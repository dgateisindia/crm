
require("dotenv").config();

const crypto = require("crypto");
const { createClerkClient } = require("@clerk/express");
const db = require("../db");

(async () => {
  let conn;

  try {
    if (process.env.INTERNAL_CRM_MODE !== "true") {
      throw Error("Set INTERNAL_CRM_MODE=true");
    }

    if (process.env.CONFIRM_EMPTY_INTERNAL_DB !== "YES") {
      throw Error(
        "Set CONFIRM_EMPTY_INTERNAL_DB=YES after reviewing the database"
      );
    }

    const clerkId = process.env.INITIAL_MANAGER_CLERK_USER_ID;

    const expectedEmail = (
      process.env.INITIAL_MANAGER_EMAIL || ""
    ).trim().toLowerCase();

    if (!clerkId || !expectedEmail) {
      throw Error("Manager Clerk ID and email required");
    }

    const client = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY
    });

    const user = await client.users.getUser(clerkId);

    const verified = (user.emailAddresses || []).find(
      (e) =>
        e.id === user.primaryEmailAddressId &&
        e.verification?.status === "verified"
    );

    if (
      !verified ||
      verified.emailAddress.toLowerCase() !== expectedEmail
    ) {
      throw Error(
        "Manager must have verified matching Clerk email"
      );
    }

    conn = await db.promise().getConnection();

    const [counts] = await conn.query(`
      SELECT
        (SELECT COUNT(*) FROM companies) companies,
        (SELECT COUNT(*) FROM users) users,
        (SELECT COUNT(*) FROM managers) managers
    `);

    if (
      counts[0].companies !== 0 ||
      counts[0].users !== 0 ||
      counts[0].managers !== 0
    ) {
      throw Error(
        "Database is not empty; refusing to overwrite any company/user"
      );
    }

    await conn.beginTransaction();

    const [company] = await conn.query(`
      INSERT INTO companies (name, slug, status)
      VALUES (
        'D-GATE Integrated Services',
        'd-gate-integrated-services',
        'active'
      )
    `);

    const companyId = company.insertId;

    const displayName =
      [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ") || "D-GATE Manager";

    const [insert] = await conn.query(
      `INSERT INTO users
       (clerk_user_id, company_id, name, email, password, role, status)
       VALUES (?, ?, ?, ?, NULL, 'manager', 'active')`,
      [clerkId, companyId, displayName, expectedEmail]
    );

    await conn.query(
      `INSERT INTO managers
       (company_id, user_id, manager_code, full_name,
        email, password, designation, status)
       VALUES (?, ?, ?, ?, ?, NULL, 'Manager', 'active')`,
      [
        companyId,
        insert.insertId,
        "MGR" + crypto.randomBytes(4).toString("hex").toUpperCase(),
        displayName,
        expectedEmail
      ]
    );

    await conn.commit();

    console.log(
      "D-GATE company created. Set INTERNAL_COMPANY_ID=" +
      companyId +
      " in backend .env and restart."
    );

  } catch (error) {
    if (conn) {
      try {
        await conn.rollback();
      } catch {}
    }

    console.error("PROVISIONING BLOCKED:", error.message);
    process.exitCode = 1;

  } finally {
    conn?.release();
    await db.promise().end();
  }
})();
