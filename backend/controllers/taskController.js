const db =
require("../db");

const XLSX =
require("xlsx");

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

const moveTaskToNotInterested =
(req, res) => {

    const leadId =
    req.params.leadId;

    const sql = `

    UPDATE leads

    SET lead_status =
    'not_interested'

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

          res.json({

            message:
            "Followup Scheduled"

          });

    }

  );

};


const getTaskFollowups =
(req, res) => {

  const employeeId =
  req.params.employeeId;

  const sql = `

        SELECT

            tf.*,

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

        AND l.lead_status = 'new'

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

module.exports = {

  getEmployeeTasks,
  getTaskFollowups,
  connectTaskToLead,
  moveTaskToNotInterested,
  saveTaskFollowup

};