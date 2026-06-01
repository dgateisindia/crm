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
    `,

    [employeeId],

    (err, totalResult) => {

      if (err)
      return res.status(500)
      .json(err);


      stats.totalLeads =
      totalResult[0]
      .totalLeads;


      // ==========================
      // Contacted Leads
      // ==========================
      db.query(

        `
        SELECT COUNT(*) AS contacted

        FROM leads

        WHERE
        lead_status = 'contacted'

        AND

        created_by_id = ?
        `,

        [employeeId],

        (err, contactedResult) => {

          if (err)
          return res.status(500)
          .json(err);


          stats.contacted =
          contactedResult[0]
          .contacted;


          // ==========================
          // Qualified Leads
          // ==========================
          db.query(

            `
            SELECT COUNT(*) AS qualified

            FROM leads

            WHERE
            lead_status = 'qualified'

            AND

            created_by_id = ?
            `,

            [employeeId],

            (err, qualifiedResult) => {

              if (err)
              return res.status(500)
              .json(err);


              stats.qualified =
              qualifiedResult[0]
              .qualified;


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

};