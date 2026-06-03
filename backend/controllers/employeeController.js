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

        //console.log(err);

        return res.status(500)
        .json({
          message:
          "Failed to create employee",
        });

      }

      // Generate EMP001
      const employeeCode =
      `EMP${String(
        result.insertId
      ).padStart(3, "0")}`;

      // Save employee code
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

            //console.log(updateErr);

            return res.status(500)
            .json({
              message:
              "Employee created but code generation failed",
            });

          }

          res.status(201)
          .json({

            message:
            "Employee created successfully",

            employee_code:
            employeeCode,

          });

        }
      );

    }

  );

};

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

// ==========================
// Export
// ==========================
module.exports = {

  createEmployee,

  getEmployees,

  getEmployeeById,

  deleteEmployee,
  updateEmployeeStatus

};