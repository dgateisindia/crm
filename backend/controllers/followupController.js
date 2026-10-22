const db =
require("../db");
// ==========================
// Add Followup
// ==========================
const addFollowup = async (req, res) => {
  try {
    const {
      lead_id,
      followup_mode,
      remarks,
      lead_status
    } = req.body;

    const { companyId, id: userId, role } = req.user;

    // ==========================
    // Basic Validation
    // ==========================
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (!lead_id) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    // ==========================
    // Verify Lead Belongs
    // To Current Company
    // ==========================
    const [leadRows] = await db.promise().query(
      `
      SELECT
        id,
        company_id,
        lead_status
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      `,
      [lead_id, companyId]
    );

    if (leadRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead Not Found"
      });
    }

    // ==========================
    // Resolve Employee
    // ==========================
    let employeeId = null;

    if (role === "employee") {
      const [employeeRows] = await db.promise().query(
        `
        SELECT employee_id
        FROM employees
        WHERE user_id = ?
          AND company_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [userId, companyId]
      );

      if (employeeRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Employee profile is not linked to this account"
        });
      }

      employeeId = employeeRows[0].employee_id;
    }
    // Verify employee can access this lead
if (role === "employee") {
  const [accessRows] = await db.promise().query(
    `
    SELECT id
    FROM leads
    WHERE id = ?
      AND company_id = ?
      AND (
        assigned_employee_id = ?
        OR (
          assigned_employee_id IS NULL
          AND created_by_type = 'employee'
          AND created_by_id = ?
        )
      )
    LIMIT 1
    `,
    [lead_id, companyId, employeeId, employeeId]
  );

  if (accessRows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this lead"
    });
  }
}

    // ==========================
    // Add Permanent Lead History
    // ==========================
    await db.promise().query(
      `
      INSERT INTO follow_ups (
        lead_id,
        employee_id,
        followup_mode,
        remarks,
        lead_status
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        lead_id,
        employeeId,
        followup_mode || "other",
        remarks || null,
        lead_status || null
      ]
    );

    // ==========================
    // Update Lead Status
    // IMPORTANT:
    // Company-scoped
    // ==========================
    await db.promise().query(
      `
      UPDATE leads
      SET lead_status = ?
      WHERE id = ?
        AND company_id = ?
      `,
      [
        lead_status,
        lead_id,
        companyId
      ]
    );

    // ==========================
    // Remove Pending Task Followup
    // Only for this company's lead
    // ==========================
    await db.promise().query(
      `
      DELETE tf
      FROM task_followups tf
      INNER JOIN leads l
        ON l.id = tf.lead_id
      WHERE tf.lead_id = ?
        AND l.company_id = ?
      `,
      [
        lead_id,
        companyId
      ]
    );

    // ==========================
    // Success
    // ==========================
    return res.status(201).json({
      success: true,
      message: "Followup Added Successfully"
    });

  } catch (error) {
    console.error("ADD FOLLOWUP ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to add followup"
    });
  }
};


// ==========================
// Get All Followups
// ==========================
const getFollowups = async (req, res) => {
  try {
    const { companyId } = req.user;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    const sql = `
      SELECT
        l.id AS lead_id,
        l.company_name,
        l.lead_status,

        MAX(f.followup_id) AS latest_followup,

        (
          SELECT e.full_name
          FROM employees e
          WHERE e.employee_id = (
            SELECT fu.employee_id
            FROM follow_ups fu
            WHERE fu.lead_id = l.id
            ORDER BY fu.followup_id DESC
            LIMIT 1
          )
        ) AS full_name,

        (
          SELECT fu.followup_mode
          FROM follow_ups fu
          WHERE fu.lead_id = l.id
          ORDER BY fu.followup_id DESC
          LIMIT 1
        ) AS followup_mode,

        (
          SELECT fu.remarks
          FROM follow_ups fu
          WHERE fu.lead_id = l.id
          ORDER BY fu.followup_id DESC
          LIMIT 1
        ) AS remarks

      FROM leads l

      INNER JOIN follow_ups f
        ON l.id = f.lead_id

      WHERE l.company_id = ?

      GROUP BY
        l.id,
        l.company_name,
        l.lead_status

      ORDER BY latest_followup DESC
    `;

    const [rows] = await db.promise().query(sql, [companyId]);

    return res.status(200).json(rows);

  } catch (error) {
    console.error("GET FOLLOWUPS ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to fetch followups"
    });
  }
};

// ==========================
// Get Employee Followups
// ==========================
const getEmployeeFollowups = async (req, res) => {
  try {
    const { companyId, id: userId, role } = req.user;
    const employeeId = req.params.employeeId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    // Employee can only access their own followups
    if (role === "employee") {
      const [employeeRows] = await db.promise().query(
        `
        SELECT employee_id
        FROM employees
        WHERE user_id = ?
          AND company_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [userId, companyId]
      );

      if (employeeRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Employee profile is not linked to this account"
        });
      }

      if (Number(employeeRows[0].employee_id) !== Number(employeeId)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to access this employee's followups"
        });
      }
    }

    // Verify employee belongs to current company
    const [employeeRows] = await db.promise().query(
      `
      SELECT employee_id
      FROM employees
      WHERE employee_id = ?
        AND company_id = ?
      LIMIT 1
      `,
      [employeeId, companyId]
    );

    if (employeeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found in this company"
      });
    }

    const sql = `
      SELECT
        l.id AS lead_id,
        l.company_name,
        l.lead_status,

        MAX(f.followup_id) AS latest_followup,

        (
          SELECT fu.followup_mode
          FROM follow_ups fu
          WHERE fu.lead_id = l.id
            AND fu.employee_id = ?
          ORDER BY fu.followup_id DESC
          LIMIT 1
        ) AS followup_mode,

        (
          SELECT fu.remarks
          FROM follow_ups fu
          WHERE fu.lead_id = l.id
            AND fu.employee_id = ?
          ORDER BY fu.followup_id DESC
          LIMIT 1
        ) AS remarks

      FROM leads l

      INNER JOIN follow_ups f
        ON l.id = f.lead_id

      WHERE l.company_id = ?
        AND f.employee_id = ?

      GROUP BY
        l.id,
        l.company_name,
        l.lead_status

      ORDER BY latest_followup DESC
    `;

    const [rows] = await db.promise().query(
      sql,
      [
        employeeId,
        employeeId,
        companyId,
        employeeId
      ]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("GET EMPLOYEE FOLLOWUPS ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to fetch employee followups"
    });
  }
};
// ==========================
// Get Lead Followups
// ==========================
const getLeadFollowups = async (req, res) => {
  try {
    const { companyId, id: userId, role } = req.user;
    const leadId = req.params.leadId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }
    if (role === "employee") {
  const [employeeRows] = await db.promise().query(
    `
    SELECT employee_id
    FROM employees
    WHERE user_id = ?
      AND company_id = ?
      AND status = 'active'
    LIMIT 1
    `,
    [userId, companyId]
  );

  if (employeeRows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "Employee profile not found"
    });
  }

  const employeeId = employeeRows[0].employee_id;

  const [accessRows] = await db.promise().query(
    `
    SELECT id
    FROM leads
    WHERE id = ?
      AND company_id = ?
      AND (
        assigned_employee_id = ?
        OR (
          assigned_employee_id IS NULL
          AND created_by_type = 'employee'
          AND created_by_id = ?
        )
      )
    LIMIT 1
    `,
    [leadId, companyId, employeeId, employeeId]
  );

  if (accessRows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this lead"
    });
  }
}

    const sql = `
      SELECT
        follow_ups.*,
        employees.full_name
      FROM follow_ups

      INNER JOIN leads
        ON follow_ups.lead_id = leads.id

      LEFT JOIN employees
        ON follow_ups.employee_id = employees.employee_id

      WHERE follow_ups.lead_id = ?
        AND leads.company_id = ?

      ORDER BY follow_ups.followup_id DESC
    `;

    const [rows] = await db.promise().query(
      sql,
      [leadId, companyId]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("GET LEAD FOLLOWUPS ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to fetch followups"
    });
  }
};
// ==========================
// Get Lead History
// ==========================
const getLeadHistory = async (req, res) => {
  const { leadId } = req.params;
  const { companyId, id: userId, role } = req.user;
  try {
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }
    // Verify employee access to this lead
if (role === "employee") {
  const [employeeRows] = await db.promise().query(
    `
    SELECT employee_id
    FROM employees
    WHERE user_id = ?
      AND company_id = ?
      AND status = 'active'
    LIMIT 1
    `,
    [userId, companyId]
  );

  if (employeeRows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "Employee profile not found"
    });
  }

  const employeeId = employeeRows[0].employee_id;

  const [accessRows] = await db.promise().query(
    `
    SELECT id
    FROM leads
    WHERE id = ?
      AND company_id = ?
      AND (
        assigned_employee_id = ?
        OR (
          assigned_employee_id IS NULL
          AND created_by_type = 'employee'
          AND created_by_id = ?
        )
      )
    LIMIT 1
    `,
    [leadId, companyId, employeeId, employeeId]
  );

  if (accessRows.length === 0) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to view this lead history"
    });
  }
}

    const [rows] = await db.promise().query(
      `
      SELECT
        follow_ups.followup_id,
        follow_ups.followup_mode,
        follow_ups.lead_status,
        follow_ups.remarks,
        follow_ups.next_followup_date,
        follow_ups.created_at

      FROM follow_ups

      INNER JOIN leads
        ON follow_ups.lead_id = leads.id

      WHERE follow_ups.lead_id = ?
        AND leads.company_id = ?

      ORDER BY follow_ups.created_at DESC
      `,
      [leadId, companyId]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("GET LEAD HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Error fetching history"
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