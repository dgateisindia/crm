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
const getManagers = async (req, res) => {
  try {
    const { companyId, role } = req.user;

    if (
      !companyId ||
      !["manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Manager list access denied"
      });
    }

    const [managers] = await db.promise().query(
      `SELECT
         manager_id,
         company_id,
         user_id,
         manager_code,
         full_name,
         email,
         phone,
         department,
         designation,
         status
       FROM managers
       WHERE company_id = ?
       ORDER BY manager_id DESC`,
      [companyId]
    );

    return res.status(200).json(managers);

  } catch (error) {
    console.error("GET MANAGERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch managers"
    });
  }
};
//get manager profile
const getManagerProfile = async (req, res) => {
  try {
    const managerId = Number(req.params.id);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(managerId) ||
      managerId <= 0 ||
      !userId ||
      !companyId ||
      !["manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Manager profile access denied"
      });
    }

    const [rows] = await db.promise().query(
      `SELECT
         manager_id,
         company_id,
         user_id,
         manager_code,
         full_name,
         email,
         phone,
         department,
         designation,
         status
       FROM managers
       WHERE manager_id = ?
         AND company_id = ?
         AND user_id = ?
         AND status = 'active'
       LIMIT 1`,
      [managerId, companyId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Manager profile not found"
      });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error("GET MANAGER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch manager profile"
    });
  }
};
//update manager profile
const updateManagerProfile = async (req, res) => {
  try {
    const managerId = Number(req.params.id);

    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(managerId) ||
      managerId <= 0 ||
      !userId ||
      !companyId ||
      !["manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Manager profile access denied"
      });
    }

    const fullName = String(req.body.full_name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const designation = String(req.body.designation || "").trim();

    if (!fullName || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Valid name and 10-digit phone are required"
      });
    }

    const [duplicate] = await db.promise().query(
      `SELECT manager_id
       FROM managers
       WHERE phone = ?
         AND manager_id <> ?
       LIMIT 1`,
      [phone, managerId]
    );

    if (duplicate.length) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists"
      });
    }

    const [result] = await db.promise().query(
      `UPDATE managers
       SET full_name = ?,
           phone = ?,
           designation = ?
       WHERE manager_id = ?
         AND company_id = ?
         AND user_id = ?
         AND status = 'active'`,
      [
        fullName,
        phone,
        designation,
        managerId,
        companyId,
        userId
      ]
    );

    if (result.affectedRows !== 1) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own manager profile"
      });
    }

    return res.json({
      success: true,
      message: "Profile Updated Successfully"
    });

  } catch (error) {
    console.error("UPDATE MANAGER PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
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