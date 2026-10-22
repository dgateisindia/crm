const express = require("express");
const { verifyWebhook } = require("@clerk/express/webhooks");

const db = require("../db");

const router = express.Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // Verify that the webhook really came from Clerk
      const evt = await verifyWebhook(req);

      console.log("=================================");
      console.log("CLERK WEBHOOK RECEIVED");
      console.log("Event Type:", evt.type);
      console.log("Event ID:", evt.data?.id);
      console.log("=================================");

      // ==========================================
      // USER CREATED
      // ==========================================
      if (evt.type === "user.created") {
        const clerkUser = evt.data;

       

        // ------------------------------------------
        // Get Clerk user information
        // ------------------------------------------

        const clerkUserId = clerkUser.id;

        const firstName = clerkUser.first_name || "";
        const lastName = clerkUser.last_name || "";

        const fullName =
          `${firstName} ${lastName}`.trim();

        // Clerk stores email addresses separately
        const primaryEmailId =
          clerkUser.primary_email_address_id;

        const emailObject =
          clerkUser.email_addresses?.find(
            (email) =>
              email.id === primaryEmailId
          );

        const email =
          emailObject?.email_address
            ?.trim()
            .toLowerCase() || null;

        // ------------------------------------------
        // Get CRM invitation metadata
        // ------------------------------------------

        const metadata =
          clerkUser.public_metadata || {};

        const companyId =
          metadata.crmCompanyId;

        const employeeId =
          metadata.crmEmployeeId;

        const crmRole =
          metadata.crmRole;

        

        // ------------------------------------------
        // Only process CRM employee invitations
        // ------------------------------------------

        if (
          !companyId ||
          !employeeId ||
          crmRole !== "employee"
        ) {
          console.log(
            "No CRM employee metadata found. Skipping provisioning."
          );

          return res.status(200).json({
            success: true,
            message:
              "User created but no CRM provisioning metadata found"
          });
        }

        // ------------------------------------------
        // Validate required Clerk data
        // ------------------------------------------

        if (!email) {
          console.error(
            "CRM PROVISIONING ERROR: Clerk user has no email"
          );

          return res.status(400).json({
            success: false,
            message:
              "Clerk user does not have an email address"
          });
        }

        // ------------------------------------------
        // Check employee exists
        // ------------------------------------------

        const [employees] =
          await db.promise().query(
            `
            SELECT
              employee_id,
              user_id,
              company_id,
              email,
              status
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
          );

        if (employees.length === 0) {
          console.error(
            "CRM PROVISIONING ERROR: Employee not found"
          );

          return res.status(404).json({
            success: false,
            message:
              "CRM employee record not found"
          });
        }

        const employee = employees[0];

                // CLERK_COMPANY_STATUS_CHECK
        const [companyRows] = await db.promise().query(
          "SELECT status FROM companies WHERE id = ? LIMIT 1",
          [companyId]
        );

        if (
          companyRows.length !== 1 ||
          companyRows[0].status !== "active"
        ) {
          return res.status(403).json({
            success: false,
            message: "CRM company is not active"
          });
        }
        // Internal company only; the middleware also validates company status.
        const allowedCompanyId = Number(process.env.INTERNAL_COMPANY_ID);
        if (!Number.isSafeInteger(allowedCompanyId) || Number(companyId) !== allowedCompanyId) {
          return res.status(403).json({ success: false, message: "Not an authorized D-GATE company" });
        }
        // CLERK_EMPLOYEE_EMAIL_CHECK
        const registeredEmail = String(employee.email || "")
          .trim()
          .toLowerCase();

        const clerkEmailVerified =
          emailObject?.verification?.status === "verified";

        if (
          !registeredEmail ||
          !email ||
          !clerkEmailVerified ||
          registeredEmail !== email
        ) {
          return res.status(403).json({
            success: false,
            message: "Clerk email does not match the registered employee"
          });
        }

        if (!["invited", "active"].includes(employee.status)) {
          return res.status(403).json({
            success: false,
            message: "Employee account is not eligible for activation"
          });
        }


        // ------------------------------------------
        // Idempotency:
        // If already linked, do not create another user
        // ------------------------------------------

                // CLERK_EMPLOYEE_LINK_TRANSACTION
        const connection = await db.promise().getConnection();
        let userId;

        try {
          await connection.beginTransaction();

          const [records] = await connection.query(
            `SELECT e.employee_id, e.company_id, e.manager_id,
                    e.user_id, e.email, e.status,
                    c.status AS company_status
             FROM employees e
             JOIN companies c ON c.id = e.company_id
             WHERE e.employee_id = ?
               AND e.company_id = ?
             FOR UPDATE`,
            [employeeId, companyId]
          );

          const record = records[0];

          if (
            !record ||
            record.company_status !== "active" ||
            !["invited", "active"].includes(record.status) ||
            String(record.email || "").trim().toLowerCase() !== email
          ) {
            const error = new Error("Employee is not eligible");
            error.statusCode = 403;
            throw error;
          }

          const [managers] = await connection.query(
            `SELECT manager_id FROM managers
             WHERE manager_id = ?
               AND company_id = ?
             LIMIT 1`,
            [record.manager_id, companyId]
          );

          if (managers.length !== 1) {
            const error = new Error("Employee manager association is invalid");
            error.statusCode = 403;
            throw error;
          }

          const [users] = await connection.query(
            `SELECT id, clerk_user_id, company_id,
                    email, role, status
             FROM users
             WHERE clerk_user_id = ? OR email = ?
             FOR UPDATE`,
            [clerkUserId, email]
          );

          if (record.user_id !== null) {
            const matched = users.find(
              u =>
                Number(u.id) === Number(record.user_id) &&
                u.clerk_user_id === clerkUserId &&
                Number(u.company_id) === Number(companyId) &&
                u.role === "employee" &&
                u.status === "active" &&
                String(u.email || "").trim().toLowerCase() === email
            );

            if (!matched || users.some(u => u.id !== matched.id)) {
              const error = new Error("Employee account conflict");
              error.statusCode = 409;
              throw error;
            }

            userId = matched.id;
          } else {
            if (users.length > 0) {
              const error = new Error("CRM user already exists");
              error.statusCode = 409;
              throw error;
            }

            const [created] = await connection.query(
              `INSERT INTO users
               (clerk_user_id, company_id, name, email,
                password, role, status)
               VALUES (?, ?, ?, ?, NULL, 'employee', 'active')`,
              [
                clerkUserId,
                companyId,
                fullName || record.email,
                email
              ]
            );

            userId = created.insertId;

            const [updated] = await connection.query(
              `UPDATE employees
               SET user_id = ?, status = 'active'
               WHERE employee_id = ?
                 AND company_id = ?
                 AND manager_id = ?
                 AND user_id IS NULL`,
              [userId, employeeId, companyId, record.manager_id]
            );

            if (updated.affectedRows !== 1) {
              throw new Error("Employee linking failed");
            }
          }

          await connection.commit();

        } catch (error) {
          await connection.rollback();

          console.error("CLERK EMPLOYEE LINK ERROR:", error);

          return res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode
              ? error.message
              : "Employee provisioning failed"
          });

        } finally {
          connection.release();
        }
console.log(
          "EMPLOYEE PROVISIONING COMPLETED"
        );

        console.log({
          clerkUserId,
          userId,
          employeeId,
          companyId,
          status: "active"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Webhook received"
      });

    } catch (error) {
      console.error(
        "CLERK WEBHOOK ERROR:",
        error
      );

      return res.status(400).json({
        success: false,
        message: "Webhook processing failed"
      });
    }
  }
);

module.exports = router;