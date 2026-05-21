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
    next_followup_date,
    status

  } = req.body;


  const sql = `

    INSERT INTO follow_ups (

      lead_id,
      employee_id,
      followup_mode,
      remarks,
      next_followup_date,
      status

    )

    VALUES (?, ?, ?, ?, ?, ?)

  `;


  db.query(

    sql,

    [

      lead_id,
      employee_id,
      followup_mode,
      remarks,
      next_followup_date || null,
      status || "pending"

    ],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500)
        .json({

          message:
          "Failed to add followup"

        });

      }

      res.status(201)
      .json({

        message:
        "Followup Added Successfully"

      });

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

  const sql = `

    SELECT

      follow_ups.*,

      leads.company_name

    FROM follow_ups

    LEFT JOIN leads

    ON follow_ups.lead_id =
    leads.id

    WHERE
    follow_ups.employee_id = ?

    ORDER BY
    followup_id DESC

  `;


  db.query(

    sql,

    [employeeId],

    (err, result) => {

      if (err) {

        console.log(err);

        return res
        .status(500)
        .json({

message:
"Failed to fetch employee followups"

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
  getEmployeeFollowups


};