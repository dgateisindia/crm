const db =
require("../db");


// ==========================
// Add Followup
// ==========================
const addFollowup =
(req, res) => {

  const {

    lead_id,
    employee_id,
    followup_mode,
    remarks,
    lead_status

  } = req.body;


  const sql = `

    INSERT INTO follow_ups (

      lead_id,
      employee_id,
      followup_mode,
      remarks,
      lead_status

    )

    VALUES (?, ?, ?, ?, ?)

  `;


  db.query(

    sql,

    [

      lead_id,
      employee_id,
      followup_mode,
      remarks,
      lead_status

    ],

    (err, result) => {

      if (err) {

        //console.log(err);

        return res.status(500)
        .json({

          message:
          "Failed to add followup"

        });

      }


      // ==========================
      // Update Lead Status
      // ==========================
      const updateLeadSql = `

        UPDATE leads

        SET lead_status = ?

        WHERE id = ?

      `;


      db.query(

        updateLeadSql,

        [

          lead_status,

          lead_id

        ],

        (updateErr) => {

          if (updateErr) {

            //console.log(
            //  updateErr
            //);

          }

          res.status(201)
          .json({

            message:
            "Followup Added Successfully"

          });

        }

      );

    }

  );

};




// ==========================
// Get All Followups
// ==========================
const getFollowups =
(req, res) => {

  const sql = `

    SELECT

      follow_ups.*,

      leads.company_name,

      employees.full_name

    FROM follow_ups

    LEFT JOIN leads

    ON follow_ups.lead_id =
    leads.id

    LEFT JOIN employees

    ON follow_ups.employee_id =
    employees.employee_id

    ORDER BY
    followup_id DESC

  `;


  db.query(

    sql,

    (err, result) => {

      if (err) {

        return res.status(500)
        .json(err);

      }

      res.status(200)
      .json(result);

    }

  );

};
// ==========================
// Get Employee Followups
// ==========================
const getEmployeeFollowups =
(req, res) => {

  const employeeId =
  req.params.employeeId;

  //console.log(
   // "Employee ID:",
   // employeeId
 // );

  const sql = `

    SELECT

      follow_ups.followup_id,

      follow_ups.followup_mode,

      follow_ups.remarks,

      follow_ups.lead_status,

      leads.company_name,

      employees.full_name

    FROM follow_ups

    INNER JOIN leads

    ON follow_ups.lead_id =
    leads.id

    INNER JOIN employees

    ON follow_ups.employee_id =
    employees.employee_id

    WHERE
    follow_ups.employee_id = ?

    ORDER BY
    follow_ups.followup_id DESC

  `;

  db.query(

    sql,

    [employeeId],

    (err, result) => {

      if (err) {

        //console.log(
        //  "DB ERROR:",
        //  err
        //);

        return res
        .status(500)
        .json({

          message:
          "Failed to fetch employee followups"

        });

      }

      //console.log(result);

      res.status(200)
      .json(result);

    }

  );

};




// ==========================
// Get Lead Followups
// ==========================
const getLeadFollowups =
(req, res) => {

  const leadId =
  req.params.leadId;

  const sql = `

    SELECT

      follow_ups.*,

      employees.full_name

    FROM follow_ups

    LEFT JOIN employees

    ON follow_ups.employee_id =
    employees.employee_id

    WHERE
    follow_ups.lead_id = ?

    ORDER BY
    followup_id DESC

  `;

  db.query(

    sql,

    [leadId],

    (err, result) => {

      if (err) {

        //    console.log(err);

        return res
        .status(500)
        .json({

message:
"Failed to fetch followups"

        });

      }

      res.status(200)
      .json(result);

    }

  );

};


module.exports = {

  addFollowup,
  getFollowups,
  getEmployeeFollowups,
  getLeadFollowups

};