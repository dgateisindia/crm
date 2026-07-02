const db = require("../db");

// ==========================
// Company Report
// ==========================
const getCompanyReport =
(req, res) => {

  const range = req.query.range || "today";
  const { startDate, endDate } = req.query;

  let dateCondition = "";

  if (range === "today") {
    dateCondition = "DATE(created_at) = CURDATE()";
  }

  else if (range === "15days") {
    dateCondition = "created_at >= DATE_SUB(NOW(), INTERVAL 15 DAY)";
  }

  else if (range === "month") {
    dateCondition = `
      MONTH(created_at) = MONTH(NOW())
      AND YEAR(created_at) = YEAR(NOW())
    `;
  }

  else if (range === "year") {
    dateCondition = "YEAR(created_at) = YEAR(NOW())";
  }

  else if (range === "custom") {

  if (!startDate) {
    return res.status(400).json({
      message: "Start date is required"
    });
  }

  // If end date is not selected, use start date
  const fromDate = startDate;
  const toDate = endDate || startDate;

  dateCondition = `
    DATE(created_at)
    BETWEEN '${fromDate}'
    AND '${toDate}'
  `;
}

  const report = {};

  db.query(

    `SELECT COUNT(*) totalLeads
     FROM leads
     WHERE ${dateCondition}`,

    (err, leadResult) => {

      if (err) {

        return res.status(500).json(err);

      }

      report.totalLeads =
      leadResult[0].totalLeads;

      db.query(

        `SELECT COUNT(*) totalFollowups
         FROM follow_ups
         WHERE ${dateCondition}`,

        (err, followupResult) => {

          if (err) {

            return res.status(500).json(err);

          }

          report.totalFollowups =
          followupResult[0]
          .totalFollowups;

          db.query(

            `SELECT COUNT(*) convertedLeads
             FROM leads
             WHERE lead_status='converted'
             AND ${dateCondition}`,

            (err, convertedResult) => {

              if (err) {

                return res.status(500).json(err);

              }

              report.convertedLeads =
              convertedResult[0]
              .convertedLeads;

              db.query(

                `SELECT COUNT(*) pendingLeads
                 FROM leads
                 WHERE lead_status != 'converted'
                 AND ${dateCondition}`,

                (err, pendingResult) => {

                  if (err) {

                    return res.status(500).json(err);

                  }

                  report.pendingLeads =
                  pendingResult[0]
                  .pendingLeads;

                  db.query(

                    `SELECT COUNT(*) totalEmployees
                     FROM employees`,

                    (err, employeeResult) => {

                      if (err) {

                        return res.status(500).json(err);

                      }

                      report.totalEmployees =
                      employeeResult[0]
                      .totalEmployees;

                      res.json(report);

                    }

                  );

                }

              );

            }

          );

        }

      );

    }

  );

};
// ==========================
// Employee Report
// ==========================
const getEmployeeReport =
(req, res) => {

  const employeeId =
  req.params.id;

  const range = req.query.range || "today";
  const { startDate, endDate } = req.query;

  let dateCondition = "";

  if (range === "today") {
    dateCondition = "DATE(created_at) = CURDATE()";
  }

  else if (range === "15days") {
    dateCondition = "created_at >= DATE_SUB(NOW(), INTERVAL 15 DAY)";
  }

  else if (range === "month") {
    dateCondition = `
      MONTH(created_at)=MONTH(NOW())
      AND YEAR(created_at)=YEAR(NOW())
    `;
  }

  else if (range === "year") {
    dateCondition = "YEAR(created_at)=YEAR(NOW())";
  }

  else if (range === "custom") {

  if (!startDate) {
    return res.status(400).json({
      message: "Start date is required"
    });
  }

  // If end date is not selected, use start date
  const fromDate = startDate;
  const toDate = endDate || startDate;

  dateCondition = `
    DATE(created_at)
    BETWEEN '${fromDate}'
    AND '${toDate}'
  `;
}

  const report = {};

  db.query(

    `SELECT COUNT(*) totalLeads
     FROM leads
     WHERE created_by_type = 'employee'
     AND created_by_id = ?
     AND ${dateCondition}`,

    [employeeId],

    (err, leadResult) => {

      if (err)
        return res.status(500).json(err);

      report.totalLeads =
      leadResult[0].totalLeads;

      db.query(

        `SELECT COUNT(*) totalFollowups
         FROM follow_ups
         WHERE employee_id = ?
         AND ${dateCondition}`,

        [employeeId],

        (err, followupResult) => {

          if (err)
            return res.status(500).json(err);

          report.totalFollowups =
          followupResult[0].totalFollowups;

          db.query(

            `SELECT COUNT(*) convertedLeads
             FROM leads
             WHERE created_by_type = 'employee'
             AND created_by_id = ?
             AND lead_status = 'converted'
             AND ${dateCondition}`,

            [employeeId],

            (err, convertedResult) => {

              if (err)
                return res.status(500).json(err);

              report.convertedLeads =
              convertedResult[0].convertedLeads;

              db.query(

                `SELECT COUNT(*) pendingLeads
                 FROM leads
                 WHERE created_by_type = 'employee'
                 AND created_by_id = ?
                 AND lead_status != 'converted'
                 AND ${dateCondition}`,

                [employeeId],

                (err, pendingResult) => {

                  if (err)
                    return res.status(500).json(err);

                  report.pendingLeads =
                  pendingResult[0].pendingLeads;

                  {/*report.conversionRate =
                  report.totalLeads > 0
                    ? (
                        report.convertedLeads /
                        report.totalLeads
                      ) * 100
                    : 0;

                  res.json(report);*/}

                }

              );

            }

          );

        }

      );

    }

  );

};
module.exports = {
  getCompanyReport,
  getEmployeeReport
};