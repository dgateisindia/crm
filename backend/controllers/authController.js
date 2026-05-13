const db = require("../db");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const { email, password } =
    req.body;

  const sql =
    "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, result) => {

    if (err) {
      return res.status(500).json({
        message: "Server Error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        message:
          "Invalid Email",
      });
    }

    const user = result[0];

    // Check password
    if (
      user.password !== password
    ) {
      return res.status(401).json({
        message:
          "Invalid Password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      "crmSecretKey",
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message:
        "Login Success",
      token,
      role: user.role,
      user,
    });
  });
};

module.exports = {
  login,
};