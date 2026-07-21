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

        //console.log(err);

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

            //console.log(
            //  updateErr
            //);

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

        //console.log(err);

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
//get manager profile
const getManagerProfile = (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT
            manager_id,
            manager_code,
            full_name,
            email,
            phone,
            department,
            designation,
            status
        FROM managers
        WHERE manager_id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result[0]);
    });

};
//update manager profile
const updateManagerProfile = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            full_name,
            phone,
            designation
        } = req.body;

        const [duplicate] = await db.promise().query(
            `SELECT manager_id
             FROM managers
             WHERE phone = ?
             AND manager_id != ?`,
            [phone, id]
        );

        if (duplicate.length > 0) {
            return res.status(400).json({
                message: "Phone number already exists"
            });
        }

        await db.promise().query(
            `UPDATE managers
             SET
                full_name = ?,
                phone = ?,
                designation = ?
             WHERE manager_id = ?`,
            [
                full_name,
                phone,
                designation,
                id
            ]
        );

        res.json({
            message: "Profile Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to update profile"
        });

    }

};
//change manager password
const changeManagerPassword = (req, res) => {

    const id = req.params.id;

    const { newPassword } = req.body;

    db.query(
        `
        UPDATE managers
        SET password = ?
        WHERE manager_id = ?
        `,
        [
            newPassword,
            id
        ],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Password Updated"
            });

        }
    );

};


module.exports = {

  createManager,
  getManagers,
  getManagerProfile,
  updateManagerProfile,
  changeManagerPassword

};