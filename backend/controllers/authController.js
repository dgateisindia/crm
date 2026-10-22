const db =
require("../db");
const jwt =
require("jsonwebtoken");
const crypto = require("crypto");
// ==========================
// LOGIN
// ==========================
const login =
(req, res) => {
  const {
    email,
    password,
  } = req.body;
  // ==========================
  // CHECK MANAGER
  // ==========================
  const managerSql =
  `
    SELECT *

    FROM managers

    WHERE email = ?
  `;

  db.query(
    managerSql,
    [email],

    (err, managerResult) => {

      if (err) {

        //console.log(err);

        return res.status(500)
        .json({
          message:
          "Server Error",
        });

      }
      // ==========================
      // MANAGER FOUND
      // ==========================
      if (
        managerResult.length > 0
      ) {

        const manager =
        managerResult[0];


        // Check Password
        if (
          manager.password !==
          password
        ) {

          return res.status(401)
          .json({
            message:
            "Invalid Password",
          });

        }


        // JWT Token
        const token =
        jwt.sign(

          {

            id:
            manager.manager_id,

            role:
            "manager",

          },

          process.env.JWT_SECRET,

          {

            expiresIn:
            "1d",

          }

        );


        return res.status(200)
        .json({

          message:
          "Manager Login Success",

          token,

          role:
          "manager",

         user: {

            id:
            manager.manager_id,

            full_name:
            manager.full_name,

            email:
            manager.email,

          },

        });

      }


      // ==========================
      // CHECK EMPLOYEE
      // ==========================
      const employeeSql =
      `
        SELECT

          employees.*,

          employee_roles.role_name

        FROM employees

        JOIN employee_roles

        ON employees.role_id =
        employee_roles.role_id

        WHERE employees.email = ?
      `;


      db.query(
        employeeSql,
        [email],

        (err, employeeResult) => {

          if (err) {

            //console.log(err);

            return res.status(500)
            .json({
              message:
              "Server Error",
            });

          }


          // Employee Not Found
          if (
            employeeResult.length === 0
          ) {

            return res.status(401)
            .json({
              message:
              "Invalid Email",
            });

          }


          const employee =
          employeeResult[0];
          if (
                employee.status ===
                "inactive"
              ) {

                return res.status(403)
                .json({
                  message:
                  "Employee account is inactive",
                });

              }


          // Password Check
          if (
            employee.password !==
            password
          ) {

            return res.status(401)
            .json({
              message:
              "Invalid Password",
            });

          }


          // JWT Token
          const token =
          jwt.sign(

            {

              id:
              employee.employee_id,

              role:
              "employee",

            },

            process.env.JWT_SECRET,

            {

              expiresIn:
              "1d",

            }

          );


          res.status(200)
          .json({

            message:
            "Employee Login Success",

            token,

            role:
            "employee",

            user: {

                id:
                employee.employee_id,

                employee_code:
                employee.employee_code,

                full_name:
                employee.full_name,

                email:
                employee.email,

                role:
                employee.role_name,

              },

          });

        }

      );

    }

  );

};
const forgotPassword = (req, res) => {
  const { email } = req.body;

  const token =
    crypto.randomBytes(32).toString("hex");

  const expiry =
    new Date(Date.now() + 15 * 60 * 1000);

  // Check Employee
  db.query(
    "SELECT * FROM employees WHERE email = ?",
    [email],
    (err, employeeResult) => {

      if (employeeResult.length > 0) {

        db.query(
          `UPDATE employees
           SET reset_token = ?,
               reset_token_expiry = ?
           WHERE email = ?`,
          [token, expiry, email]
        );

        return res.json({
          message: "Reset link generated",
          resetLink:
            `${process.env.CRM_PUBLIC_URL}/reset-password/${token}`
        });
      }

      // Check Manager
      db.query(
        "SELECT * FROM managers WHERE email = ?",
        [email],
        (err, managerResult) => {

          if (managerResult.length > 0) {

            db.query(
              `UPDATE managers
               SET reset_token = ?,
                   reset_token_expiry = ?
               WHERE email = ?`,
              [token, expiry, email]
            );

            return res.json({
              message: "Reset link generated",
              resetLink:
                `${process.env.CRM_PUBLIC_URL}/reset-password/${token}`
            });
          }

          return res.status(404).json({
            message: "Email not found"
          });

        }
      );
    }
  );
};
const resetPassword = (req, res) => {

  const {
    token,
    password
  } = req.body;

  // Check Employee
  db.query(
    `SELECT *
     FROM employees
     WHERE reset_token = ?
     AND reset_token_expiry > NOW()`,
    [token],

    (err, employeeResult) => {

      if (employeeResult.length > 0) {

        db.query(
          `UPDATE employees
           SET password = ?,
               reset_token = NULL,
               reset_token_expiry = NULL
           WHERE reset_token = ?`,
          [password, token],

          (err) => {

            if (err) {
              return res.status(500).json({
                message: "Server Error"
              });
            }

            return res.json({
              message:
              "Password updated successfully"
            });

          }
        );

        return;
      }

      // Check Manager
      db.query(
        `SELECT *
         FROM managers
         WHERE reset_token = ?
         AND reset_token_expiry > NOW()`,
        [token],

        (err, managerResult) => {

          if (managerResult.length > 0) {

            db.query(
              `UPDATE managers
               SET password = ?,
                   reset_token = NULL,
                   reset_token_expiry = NULL
               WHERE reset_token = ?`,
              [password, token],

              (err) => {

                if (err) {
                  return res.status(500).json({
                    message:
                    "Server Error"
                  });
                }

                return res.json({
                  message:
                  "Password updated successfully"
                });

              }
            );

            return;
          }

          return res.status(400).json({
            message:
            "Invalid or Expired Token"
          });

        }
      );

    }
  );
};
// ==========================
// GET CURRENT CRM USER
// ==========================
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

    if (employee.user_id) {

      return res.status(403).json({
        success: false,
        message: "Employee is already linked to another CRM user"
      });

    }


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
    /*
     * ================================
     * RESPONSE
     * ================================
     */

   return res.status(200).json({
  success: true,

  user: {
    id: userId,
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

module.exports = {

  login,
  forgotPassword,
  resetPassword,
  getCurrentUser
};

