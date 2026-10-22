const db =
require("../db");
const logLeadChanges =
require("../utils/logLeadChanges");


 // ==========================
 // Add Lead
 // ==========================
const addLead = async (req, res) => {
  try {
    const {
      company_name,
      contact_person_name,
      designation,
      phone,
      email,
      address,
      website,
      city,
      category,
      source,
      important_lead,
      lead_mode,
      lead_status,
      assigned_employee_id
    } = req.body;

    // ==========================
    // Authenticated SaaS User
    // ==========================
    const {
      id: userId,
      companyId,
      role,
      name
    } = req.user;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company."
      });
    }

    const isManager = role === "manager" || role === "owner";
    const isEmployee = role === "employee";

    if (!isManager && !isEmployee) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized role."
      });
    }

    // ==========================
    // Contact Validation
    // ==========================
    const finalPhone = phone?.trim() || null;
    const finalEmail = email?.trim() || null;

    if (!finalPhone && !finalEmail) {
      return res.status(400).json({
        success: false,
        message: "Either Phone Number or Email is required."
      });
    }

    if (finalPhone && !/^\d{10}$/.test(finalPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone Number must contain exactly 10 digits."
      });
    }

    if (finalEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(finalEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid Email Address."
        });
      }
    }

    // ==========================
    // Resolve Creator Employee
    // ==========================
    let employeeId = null;

    if (isEmployee) {
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
          message: "Employee profile is not linked to this account."
        });
      }

      employeeId = employeeRows[0].employee_id;
    }

    // ==========================
    // Validate Lead Assignment
    // ==========================
    let assignedEmployeeId = null;
    let assignedById = null;

    if (isEmployee) {
      // Employee-created leads belong to that employee.
      assignedEmployeeId = employeeId;
    }

    if (isManager) {
      if (
        assigned_employee_id === undefined ||
        assigned_employee_id === null ||
        String(assigned_employee_id).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Please select an employee to assign this lead."
        });
      }

      const selectedEmployeeId = Number(assigned_employee_id);

      if (
        !Number.isInteger(selectedEmployeeId) ||
        selectedEmployeeId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee selected."
        });
      }

      const [managerRows] = await db.promise().query(
        `
        SELECT manager_id
        FROM managers
        WHERE user_id = ?
          AND company_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [userId, companyId]
      );

      if (managerRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Manager profile not found or inactive."
        });
      }

      const managerId = managerRows[0].manager_id;

      const [employeeRows] = await db.promise().query(
        `
        SELECT employee_id
        FROM employees
        WHERE employee_id = ?
          AND company_id = ?
          AND manager_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [selectedEmployeeId, companyId, managerId]
      );

      if (employeeRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected employee is not valid."
        });
      }

      assignedEmployeeId = employeeRows[0].employee_id;
      assignedById = userId;
    }

    // ==========================
    // Insert Lead
    // ==========================
    const [result] = await db.promise().query(
      `
      INSERT INTO leads (
        company_id,
        company_name,
        contact_person_name,
        designation,
        phone,
        email,
        address,
        website,
        city,
        category,
        source,
        important_lead,
        lead_mode,
        lead_status,
        created_by_id,
        created_by_type,
        created_by_name,
        assigned_employee_id,
        assigned_at,
        assigned_by_id
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        CASE
          WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP
          ELSE NULL
        END,
        ?
      )
      `,
      [
        companyId,
        company_name?.trim() || null,
        contact_person_name?.trim() || null,
        designation?.trim() || null,
        finalPhone,
        finalEmail,
        address?.trim() || null,
        website?.trim() || null,
        city?.trim() || null,
        category?.trim() || null,
        source?.trim() || null,
        important_lead ? 1 : 0,
        lead_mode?.trim() || null,
        lead_status?.trim() || "new",
        isEmployee ? employeeId : userId,
        isEmployee ? "employee" : "manager",
        name || null,
        assignedEmployeeId,
        assignedEmployeeId,
        assignedById
      ]
    );

    // ==========================
    // Lead Follow-up Creation
    // ==========================
    const normalizedStatus = (lead_status || "new")
      .trim()
      .toLowerCase();

    const followupStatuses = [
      "interested",
      "proposal",
      "proposed",
      "offered",
      "meeting scheduled"
    ];

    if (followupStatuses.includes(normalizedStatus)) {
      await db.promise().query(
        `
        INSERT INTO follow_ups (
          lead_id,
          employee_id,
          followup_mode,
          remarks,
          lead_status,
          status,
          contact_date,
          next_followup_date
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          result.insertId,
          assignedEmployeeId,
          lead_mode || "other",
          "Lead created with status " + (lead_status || "new"),
          lead_status || "new",
          "pending"
        ]
      );
    }

    // ==========================
    // Success
    // ==========================
    return res.status(201).json({
      success: true,
      message: "Lead Added Successfully",
      id: result.insertId,
      assigned_employee_id: assignedEmployeeId,
      assigned_at: assignedEmployeeId ? new Date() : null,
      assigned_by_id: assignedById
    });

  } catch (error) {
    console.error("ADD LEAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to Add Lead"
    });
  }
};

// ==========================
// Get All Leads
// ==========================
const getLeads = async (req, res) => {
  try {
    const { id: userId, companyId, role } = req.user;

    if (!userId || !companyId) {
      return res.status(403).json({
        success: false,
        message: "Company access denied"
      });
    }

    if (role === "manager" || role === "owner") {
      const [manager] = await db.promise().query(
        `SELECT manager_id
         FROM managers
         WHERE user_id = ?
           AND company_id = ?
           AND status = 'active'
         LIMIT 1`,
        [userId, companyId]
      );

      if (!manager.length) {
        return res.status(403).json({
          success: false,
          message: "Manager access denied"
        });
      }

      const [rows] = await db.promise().query(
        `SELECT *
         FROM leads
         WHERE company_id = ?
         ORDER BY id DESC`,
        [companyId]
      );

      return res.json(rows);
    }

    if (role === "employee") {
      const [employee] = await db.promise().query(
        `SELECT employee_id
         FROM employees
         WHERE user_id = ?
           AND company_id = ?
           AND status = 'active'
         LIMIT 1`,
        [userId, companyId]
      );

      if (!employee.length) {
        return res.status(403).json({
          success: false,
          message: "Employee access denied"
        });
      }

      const employeeId = employee[0].employee_id;

      const [rows] = await db.promise().query(
        `SELECT *
        FROM leads
        WHERE company_id = ?
          AND (
            assigned_employee_id = ?
            OR (
              assigned_employee_id IS NULL
              AND created_by_type = 'employee'
              AND created_by_id = ?
            )
          )
        ORDER BY id DESC`,
        [companyId, employeeId, employeeId]
      );
      return res.json(rows);
    }

    return res.status(403).json({
      success: false,
      message: "Lead access denied"
    });

  } catch (error) {
    console.error("GET LEADS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads"
    });
  }
};
// ==========================
// Delete Lead
// ==========================
const deleteLead = async (req, res) => {

  try {

    const { id } = req.params;
    const { companyId } = req.user;

    const [result] =
      await db.promise().query(

        `
        DELETE FROM leads
        WHERE id = ?
        AND company_id = ?
        `,

        [id, companyId]

      );

    if (result.affectedRows === 0) {

      return res.status(404).json({

        message: "Lead Not Found"

      });

    }

    return res.json({

      message:
        "Lead Deleted Successfully"

    });

  }

  catch (error) {

    console.error(
      "DELETE LEAD ERROR:",
      error
    );

    return res.status(500).json({

      message:
        "Failed to Delete Lead"

    });

  }

};
// ==========================
// Get Employee Leads
// ==========================
const getEmployeeLeads = (req, res) => {

    const { employeeId } = req.params;
    const { companyId } = req.user;

    const sql = `
        SELECT l.*
        FROM leads l

        INNER JOIN employees e
            ON e.employee_id = ?
            AND e.company_id = ?

        WHERE l.company_id = ?

          AND (
                (
                    l.created_by_type = 'employee'
                    AND l.created_by_id = e.employee_id
                )
                OR
                l.assigned_employee_id = e.employee_id
              )

          AND l.lead_status = 'new'

          AND NOT EXISTS (
            SELECT 1
            FROM follow_ups f
            WHERE f.lead_id = l.id
              AND f.employee_id = e.employee_id
              AND f.status = 'pending'
              AND f.next_followup_date IS NOT NULL
        )

        ORDER BY l.id DESC
    `;

    db.query(
        sql,
        [
            employeeId,
            companyId,
            companyId
        ],
        (err, results) => {

            if (err) {

                console.error(
                    "GET EMPLOYEE LEADS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to fetch employee leads"
                });

            }

            res.json(results);

        }
    );
};


const getAllEmployeeLeads = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { companyId } = req.user;

        const sql = `
            SELECT l.*
            FROM leads l
            INNER JOIN employees e
                ON e.employee_id = ?
                AND e.company_id = ?
            WHERE l.company_id = ?
              AND (
                    (
                        l.created_by_type = 'employee'
                        AND l.created_by_id = e.employee_id
                    )
                    OR
                    l.assigned_employee_id = e.employee_id
                  )
            ORDER BY l.id DESC
        `;

        const [results] = await db.promise().query(sql, [
            employeeId,
            companyId,
            companyId
        ]);

        return res.json(results);

    } catch (error) {
        console.error("GET ALL EMPLOYEE LEADS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch all employee leads"
        });
    }
};


const getEmployeeImportantLeads = (req, res) => {
    const { employeeId } = req.params;
    const { companyId } = req.user;

    const sql = `
        SELECT l.*
        FROM leads l

        INNER JOIN employees e
            ON e.employee_id = ?
            AND e.company_id = ?

        WHERE l.company_id = ?
          AND (
                (
                    l.created_by_type = 'employee'
                    AND l.created_by_id = e.employee_id
                )
                OR
                l.assigned_employee_id = e.employee_id
              )

          AND l.important_lead = 1

        ORDER BY l.id DESC
    `;

    db.query(
        sql,
        [employeeId, companyId, companyId],
        (err, results) => {

            if (err) {
                console.error(
                    "GET EMPLOYEE IMPORTANT LEADS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee important leads"
                });
            }

            res.json(results);
        }
    );
};

const getEmployeeConvertedLeads = (req, res) => {
    const { employeeId } = req.params;
    const { companyId } = req.user;

    const sql = `
        SELECT l.*
        FROM leads l
        INNER JOIN employees e
            ON e.employee_id = ?
            AND e.company_id = ?
        WHERE l.company_id = ?
          AND (
                (
                    l.created_by_type = 'employee'
                    AND l.created_by_id = e.employee_id
                )
                OR
                l.assigned_employee_id = e.employee_id
              )
          AND l.lead_status = 'converted'
        ORDER BY l.id DESC
    `;

    db.query(
        sql,
        [employeeId, companyId, companyId],
        (err, results) => {
            if (err) {
                console.error(
                    "GET EMPLOYEE CONVERTED LEADS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee converted leads"
                });
            }

            res.json(results);
        }
    );
};

const getEmployeeNotInterestedLeads = (req, res) => {
    const { employeeId } = req.params;
    const { companyId } = req.user;

    const sql = `
        SELECT l.*
        FROM leads l
        INNER JOIN employees e
            ON e.employee_id = ?
            AND e.company_id = ?
        WHERE l.company_id = ?
          AND (
                (
                    l.created_by_type = 'employee'
                    AND l.created_by_id = e.employee_id
                )
                OR
                l.assigned_employee_id = e.employee_id
              )
        AND LOWER(REPLACE(l.lead_status, ' ', '_')) = 'not_interested'
        ORDER BY l.id DESC
    `;

    db.query(
        sql,
        [employeeId, companyId, companyId],
        (err, results) => {
            if (err) {
                console.error(
                    "GET EMPLOYEE NOT INTERESTED LEADS ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee not interested leads"
                });
            }

            res.json(results);
        }
    );
};
// ==========================
// Get Lead By ID
// ==========================
const getLeadById = async (req, res) => {
  try {
    const leadId = Number(req.params.id);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(leadId) ||
      leadId <= 0 ||
      !userId ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Invalid lead request"
      });
    }

    let sql = `
      SELECT l.*
      FROM leads l
      WHERE l.id = ?
        AND l.company_id = ?
    `;

    const params = [leadId, companyId];

    if (role === "employee") {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM employees e
          WHERE e.user_id = ?
            AND e.company_id = l.company_id
            AND e.status = 'active'
           AND (
            l.assigned_employee_id = e.employee_id
            OR (
              l.assigned_employee_id IS NULL
              AND l.created_by_type = 'employee'
              AND l.created_by_id = e.employee_id
            )
          )
          )
          `;

      params.push(userId);
    } else if (role === "manager" || role === "owner") {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM managers m
          WHERE m.user_id = ?
            AND m.company_id = l.company_id
            AND m.status = 'active'
        )
      `;

      params.push(userId);
    } else {
      return res.status(403).json({
        message: "Lead access denied"
      });
    }

    sql += " LIMIT 1";

    const [rows] = await db.promise().query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Lead Not Found"
      });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error("GET LEAD ERROR:", error);

    return res.status(500).json({
      message: "Failed to Fetch Lead"
    });
  }
};
// ==========================
// Update Lead
// ==========================
const updateLead = async (req, res) => {
    try {
        // ==========================
        // Get Lead ID + Tenant
        // ==========================
        const { id } = req.params;
        const { companyId, id: userId, role } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company."
            });
        }

        // ==========================
        // Request Body
        // ==========================
        const {
            company_name,
            contact_person_name,
            designation,
            phone,
            email,
            address,
            website,
            city,
            category,
            source,
            lead_mode,
            lead_status,
            remarks,
            important_lead,
            assigned_employee_id
        } = req.body;

        // ==========================
        // Clean Values
        // ==========================
        const cleanPhone = phone?.trim() || null;
        const cleanEmail = email?.trim() || null;

        // ==========================
        // Required Contact
        // ==========================
        if (!cleanPhone && !cleanEmail) {
            return res.status(400).json({
                success: false,
                message: "Either Phone Number or Email is required."
            });
        }

        // ==========================
        // Phone Validation
        // ==========================
        if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {
            return res.status(400).json({
                success: false,
                message: "Phone Number must contain exactly 10 digits."
            });
        }

        // ==========================
        // Email Validation
        // ==========================
        if (cleanEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid Email Address."
                });
            }
        }

        // ==========================
        // Get Existing Lead
        // ==========================
        const [oldLeadRows] = await db.promise().query(
            `
            SELECT *
            FROM leads
            WHERE id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [id, companyId]
        );

        if (oldLeadRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead Not Found"
            });
        }

        const previous = oldLeadRows[0];
        // ==========================
// Employee Lead Ownership Check
// ==========================
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

    if (employeeRows.length !== 1) {
        return res.status(403).json({
            success: false,
            message: "Employee profile not found or inactive."
        });
    }

    const employeeId = Number(employeeRows[0].employee_id);

    const assignedToEmployee =
    previous.assigned_employee_id !== null &&
    Number(previous.assigned_employee_id) === employeeId;

    const createdUnassignedLead =
        previous.assigned_employee_id == null &&
        previous.created_by_type === "employee" &&
        Number(previous.created_by_id) === employeeId;

    if (!assignedToEmployee && !createdUnassignedLead) {
        return res.status(404).json({
            success: false,
            message: "Lead Not Found"
        });

    }
}

        // ==========================
        // Determine Role
        // ==========================
        const isManager = role === "manager" || role === "owner";

        // Preserve the current assignment for employees.
        let newAssignedEmployeeId = previous.assigned_employee_id;

        // ==========================
        // Validate Manager Assignment
        // ==========================
        if (isManager) {
            if (
                assigned_employee_id === undefined ||
                assigned_employee_id === null ||
                String(assigned_employee_id).trim() === ""
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Please select an employee for this lead."
                });
            }

            newAssignedEmployeeId = Number(assigned_employee_id);

            if (
                !Number.isInteger(newAssignedEmployeeId) ||
                newAssignedEmployeeId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid employee selected."
                });
            }

            // Find Manager profile
            const [managerRows] = await db.promise().query(
                `
                SELECT manager_id
                FROM managers
                WHERE user_id = ?
                  AND company_id = ?
                  AND status = 'active'
                LIMIT 1
                `,
                [userId, companyId]
            );

            if (managerRows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "Manager profile not found or inactive."
                });
            }

            const managerId = managerRows[0].manager_id;

            // Confirm employee belongs to this Manager and company
            const [employeeRows] = await db.promise().query(
                `
                SELECT employee_id
                FROM employees
                WHERE employee_id = ?
                  AND company_id = ?
                  AND manager_id = ?
                  AND status = 'active'
                LIMIT 1
                `,
                [newAssignedEmployeeId, companyId, managerId]
            );

            if (employeeRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected employee is not an active employee under your account."
                });
            }
        }

        // ==========================
        // Duplicate Check
        // ==========================
        const conditions = [];
        const values = [companyId, id];

        if (cleanPhone) {
            conditions.push("phone = ?");
            values.push(cleanPhone);
        }

        if (cleanEmail) {
            conditions.push("email = ?");
            values.push(cleanEmail);
        }

        if (conditions.length > 0) {
            const [duplicate] = await db.promise().query(
                `
                SELECT id
                FROM leads
                WHERE company_id = ?
                  AND id <> ?
                  AND (${conditions.join(" OR ")})
                LIMIT 1
                `,
                values
            );

            if (duplicate.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Phone Number or Email already exists."
                });
            }
        }

        // ==========================
        // Update Lead
        // Manager can change assignment.
        // Employee cannot change assignment.
        // ==========================
        let updateQuery;
        let updateValues;

        if (isManager) {
            updateQuery = `
                UPDATE leads
                SET
                    company_name = ?,
                    contact_person_name = ?,
                    designation = ?,
                    phone = ?,
                    email = ?,
                    address = ?,
                    website = ?,
                    city = ?,
                    category = ?,
                    source = ?,
                    lead_mode = ?,
                    lead_status = ?,
                    remarks = ?,
                    important_lead = ?,
                    assigned_at = CASE
                        WHEN assigned_employee_id <=> ?
                        THEN assigned_at
                        ELSE CURRENT_TIMESTAMP
                    END,
                    assigned_by_id = CASE
                        WHEN assigned_employee_id <=> ?
                        THEN assigned_by_id
                        ELSE ?
                    END,
                    assigned_employee_id = ?
                WHERE id = ?
                  AND company_id = ?
            `;

            updateValues = [
                company_name?.trim() || null,
                contact_person_name?.trim() || null,
                designation?.trim() || null,
                cleanPhone,
                cleanEmail,
                address?.trim() || null,
                website?.trim() || null,
                city?.trim() || null,
                category?.trim() || null,
                source?.trim() || null,
                lead_mode?.trim() || null,
                lead_status?.trim() || null,
                remarks?.trim() || null,
                important_lead ? 1 : 0,

                newAssignedEmployeeId,
                newAssignedEmployeeId,
                userId,
                newAssignedEmployeeId,

                id,
                companyId
            ];
        } else {
            // Employee: only created or assigned leads
            updateQuery = `
                UPDATE leads AS l
                INNER JOIN employees AS e
                    ON e.user_id = ?
                   AND e.company_id = l.company_id
                   AND e.status = 'active'
                   AND (
                        l.assigned_employee_id = e.employee_id
                        OR (
                            l.assigned_employee_id IS NULL
                            AND l.created_by_type = 'employee'
                            AND l.created_by_id = e.employee_id
                        )
                    )
                SET
                    l.company_name = ?,
                    l.contact_person_name = ?,
                    l.designation = ?,
                    l.phone = ?,
                    l.email = ?,
                    l.address = ?,
                    l.website = ?,
                    l.city = ?,
                    l.category = ?,
                    l.source = ?,
                    l.lead_mode = ?,
                    l.lead_status = ?,
                    l.remarks = ?,
                    l.important_lead = ?
                WHERE l.id = ?
                  AND l.company_id = ?
            `;

            updateValues = [
                userId,
                company_name?.trim() || null,
                contact_person_name?.trim() || null,
                designation?.trim() || null,
                cleanPhone,
                cleanEmail,
                address?.trim() || null,
                website?.trim() || null,
                city?.trim() || null,
                category?.trim() || null,
                source?.trim() || null,
                lead_mode?.trim() || null,
                lead_status?.trim() || null,
                remarks?.trim() || null,
                important_lead ? 1 : 0,
                id,
                companyId
            ];
        }
        const [updateResult] = await db.promise().query(
            updateQuery,
            updateValues
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or update access denied."
            });
        }

        // ==========================
        // Determine Employee for History
        // ==========================
        let employeeId = previous.created_by_id;

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

            if (employeeRows.length > 0) {
                employeeId = employeeRows[0].employee_id;
            }
        }

        // ==========================
        // Save Lead History
        // ==========================
        await logLeadChanges(
            previous,
            req.body,
            id,
            employeeId
        );

        // ==========================
        // Success
        // ==========================
        return res.json({
            success: true,
            message: "Lead Updated Successfully"
        });

    } catch (error) {
        console.error("UPDATE LEAD ERROR:", error);

        return res.status(500).json({
            success: false,
            message:
                error.sqlMessage ||
                error.message ||
                "Failed to Update Lead"
        });
    }
};

// ==========================
// Get Important Leads
// ==========================
const getImportantLeads = async (req, res) => {
    try {
        const { companyId } = req.user;

        const [rows] = await db.promise().query(
            `
            SELECT *
            FROM leads
            WHERE company_id = ?
              AND important_lead = 1
            ORDER BY id DESC
            `,
            [companyId]
        );

        res.json(rows);

    } catch (error) {
        console.error("GET IMPORTANT LEADS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch important leads"
        });
    }
};
// ==========================
// Converted Leads
// ==========================
const getConvertedLeads = async (req, res) => {
    try {
        const { companyId } = req.user;

        const [rows] = await db.promise().query(
            `
            SELECT *
            FROM leads
            WHERE company_id = ?
              AND lead_status = 'converted'
            ORDER BY id DESC
            `,
            [companyId]
        );

        res.json(rows);

    } catch (error) {
        console.error("GET CONVERTED LEADS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch converted leads"
        });
    }
};


// ==========================
// Not Interested Leads
// ==========================
const getNotInterestedLeads = async (req, res) => {
    try {
        const { companyId } = req.user;

        const [rows] = await db.promise().query(
            `
            SELECT *
            FROM leads
            WHERE company_id = ?
              AND lead_status = 'not interested'
            ORDER BY id DESC
            `,
            [companyId]
        );

        res.json(rows);

    } catch (error) {
        console.error("GET NOT INTERESTED LEADS ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch not interested leads"
        });
    }
};
// ======================================================
// Assign Lead
// ======================================================
const assignLead = async (req, res) => {
    try {
        const { id: userId, companyId } = req.user;
        const { id: leadId } = req.params;
        const { assigned_employee_id } = req.body;

        // ==========================
        // Basic Company Validation
        // ==========================
        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company."
            });
        }

        // ==========================
        // Verify Lead
        // ==========================
        const [leadRows] = await db.promise().query(
            `
            SELECT id
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
                message: "Lead Not Found"
            });
        }

        // ==========================
        // Unassign Lead
        // ==========================
        if (
            assigned_employee_id === null ||
            assigned_employee_id === undefined ||
            assigned_employee_id === ""
        ) {
            await db.promise().query(
                `
                UPDATE leads
                SET
                    assigned_employee_id = NULL,
                    assigned_at = NULL,
                    assigned_by_id = NULL
                WHERE id = ?
                  AND company_id = ?
                `,
                [leadId, companyId]
            );

            return res.json({
                success: true,
                message: "Lead Unassigned Successfully"
            });
        }

        // ==========================
        // Validate Employee ID
        // ==========================
        const employeeId = Number(assigned_employee_id);

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Employee ID"
            });
        }

        // ==========================
        // Verify Employee
        // ==========================
        const [employeeRows] = await db.promise().query(
            `
            SELECT
                employee_id,
                user_id,
                full_name,
                email,
                company_id,
                status
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
        );

        if (employeeRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Employee does not belong to this company."
            });
        }

        const employee = employeeRows[0];

        // ==========================
        // Active Employee Required
        // ==========================
        if (employee.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Only active employees can be assigned leads."
            });
        }

        // ==========================
        // Assign Lead
        // ==========================
        await db.promise().query(
            `
            UPDATE leads
            SET
                assigned_employee_id = ?,
                assigned_at = CURRENT_TIMESTAMP,
                assigned_by_id = ?
            WHERE id = ?
              AND company_id = ?
            `,
            [
                employeeId,
                userId,
                leadId,
                companyId
            ]
        );

        // ==========================
        // Success
        // ==========================
        return res.json({
            success: true,
            message: "Lead Assigned Successfully",
            data: {
                lead_id: Number(leadId),
                assigned_employee_id: employee.employee_id,
                assigned_employee_name: employee.full_name,
                assigned_employee_email: employee.email,
                assigned_by_id: userId
            }
        });

    } catch (error) {
        console.error("ASSIGN LEAD ERROR:", error);

        return res.status(500).json({
            success: false,
            message:
                error.sqlMessage ||
                error.message ||
                "Failed to Assign Lead"
        });
    }
};
// ======================================================
// Get Manager Employees for Lead Assignment
// ======================================================

const getAssignmentEmployees = async (req, res) => {
    try {
        const {
            id: userId,
            companyId,
            role
        } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company."
            });
        }

        if (role !== "manager" && role !== "owner") {
            return res.status(403).json({
                success: false,
                message: "Only Manager can access employees."
            });
        }

        const [managerRows] = await db.promise().query(
            `
                SELECT manager_id
                FROM managers
                WHERE user_id = ?
                  AND company_id = ?
                  AND status = 'active'
                LIMIT 1
            `,
            [userId, companyId]
        );

        if (managerRows.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Manager profile not found."
            });
        }

        const managerId = managerRows[0].manager_id;

        const [employees] = await db.promise().query(
            `
                SELECT
                    employee_id,
                    employee_code,
                    full_name,
                    email,
                    status
                FROM employees
                WHERE company_id = ?
                  AND manager_id = ?
                  AND status = 'active'
                ORDER BY full_name ASC
            `,
            [companyId, managerId]
        );

        return res.json({
            success: true,
            employees
        });

    } catch (error) {
        console.error(
            "GET ASSIGNMENT EMPLOYEES ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employees."
        });
    }
};
// ==========================
// Export
// ==========================
module.exports = {

  addLead,

  getLeads,

  deleteLead,

  getEmployeeLeads,

  getAllEmployeeLeads,

  getLeadById,

  updateLead,

  assignLead,

   getAssignmentEmployees,

  getImportantLeads,

  getConvertedLeads,

  getNotInterestedLeads,

  getEmployeeImportantLeads,

  getEmployeeConvertedLeads,

  getEmployeeNotInterestedLeads

};