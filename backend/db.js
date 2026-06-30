const mysql = require("mysql2");

require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,

  port: process.env.DB_PORT,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0
});

db.getConnection((err, connection) => {

  if (err) {

    //console.log(
      //"Database Connection Failed:",
      //err
    //);

    return;

  }

  //console.log(
    //"MySQL Connected Successfully"
  //);

  connection.query(
    "SELECT DATABASE() AS db",
    (err, result) => {

      if (err) {

        console.log(
          "Database Check Failed:",
          err
        );

      } else {

        console.log(
          "Connected Database:",
          result[0].db
        );

      }

    }
  );

  connection.release();

});

module.exports = db;