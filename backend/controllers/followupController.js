const db =
require("../db");
// ==========================
// Add Followup
// ==========================
const addFollowup = async (req, res) => {
  // FOLLOWUP_ATOMIC_V1
  const {
    lead_id,
    followup_mode,
    remarks,
    lead_status
  } = req.body || {};

  const { companyId, id: userId, role } = req.user || {};
  const leadId = Number(lead_id);

  if (
    !companyId ||
    !userId ||
    !["manager", "owner", "employee"].includes(role)
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }

  if (!Number.isSafeInteger(leadId) || leadId < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead ID"
    });
  }

  const mode = followup_mode || "other";

  if (![
    "call",
    "whatsapp",
    "email",
    "meeting",
    "other"
  ].includes(mode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid follow-up mode"
    });
  }

  if (remarks != null && typeof remarks !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid remarks"
    });
  }

  if (lead_status != null && typeof lead_status !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid lead status"
    });
  }

  const note = remarks?.trim() || null;

  let connection;
  let transactionStarted = false;

  try {
    connection = await db.promise().getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // Lock lead before updating related records.
    const [leadRows] = await connection.query(
      `SELECT
         id,
         company_id,
         lead_status,
         assigned_employee_id,
         created_by_type,
         created_by_id
       FROM leads
       WHERE id = ?
         AND company_id = ?
       LIMIT 1 FOR UPDATE`,
      [leadId, companyId]
    );

    if (!leadRows.length) {
      const error = new Error("Lead not found");
      error.httpStatus = 404;
      throw error;
    }

    let employeeId = null;

    if (role === "employee") {
      const [profiles] = await connection.query(
        `SELECT employee_id
         FROM employees
         WHERE user_id = ?
           AND company_id = ?
           AND status = 'active'
         LIMIT 1`,
        [userId, companyId]
      );

      if (!profiles.length) {
        const error = new Error("Employee access inactive");
        error.httpStatus = 403;
        throw error;
      }

      employeeId = profiles[0].employee_id;

      const lead = leadRows[0];

      const canAccess = lead.assigned_employee_id == null
        ? (
            lead.created_by_type === "employee" &&
            Number(lead.created_by_id) === Number(employeeId)
          )
        : Number(lead.assigned_employee_id) === Number(employeeId);

      if (!canAccess) {
        const error = new Error(
          "Not authorized to update this lead"
        );

        error.httpStatus = 403;
        throw error;
      }
    }

    const status =
      lead_status?.trim() ||
      leadRows[0].lead_status ||
      "pending";

    if (status.length > 50) {
      const error = new Error("Lead status too long");
      error.httpStatus = 400;
      throw error;
    }

    // Prevent identical retries within 10 seconds.
    // The locked lead serializes concurrent submissions.
    const [existing] = await connection.query(
      `SELECT followup_id
       FROM follow_ups
       WHERE lead_id = ?
         AND employee_id <=> ?
         AND followup_mode = ?
         AND remarks <=> ?
         AND lead_status = ?
         AND contact_date >= DATE_SUB(
           NOW(),
           INTERVAL 10 SECOND
         )
       ORDER BY followup_id DESC
       LIMIT 1`,
      [leadId, employeeId, mode, note, status]
    );

    if (existing.length) {
      await connection.commit();
      transactionStarted = false;

      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Follow-up already recorded"
      });
    }

    await connection.query(
      `INSERT INTO follow_ups (
         lead_id,
         employee_id,
         followup_mode,
         remarks,
         lead_status
       )
       VALUES (?, ?, ?, ?, ?)`,
      [leadId, employeeId, mode, note, status]
    );

    await connection.query(
      `UPDATE leads
       SET lead_status = ?
       WHERE id = ?
         AND company_id = ?`,
      [status, leadId, companyId]
    );

    await connection.query(
      `DELETE tf
       FROM task_followups tf
       INNER JOIN leads l
         ON l.id = tf.lead_id
       WHERE tf.lead_id = ?
         AND l.company_id = ?`,
      [leadId, companyId]
    );

    await connection.commit();
    transactionStarted = false;

    return res.status(201).json({
      success: true,
      message: "Followup Added Successfully"
    });

  } catch (error) {
    if (transactionStarted && connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "FOLLOWUP ROLLBACK:",
          rollbackError.code || "ROLLBACK_FAILED"
        );
      }
    }

    if (!error.httpStatus) {
      console.error(
        "ADD FOLLOWUP ERROR:",
        error.code || "DATABASE_ERROR"
      );
    }

    return res.status(error.httpStatus || 500).json({
      success: false,
      message: error.httpStatus
        ? error.message
        : "Failed to save follow-up"
    });

  } finally {
    connection?.release();
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
        MAX(l.phone) AS phone,
        MAX(l.email) AS email,
        MAX(l.category) AS category,
        MAX(l.contact_person_name) AS contact_person_name,
        MAX(l.contact_person_number) AS contact_person_number,
        MAX(l.city) AS city,
        MAX(l.address) AS address,
        MAX(l.website) AS website,
        MAX(l.source) AS source,
        MAX(l.priority) AS priority,
        MAX(l.designation) AS designation,
        MAX(l.created_by_name) AS created_by_name,
        MAX(l.lead_mode) AS lead_mode,
        MAX(f.created_at) AS latest_followup_date,
        l.contact_person_name,
        l.phone,
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
        l.contact_person_name,
        l.phone,
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
        leads.lead_status AS lead_status,
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