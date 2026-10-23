'use strict';
// Local-only one-time CRM data migration. No Clerk calls or hosted database access.
require('dotenv').config();
const mysql = require('mysql2/promise');
const APPLY = process.argv.includes('--apply');
const SOURCE = 'o_crm', TARGET = 'c_crm', COMPANY = 1, MANAGER = 1;
const known = new Map([[2,7],[3,2],[4,4],[6,3],[8,5],[13,6],[14,8],[15,6]]);
const legacy = new Set([1,5,7,9,10,11,12]);
const q = (x) => '`' + x.replace(/`/g,'``') + '`';
const assert = (ok, message) => { if(!ok) throw Error(message); };
const cols = async (db,schema,table) => (await db.query('SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=? ORDER BY ORDINAL_POSITION',[schema,table]))[0].map(x=>x.COLUMN_NAME);
const rows = async (db,s,t) => (await db.query(`SELECT * FROM ${q(s)}.${q(t)}`))[0];
const count = async (db,s,t) => Number((await db.query(`SELECT COUNT(*) n FROM ${q(s)}.${q(t)}`))[0][0].n);
async function insertBatch(db,table,columns,records){
  if(!records.length)return;
  const placeholders = '('+columns.map(()=>'?').join(',')+')';
  for(let i=0;i<records.length;i+=150){
    const batch=records.slice(i,i+150);
    const values=batch.flatMap(r=>columns.map(c=>r[c]===undefined?null:r[c]));
    await db.query(`INSERT INTO ${q(TARGET)}.${q(table)} (${columns.map(q).join(',')}) VALUES ${batch.map(()=>placeholders).join(',')}`,values);
  }
}
async function main(){
 const host=process.env.DB_HOST||'127.0.0.1';
 assert(['127.0.0.1','localhost','::1'].includes(host),'Safety stop: DB_HOST must be localhost');
 const db=await mysql.createConnection({host,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,multipleStatements:false,dateStrings:true});
 let transaction=false;
 try{
  const [schemas]=await db.query('SELECT SCHEMA_NAME AS name FROM information_schema.SCHEMATA WHERE SCHEMA_NAME IN (?,?)',[SOURCE,TARGET]);
  assert(schemas.length===2,'Both local o_crm and c_crm databases must exist');
  const oldEmps=await rows(db,SOURCE,'employees'), current=await rows(db,TARGET,'employees');
  const oldIds=new Set(oldEmps.map(x=>Number(x.employee_id)));
  assert(oldEmps.length===15,'Old employees count changed; review mapping');
  assert([...oldIds].every(x=>known.has(x)||legacy.has(x)),'Old employee mapping does not cover all IDs');
  assert(current.every(e=>Number(e.company_id)===COMPANY && Number(e.manager_id)===MANAGER),'Unexpected employee company / manager');
  for(const [oldId,newId] of known){
    const x=current.find(e=>Number(e.employee_id)===newId), y=oldEmps.find(e=>Number(e.employee_id)===oldId);
    assert(x&&y,`Missing verified employee old ${oldId} -> new ${newId}`);
  }
  const [mgrs]=await db.query(`SELECT m.manager_id, m.user_id, u.clerk_user_id FROM ${q(TARGET)}.managers m JOIN ${q(TARGET)}.users u ON u.id=m.user_id WHERE m.manager_id=? AND m.company_id=?`,[MANAGER,COMPANY]);
  assert(mgrs.length===1&&mgrs[0].clerk_user_id,'Protected Sridevi manager identity missing');
  const tables=['leads','follow_ups','tasks','task_followups','employee_notes'];
  for(const t of tables)assert(await count(db,TARGET,t)===0,`Destination ${t} is not empty: refusing duplicate import`);
  const source={}; for(const t of tables)source[t]=await rows(db,SOURCE,t);
  assert(source.leads.length===7188&&source.follow_ups.length===5670&&source.tasks.length===4,'Source row counts differ from confirmed baseline');
  const leadIds=new Set(source.leads.map(x=>Number(x.id)));
  assert(source.follow_ups.every(x=>leadIds.has(Number(x.lead_id))),'Orphan follow-up: lead missing');
  assert(source.task_followups.every(x=>x.lead_id!=null&&leadIds.has(Number(x.lead_id))),'Task history contains missing lead IDs; requires separate preservation plan');
  const actorCheck=(id,tag)=>{if(id!=null && !oldIds.has(Number(id)))throw Error(`Unknown old employee ID ${id} referenced by ${tag}`)};
  for(const l of source.leads){if(l.created_by_type==='employee')actorCheck(l.created_by_id,`lead ${l.id}`);else assert(l.created_by_type==='manager',`Unknown lead actor type at ${l.id}`)}
  for(const f of source.follow_ups)actorCheck(f.employee_id,`follow-up ${f.followup_id}`);
  for(const t of source.tasks)actorCheck(t.employee_id,`task ${t.task_id}`);
  for(const t of source.task_followups)actorCheck(t.employee_id,`task follow-up ${t.followup_id}`);
  for(const n of source.employee_notes)actorCheck(n.employee_id,'employee note');
  // Verify columns: old source data fields must all be carried forward.
  for(const t of tables){const a=await cols(db,SOURCE,t),b=await cols(db,TARGET,t);assert(a.length>0&&b.length>0,`Schema column lookup failed for ${t}`);assert(a.every(c=>b.includes(c)),`New ${t} schema omits source columns: ${a.filter(c=>!b.includes(c)).join(', ')}`)}
  const oldProfiles=oldEmps.filter(x=>legacy.has(Number(x.employee_id)));
  // Synthetic email is explicitly a non-deliverable historical placeholder, not a real login.
  const reserved=new Set(current.map(e=>String(e.email||'').toLowerCase()));
  for(const old of oldProfiles)assert(!reserved.has(`legacy-${old.employee_id}@history.invalid`),'Historical identity placeholder conflicts with existing employee');
  console.log(JSON.stringify({mode:APPLY?'APPLY':'DRY RUN',sourceCounts:Object.fromEntries(tables.map(t=>[t,source[t].length])),verifiedMappings:Object.fromEntries(known),historicalProfiles:oldProfiles.map(e=>({oldId:e.employee_id,name:e.full_name})),protectedManager:true,existingEmployees:current.length},null,2));
  if(!APPLY){console.log('SAFE DRY RUN COMPLETE. No changes made.');return;}
  assert(process.env.DGATE_LOCAL_MIGRATION_APPROVED==='YES','Set DGATE_LOCAL_MIGRATION_APPROVED=YES only after backing up local c_crm');
  // DDL commits implicitly in MySQL, so create audit table BEFORE the data transaction.
  await db.query(`CREATE TABLE IF NOT EXISTS ${q(TARGET)}.crm_migration_employee_audit (old_employee_id INT NOT NULL PRIMARY KEY, old_full_name VARCHAR(100) NOT NULL, old_email VARCHAR(100), new_employee_id INT NOT NULL, mapping_type VARCHAR(30) NOT NULL, migrated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB`);
  assert(await count(db,TARGET,'crm_migration_employee_audit')===0,'Audit already has mappings: migration may have run');
  await db.beginTransaction();transaction=true;
  const map=new Map(known);
  const used=new Set(current.map(e=>Number(e.employee_id)));
  for(const old of oldProfiles){
    // Do not use old fake emails, passwords or invite tokens.
    const [r]=await db.query(`INSERT INTO ${q(TARGET)}.employees (user_id,clerk_invitation_id,company_id,manager_id,role_id,full_name,email,phone,password,department,designation,status,employee_code) VALUES (NULL,NULL,?,?,?,?,?,NULL,NULL,?,?,'inactive',NULL)`,
      [COMPANY,MANAGER,Number(old.role_id),String(old.full_name),`legacy-${old.employee_id}@history.invalid`,old.department||null,old.designation||null]);
    const newId=r.insertId;assert(!used.has(newId),'Historical employee ID collision');used.add(newId);map.set(Number(old.employee_id),newId);
    await db.query(`UPDATE ${q(TARGET)}.employees SET employee_code=? WHERE employee_id=?`,[`HIST${String(newId).padStart(3,'0')}`,newId]);
  }
  for(const old of oldEmps){
    await db.query(`INSERT INTO ${q(TARGET)}.crm_migration_employee_audit (old_employee_id,old_full_name,old_email,new_employee_id,mapping_type) VALUES (?,?,?,?,?)`,
      [old.employee_id,old.full_name,old.email,map.get(Number(old.employee_id)),legacy.has(Number(old.employee_id))?'historical_inactive':Number(old.employee_id)===15?'merged_into_ramya':'verified_identity']);
  }
  const newCols={};for(const t of tables){newCols[t]=await cols(db,TARGET,t);assert(newCols[t].length>0,`Missing destination column list for ${t}`)}assert(newCols.leads.includes('id'),'Lead primary key must be explicitly inserted');
  const mergeCols=async(t,recs)=>{const a=await cols(db,SOURCE,t);await insertBatch(db,t,a,recs);};
  // Copy exact lead IDs so follow-up lead_id references remain unchanged.
  const leadRows=source.leads.map(l=>({...l,company_id:COMPANY,created_by_id:l.created_by_type==='employee'?(l.created_by_id==null?null:map.get(Number(l.created_by_id))):MANAGER,assigned_employee_id:l.created_by_type==='employee'&&l.created_by_id!=null?map.get(Number(l.created_by_id)):null,assigned_at:null,assigned_by_id:null}));
  await insertBatch(db,'leads',newCols.leads,leadRows);
  // Diagnostic checkpoint inside the same transaction. No commit occurs here.
  const [insertedLeadRows] = await db.query(`SELECT id FROM ${q(TARGET)}.leads`);
  const importedLeadIds = new Set(insertedLeadRows.map(r => Number(r.id)));
  const expectedLeadIds = new Set(source.leads.map(r => Number(r.id)));
  const missingLeadIds = [...expectedLeadIds].filter(id => !importedLeadIds.has(id));
  const unexpectedLeadIds = [...importedLeadIds].filter(id => !expectedLeadIds.has(id));
  console.log('LEAD INSERT DIAGNOSTIC:', JSON.stringify({
    expected: source.leads.length,
    inserted: insertedLeadRows.length,
    missingCount: missingLeadIds.length,
    firstMissingIds: missingLeadIds.slice(0, 15),
    unexpectedCount: unexpectedLeadIds.length,
    firstUnexpectedIds: unexpectedLeadIds.slice(0, 15)
  }));
  assert(missingLeadIds.length === 0 && unexpectedLeadIds.length === 0, 'Lead IDs were not preserved; transaction will roll back');
  const [unresolvedFollowups] = await db.query(`
    SELECT f.followup_id, f.lead_id
    FROM ${q(SOURCE)}.follow_ups f
    LEFT JOIN ${q(TARGET)}.leads l ON l.id = f.lead_id
    WHERE l.id IS NULL
    LIMIT 15
  `);
  console.log('FOLLOW-UP FK DIAGNOSTIC:', JSON.stringify({
    sampleMissingReferences: unresolvedFollowups
  }));
  assert(unresolvedFollowups.length === 0, 'Follow-up references absent after lead import; transaction will roll back');
  const followRows=source.follow_ups.map(f=>({...f,employee_id:f.employee_id==null?null:map.get(Number(f.employee_id))}));
  await insertBatch(db,'follow_ups',newCols.follow_ups,followRows);
  const taskRows=source.tasks.map(t=>({...t,company_id:COMPANY,employee_id:t.employee_id==null?null:map.get(Number(t.employee_id))}));
  await insertBatch(db,'tasks',newCols.tasks,taskRows);
  const taskFollowRows=source.task_followups.map(t=>({...t,employee_id:t.employee_id==null?null:map.get(Number(t.employee_id)),followup_mode:'call',lead_status:null}));
  await insertBatch(db,'task_followups',newCols.task_followups,taskFollowRows);
  const notes=source.employee_notes.map(n=>({...n,employee_id:map.get(Number(n.employee_id))}));
  // Two old profiles may map to Ramya. Never overwrite notes silently.
  const noteIds=new Set(); for(const n of notes){assert(!noteIds.has(n.employee_id),'Multiple employee notes target the same person. Stop and merge manually.');noteIds.add(n.employee_id)}
  await insertBatch(db,'employee_notes',newCols.employee_notes,notes);
  for(const t of tables) assert(await count(db,TARGET,t)===source[t].length,`Post-insert count mismatch ${t}`);
  assert(await count(db,TARGET,'crm_migration_employee_audit')===oldEmps.length,'Audit mapping count mismatch');
  await db.commit();transaction=false;
  console.log('MIGRATION COMMITTED. Verified all five business tables. Original employee mapping stored in crm_migration_employee_audit.');
 }catch(e){if(transaction){await db.rollback();console.error('Transaction rolled back.');}throw e;}finally{await db.end();}
}
main().catch(e=>{console.error('Migration blocked:',e.message);process.exitCode=1;});

