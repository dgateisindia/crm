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
    FROM tasks
    WHERE employee_id = ?
    ORDER BY task_id DESC

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

  const taskId =
  req.params.taskId;

  const getTaskSql = `

    SELECT *
    FROM tasks
    WHERE task_id = ?

  `;

  db.query(

    getTaskSql,

    [taskId],

    (err, taskResult) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      if (
        taskResult.length === 0
      ) {

        return res
        .status(404)
        .json({
          message:
          "Task not found"
        });

      }

      const task =
      taskResult[0];

      const insertLeadSql = `

        INSERT INTO leads
        (
        company_name,
        contact_person_name,
        phone,
        email,
        city,
        source,
        lead_mode,
        lead_status,
        created_by_id
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

      `;
      //console.log(task);

      db.query(

        insertLeadSql,

        [

          task.company_name,

          task.contact_person_name,

          task.phone,

          task.email,

          task.city,

          "task",
          "phone_call",

          "new",
          task.employee_id


        ],

        (err) => {

          if (err) {

                //console.log("Lead Insert Error:", err);


            return res
            .status(500)
            .json(err);

          }

          db.query(

            "DELETE FROM tasks WHERE task_id = ?",

            [taskId],

            (err) => {

              if (err) {

                return res
                .status(500)
                .json(err);

              }

              res.json({

                message:
                "Task converted to Lead"

              });

            }

          );

        }

      );

    }

  );

};
const uploadTasks =
(req, res) => {

  try {

    if (!req.file) {

      return res
      .status(400)
      .json({
        message:
        "No file uploaded"
      });

    }

    const workbook =
    XLSX.readFile(
      req.file.path
    );

    const sheetName =
    workbook.SheetNames[0];

    const sheet =
    workbook.Sheets[
      sheetName
    ];

    const rows =
    XLSX.utils
    .sheet_to_json(
      sheet
    );

    let inserted = 0;

    let duplicates = 0;

    const employee_id =
    req.body.created_by_id;

    rows.forEach(

      (row) => {

        const company_name =

          row["Company Name"] ||
          row.company_name;

          const contact_person_name =

          row["Contact Person"] ||
          row.contact_person_name;

          const phone =

          row["Phone"] ||
          row.phone;

          const email =

          row["Email"] ||
          row.email;

          const city =

          row["City"] ||
          row.city;

        const duplicateSql = `

          SELECT *

          FROM tasks

          WHERE phone = ?

        `;

        db.query(

          duplicateSql,

          [phone],

          (
            err,
            duplicateResult
          ) => {

            if (
              duplicateResult.length > 0
            ) {

              duplicates++;

              return;

            }

            const insertSql = `

              INSERT INTO tasks
              (

                company_name,
                contact_person_name,
                phone,
                email,
                city,
                task_status,
                employee_id

              )

              VALUES
              (
                ?, ?, ?, ?, ?, ?, ?
              )

            `;

            db.query(

              insertSql,

              [

                company_name,

                contact_person_name,

                phone,

                email || "",

                city || "",

                "pending",

                employee_id

              ]

            );

            inserted++;

          }

        );

      }

    );

    setTimeout(() => {

      res.status(200)
      .json({

        message:
        "Tasks Uploaded",

        inserted,

        duplicates

      });

    }, 3000);

  }

  catch (error) {

    res.status(500)
    .json({

      message:
      "Task upload failed"

    });

  }

};

module.exports = {
  getEmployeeTasks,
  connectTaskToLead,
  uploadTasks
};