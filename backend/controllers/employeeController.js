const db = require("../db");

const createEmployee = (req, res) => {
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
    [name, email, password, role],
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

module.exports = {
  createEmployee,
};