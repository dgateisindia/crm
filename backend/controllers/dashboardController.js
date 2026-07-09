const db =
require("../db");

// ==========================
// MANAGER DASHBOARD
// ==========================
const getDashboardStats = (req, res) => {

  const stats = {};

  // Total Leads
  db.query(
    `
    SELECT COUNT(*) AS totalLeads
    FROM leads
    `,
    (err, totalResult) => {

      if (err)
        return res.status(500).json(err);

      stats.totalLeads =
        totalResult[0].totalLeads;

      // New Leads
      db.query(
        `
        SELECT COUNT(*) AS newLeads
        FROM leads
        WHERE lead_status='new'
        `,
        (err, newResult) => {

          if (err)
            return res.status(500).json(err);

          stats.newLeads =
            newResult[0].newLeads;

          // Followups
          db.query(
            `
            SELECT COUNT(*) AS followups
            FROM leads
            WHERE lead_status NOT IN
            (
              'new',
              'converted',
              'closed',
              'not_interested'
            )
            `,
            (err, followupResult) => {

              if (err)
                return res.status(500).json(err);

              stats.followups =
                followupResult[0].followups;

              // Converted
              db.query(
                `
                SELECT COUNT(*) AS converted
                FROM leads
                WHERE lead_status='converted'
                `,
                (err, convertedResult) => {

                  if (err)
                    return res.status(500).json(err);

                  stats.converted =
                    convertedResult[0].converted;

                  // Closed
                  db.query(
                    `
                    SELECT COUNT(*) AS closed
                    FROM leads
                    WHERE lead_status='closed'
                    `,
                    (err, closedResult) => {

                      if (err)
                        return res.status(500).json(err);

                      stats.closed =
                        closedResult[0].closed;

                      // Not Interested
                      db.query(
                        `
                        SELECT COUNT(*) AS notInterested
                        FROM leads
                        WHERE lead_status='not_interested'
                        `,
                        (err, notInterestedResult) => {

                          if (err)
                            return res.status(500).json(err);

                          stats.notInterested =
                            notInterestedResult[0].notInterested;

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
                                return res.status(500).json(err);

                              stats.recentLeads =
                                recentResult;

                              res.status(200).json(stats);

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
const getEmployeeLeadTrend = async (req, res) => {

  const employeeId = req.params.id;

  try {

    const [result] = await db.promise().query(

      `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total
      FROM leads
      WHERE
        created_by_type='employee'
        AND created_by_id=?
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `,

      [employeeId]

    );

    const chart = [];

    for (let i = 6; i >= 0; i--) {

      const d = new Date();

      d.setDate(d.getDate() - i);

      const date = d.toISOString().split("T")[0];

      const found = result.find(
        r => r.date.toISOString().split("T")[0] === date
      );

      chart.push({

        date,

        total: found ? found.total : 0

      });

    }

    res.json(chart);

  }

  catch (err) {

    res.status(500).json(err);

  }

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
const getLeadTrend = async (req, res) => {

  try {

    const [result] = await db.promise().query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total
      FROM leads
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    const chart = [];

    for (let i = 6; i >= 0; i--) {

      const d = new Date();

      d.setDate(d.getDate() - i);

      const date = d.toISOString().split("T")[0];

      const found = result.find(
        r => r.date.toISOString().split("T")[0] === date
      );

      chart.push({
        date,
        total: found ? found.total : 0
      });

    }

    res.json(chart);

  } catch (err) {

    res.status(500).json(err);

  }

};
// ==========================
// EMPLOYEE DASHBOARD
// ==========================
const getEmployeeStats = (req, res) => {

  const stats = {};
  const employeeId = req.params.id;

  // Total Leads
  db.query(
    `
    SELECT COUNT(*) AS totalLeads
    FROM leads
    WHERE created_by_id = ?
    AND created_by_type = 'employee'
    `,
    [employeeId],
    (err, totalResult) => {

      if (err)
        return res.status(500).json(err);

      stats.totalLeads = totalResult[0].totalLeads;

      // New Leads
      db.query(
        `
        SELECT COUNT(*) AS newLeads
        FROM leads
        WHERE lead_status='new'
        AND created_by_id=?
        AND created_by_type='employee'
        `,
        [employeeId],
        (err, newResult) => {

          if (err)
            return res.status(500).json(err);

          stats.newLeads = newResult[0].newLeads;

        // Follow-ups
    db.query(
      `
      SELECT COUNT(DISTINCT f.lead_id) AS followups
      FROM follow_ups f
      INNER JOIN leads l
        ON l.id = f.lead_id
      WHERE
        f.employee_id = ?
        AND l.created_by_type = 'employee'
        AND l.created_by_id = ?
        AND l.lead_status IN
        (
          'interested',
          'proposed',
          'offered',
          'meeting scheduled'
        )
      `,
      [employeeId, employeeId],
      (err, followupResult) => {

        if (err)
          return res.status(500).json(err);

        stats.followups = followupResult[0].followups;


              // Converted
              db.query(
                `
                SELECT COUNT(*) AS converted
                FROM leads
                WHERE lead_status='converted'
                AND created_by_id=?
                AND created_by_type='employee'
                `,
                [employeeId],
                (err, convertedResult) => {

                  if (err)
                    return res.status(500).json(err);

                  stats.converted = convertedResult[0].converted;

                  // Closed
                  db.query(
                    `
                    SELECT COUNT(*) AS closed
                    FROM leads
                    WHERE lead_status='closed'
                    AND created_by_id=?
                    AND created_by_type='employee'
                    `,
                    [employeeId],
                    (err, closedResult) => {

                      if (err)
                        return res.status(500).json(err);

                      stats.closed = closedResult[0].closed;

                      // Not Interested
                      db.query(
                        `
                        SELECT COUNT(*) AS notInterested
                        FROM leads
                        WHERE lead_status='not_interested'
                        AND created_by_id=?
                        AND created_by_type='employee'
                        `,
                        [employeeId],
                        (err, notInterestedResult) => {

                          if (err)
                            return res.status(500).json(err);

                          stats.notInterested =
                            notInterestedResult[0].notInterested;

                          // Recent Leads
                          db.query(
                            `
                            SELECT *
                            FROM leads
                            WHERE created_by_id=?
                            AND created_by_type='employee'
                            ORDER BY id DESC
                            LIMIT 5
                            `,
                            [employeeId],
                            (err, recentResult) => {

                              if (err)
                                return res.status(500).json(err);

                              stats.recentLeads = recentResult;

                              res.status(200).json(stats);

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

        }
      );

    }
  );

};   
// ==========================
// EMPLOYEE WELCOME POPUP
// ==========================
const getEmployeeWelcome = async (req, res) => {

  try {

    const employeeId = req.params.id;

    const welcome = {};

    // ==========================
    // Today's Follow-ups
    // ==========================
    // ==========================
// Today's Follow-ups Count
// ==========================
const [todayResult] = await db.promise().query(
  `
  SELECT COUNT(*) AS total
  FROM follow_ups
  WHERE
    employee_id = ?
    AND status = 'pending'
    AND DATE(next_followup_date) = CURDATE()
  `,
  [employeeId]
);

welcome.todayFollowups = todayResult[0].total;

    // ==========================
    // Overdue Follow-ups
    // ==========================
    const [overdueResult] = await db.promise().query(
      `
      SELECT COUNT(*) AS total
      FROM follow_ups
      WHERE
        employee_id = ?
        AND status = 'pending'
        AND DATE(next_followup_date) < CURDATE()
      `,
      [employeeId]
    );

    welcome.overdueFollowups = overdueResult[0].total;

    // ==========================
    // Pending Tasks (New Leads)
    // ==========================
    const [pendingResult] = await db.promise().query(
      `
      SELECT COUNT(*) AS total
      FROM leads
      WHERE
        created_by_id = ?
        AND created_by_type = 'employee'
        AND lead_status = 'new'
      `,
      [employeeId]
    );

    welcome.pendingTasks = pendingResult[0].total;

    // ==========================
    // Important Leads
    // ==========================
    const [importantResult] = await db.promise().query(
      `
      SELECT COUNT(*) AS total
      FROM leads
      WHERE
        created_by_id = ?
        AND created_by_type = 'employee'
        AND important_lead = 1
      `,
      [employeeId]
    );

    welcome.importantLeads = importantResult[0].total;

    // ==========================
    // Employee Name
    // ==========================
    const [employee] = await db.promise().query(
      `
      SELECT full_name
      FROM employees
      WHERE employee_id = ?
      `,
      [employeeId]
    );

    welcome.employeeName = employee.length
      ? employee[0].full_name
      : "";

    res.json(welcome);

  } catch (err) {

    console.error("Welcome Popup Error:", err);

    res.status(500).json({
      message: "Failed to load welcome data"
    });

  }

};   
module.exports = {

  getDashboardStats,
  getEmployeeStats,
  getEmployeeWelcome,

  getLeadStatusChart,
  getEmployeePerformance,
  getLeadTrend,


  getEmployeeLeadStatusChart,
  getEmployeeLeadTrend,
  getEmployeeFollowupChart


};