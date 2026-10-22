
const db = require("../db");
const XLSX = require("xlsx");

// =====================================================
// COMMON HELPERS
// =====================================================

// Permanent follow-up history
const addLeadHistory = async (
  lead_id,
  employee_id,
  remarks,
  followup_date,
  followup_time,
  lead_status = "new",
  followup_mode = "call",
  connection = null
) => {
  const nextFollowup =
    followup_date && followup_time
      ? `${followup_date} ${followup_time}`
      : null;

  const sql = `
    INSERT INTO follow_ups (
      lead_id,
      employee_id,
      contact_date,
      followup_mode,
      remarks,
      next_followup_date,
      status,
      lead_status
    )
    VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
  `;

  await (connection || db.promise()).query(sql, [
    lead_id,
    employee_id,
    followup_mode,
    remarks || null,
    nextFollowup,
    "pending",
    lead_status
  ]);
};

// Resolve an authenticated employee's profile ID
const resolveEmployeeId = async (userId, companyId) => {
  const [rows] = await db.promise().query(
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

  return rows.length ? rows[0].employee_id : null;
};

// Check whether the employee currently owns this lead
const employeeCanAccessLead = (
  lead,
  employeeId
) => {
  if (
    lead.assigned_employee_id !== null &&
    lead.assigned_employee_id !== undefined
  ) {
    return (
      Number(lead.assigned_employee_id) ===
      Number(employeeId)
    );
  }

  return (
    lead.created_by_type === "employee" &&
    Number(lead.created_by_id) ===
      Number(employeeId)
  );
};

// Roll back and release a transaction safely
const rollbackConnection = async (
  connection,
  errorLabel
) => {
  if (!connection) return;

  try {
    await connection.rollback();
  } catch (rollbackError) {
    console.error(
      `${errorLabel} ROLLBACK ERROR:`,
      rollbackError
    );
  } finally {
    connection.release();
  }
};

// =====================================================
// GET EMPLOYEE TASKS
// =====================================================
const getEmployeeTasks = async (req, res) => {
  try {
    const {
      companyId,
      id: userId,
      role
    } = req.user;

    const employeeId = req.params.employeeId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Employee may request only their own tasks
    if (role === "employee") {
      const authenticatedEmployeeId =
        await resolveEmployeeId(userId, companyId);

      if (!authenticatedEmployeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }

      if (
        Number(authenticatedEmployeeId) !==
        Number(employeeId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to access this employee's tasks"
        });
      }
    }

    // Verify employee is in this company
    const [employeeRows] = await db.promise().query(
      `
      SELECT employee_id, user_id
      FROM employees
      WHERE employee_id = ?
        AND company_id = ?
        AND status = 'active'
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
      SELECT l.*
      FROM leads l
      WHERE l.lead_status = 'new'
        AND l.company_id = ?
        AND (
          l.assigned_employee_id = ?
          OR (
            l.assigned_employee_id IS NULL
            AND l.created_by_type = 'employee'
            AND l.created_by_id = ?
          )
        )
        AND NOT EXISTS (
          SELECT 1
          FROM task_followups tf
          WHERE tf.lead_id = l.id
            AND tf.employee_id = ?
        )
      ORDER BY l.id DESC
    `;

    const [rows] = await db.promise().query(
      sql,
      [
        companyId,
        employeeId,
        employeeId,
        employeeId
      ]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error(
      "GET EMPLOYEE TASKS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to fetch employee tasks"
    });
  }
};

// =====================================================
// MOVE TASK TO LEADS / INTERESTED
// =====================================================
const connectTaskToLead = async (req, res) => {
  let connection = null;

  try {
    const {
      companyId,
      id: userId,
      role
    } = req.user;

    const leadId = req.params.leadId;
    let employeeId = null;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    if (role === "employee") {
      employeeId =
        await resolveEmployeeId(userId, companyId);

      if (!employeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // Lock record and verify company ownership
    const [leadRows] = await connection.query(
      `
      SELECT
        id,
        lead_status,
        assigned_employee_id,
        created_by_type,
        created_by_id
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [leadId, companyId]
    );

    if (leadRows.length === 0) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(404).json({
        success: false,
        message: "Task not found in this company"
      });
    }

    const lead = leadRows[0];

    // Employee must own or be assigned the lead
    if (
      role === "employee" &&
      !employeeCanAccessLead(lead, employeeId)
    ) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this lead"
      });
    }

    // Do not create duplicate history if unchanged
    if (
      String(lead.lead_status).trim().toLowerCase() !==
      "interested"
    ) {
      await connection.query(
        `
        UPDATE leads
        SET lead_status = 'interested'
        WHERE id = ?
          AND company_id = ?
        `,
        [leadId, companyId]
      );

      await addLeadHistory(
        leadId,
        employeeId,
        "Lead moved to Interested",
        null,
        null,
        "interested",
        "other",
        connection
      );
    }

    await connection.commit();

    connection.release();
    connection = null;

    return res.status(200).json({
      success: true,
      message: "Task moved to Leads"
    });

  } catch (error) {
    await rollbackConnection(
      connection,
      "CONNECT TASK"
    );

    console.error(
      "CONNECT TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to move task to leads"
    });
  }
};

// =====================================================
// MOVE TASK TO NOT INTERESTED
// =====================================================
const moveTaskToNotInterested = async (
  req,
  res
) => {
  let connection = null;

  try {
    const {
      companyId,
      id: userId,
      role
    } = req.user;

    const leadId = req.params.leadId;
    let employeeId = null;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    if (role === "employee") {
      employeeId =
        await resolveEmployeeId(userId, companyId);

      if (!employeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }
    }

    connection = await db.promise().getConnection();
    await connection.beginTransaction();

    // Lock lead and verify company ownership
    const [leadRows] = await connection.query(
      `
      SELECT
        id,
        lead_status,
        assigned_employee_id,
        created_by_type,
        created_by_id
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [leadId, companyId]
    );

    if (leadRows.length === 0) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(404).json({
        success: false,
        message: "Task not found in this company"
      });
    }

    const lead = leadRows[0];

    if (
      role === "employee" &&
      !employeeCanAccessLead(lead, employeeId)
    ) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this lead"
      });
    }

    // Avoid duplicate status-change history
    if (
      String(lead.lead_status).trim().toLowerCase() !==
      "not interested"
    ) {
      await connection.query(
        `
        UPDATE leads
        SET lead_status = 'not interested'
        WHERE id = ?
          AND company_id = ?
        `,
        [leadId, companyId]
      );

      await addLeadHistory(
        leadId,
        employeeId,
        "Lead moved to Not Interested",
        null,
        null,
        "not interested",
        "other",
        connection
      );
    }

    await connection.commit();

    connection.release();
    connection = null;

    return res.status(200).json({
      success: true,
      message: "Moved to Not Interested"
    });

  } catch (error) {
    await rollbackConnection(
      connection,
      "MOVE TASK NOT INTERESTED"
    );

    console.error(
      "MOVE TASK NOT INTERESTED ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to move task to not interested"
    });
  }
};

// =====================================================
// SAVE TASK FOLLOW-UP
// =====================================================
const saveTaskFollowup = async (req, res) => {
  let connection = null;

  try {
    const {
      lead_id,
      followup_date,
      followup_time,
      remarks,
      followup_mode,
      lead_status,
      important_lead
    } = req.body;

    const {
      companyId,
      id: userId,
      role
    } = req.user;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!lead_id) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    // Verify company ownership
    const [leadRows] = await db.promise().query(
      `
      SELECT
        id,
        company_id,
        lead_status,
        assigned_employee_id,
        created_by_id,
        created_by_type
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
        message: "Lead not found in this company"
      });
    }

    let employeeId = null;

    if (role === "employee") {
      employeeId =
        await resolveEmployeeId(userId, companyId);

      if (!employeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }

      if (
        !employeeCanAccessLead(
          leadRows[0],
          employeeId
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to schedule a follow-up for this lead"
        });
      }
    } else {
      // Manager selects an employee within own company
      const requestedEmployeeId =
        req.body.employee_id;

      if (!requestedEmployeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required"
        });
      }

      const [employeeRows] =
        await db.promise().query(
          `
          SELECT employee_id
          FROM employees
          WHERE employee_id = ?
            AND company_id = ?
          LIMIT 1
          `,
          [requestedEmployeeId, companyId]
        );

      if (employeeRows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found in this company"
        });
      }

      employeeId =
        employeeRows[0].employee_id;
    }

    connection =
      await db.promise().getConnection();

    await connection.beginTransaction();

    // Recheck ownership under lead lock
    const [lockedRows] = await connection.query(
      `
      SELECT
        lead_status,
        assigned_employee_id,
        created_by_type,
        created_by_id
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [lead_id, companyId]
    );

    if (
      lockedRows.length === 0 ||
      (
        role === "employee" &&
        !employeeCanAccessLead(
          lockedRows[0],
          employeeId
        )
      )
    ) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(403).json({
        success: false,
        message: "Lead access denied"
      });
    }

    // Insert scheduled follow-up
    await connection.query(
      `
      INSERT INTO task_followups (
        lead_id,
        employee_id,
        followup_date,
        followup_time,
        remarks
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        lead_id,
        employeeId,
        followup_date || null,
        followup_time || null,
        remarks || null
      ]
    );

    // Update lead status and importance
    await connection.query(
      `
      UPDATE leads
      SET
        lead_status =
          COALESCE(NULLIF(?, ''), lead_status),
        important_lead = COALESCE(?, important_lead)
      WHERE id = ?
        AND company_id = ?
      `,
      [
        lead_status || null,
        important_lead === true || important_lead === 1 ? 1 : null,
        lead_id,
        companyId
      ]
    );

    // Permanent history
    await addLeadHistory(
      lead_id,
      employeeId,
      remarks,
      followup_date,
      followup_time,
      lead_status || lockedRows[0].lead_status,
      followup_mode || "call",
      connection
    );

    await connection.commit();

    connection.release();
    connection = null;

    return res.status(201).json({
      success: true,
      message: "Followup Scheduled"
    });

  } catch (error) {
    await rollbackConnection(
      connection,
      "SAVE TASK FOLLOWUP"
    );

    console.error(
      "SAVE TASK FOLLOWUP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to schedule followup"
    });
  }
};

// =====================================================
// GET TASK FOLLOW-UPS / TO-DO LIST
// =====================================================
const getTaskFollowups = async (req, res) => {
  try {
    const {
      companyId,
      id: userId,
      role
    } = req.user;

    const employeeId = req.params.employeeId;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (role === "employee") {
      const authenticatedEmployeeId =
        await resolveEmployeeId(userId, companyId);

      if (!authenticatedEmployeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }

      if (
        Number(authenticatedEmployeeId) !==
        Number(employeeId)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to access this employee's task followups"
        });
      }
    }

    // Verify employee belongs to the company
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
        message:
          "Employee not found in this company"
      });
    }

    const sql = `
      SELECT
        tf.followup_id,
        l.id AS lead_id,
        ? AS employee_id,

        DATE_FORMAT(
          tf.followup_date,
          '%Y-%m-%d'
        ) AS followup_date,

        tf.followup_time,
        tf.remarks,

        l.company_name,
        l.contact_person_name,
        l.phone,
        l.email,
        l.city,
        l.lead_status

      FROM leads l

      LEFT JOIN task_followups tf
        ON tf.lead_id = l.id
        AND tf.employee_id = ?

      WHERE l.company_id = ?
        AND (
          l.assigned_employee_id = ?
          OR (
            l.assigned_employee_id IS NULL
            AND l.created_by_id = ?
            AND l.created_by_type = 'employee'
          )
        )
        AND LOWER(
          REPLACE(
            REPLACE(
              TRIM(l.lead_status),
              '_',
              ' '
            ),
            '-',
            ' '
          )
        ) IN (
          'interested',
          'proposed',
          'proposal',
          'offered',
          'meeting scheduled',
          'not responded',
          'sponsorship'
        )

      ORDER BY
        CASE
          WHEN tf.followup_date IS NULL THEN 1
          ELSE 0
        END,
        tf.followup_date ASC,
        tf.followup_time ASC,
        l.id DESC
    `;

    const [rows] = await db.promise().query(
      sql,
      [
        employeeId,
        employeeId,
        companyId,
        employeeId,
        employeeId
      ]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error(
      "GET TASK FOLLOWUPS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to fetch task followups"
    });
  }
};

// =====================================================
// EDIT TASK FOLLOW-UP
// =====================================================
const editTaskFollowup = async (req, res) => {
  try {
    const {
      companyId,
      id: userId,
      role
    } = req.user;

    const leadId = req.params.leadId;

    const {
      followup_date,
      followup_time,
      remarks
    } = req.body;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    if (!followup_date || !followup_time) {
      return res.status(400).json({
        success: false,
        message:
          "Followup date and time are required"
      });
    }

    // Verify lead belongs to company
    const [leadRows] = await db.promise().query(
      `
      SELECT
        id,
        company_id,
        assigned_employee_id,
        created_by_type,
        created_by_id
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      `,
      [leadId, companyId]
    );

    if (leadRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Lead not found in this company"
      });
    }

    let employeeId = null;

    if (role === "employee") {
      employeeId =
        await resolveEmployeeId(userId, companyId);

      if (!employeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }

      if (
        !employeeCanAccessLead(
          leadRows[0],
          employeeId
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to edit this lead"
        });
      }

      const [followupRows] =
        await db.promise().query(
          `
          SELECT followup_id
          FROM task_followups
          WHERE lead_id = ?
            AND employee_id = ?
          LIMIT 1
          `,
          [leadId, employeeId]
        );

      if (followupRows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to edit this task followup"
        });
      }

    } else {
      const requestedEmployeeId =
        req.body.employee_id;

      if (!requestedEmployeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required"
        });
      }

      const [employeeRows] =
        await db.promise().query(
          `
          SELECT employee_id
          FROM employees
          WHERE employee_id = ?
            AND company_id = ?
          LIMIT 1
          `,
          [requestedEmployeeId, companyId]
        );

      if (employeeRows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found in this company"
        });
      }

      employeeId =
        employeeRows[0].employee_id;

      const [followupRows] =
        await db.promise().query(
          `
          SELECT followup_id
          FROM task_followups
          WHERE lead_id = ?
            AND employee_id = ?
          LIMIT 1
          `,
          [leadId, employeeId]
        );

      if (followupRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Task followup not found"
        });
      }
    }

    // Edit scheduled task only
    // Permanent history remains unchanged
    const [result] = await db.promise().query(
      `
      UPDATE task_followups
      SET
        followup_date = ?,
        followup_time = ?,
        remarks = ?
      WHERE lead_id = ?
        AND employee_id = ?
      `,
      [
        followup_date,
        followup_time,
        remarks || null,
        leadId,
        employeeId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Task followup not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task Followup Updated"
    });

  } catch (error) {
    console.error(
      "EDIT TASK FOLLOWUP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to update task followup"
    });
  }
};

// =====================================================
// ADD TASK FOLLOW-UP
// =====================================================
const addTaskFollowup = async (req, res) => {
  let connection = null;

  try {
    const {
      companyId,
      id: userId,
      role
    } = req.user;

    const leadId = req.params.leadId;

    const {
      followup_date,
      followup_time,
      remarks,
      followup_mode,
      lead_status,
      important_lead
    } = req.body;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message:
          "User is not associated with a company"
      });
    }

    if (
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required"
      });
    }

    if (
      followup_date &&
      followup_date <
        new Date().toISOString().split("T")[0]
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Followup date cannot be in the past"
      });
    }

    // Verify lead company
    const [leadRows] = await db.promise().query(
      `
      SELECT
        id,
        company_id,
        lead_status,
        assigned_employee_id,
        created_by_type,
        created_by_id
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      `,
      [leadId, companyId]
    );

    if (leadRows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Lead not found in this company"
      });
    }

    let employeeId = null;

    if (role === "employee") {
      employeeId =
        await resolveEmployeeId(userId, companyId);

      if (!employeeId) {
        return res.status(403).json({
          success: false,
          message:
            "Employee profile is not linked to this account"
        });
      }

      if (
        !employeeCanAccessLead(
          leadRows[0],
          employeeId
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to schedule a follow-up for this lead"
        });
      }

    } else {
      const requestedEmployeeId =
        req.body.employee_id;

      if (!requestedEmployeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required"
        });
      }

      const [employeeRows] =
        await db.promise().query(
          `
          SELECT employee_id
          FROM employees
          WHERE employee_id = ?
            AND company_id = ?
          LIMIT 1
          `,
          [requestedEmployeeId, companyId]
        );

      if (employeeRows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found in this company"
        });
      }

      employeeId =
        employeeRows[0].employee_id;
    }

    connection =
      await db.promise().getConnection();

    await connection.beginTransaction();

    // Lock lead and confirm access before updates
    const [lockedRows] = await connection.query(
      `
      SELECT
        lead_status,
        assigned_employee_id,
        created_by_type,
        created_by_id
      FROM leads
      WHERE id = ?
        AND company_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [leadId, companyId]
    );

    if (
      lockedRows.length === 0 ||
      (
        role === "employee" &&
        !employeeCanAccessLead(
          lockedRows[0],
          employeeId
        )
      )
    ) {
      await connection.rollback();
      connection.release();
      connection = null;

      return res.status(403).json({
        success: false,
        message: "Lead access denied"
      });
    }

    // Check existing scheduled follow-up
    const [taskRows] = await connection.query(
      `
      SELECT followup_id
      FROM task_followups
      WHERE lead_id = ?
        AND employee_id = ?
      LIMIT 1
      `,
      [leadId, employeeId]
    );

    const taskFollowupExists =
      taskRows.length > 0;

    if (taskFollowupExists) {
      // Update current scheduled follow-up
      await connection.query(
        `
        UPDATE task_followups
        SET
          followup_date = ?,
          followup_time = ?,
          remarks = ?,
          followup_mode = ?,
          lead_status = ?
        WHERE lead_id = ?
          AND employee_id = ?
        `,
        [
          followup_date || null,
          followup_time || null,
          remarks || null,
          followup_mode || "call",
          lead_status ||
            lockedRows[0].lead_status,
          leadId,
          employeeId
        ]
      );
    } else {
      // Create scheduled follow-up
      await connection.query(
        `
        INSERT INTO task_followups (
          lead_id,
          employee_id,
          followup_date,
          followup_time,
          remarks,
          followup_mode,
          lead_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          leadId,
          employeeId,
          followup_date || null,
          followup_time || null,
          remarks || null,
          followup_mode || "call",
          lead_status ||
            lockedRows[0].lead_status
        ]
      );
    }

    // Update lead
    await connection.query(
      `
      UPDATE leads
      SET
        lead_status =
          COALESCE(NULLIF(?, ''), lead_status),
        important_lead = COALESCE(?, important_lead)
      WHERE id = ?
        AND company_id = ?
      `,
      [
        lead_status || "",
        important_lead === true || important_lead === 1 ? 1 : null,
        leadId,
        companyId
      ]
    );

    // Add permanent completed follow-up history
    await connection.query(
      `
      INSERT INTO follow_ups (
        lead_id,
        employee_id,
        contact_date,
        followup_mode,
        remarks,
        next_followup_date,
        status,
        lead_status
      )
      VALUES (
        ?,
        ?,
        NOW(),
        ?,
        ?,
        ?,
        'completed',
        ?
      )
      `,
      [
        leadId,
        employeeId,
        followup_mode || "call",
        remarks || null,
        followup_date && followup_time
          ? `${followup_date} ${followup_time}`
          : null,
        lead_status ||
          lockedRows[0].lead_status
      ]
    );

    await connection.commit();

    connection.release();
    connection = null;

    return res.status(200).json({
      success: true,
      message: "Task Followup Added"
    });

  } catch (error) {
    await rollbackConnection(
      connection,
      "ADD TASK FOLLOWUP"
    );

    console.error(
      "ADD TASK FOLLOWUP ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add task followup"
    });
  }
};

// =====================================================
// EXPORT ALL CONTROLLERS
// =====================================================
module.exports = {
  getEmployeeTasks,
  getTaskFollowups,
  connectTaskToLead,
  moveTaskToNotInterested,
  saveTaskFollowup,
  editTaskFollowup,
  addTaskFollowup
};
