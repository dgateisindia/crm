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


  // Validation
  if (
    !manager_id ||
    !role_id ||
    !full_name ||
    !email ||
    !password
  ) {

    return res.status(400)
    .json({
      message:
      "Required fields are missing",
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

      role_id,

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

        console.log(err);

        return res.status(500)
        .json({
          message:
          "Failed to create employee",
        });

      }

      res.status(201)
      .json({
        message:
        "Employee created successfully",
      });

    }
  );

};


// ==========================
// Get All Employees
// ==========================
const getEmployees =
(req, res) => {

  const sql = `
    SELECT

      employees.employee_id,

      employees.full_name,

      employees.email,

      employees.phone,

      employees.department,

      employees.designation,

      employees.status,

      employee_roles.role_name

    FROM employees

    JOIN employee_roles

    ON employees.role_id = employee_roles.role_id

    ORDER BY employees.employee_id DESC
  `;


  db.query(
    sql,
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500)
        .json({
          message:
          "Failed to fetch employees",
        });

      }

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
    SELECT *

    FROM employees

    WHERE employee_id = ?
  `;


  db.query(
    sql,
    [employeeId],

    (err, result) => {

      if (err) {

        console.log(err);

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

        console.log(err);

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


// ==========================
// Export
// ==========================
module.exports = {

  createEmployee,

  getEmployees,

  getEmployeeById,

  deleteEmployee

};