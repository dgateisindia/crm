const db =
require("../db");


// ==========================
// Create Manager
// ==========================
const createManager =
(req, res) => {

  const {

    full_name,
    email,
    phone,
    password,
    department,
    designation,
    status

  } = req.body;

  if (
    !full_name ||
    !email ||
    !password
  ) {

    return res.status(400)
    .json({
      message:
      "Required fields missing"
    });

  }

  const sql = `
    INSERT INTO managers (

      full_name,
      email,
      phone,
      password,
      department,
      designation,
      status

    )

    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(

    sql,

    [

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
          "Failed to create manager"
        });

      }

      // Generate Manager Code
      const managerCode =
      `MGR${String(
        result.insertId
      ).padStart(3, "0")}`;

      const updateSql = `
        UPDATE managers
        SET manager_code = ?
        WHERE manager_id = ?
      `;

      db.query(

        updateSql,

        [
          managerCode,
          result.insertId
        ],

        (updateErr) => {

          if (updateErr) {

            console.log(
              updateErr
            );

            return res.status(500)
            .json({
              message:
              "Manager created but code generation failed"
            });

          }

          res.status(201)
          .json({

            message:
            "Manager created successfully",

            manager_code:
            managerCode

          });

        }

      );

    }

  );

};


// ==========================
// Get Managers
// ==========================
const getManagers =
(req, res) => {

  const sql = `
    SELECT *
    FROM managers
    ORDER BY manager_id DESC
  `;

  db.query(
    sql,
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500)
        .json({
          message:
          "Failed to fetch managers"
        });

      }

      res.status(200)
      .json(result);

    }
  );

};


module.exports = {

  createManager,
  getManagers

};