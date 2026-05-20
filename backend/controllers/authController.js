const db =
require("../db");

const jwt =
require("jsonwebtoken");


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

        console.log(err);

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

          user:
          manager,

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

            user:
            employee,

          });

        }

      );

    }

  );

};


module.exports = {

  login,

};