const db =
require("../db");

const getDashboardStats =
(req, res) => {

  const stats = {};

  // Total Leads
  db.query(
    "SELECT COUNT(*) AS totalLeads FROM leads",
    (err, leadsResult) => {

      if (err)
        return res.status(500)
        .json(err);

      stats.totalLeads =
      leadsResult[0]
      .totalLeads;

      // Total Employees
      db.query(
        "SELECT COUNT(*) AS totalEmployees FROM users WHERE role='employee'",
        (err, empResult) => {

          if (err)
            return res.status(500)
            .json(err);

          stats.totalEmployees =
          empResult[0]
          .totalEmployees;

          // New Leads
          db.query(
            "SELECT COUNT(*) AS newLeads FROM leads WHERE lead_status='New Lead'",
            (err, newLeadResult) => {

              if (err)
                return res.status(500)
                .json(err);

              stats.newLeads =
              newLeadResult[0]
              .newLeads;

              // Converted Leads
              db.query(
                "SELECT COUNT(*) AS convertedLeads FROM leads WHERE lead_status='Converted'",
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

const getEmployeeStats =
(req, res) => {

  const employeeId =
  req.params.id;

  const stats = {};

  db.query(
    `
    SELECT COUNT(*) AS totalLeads
    FROM leads
    WHERE created_by = ?
    `,
    [employeeId],
    (err, totalResult) => {

      stats.totalLeads =
      totalResult[0]
      .totalLeads;

      db.query(
        `
        SELECT COUNT(*) AS connected
        FROM leads
        WHERE created_by = ?
        AND lead_status = 'Connected'
        `,
        [employeeId],
        (err, connectedResult) => {

          stats.connected =
          connectedResult[0]
          .connected;

          db.query(
            `
            SELECT COUNT(*) AS interested
            FROM leads
            WHERE created_by = ?
            AND lead_status = 'Interested'
            `,
            [employeeId],
            (err, interestedResult) => {

              stats.interested =
              interestedResult[0]
              .interested;

              db.query(
                `
                SELECT COUNT(*) AS converted
                FROM leads
                WHERE created_by = ?
                AND lead_status = 'Converted'
                `,
                [employeeId],
                (err, convertedResult) => {

                  stats.converted =
                  convertedResult[0]
                  .converted;

                  db.query(
                    `
                    SELECT *
                    FROM leads
                    WHERE created_by = ?
                    ORDER BY id DESC
                    LIMIT 5
                    `,
                    [employeeId],
                    (err, recentResult) => {

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
};