const db =
require("../db");

const XLSX =
require("xlsx");

// ==========================
// Add Lead History
// ==========================
const addLeadHistory = (

  lead_id,

  employee_id,

  remarks,

  followup_date,

  followup_time,

  lead_status = "new",

  followup_mode = "call"

) => {

  const nextFollowup =

    `${followup_date} ${followup_time}`;

  const sql = `

    INSERT INTO follow_ups

    (

      lead_id,

      employee_id,

      contact_date,

      followup_mode,

      remarks,

      next_followup_date,

      status,

      lead_status

    )

    VALUES

    (?, ?, NOW(), ?, ?, ?, ?, ?)

  `;

  db.query(

    sql,

    [

      lead_id,

      employee_id,

      followup_mode,

      remarks,

      nextFollowup,

      "pending",

      lead_status

    ],

    (err) => {

      if (err) {

        console.log(

          "Followup History Error:",

          err

        );

      }

      else {

        console.log(

          "Lead History Added"

        );

      }

    }

  );

};

// ==========================
// Get Employee Tasks
// ==========================
const getEmployeeTasks =
(req, res) => {

  const employeeId =
  req.params.employeeId;

  const sql = `

    SELECT *

    FROM leads

    WHERE

    lead_status = 'new'

    AND created_by_type = 'employee'

    AND created_by_id = ?

    AND id NOT IN (

      SELECT lead_id

      FROM task_followups

    )

    ORDER BY id DESC

  `;

  db.query(

    sql,

    [employeeId],

    (err, result) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json(result);

    }

  );

};

// ==========================
// Move Task To Lead
// ==========================
const connectTaskToLead =
(req, res) => {

  const leadId =
  req.params.leadId;

  const sql = `

    UPDATE leads

    SET lead_status = 'interested'

    WHERE id = ?

  `;

  db.query(

    sql,

    [leadId],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json({

        message:
        "Task moved to Leads"

      });

    }

  );

};

// ==========================
// Not Interested
// ==========================
const moveTaskToNotInterested =
(req, res) => {

  const leadId =
  req.params.leadId;

  const sql = `

    UPDATE leads

    SET lead_status = 'not interested'

    WHERE id = ?

  `;

  db.query(

    sql,

    [leadId],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json({

        message:
        "Moved to Not Interested"

      });

    }

  );

};

// ==========================
// Save Task Followup
// ==========================
const saveTaskFollowup =
(req, res) => {

  const {

    lead_id,

    employee_id,

    followup_date,

    followup_time,

    remarks

  } = req.body;

  const insertSql = `

    INSERT INTO task_followups
    (

      lead_id,

      employee_id,

      followup_date,

      followup_time,

      remarks

    )

    VALUES
    (?, ?, ?, ?, ?)

  `;

  db.query(

    insertSql,

    [

      lead_id,

      employee_id,

      followup_date,

      followup_time,

      remarks

    ],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      // Update Lead Status
      db.query(

        `

        UPDATE leads

        SET lead_status = 'new'

        WHERE id = ?

        `,

        [lead_id]

      );

      // Add Lead History
      addLeadHistory(

        lead_id,

        employee_id,

        remarks,

        followup_date,

        followup_time,

        "new",

        "call"

      );

      res.json({

        message:
        "Followup Scheduled"

      });

    }

  );

};

// ==========================
// Get Task Followups
// ==========================
const getTaskFollowups =
(req, res) => {

  const employeeId =
  req.params.employeeId;

  const sql = `

    SELECT

        tf.followup_id,

        tf.lead_id,

        tf.employee_id,

        DATE_FORMAT(
          tf.followup_date,
          '%Y-%m-%d'
        ) AS followup_date,

        tf.followup_time,

        tf.remarks,

        l.company_name,

        l.contact_person_name,

        l.phone,

        l.email,

        l.city,

        l.lead_status
        
    FROM task_followups tf

    JOIN leads l

    ON tf.lead_id = l.id

    WHERE

    tf.employee_id = ?

    ORDER BY tf.followup_date ASC

  `;

  db.query(

    sql,

    [employeeId],

    (err, result) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json(result);

    }

  );

};
const editTaskFollowup = (
  req,
  res
) => {

  const leadId =
  req.params.leadId;

  const {

    followup_date,

    followup_time,

    remarks

  } = req.body;

  const sql = `

    UPDATE task_followups

    SET

      followup_date = ?,

      followup_time = ?,

      remarks = ?

    WHERE lead_id = ?

  `;

  db.query(

    sql,

    [

      followup_date,

      followup_time,

      remarks,

      leadId

    ],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json({

        message:

        "Task Followup Updated"

      });

    }

  );

};
const addTaskFollowup = (
  req,
  res
) => {

  const leadId =
  req.params.leadId;

  const {

    employee_id,

    followup_date,

    followup_time,

    remarks

  } = req.body;

  const updateSql = `

    UPDATE task_followups

    SET

      followup_date = ?,

      followup_time = ?,

      remarks = ?

    WHERE lead_id = ?

  `;

  db.query(

    updateSql,

    [

      followup_date,

      followup_time,

      remarks,

      leadId

    ],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      // History Entry

      const historySql = `

        INSERT INTO follow_ups

        (

          lead_id,

          employee_id,

          contact_date,

          followup_mode,

          remarks,

          next_followup_date,

          status,

          lead_status

        )

        VALUES

        (

          ?,

          ?,

          NOW(),

          'call',

          ?,

          ?,

          'completed',

          'new'

        )

      `;

      db.query(

        historySql,

        [

          leadId,

          employee_id,

          remarks,

          `${followup_date} ${followup_time}`

        ],

        (err) => {

          if (err) {

            return res
            .status(500)
            .json(err);

          }

          res.json({

            message:

            "Task Followup Added"

          });

        }

      );

    }

  );

};

module.exports = {

  getEmployeeTasks,

  getTaskFollowups,

  connectTaskToLead,

  moveTaskToNotInterested,

  saveTaskFollowup,

  editTaskFollowup,

  addTaskFollowup

};