const db = require("../db");

const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const {
            id: userId,
            clerkUserId,
            companyId,
            employeeId,
            name,
            email,
            role,
            accessMode
          } = req.user;

    let manager = null;
    let employee = null;

    /*
     * ================================
     * MANAGER
     * ================================
     */

    if (role === "manager" || role === "owner") {

      const managerSql = `
        SELECT
          manager_id,
          company_id,
          user_id,
          manager_code,
          full_name,
          email,
          phone,
          department,
          designation,
          status
        FROM managers
        WHERE user_id = ?
          AND company_id = ?
        LIMIT 1
      `;

      manager = await new Promise((resolve, reject) => {
        db.query(
          managerSql,
          [userId, companyId],
          (err, results) => {
            if (err) {
              return reject(err);
            }

            resolve(results[0] || null);
          }
        );
      });

      /*
 * If the Manager profile is missing,
 * only a fully active subscription
 * may create a new profile.
 */

if (!manager && accessMode !== "full") {
  return res.status(403).json({
    success: false,
    code: "SUBSCRIPTION_READ_ONLY",
    message:
      "Your subscription has expired. New profile creation is disabled."
  });
}

if (!manager) {

        const insertManagerSql = `
          INSERT INTO managers (
            company_id,
            user_id,
            full_name,
            email,
            password,
            designation,
            status
          )
          VALUES (?, ?, ?, ?, NULL, 'Manager', 'active')
        `;

        const result = await new Promise((resolve, reject) => {
          db.query(
            insertManagerSql,
            [
              companyId,
              userId,
              name,
              email
            ],
            (err, result) => {
              if (err) {
                return reject(err);
              }

              resolve(result);
            }
          );
        });

        const managerId = result.insertId;

        const managerCode =
          `MGR${String(managerId).padStart(3, "0")}`;

        await new Promise((resolve, reject) => {
          db.query(
            `
              UPDATE managers
              SET manager_code = ?
              WHERE manager_id = ?
            `,
            [managerCode, managerId],
            (err) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });

        manager = {
          manager_id: managerId,
          company_id: companyId,
          user_id: userId,
          manager_code: managerCode,
          full_name: name,
          email: email,
          designation: "Manager",
          status: "active"
        };
      }
    }

/*
 * ================================
 * EMPLOYEE
 * ================================
 */

if (role === "employee") {

  /*
   * ==========================================
   * STEP 1:
   * First check whether the employee is already
   * linked to a CRM users record.
   * ==========================================
   */

  if (userId) {

    const employeeSql = `
      SELECT
        employee_id,
        user_id,
        company_id,
        manager_id,
        full_name,
        email,
        phone,
        department,
        designation,
        status,
        employee_code
      FROM employees
      WHERE user_id = ?
        AND company_id = ?
      LIMIT 1
    `;

    employee = await new Promise((resolve, reject) => {

      db.query(
        employeeSql,
        [userId, companyId],
        (err, results) => {

          if (err) {
            return reject(err);
          }

          resolve(results[0] || null);

        }
      );

    });

  }


  /*
   * ==========================================
   * STEP 2:
   * First-time employee
   *
   * The middleware has already obtained the
   * exact CRM employee ID from Clerk metadata.
   * ==========================================
   */

  if (!employee && employeeId) {

    const employeeByIdSql = `
      SELECT
        employee_id,
        user_id,
        company_id,
        manager_id,
        full_name,
        email,
        phone,
        department,
        designation,
        status,
        employee_code
      FROM employees
      WHERE employee_id = ?
        AND company_id = ?
      LIMIT 1
    `;

    employee = await new Promise((resolve, reject) => {

      db.query(
        employeeByIdSql,
        [employeeId, companyId],
        (err, results) => {

          if (err) {
            return reject(err);
          }

          resolve(results[0] || null);

        }
      );

    });


    /*
     * ==========================================
     * STEP 3:
     * Employee record must exist
     * ==========================================
     */

    if (!employee) {

      return res.status(403).json({
        success: false,
        message: "CRM employee record not found"
      });

    }


    /*
     * ==========================================
     * STEP 4:
     * Check if employee is already linked
     * ==========================================
     */

    // EMPLOYEE_LINK_IDEMPOTENT_V2
    if (employee.user_id) {
      if (
        !userId ||
        Number(employee.user_id) !== Number(userId)
      ) {
        return res.status(403).json({
          success: false,
          message: "Employee is already linked to another CRM user"
        });
      }
    } else {


 /*
 * ==========================================
 * STEP 5:
 * Create users record
 * ==========================================
 *
 * First-time employee linking modifies
 * the CRM database.
 *
 * Only full subscriptions may perform it.
 */

if (accessMode !== "full") {
  return res.status(403).json({
    success: false,
    code: "SUBSCRIPTION_READ_ONLY",
    message:
      "Employee account linking is unavailable until the subscription is renewed."
  });
}

const connection = await db.promise().getConnection();
    let linkedUserId;

    // FIRST_TIME_EMPLOYEE_TRANSACTION
    try {
      await connection.beginTransaction();

      const [records] = await connection.query(
        `SELECT e.employee_id, e.user_id, e.status,
                e.email, e.full_name, c.status AS company_status
         FROM employees e
         INNER JOIN companies c ON c.id = e.company_id
         WHERE e.employee_id = ? AND e.company_id = ?
         FOR UPDATE`,
        [employeeId, companyId]
      );

      const record = records[0];

      if (
        !record ||
        record.user_id !== null ||
        !["invited", "active"].includes(record.status) ||
        record.company_status !== "active" ||
        String(record.email).trim().toLowerCase() !==
          String(email).trim().toLowerCase()
      ) {
        const error = new Error("Employee linking is not permitted");
        error.statusCode = 403;
        throw error;
      }

      const [existingUsers] = await connection.query(
        `SELECT id FROM users
         WHERE clerk_user_id = ? OR email = ?
         LIMIT 1 FOR UPDATE`,
        [clerkUserId, record.email]
      );

      if (existingUsers.length) {
        const error = new Error("CRM user is already registered");
        error.statusCode = 409;
        throw error;
      }

      const [userResult] = await connection.query(
        `INSERT INTO users
         (clerk_user_id, company_id, name, email, password, role, status)
         VALUES (?, ?, ?, ?, NULL, 'employee', 'active')`,
        [
          clerkUserId,
          companyId,
          record.full_name || name,
          record.email
        ]
      );

      linkedUserId = userResult.insertId;

      const [updateResult] = await connection.query(
        `UPDATE employees
         SET user_id = ?, status = 'active'
         WHERE employee_id = ?
           AND company_id = ?
           AND user_id IS NULL`,
        [linkedUserId, employeeId, companyId]
      );

      if (updateResult.affectedRows !== 1) {
        throw new Error("Employee linkage failed");
      }

      await connection.commit();

    } catch (error) {
      await connection.rollback();

      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      console.error("EMPLOYEE LINKING TRANSACTION FAILED:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to link employee account"
      });

    } finally {
      connection.release();
    }

    employee.user_id = linkedUserId;
    employee.status = "active";
    }
  }

}
    /*
     * ================================
     * RESPONSE
     * ================================
     */

   return res.status(200).json({
  success: true,

  user: {
    id: employee?.user_id || userId,
    clerk_user_id: clerkUserId,
    company_id: companyId,
    name: name,
    email: email,
    role: role === "owner" ? "manager" : role,

    accessMode: req.user.accessMode,

    subscriptionReason:
      req.user.subscriptionReason || null
  },

  manager: manager,
  employee: employee
});
  } catch (error) {

    console.error(
      "GET CURRENT USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load current user"
    });
  }
};

module.exports = { getCurrentUser };
