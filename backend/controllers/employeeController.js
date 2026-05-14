const db = require("../db");

// Create Employee
const createEmployee =
(req, res) => {

  const {
    name,
    email,
    password,
    role,
  } = req.body;

  // Validation
  if (
    !name ||
    !email ||
    !password ||
    !role
  ) {
    return res.status(400).json({
      message:
        "All fields are required",
    });
  }

  const sql =
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

  db.query(
    sql,
    [
      name,
      email,
      password,
      role,
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          message:
            "Failed to create employee",
        });
      }

      res.status(201).json({
        message:
          "Employee created successfully",
      });
    }
  );
};

// Get Employees
const getEmployees =
(req, res) => {

  const sql =
    "SELECT id, name , email, role FROM users WHERE role = 'employee'";

  db.query(
    sql,
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          message:
            "Failed to fetch employees",
        });
      }

      res.status(200).json(
        result
      );
    }
  );
};

const getEmployeeById =
(req, res) => {

  const sql =
  "SELECT * FROM users WHERE id = ?";

  db.query(
    sql,
    [req.params.id],
    (err, result) => {

      if (err) {

        return res.status(500)
        .json({
          message:
          "Error"
        });
      }

      res.status(200)
      .json(result[0]);
    }
  );
};

// Export
module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
};
