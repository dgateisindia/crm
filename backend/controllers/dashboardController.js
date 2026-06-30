const db =
require("../db");


// ==========================
// MANAGER DASHBOARD
// ==========================
const getDashboardStats =
(req, res) => {

  const stats = {};

  // Total Leads
  db.query(
    `
    SELECT COUNT(*) AS totalLeads
    FROM leads
    `,
    (err, leadsResult) => {

      if (err)
      return res.status(500)
      .json(err);

      stats.totalLeads =
      leadsResult[0]
      .totalLeads;

      // Total Employees
      db.query(
        `
        SELECT COUNT(*) AS totalEmployees
        FROM employees
        `,
        (err, empResult) => {

          if (err)
          return res.status(500)
          .json(err);

          stats.totalEmployees =
          empResult[0]
          .totalEmployees;

          // New Leads
          db.query(
            `
            SELECT COUNT(*) AS newLeads
            FROM leads
            WHERE lead_status = 'new'
            `,
            (err, newLeadResult) => {

              if (err)
              return res.status(500)
              .json(err);

              stats.newLeads =
              newLeadResult[0]
              .newLeads;

              // Converted Leads
              db.query(
                `
                SELECT COUNT(*) AS convertedLeads
                FROM leads
                WHERE lead_status = 'converted'
                `,
                (err, convertedResult) => {

                  if (err)
                  return res.status(500)
                  .json(err);

                  stats.convertedLeads =
                  convertedResult[0]
                  .convertedLeads;

                  // Recent Leads
                  db.query(
                    `
                    SELECT *
                    FROM leads
                    ORDER BY id DESC
                    LIMIT 5
                    `,
                    (err, recentResult) => {

                      if (err)
                      return res.status(500)
                      .json(err);

                      stats.recentLeads =
                      recentResult;

                      res.status(200)
                      .json(stats);

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
const getLeadStatusChart = (req, res) => {

  db.query(

    `
    SELECT
      lead_status,
      COUNT(*) AS total
    FROM leads
    GROUP BY lead_status
    `,

    (err, result) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);

    }

  );

};
const getEmployeePerformance = (req, res) => {

  db.query(

    `
    SELECT

      e.full_name,

      COUNT(l.id) AS totalLeads

    FROM employees e

    LEFT JOIN leads l

      ON e.employee_id = l.created_by_id
      AND l.created_by_type='employee'

    GROUP BY e.employee_id

    ORDER BY totalLeads DESC
    `,

    (err, result) => {

      if (err)
        return res.status(500).json(err);

      res.json(result);

    }

  );

};
const getEmployeeLeadStatusChart = (req, res) => {

  const employeeId = req.params.id;

  db.query(

    `
    SELECT
      lead_status,
      COUNT(*) AS total
    FROM leads
    WHERE created_by_type='employee'
    AND created_by_id=?
    GROUP BY lead_status
    `,

    [employeeId],

    (err, result) => {

      if (err)
        return res.status(500).json(err);

      res.json(result);

    }

  );

};
const getEmployeeLeadTrend = (req, res) => {

  const employeeId = req.params.id;

  db.query(

    `
    SELECT

      DATE(created_at) AS date,

      COUNT(*) AS total

    FROM leads

    WHERE created_by_type='employee'

    AND created_by_id=?

    GROUP BY DATE(created_at)

    ORDER BY DATE(created_at)
    `,

    [employeeId],

    (err, result) => {

      if (err)
        return res.status(500).json(err);

      res.json(result);

    }

  );

};
const getEmployeeFollowupChart = (req, res) => {

  const employeeId = req.params.id;

  db.query(

    `
    SELECT

      status,

      COUNT(*) AS total

    FROM follow_ups

    WHERE employee_id=?

    GROUP BY status
    `,

    [employeeId],

    (err, result) => {

      if (err)
        return res.status(500).json(err);

      res.json(result);

    }

  );

};
const getLeadTrend = (req, res) => {

  db.query(

    `
    SELECT

      DATE(created_at) AS date,

      COUNT(*) AS total

    FROM leads

    GROUP BY DATE(created_at)

    ORDER BY DATE(created_at)
    `,

    (err, result) => {

      if (err)
        return res.status(500).json(err);

      res.json(result);

    }

  );

};

// ==========================
// EMPLOYEE DASHBOARD
// ==========================
const getEmployeeStats =
(req, res) => {

  const stats = {};

  const employeeId =
  req.params.id;


  // ==========================
  // Total Leads
  // ==========================
  db.query(

    `
    SELECT COUNT(*) AS totalLeads

    FROM leads

    WHERE
    created_by_id = ?
    AND created_by_type = 'employee'
    `,

    [employeeId],

    (err, totalResult) => {

      if (err)
      return res.status(500)
      .json(err);


      stats.totalLeads =
      totalResult[0]
      .totalLeads;


      // Connected Leads
          db.query(

            `
            SELECT COUNT(*) AS connected

            FROM leads

            WHERE
            lead_status = 'connected'

            AND created_by_id = ?
            AND created_by_type = 'employee'
            `,

            [employeeId],

            (err, connectedResult) => {

              if (err)
                return res.status(500).json(err);

              stats.connected =
                connectedResult[0].connected;

              // New Leads
              db.query(

                `
                SELECT COUNT(*) AS newLeads

                FROM leads

                WHERE
                lead_status = 'new'

                AND created_by_id = ?
                AND created_by_type = 'employee'
                `,

                [employeeId],

                (err, newResult) => {

                  if (err)
                    return res.status(500).json(err);

                  stats.new =
                    newResult[0].newLeads;


              // ==========================
              // Converted Leads
              // ==========================
              db.query(

                `
                SELECT COUNT(*) AS converted

                FROM leads

                WHERE
                lead_status = 'converted'

                AND

                created_by_id = ?
                AND created_by_type = 'employee'
                `,

                [employeeId],

                (err, convertedResult) => {

                  if (err)
                  return res.status(500)
                  .json(err);


                  stats.converted =
                  convertedResult[0]
                  .converted;


                  // ==========================
                  // Recent Leads
                  // ==========================
                  db.query(

                    `
                    SELECT *

                    FROM leads

                    WHERE
                    created_by_id = ?
                    AND created_by_type = 'employee'

                    ORDER BY id DESC

                    LIMIT 5
                    `,

                    [employeeId],

                    (err, recentResult) => {

                      if (err)
                      return res.status(500)
                      .json(err);


                      stats.recentLeads =
                      recentResult;


                      res.status(200)
                      .json(stats);

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

module.exports = {

  getDashboardStats,
  getEmployeeStats,

  getLeadStatusChart,
  getEmployeePerformance,
  getLeadTrend,


  getEmployeeLeadStatusChart,
  getEmployeeLeadTrend,
  getEmployeeFollowupChart


};