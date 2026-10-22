const express=require('express');
const crypto=require('crypto');
const db=require('../db');
const router=express.Router();
function trusted(req,res,next){const expected=process.env.SAAS_CRM_BRIDGE_KEY||'';const supplied=req.get('x-saas-bridge-key')||'';if(!expected||expected.length<32||!supplied||supplied.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(expected)))return res.status(401).json({error:'Unauthorized bridge request'});next()}
router.use(trusted);
router.post('/provision',async(req,res)=>{const {registrationId,companyName,managerName,email,clerkUserId}=req.body||{};
 if(!Number.isSafeInteger(registrationId)||registrationId<1||![companyName,managerName,email,clerkUserId].every(x=>typeof x==='string'&&x.trim()))return res.status(400).json({error:'Invalid provisioning request'});
 const c=await db.promise().getConnection();try{await c.beginTransaction();
 // Unique registration mapping provides safe idempotency across retries.
 const [previous]=await c.query('SELECT company_id FROM saas_provisioning_links WHERE saas_registration_id=? FOR UPDATE',[registrationId]);
 if(previous.length){await c.commit();return res.json({companyId:previous[0].company_id,reused:true})}
 const [user]=await c.query('SELECT id,company_id FROM users WHERE email=? OR clerk_user_id=? LIMIT 1 FOR UPDATE',[email.toLowerCase(),clerkUserId]);
 const [mgr]=await c.query('SELECT manager_id FROM managers WHERE email=? LIMIT 1 FOR UPDATE',[email.toLowerCase()]);
 if(user.length||mgr.length){await c.rollback();return res.status(409).json({error:'CRM user or manager already exists. Manual linking review required.'})}
 const slug=companyName.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,160).replace(/^-|-$/g,'')+'-'+crypto.randomBytes(5).toString('hex');
 const [company]=await c.query("INSERT INTO companies(name,slug,status) VALUES (?,?,'inactive')",[companyName,slug]);
 const [u]=await c.query("INSERT INTO users(clerk_user_id,company_id,name,email,role,status) VALUES (?,?,?,?,'manager','inactive')",[clerkUserId,company.insertId,managerName,email.toLowerCase()]);
 await c.query("INSERT INTO managers(company_id,user_id,full_name,email,status,manager_code) VALUES (?,?,?,?,'inactive',?)",[company.insertId,u.insertId,managerName,email.toLowerCase(),'S'+crypto.randomBytes(5).toString('hex').toUpperCase()]);
 await c.query('INSERT INTO saas_provisioning_links(saas_registration_id,company_id,clerk_user_id) VALUES (?,?,?)',[registrationId,company.insertId,clerkUserId]);await c.commit();res.status(201).json({companyId:company.insertId});
 }catch(err){await c.rollback();console.error('Provisioning:',err.code||err.message);res.status(500).json({error:'CRM provisioning failed'})}finally{c.release()}});
router.post('/activate', async (req, res) => {
  const { registrationId, companyId } = req.body || {};

  if (
    !Number.isSafeInteger(registrationId) ||
    registrationId < 1 ||
    !Number.isSafeInteger(companyId) ||
    companyId < 1
  ) {
    return res.status(400).json({ error: 'Invalid activation' });
  }

  const key = process.env.SAAS_CRM_BRIDGE_KEY;
  const saasUrl = process.env.SAAS_INTERNAL_URL;

  if (!key || key.length < 32 || !saasUrl) {
    return res.status(503).json({
      error: 'SaaS entitlement verification is not configured'
    });
  }

  // Confirm approval and active trial/subscription before activation.
  try {
    const url = new URL(
      '/api/internal/entitlement/' + registrationId,
      saasUrl
    );

    const response = await fetch(url, {
      headers: { 'x-saas-bridge-key': key },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return res.status(503).json({
        error: 'SaaS entitlement verification failed'
      });
    }

    const entitlement = await response.json();

    if (entitlement.eligible !== true && entitlement.activation_allowed !== true) {
      return res.status(403).json({
        error: 'Company does not have an eligible SaaS subscription'
      });
    }
  } catch (error) {
    console.error('SaaS activation entitlement error:', error.message);

    return res.status(503).json({
      error: 'SaaS entitlement service unavailable'
    });
  }

  let connection;

  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    const [links] = await connection.query(
      `SELECT company_id, clerk_user_id
       FROM saas_provisioning_links
       WHERE saas_registration_id = ?
         AND company_id = ?
       FOR UPDATE`,
      [registrationId, companyId]
    );

    if (links.length !== 1) {
      await connection.rollback();

      return res.status(404).json({
        error: 'Provisioning record not found'
      });
    }

    const [managers] = await connection.query(
      `SELECT m.manager_id, m.user_id
       FROM managers m
       JOIN users u ON u.id = m.user_id
       WHERE m.company_id = ?
         AND u.company_id = ?
         AND u.clerk_user_id = ?
         AND u.role IN ('manager', 'owner')
       FOR UPDATE`,
      [companyId, companyId, links[0].clerk_user_id]
    );

    if (managers.length !== 1) {
      await connection.rollback();

      return res.status(409).json({
        error: 'Company manager mapping is invalid'
      });
    }

    await connection.query(
      "UPDATE companies SET status = 'active' WHERE id = ?",
      [companyId]
    );

    await connection.query(
      "UPDATE users SET status = 'active' WHERE id = ? AND company_id = ?",
      [managers[0].user_id, companyId]
    );

    await connection.query(
      "UPDATE managers SET status = 'active' WHERE manager_id = ? AND company_id = ?",
      [managers[0].manager_id, companyId]
    );

    await connection.commit();

    return res.json({ activated: true });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error('CRM activation error:', error.message);

    return res.status(500).json({
      error: 'CRM activation failed'
    });
  } finally {
    if (connection) connection.release();
  }
});
module.exports=router;
