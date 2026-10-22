const db =
require("../db");
// =====================================================
// COMPANY AND EMPLOYEE ACCESS VALIDATION
// =====================================================

const getAuthorizedEmployee = async (req, res) => {
  const companyId = req.user?.companyId;
  const employeeId = req.params.id;

  if (!companyId) {
    res.status(403).json({
      message: "Company access is missing",
    });
    return null;
  }

  const [rows] = await db.promise().query(
    `
    SELECT employee_id, user_id, company_id, full_name
    FROM employees
    WHERE employee_id = ?
      AND company_id = ?
    LIMIT 1
    `,
    [employeeId, companyId]
  );

  if (!rows.length) {
    res.status(404).json({
      message: "Employee not found in your company",
    });
    return null;
  }

  const employee = rows[0];
  const role = String(req.user?.role || "").toLowerCase();

  // Employees can access only their own employee record.
  if (role === "employee") {
    const authenticatedUserId = String(req.user?.id ?? "");
    const employeeUserId = String(employee.user_id ?? "");

    if (
      !authenticatedUserId ||
      authenticatedUserId !== employeeUserId
    ) {
      res.status(403).json({
        message: "You cannot access another employee's dashboard",
      });
      return null;
    }
  }

  // Manager/owner access is restricted to the same company.
  if (role !== "employee" && !["manager", "owner"].includes(role)) {
    res.status(403).json({
      message: "You are not authorized to access this dashboard",
    });
    return null;
  }

  return employee;
};


//Manager dashboard
const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        message: "Company context is missing",
      });
    }

    const normalizedStatus = `
      LOWER(
        REPLACE(
          REPLACE(TRIM(lead_status), '_', ' '),
          '-', ' '
        )
      )
    `;

    // 1. Get lead statistics, excluding the Follow-ups count
    const [rows] = await db.promise().query(
      `
      SELECT
        COUNT(*) AS totalLeads,

        SUM(
          CASE WHEN ${normalizedStatus} = 'new'
          THEN 1 ELSE 0 END
        ) AS newLeads,

        SUM(
          CASE WHEN ${normalizedStatus} = 'converted'
          THEN 1 ELSE 0 END
        ) AS converted,

        SUM(
          CASE WHEN ${normalizedStatus} = 'not responded'
          THEN 1 ELSE 0 END
        ) AS notResponded,

        SUM(
          CASE WHEN ${normalizedStatus} = 'not interested'
          THEN 1 ELSE 0 END
        ) AS notInterested

      FROM leads
      WHERE company_id = ?
      `,
      [companyId]
    );

    // 2. Get To-Do List count from task_followups
    // Exclude New, Converted, Not Interested and Not Responded leads.
    
    // 2. Manager To-Do List:
    // Count all eligible leads in the manager's company.
    // No follow-up record or date is required.
    const [todoRows] = await db.promise().query(
      `
        SELECT COUNT(DISTINCT l.id) AS todoCount
        FROM leads l
        WHERE l.company_id = ?
          AND LOWER(
            REPLACE(
              REPLACE(
                TRIM(COALESCE(l.lead_status, '')),
                '_', ' '
              ),
              '-', ' '
            )
          ) IN (
            'interested',
            'proposed',
            'proposal',
            'offered',
            'meeting scheduled',
            'sponsorship'
          )
      `,
      [companyId]
    );


    // 3. Get recent leads
    const [recentLeads] = await db.promise().query(
      `
      SELECT *
      FROM leads
      WHERE company_id = ?
      ORDER BY id DESC
      LIMIT 5
      `,
      [companyId]
    );

    const counts = rows[0];

    return res.status(200).json({
      totalLeads: Number(counts.totalLeads || 0),
      newLeads: Number(counts.newLeads || 0),
      todoCount: Number(todoRows[0].todoCount || 0),
      converted: Number(counts.converted || 0),
      notResponded: Number(counts.notResponded || 0),
      notInterested: Number(counts.notInterested || 0),
      recentLeads,
    });

  } catch (err) {
    console.error("Manager Dashboard Stats Error:", err);

    return res.status(500).json({
      message: "Failed to fetch manager dashboard statistics",
    });
  }
};
// =====================================================
// MANAGER LEAD STATUS CHART
// =====================================================

const getLeadStatusChart = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        message: "Company access is missing",
      });
    }

    const [result] = await db.promise().query(
      `
      SELECT
        CASE
          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'new'
            THEN 'New'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'interested'
            THEN 'Interested'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) IN ('proposed', 'proposal')
            THEN 'Proposed'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'offered'
            THEN 'Offered'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'meeting scheduled'
            THEN 'Meeting Scheduled'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'converted'
            THEN 'Converted'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'closed'
            THEN 'Closed'

          WHEN LOWER(
            REPLACE(
              REPLACE(TRIM(lead_status), '_', ' '),
              '-',
              ' '
            )
          ) = 'not interested'
            THEN 'Not Interested'

          ELSE lead_status
        END AS lead_status,

        COUNT(*) AS total

      FROM leads

      WHERE company_id = ?

      GROUP BY lead_status

      ORDER BY total DESC
      `,
      [companyId]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Lead Status Chart Error:", err);

    return res.status(500).json({
      message: "Failed to fetch lead status chart",
    });
  }
};
// =====================================================
// MANAGER EMPLOYEE PERFORMANCE
// =====================================================

const getEmployeePerformance = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        message: "Company access is missing",
      });
    }

    const [result] = await db.promise().query(
      `
      SELECT
        e.employee_id,
        e.full_name,
        COUNT(DISTINCT l.id) AS totalLeads

      FROM employees e

      LEFT JOIN leads l
        ON l.company_id = e.company_id
        AND (
          (
            l.created_by_type = 'employee'
            AND l.created_by_id = e.employee_id
          )
          OR l.assigned_employee_id = e.employee_id
        )

      WHERE e.company_id = ?

      GROUP BY
        e.employee_id,
        e.full_name

      ORDER BY totalLeads DESC
      `,
      [companyId]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Employee Performance Error:", err);

    return res.status(500).json({
      message: "Failed to fetch employee performance",
    });
  }
};

const getEmployeeLeadStatusChart = async (req, res) => {

  try {

    const employee = await getAuthorizedEmployee(req, res);

if (!employee) {
  return;
}

    const [result] = await db.promise().query(
      `
      SELECT

        CASE
          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'new'
            THEN 'New'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'interested'
            THEN 'Interested'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'proposed'
            THEN 'Proposed'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'offered'
            THEN 'Offered'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'meeting scheduled'
            THEN 'Meeting Scheduled'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'converted'
            THEN 'Converted'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'closed'
            THEN 'Closed'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'not interested'
            THEN 'Not Interested'

          ELSE l.lead_status

        END AS lead_status,

        COUNT(*) AS total

      FROM leads l

      WHERE
        l.company_id = ?

        AND (
          (
            l.created_by_type = 'employee'
            AND l.created_by_id = ?
          )
          OR
          l.assigned_employee_id = ?
        )

      GROUP BY
        CASE
          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'new'
            THEN 'New'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'interested'
            THEN 'Interested'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'proposed'
            THEN 'Proposed'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'offered'
            THEN 'Offered'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'meeting scheduled'
            THEN 'Meeting Scheduled'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'converted'
            THEN 'Converted'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'closed'
            THEN 'Closed'

          WHEN LOWER(REPLACE(TRIM(l.lead_status), '_', ' ')) = 'not interested'
            THEN 'Not Interested'

          ELSE l.lead_status
        END

      ORDER BY total DESC
      `,
      [
        employee.company_id,
        employee.employee_id,
        employee.employee_id
      ]
    );

    res.json(result);

  } catch (err) {

    console.error(
      "Employee Lead Status Error:",
      err
    );

    res.status(500).json({
      message: "Failed to fetch employee lead status"
    });

  }

};
const getEmployeeLeadTrend = async (req, res) => {

  try {

    const employee = await getAuthorizedEmployee(req, res);

if (!employee) {
  return;
}

const requestedDays = Number.parseInt(req.query.days, 10);

const days = Number.isFinite(requestedDays)
  ? Math.min(Math.max(requestedDays, 1), 365)
  : 7;

    const [result] = await db.promise().query(
      `
      SELECT

        DATE(l.created_at) AS date,

        COUNT(*) AS total

      FROM leads l

      WHERE

        l.company_id = ?

        AND (
          (
            l.created_by_type = 'employee'
            AND l.created_by_id = ?
          )
          OR
          l.assigned_employee_id = ?
        )

        AND DATE(l.created_at) >=
          DATE_SUB(CURDATE(), INTERVAL ? DAY)

      GROUP BY DATE(l.created_at)

      ORDER BY DATE(l.created_at)
      `,
      [
        employee.company_id,
        employee.employee_id,
        employee.employee_id,
        days - 1
      ]
    );

    const chart = [];

    for (let i = days - 1; i >= 0; i--) {

      const d = new Date();

      d.setHours(0, 0, 0, 0);

      d.setDate(d.getDate() - i);

      const year = d.getFullYear();

      const month = String(
        d.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        d.getDate()
      ).padStart(2, "0");

      const date =
        `${year}-${month}-${day}`;

      const found = result.find((item) => {

        const dbDate = new Date(item.date);

        const dbYear =
          dbDate.getFullYear();

        const dbMonth =
          String(
            dbDate.getMonth() + 1
          ).padStart(2, "0");

        const dbDay =
          String(
            dbDate.getDate()
          ).padStart(2, "0");

        return (
          `${dbYear}-${dbMonth}-${dbDay}` ===
          date
        );

      });

      chart.push({

        date,

        total:
          found
            ? Number(found.total)
            : 0

      });

    }

    res.json(chart);

  } catch (err) {

    console.error(
      "Employee Lead Trend Error:",
      err
    );

    res.status(500).json({
      message: "Failed to fetch Employee Lead Trend"
    });

  }

};
// =====================================================
// EMPLOYEE FOLLOW-UP CHART
// =====================================================

const getEmployeeFollowupChart = async (req, res) => {
  try {
    const employee = await getAuthorizedEmployee(req, res);

    if (!employee) {
      return;
    }

    const [result] = await db.promise().query(
      `
      SELECT
        fu.status,
        COUNT(*) AS total

      FROM follow_ups fu

      INNER JOIN leads l
        ON l.id = fu.lead_id
        AND l.company_id = ?

      WHERE fu.employee_id = ?

      GROUP BY fu.status
      `,
      [employee.company_id, employee.employee_id]
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Employee Follow-up Chart Error:", err);

    return res.status(500).json({
      message: "Failed to fetch employee follow-up chart",
    });
  }
};
// =====================================================
// MANAGER LEAD TREND
// =====================================================

const getLeadTrend = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(403).json({
        message: "Company access is missing",
      });
    }

    const requestedDays = Number.parseInt(req.query.days, 10);

    const days = Number.isFinite(requestedDays)
      ? Math.min(Math.max(requestedDays, 1), 365)
      : 7;

    const [result] = await db.promise().query(
      `
      SELECT
        DATE_FORMAT(created_at, '%Y-%m-%d') AS date,
        COUNT(*) AS total

      FROM leads

      WHERE company_id = ?
        AND DATE(created_at) >= DATE_SUB(
          CURDATE(),
          INTERVAL ? DAY
        )

      GROUP BY DATE(created_at)

      ORDER BY DATE(created_at)
      `,
      [companyId, days - 1]
    );

    const totalsByDate = new Map(
      result.map((row) => [
        row.date,
        Number(row.total),
      ])
    );

    const chart = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const dateString = `${year}-${month}-${day}`;

      chart.push({
        date: dateString,
        total: totalsByDate.get(dateString) || 0,
      });
    }

    return res.status(200).json(chart);
  } catch (err) {
    console.error("Lead Trend Error:", err);

    return res.status(500).json({
      message: "Failed to fetch lead trend",
    });
  }
};
// ==========================
// EMPLOYEE DASHBOARD
// ==========================
const getEmployeeStats = async (req, res) => {
  try {
    const employee = await getAuthorizedEmployee(req, res);

    if (!employee) {
      return;
    }

    /*
      Employee can see:
      1. Leads created by the employee
      2. Leads assigned to the employee by manager
    */

    const leadCondition = `
      l.company_id = ?
      AND (
        (
          l.created_by_type = 'employee'
          AND l.created_by_id = ?
        )
        OR
        l.assigned_employee_id = ?
      )
    `;

    

    // ==========================
    // Dashboard Counts
    // ==========================

    const [countResult] = await db.promise().query(
  `
  SELECT
    COUNT(*) AS totalLeads,

    SUM(
      CASE
        WHEN LOWER(
          REPLACE(
            REPLACE(TRIM(l.lead_status), '_', ' '),
            '-', ' '
          )
        ) = 'new'
        THEN 1 ELSE 0
      END
    ) AS newLeads,

    SUM(
      CASE
        WHEN LOWER(
          REPLACE(
            REPLACE(TRIM(l.lead_status), '_', ' '),
            '-', ' '
          )
        ) = 'converted'
        THEN 1 ELSE 0
      END
    ) AS converted,

    SUM(
      CASE
        WHEN LOWER(
          REPLACE(
            REPLACE(TRIM(l.lead_status), '_', ' '),
            '-', ' '
          )
        ) = 'not responded'
        THEN 1 ELSE 0
      END
    ) AS notResponded,

    SUM(
      CASE
        WHEN LOWER(
          REPLACE(
            REPLACE(TRIM(l.lead_status), '_', ' '),
            '-', ' '
          )
        ) = 'not interested'
        THEN 1 ELSE 0
      END
    ) AS notInterested

  FROM leads l
  WHERE ${leadCondition}
  `,
  [
  employee.company_id,
  employee.employee_id,
  employee.employee_id
]
);


const [todoResult] = await db.promise().query(
  `
    SELECT COUNT(DISTINCT l.id) AS todoCount
    FROM leads l
    WHERE l.company_id = ?
      AND (
        l.assigned_employee_id = ?
        OR (
          l.assigned_employee_id IS NULL
          AND l.created_by_type = 'employee'
          AND l.created_by_id = ?
        )
      )
      AND LOWER(
        REPLACE(
          REPLACE(
            TRIM(COALESCE(l.lead_status, '')),
            '_', ' '
          ),
          '-', ' '
        )
      ) IN (
        'interested',
        'proposed',
        'proposal',
        'offered',
        'meeting scheduled',
        'sponsorship'
      )
  `,
  [
    employee.company_id,
    employee.employee_id,
    employee.employee_id
  ]
);


    // ==========================
    // Recent Leads
    // ==========================

    const [recentLeads] = await db.promise().query(
      `
      SELECT l.*

      FROM leads l

      WHERE
        ${leadCondition}

      ORDER BY l.id DESC

      LIMIT 5
      `,
      [
        employee.company_id,
        employee.employee_id,
        employee.employee_id
      ]
    );


    const counts = countResult[0];

const stats = {
  totalLeads: Number(counts.totalLeads || 0),
  newLeads: Number(counts.newLeads || 0),
  todoCount: Number(todoResult[0].todoCount || 0),
  converted: Number(counts.converted || 0),
  notResponded: Number(counts.notResponded || 0),
  notInterested: Number(counts.notInterested || 0),
  recentLeads
};

res.status(200).json(stats);

   

  } catch (err) {

    console.error(
      "Employee Dashboard Stats Error:",
      err
    );

    res.status(500).json({
      message: "Failed to fetch employee dashboard"
    });

  }

};
// ==========================
// EMPLOYEE WELCOME POPUP
// ==========================
const getEmployeeWelcome = async (req, res) => {
  try {
    const employee = await getAuthorizedEmployee(req, res);

if (!employee) {
  return;
}

const employeeId = employee.employee_id;
const companyId = employee.company_id;

const welcome = {
  employeeName: employee.full_name || "",
};

// ==========================
// Today's Follow-ups
// From Employee To-Do List
// ==========================
const [todayResult] = await db.promise().query(
  `
  SELECT COUNT(*) AS total
  FROM (
    SELECT DISTINCT l.id
    FROM leads l
    INNER JOIN task_followups tf
      ON tf.lead_id = l.id
      AND tf.employee_id = ?
    WHERE l.company_id = ?
      AND DATE(tf.followup_date) = CURDATE()
      AND LOWER(
        REPLACE(
          REPLACE(TRIM(COALESCE(l.lead_status, '')), '_', ' '),
          '-', ' '
        )
      ) IN (
        'interested',
        'proposed',
        'proposal',
        'offered',
        'meeting scheduled',
        'not responded'
      )
      AND (
        l.assigned_employee_id = ?
        OR (
          l.assigned_employee_id IS NULL
          AND l.created_by_id = ?
          AND l.created_by_type = 'employee'
        )
      )
  ) AS today_tasks
  `,
 [
  employeeId,
  companyId,
  employeeId,
  employeeId
]
);

welcome.todayFollowups = Number(todayResult[0].total || 0);


// ==========================
// Overdue Follow-ups
// Count all eligible To-Do List leads
// Ignore follow-up dates
// ==========================
const [overdueResult] = await db.promise().query(
  `
  SELECT COUNT(DISTINCT l.id) AS total
  FROM leads l
  LEFT JOIN task_followups tf
    ON tf.lead_id = l.id
    AND tf.employee_id = ?
  WHERE l.company_id = ?
    AND LOWER(
      REPLACE(
        REPLACE(TRIM(COALESCE(l.lead_status, '')), '_', ' '),
        '-', ' '
      )
    ) IN (
      'interested',
      'proposed',
      'proposal',
      'offered',
      'meeting scheduled',
      'not responded'
    )
    AND (
      l.assigned_employee_id = ?
      OR (
        l.assigned_employee_id IS NULL
        AND l.created_by_id = ?
        AND l.created_by_type = 'employee'
      )
    )
  `,
  [
  employeeId,
  companyId,
  employeeId,
  employeeId
]
);

welcome.overdueFollowups = Number(overdueResult[0].total || 0);

// ==========================
// Pending Tasks (New Leads)
// ==========================
const [pendingResult] = await db.promise().query(
  `
  SELECT COUNT(*) AS total
  FROM leads
  WHERE company_id = ?
    AND LOWER(TRIM(lead_status)) = 'new'
    AND (
      assigned_employee_id = ?
      OR (
        assigned_employee_id IS NULL
        AND created_by_id = ?
        AND created_by_type = 'employee'
      )
    )
  `,
  [companyId, employeeId, employeeId]
);

welcome.pendingTasks = Number(pendingResult[0].total || 0);

// ==========================
// Important Leads
// ==========================
const [importantResult] = await db.promise().query(
  `
  SELECT COUNT(*) AS total
  FROM leads
  WHERE company_id = ?
    AND important_lead = 1
    AND (
      assigned_employee_id = ?
      OR (
        assigned_employee_id IS NULL
        AND created_by_id = ?
        AND created_by_type = 'employee'
      )
    )
  `,
  [companyId, employeeId, employeeId]
);

welcome.importantLeads = Number(importantResult[0].total || 0);

    

    res.json(welcome);

  } catch (err) {

    console.error("Welcome Popup Error:", err);

    res.status(500).json({
      message: "Failed to load welcome data"
    });

  }

};   

// ==========================
// EMPLOYEE NOT RESPONDED LEADS
// ==========================

const getEmployeeNotRespondedLeads = async (req, res) => {
  try {
    const employee = await getAuthorizedEmployee(req, res);

    if (!employee) {
      return;
    }

    const [leads] = await db.promise().query(
      `
      SELECT l.*
      FROM leads l
      WHERE l.company_id = ?
        AND (
          l.assigned_employee_id = ?
          OR (
            l.assigned_employee_id IS NULL
            AND l.created_by_type = 'employee'
            AND l.created_by_id = ?
          )
        )
        AND LOWER(
          REPLACE(
            REPLACE(TRIM(COALESCE(l.lead_status, '')), '_', ' '),
            '-', ' '
          )
        ) = 'not responded'
      ORDER BY l.id DESC
      `,
      [
        employee.company_id,
        employee.employee_id,
        employee.employee_id,
      ]
    );

    return res.status(200).json(leads);

  } catch (err) {
    console.error("Employee Not Responded Leads Error:", err);

    return res.status(500).json({
      message: "Failed to fetch not responded leads",
    });
  }
};

// ==========================
// MANAGER NOT RESPONDED LEADS
// ==========================
const getManagerNotRespondedLeads = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(400).json({
        message: "Company context is missing",
      });
    }

    const [leads] = await db.promise().query(
      `
      SELECT l.*
      FROM leads l
      WHERE l.company_id = ?
        AND LOWER(
          REPLACE(
            REPLACE(TRIM(COALESCE(l.lead_status, '')), '_', ' '),
            '-', ' '
          )
        ) = 'not responded'
      ORDER BY l.id DESC
      `,
      [companyId]
    );

    return res.status(200).json(leads);
  } catch (err) {
    console.error("Manager Not Responded Leads Error:", err);

    return res.status(500).json({
      message: "Failed to fetch company Not Responded leads",
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
  getEmployeeFollowupChart,

  getEmployeeNotRespondedLeads,
  getManagerNotRespondedLeads


};