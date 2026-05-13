const db = require("../db");

const createEmployee = (req, res) => {
  const {
    name,
    email,
    password,
    role,
  } = req.body;

  // Required fields
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

  // Password length
  if (password.length < 6) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters",
    });
  }

  // Email format
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message:
        "Invalid email format",
    });
  }

  // Check duplicate email
  const checkEmail =
    "SELECT * FROM users WHERE email = ?";

  db.query(
    checkEmail,
    [email],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Server Error",
        });
      }

      if (result.length > 0) {
        return res.status(400).json({
          message:
            "Email already exists",
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
    }
  );
};

module.exports = {
  createEmployee,
};