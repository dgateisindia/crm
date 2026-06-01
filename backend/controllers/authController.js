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
      console.log("Manager Error:",err);
      console.log("Manager Result:",managerResult);

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
              console.log("Employee Error:", err);
    console.log("Employee Result:", employeeResult);

          if (err) {

            console.log(err);

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

    if (err) {
      console.log("EMPLOYEE QUERY ERROR:", err);
      return res.status(500).json({
        message: "Database Error"
      });
    }

    console.log("employeeResult =", employeeResult);

    if (employeeResult && employeeResult.length > 0) {

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
            `http://localhost:5173/reset-password/${token}`
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
                `http://localhost:5173/reset-password/${token}`
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

module.exports = {

  login,
  forgotPassword,
  resetPassword
};

