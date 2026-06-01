const mysql = require("mysql2");

require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
db.connect((err) => {
  if (err) {
    console.error("MySQL Connection Error:", err);
    return;
  }

  console.log("MySQL Connected Successfully");

  db.query(
    "SELECT DATABASE() AS db",
    (err, result) => {
      if (err) {
        console.error("Database Check Error:", err);
      } else {
        console.log("Connected Database:", result);
      }
    }
  );

});
module.exports =
db;
