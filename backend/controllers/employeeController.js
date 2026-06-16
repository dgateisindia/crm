const db =
require("../db");


// ==========================
// Create Employee
// ==========================
const createEmployee =
(req, res) => {

  const {

    manager_id,
    role_id,
    full_name,
    email,
    phone,
    password,
    department,
    designation,
    status

  } = req.body;
 //console.log(req.body);

if (

  !manager_id ||

  

  !full_name ||

  !email ||

  !password

) {

  

  return res.status(400)
  .json({

    message:
    "Required fields are missing",

    data: {

      manager_id,
      role_id,
      full_name,
      email,
      password

    }

  });

}

 const checkSql = `
  SELECT employee_id
  FROM employees
  WHERE email = ?
  OR (phone IS NOT NULL AND phone = ?)
`;

db.query(

  checkSql,

  [email, phone],

  (checkErr, checkResult) => {

    if (checkErr) {

      return res.status(500).json({

        message:
        "Failed to validate employee details"

      });

    }

    if (checkResult.length > 0) {

      return res.status(400).json({

        message:
        "Email or phone number already exists"

      });

    }

    // ==========================
    // Insert Employee
    // ==========================

    const sql = `
      INSERT INTO employees (

        manager_id,
        role_id,
        full_name,
        email,
        phone,
        password,
        department,
        designation,
        status

      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(

      sql,

      [

        manager_id,

        designation?.toLowerCase() === "manager"

          ? 2

          : 1,

        full_name,
        email,
        phone,
        password,
        department,
        designation,
        status || "active"

      ],

      (err, result) => {

        if (err) {

          return res.status(500).json({

            message:
            "Failed to create employee"

          });

        }

        // Generate Employee Code

        const employeeCode =
          `EMP${String(
            result.insertId
          ).padStart(3, "0")}`;

        const updateSql = `
          UPDATE employees
          SET employee_code = ?
          WHERE employee_id = ?
        `;

        db.query(

          updateSql,

          [

            employeeCode,
            result.insertId

          ],

          (updateErr) => {

            if (updateErr) {

              return res.status(500).json({

                message:
                "Employee created but code generation failed"

              });

            }

            res.status(201).json({

              message:
              "Employee created successfully",

              employee_code:
              employeeCode

            });

          }

        );

      }

    );

  }

)};
      

     

// ==========================
// Get All Employees
// ==========================
const getEmployees =
(req, res) => {

  const sql = `
    SELECT *
    FROM employees
  `;

  db.query(
    sql,
    (err, result) => {

      if (err) {

        //console.log(
        //  "SQL Error:",
        //  err
        //);

        return res.status(500)
        .json({
          message:
          "Failed to fetch employees",
        });

      }

      //console.log(
      //  "Employees Data:",
      //  result
      //  );

      res.status(200)
      .json(result);

    }
  );

};

// ==========================
// Get Employee By ID
// ==========================
const getEmployeeById =
(req, res) => {
  

  const employeeId =
  req.params.id;

  const sql = `
    SELECT

      employees.*,

      employee_roles.role_name

    FROM employees

    JOIN employee_roles

    ON employees.role_id =
    employee_roles.role_id

    WHERE employee_id = ?
  `;

  db.query(
    sql,
    [employeeId],

    (err, result) => {

      if (err) {

        //console.log(err);

        return res.status(500)
        .json({
          message:
          "Error fetching employee",
        });

      }

      res.status(200)
      .json(result[0]);

    }
  );

};


// ==========================
// Delete Employee
// ==========================
const deleteEmployee =
(req, res) => {

  const employeeId =
  req.params.id;

  const sql =
  "DELETE FROM employees WHERE employee_id = ?";


  db.query(
    sql,
    [employeeId],

    (err, result) => {

      if (err) {

        //console.log(err);

        return res.status(500)
        .json({
          message:
          "Failed to delete employee",
        });

      }

      res.status(200)
      .json({
        message:
        "Employee deleted successfully",
      });

    }
  );

};
const updateEmployeeStatus =
async (req, res) => {

  const { id } =
  req.params;

  const { status } =
  req.body;

  

  try {

    await db.promise().query(

      `UPDATE employees
       SET status = ?
       WHERE employee_id = ?`,

      [
        status,
        id
      ]

    );

    res.json({

      message:
      "Status Updated"

    });

  }

  catch (error) {

    //console.log(error);

    res.status(500).json({

      message:
      "Update Failed"

    });

  }

};
const getEmployeeProfile =
(req, res) => {

  const id =
  req.params.id;

  const sql = `

    SELECT

      employee_id,
      employee_code,
      full_name,
      email,
      phone,
      department,
      designation,
      status

    FROM employees

    WHERE employee_id = ?

  `;

  db.query(

    sql,

    [id],

    (err, result) => {

      if (err) {

        console.log(err);

        return res
        .status(500)
        .json(err);

      }

      res.json(
        result[0]
      );

    }

  );

};
const changePassword =
(req, res) => {

  const id =
  req.params.id;

  const {
    newPassword
  } = req.body;

  db.query(

    `

      UPDATE employees

      SET password = ?

      WHERE employee_id = ?

    `,

    [

      newPassword,
      id

    ],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json({

        message:
        "Password Updated"

      });

    }

  );

};
// ==========================
// Employee Statistics
// ==========================
const getEmployeeStats =
(req, res) => {

  const employeeId =
  req.params.id;

  const stats = {};

  db.query(

    `SELECT COUNT(*) totalLeads
     FROM leads
      WHERE created_by_type = 'employee'
      AND created_by_id = ?`,

    [employeeId],

    (err, leadResult) => {

      if (err) {

        return res
        .status(500)
        .json({
          message:
          "Error fetching leads"
        });

      }

      stats.totalLeads =
      leadResult[0].totalLeads;

      db.query(

        `SELECT COUNT(*) totalFollowups
         FROM follow_ups
         WHERE employee_id = ?`,
        [employeeId],

        (err, followupResult) => {

          if (err) {
            console.log("followup error", err);

            return res
            .status(500)
            .json({
              message:
              "Error fetching followups"
            });

          }

          stats.totalFollowups =
          followupResult[0]
          .totalFollowups;

          db.query(

            `SELECT COUNT(*) convertedLeads
             FROM leads
              WHERE created_by_type = 'employee'
              AND created_by_id = ?
             AND lead_status = 'converted'`,

            [employeeId],

            (err, convertedResult) => {

              if (err) {

                return res
                .status(500)
                .json({
                  message:
                  "Error fetching conversions"
                });

              }

              stats.convertedLeads =
              convertedResult[0]
              .convertedLeads;

              db.query(

                `SELECT COUNT(*) pendingLeads
                 FROM leads
                  WHERE created_by_type = 'employee'
                  AND created_by_id = ?
                 AND lead_status NOT IN
                 ('converted','closed')`,

                [employeeId],

                (err, pendingResult) => {

                  if (err) {

                    return res
                    .status(500)
                    .json({
                      message:
                      "Error fetching pending leads"
                    });

                  }

                  stats.pendingLeads =
                  pendingResult[0]
                  .pendingLeads;

                  res.json(stats);

                }

              );

            }

          );

        }

      );

    }

  );

};

const updateEmployee =
async (req, res) => {

  try {

    const { id } =
    req.params;

    const {

      full_name,
      email,
      phone,
      department,
      designation,
      status

    } = req.body;
    const [duplicate] =
        await db.promise().query(

          `SELECT employee_id
          FROM employees
          WHERE (email = ? OR phone = ?)
          AND employee_id != ?`,

          [
            email,
            phone,
            id
          ]

        );

        if (duplicate.length > 0) {

          return res.status(400).json({

            message:
            "Email or phone number already exists"

          });

        }

    await db.promise().query(

      `UPDATE employees

       SET

       full_name = ?,
       email = ?,
       phone = ?,
       department = ?,
       designation = ?,
       status = ?

       WHERE employee_id = ?`,

      [

        full_name,
        email,
        phone,
        department,
        designation,
        status,
        id

      ]

    );

    res.json({

      message:
      "Employee Updated Successfully"

    });

  }

  catch (error) {

    res.status(500).json({

      message:
      "Failed to update employee"

    });

  }

};
// ==========================
// Export
// ==========================
module.exports = {

  createEmployee,


  getEmployees,

  getEmployeeById,

  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeProfile,
  changePassword,
  getEmployeeStats,
  updateEmployee

};