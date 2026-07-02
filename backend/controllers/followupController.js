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

      return res.status(500).json({

        message: "Failed to update lead status"

      });

    }

    // Remove from Task Followups
    db.query(

      `
      DELETE FROM task_followups
      WHERE lead_id = ?
      `,

      [lead_id],

      (deleteErr) => {

        if (deleteErr) {

          return res.status(500).json({

            message: "Lead updated but failed to remove task followup"

          });

        }

        res.status(201).json({

          message: "Followup Added Successfully"

        });

      }

    );

  }

);
    }

  );

};



// ==========================
// Get All Followups
// ==========================
const getFollowups = (req, res) => {

  const sql = `

    SELECT

      l.id AS lead_id,
      l.company_name,
      l.lead_status,

      MAX(f.followup_id) AS latest_followup,

      (
        SELECT e.full_name
        FROM employees e
        WHERE e.employee_id =
        (
          SELECT employee_id
          FROM follow_ups
          WHERE lead_id = l.id
          ORDER BY followup_id DESC
          LIMIT 1
        )
      ) AS full_name,

      (
        SELECT followup_mode
        FROM follow_ups
        WHERE lead_id = l.id
        ORDER BY followup_id DESC
        LIMIT 1
      ) AS followup_mode,

      (
        SELECT remarks
        FROM follow_ups
        WHERE lead_id = l.id
        ORDER BY followup_id DESC
        LIMIT 1
      ) AS remarks

    FROM leads l

     JOIN follow_ups f
    ON l.id = f.lead_id

    GROUP BY l.id

    ORDER BY latest_followup DESC

  `;

  db.query(sql, (err, result) => {

    if (err) {

      return res
      .status(500)
      .json(err);

    }

    res.status(200)
    .json(result);

  });

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

          l.id AS lead_id,

          l.company_name,

          l.lead_status,

          MAX(f.followup_id) AS latest_followup,

          (
            SELECT followup_mode
            FROM follow_ups
            WHERE lead_id = l.id
              AND employee_id = ?
            ORDER BY followup_id DESC
            LIMIT 1
          ) AS followup_mode,

          (
            SELECT remarks
            FROM follow_ups
            WHERE lead_id = l.id
              AND employee_id = ?
            ORDER BY followup_id DESC
            LIMIT 1
          ) AS remarks

        FROM leads l

        JOIN follow_ups f
        ON l.id = f.lead_id

        WHERE f.employee_id = ?

        GROUP BY l.id

        ORDER BY latest_followup DESC

        `;

  db.query(

    sql,

    [employeeId, employeeId, employeeId],

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
const getLeadHistory = async (req, res) => {

  const { leadId } = req.params;

  try {

    const [rows] =
      await db.promise().query(

        `SELECT
          followup_id,
          followup_mode,
          lead_status,
          remarks,
          next_followup_date,
          created_at
         FROM follow_ups
         WHERE lead_id = ?
         ORDER BY created_at DESC`,

        [leadId]

      );

    res.json(rows);

  } catch (error) {

    //console.log(error);

    res.status(500).json({
      message: "Error fetching history"
    });

  }

};

module.exports = {

  addFollowup,
  getFollowups,
  getEmployeeFollowups,
  getLeadFollowups,
  getLeadHistory

};