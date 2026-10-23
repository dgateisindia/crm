const db = require("../db");
const { clerkClient } = require("@clerk/express");

// ==========================
// Create Employee + Clerk Invitation
// ==========================
const createEmployee = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      department,
      designation
    } = req.body;

    const {
      id: currentUserId,
      companyId,
      role: currentUserRole
    } = req.user;

    // ==========================
    // Authorization
    // ==========================
    if (!["owner", "manager"].includes(currentUserRole)) {
      return res.status(403).json({
        success: false,
        message: "Only owner or manager can create employees"
      });
    }

    // ==========================
    // Required fields
    // ==========================
    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Full name and email are required"
      });
    }

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "Company could not be determined"
      });
    }

    // ==========================
    // Normalize email
    // ==========================
    const normalizedEmail = email.trim().toLowerCase();

    // ==========================
    // Verify current user belongs
    // to this company
    // ==========================
    const [currentUser] = await db.promise().query(
      `
      SELECT id, company_id, role
      FROM users
      WHERE id = ?
        AND company_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [currentUserId, companyId]
    );

    if (currentUser.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Current user is not associated with this company"
      });
    }
    // ==========================
// Get current Manager
// ==========================
const [manager] = await db.promise().query(
  `
  SELECT manager_id
  FROM managers
  WHERE user_id = ?
    AND company_id = ?
    AND status = 'active'
  LIMIT 1
  `,
  [currentUserId, companyId]
);

if (manager.length === 0) {
  return res.status(403).json({
    success: false,
    message: "Manager profile could not be found"
  });
}

const managerId = manager[0].manager_id;

    // ==========================
    // Check duplicate employee
    // inside this company
    // ==========================
    const [existingEmployee] = await db.promise().query(
      `
      SELECT employee_id, status
      FROM employees
      WHERE company_id = ?
        AND (
          LOWER(email) = ?
          OR (
            phone IS NOT NULL
            AND phone != ''
            AND phone = ?
          )
        )
      LIMIT 1
      `,
      [companyId, normalizedEmail, phone || null]
    );

    if (existingEmployee.length > 0) {
      return res.status(400).json({
        success: false,
        message: "An employee with this email or phone already exists"
      });
    }

    // ==========================
    // Create local employee
    // ==========================
    const [insertResult] = await db.promise().query(
      `
      INSERT INTO employees (
        user_id,
        clerk_invitation_id,
        company_id,
        manager_id,
        role_id,
        full_name,
        email,
        phone,
        password,
        department,
        designation,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        null,
        null,
        companyId,
        managerId,
        1,
        full_name.trim(),
        normalizedEmail,
        phone || null,
        null,
        department || null,
        designation || null,
        "invited"
        ]
    );

    const employeeId = insertResult.insertId;

    // ==========================
    // Generate employee code
    // ==========================
    const employeeCode =
      `EMP${String(employeeId).padStart(3, "0")}`;

    await db.promise().query(
      `
      UPDATE employees
      SET employee_code = ?
      WHERE employee_id = ?
        AND company_id = ?
      `,
      [employeeCode, employeeId, companyId]
    );

    // ==========================
    // Create Clerk invitation
    // ==========================
    let invitation;

    try {
     


   invitation = await clerkClient.invitations.createInvitation({
  emailAddress: normalizedEmail,
  ignoreExisting: true,
  notify: true,
  publicMetadata: {
    crmCompanyId: companyId,
    crmEmployeeId: employeeId,
    crmRole: "employee"
  }
});

    } catch (clerkError) {
      console.error(
        "CLERK INVITATION ERROR:",
        clerkError
      );

      return res.status(502).json({
        success: false,
        message:
          "Employee was created, but the Clerk invitation could not be sent",
        employee_id: employeeId,
        employee_code: employeeCode
      });
    }

    // ==========================
    // Store Clerk invitation ID
    // ==========================
    await db.promise().query(
      `
      UPDATE employees
      SET clerk_invitation_id = ?
      WHERE employee_id = ?
        AND company_id = ?
      `,
      [
        invitation.id,
        employeeId,
        companyId
      ]
    );

    // ==========================
    // Success
    // ==========================
    return res.status(201).json({
      success: true,
      message:
        "Employee created and invitation sent successfully",
      employee_id: employeeId,
      employee_code: employeeCode,
      status: "invited"
    });

  } catch (error) {
    console.error(
      "CREATE EMPLOYEE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create employee"
    });
  }
};
      

     

// ==========================
// Get All Employees
// ==========================
const getEmployees = async (req, res) => {
  try {
    const {
      id: currentUserId,
      companyId,
      role: currentUserRole
    } = req.user;

    // ==========================
    // Verify company
    // ==========================
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    // ==========================
    // Only Manager can access
    // employee list
    // ==========================
    if (!["owner", "manager"].includes(currentUserRole)) {
      return res.status(403).json({
        success: false,
        message: "Only manager can view employees"
      });
    }

    // ==========================
    // Get current Manager
    // ==========================
    const [manager] = await db.promise().query(
      `
      SELECT manager_id
      FROM managers
      WHERE user_id = ?
        AND company_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [currentUserId, companyId]
    );

    if (manager.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Manager profile could not be found"
      });
    }

    const managerId = manager[0].manager_id;

    // ==========================
    // Get employees belonging
    // to this Manager
    // ==========================
    const [rows] = await db.promise().query(
      `
      SELECT employee_id, employee_code, user_id, clerk_invitation_id, company_id, manager_id, role_id, full_name, email, phone, department, designation, status FROM employees
      WHERE company_id = ?
        AND manager_id = ?
      ORDER BY employee_id DESC
      `,
      [companyId, managerId]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees"
    });
  }
};
// ==========================
// Get Employee By ID
// ==========================
const getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const {
      id: currentUserId,
      companyId,
      role: currentUserRole
    } = req.user;

    // ==========================
    // Verify company
    // ==========================
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    // ==========================
    // Only Manager can access
    // ==========================
    if (!["owner", "manager"].includes(currentUserRole)) {
      return res.status(403).json({
        success: false,
        message: "Only manager can access employee details"
      });
    }

    // ==========================
    // Get current Manager
    // ==========================
    const [manager] = await db.promise().query(
      `
      SELECT manager_id
      FROM managers
      WHERE user_id = ?
        AND company_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [currentUserId, companyId]
    );

    if (manager.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Manager profile could not be found"
      });
    }

    const managerId = manager[0].manager_id;

    // ==========================
    // Get employee
    // belonging to this Manager
    // ==========================
    const [result] = await db.promise().query(
      `
      SELECT
        employees.employee_id, employees.employee_code, employees.user_id, employees.clerk_invitation_id, employees.company_id, employees.manager_id, employees.role_id, employees.full_name, employees.email, employees.phone, employees.department, employees.designation, employees.status, employee_roles.role_name
      FROM employees
      JOIN employee_roles
        ON employees.role_id = employee_roles.role_id
      WHERE employees.employee_id = ?
        AND employees.company_id = ?
        AND employees.manager_id = ?
      LIMIT 1
      `,
      [employeeId, companyId, managerId]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    return res.status(200).json(result[0]);

  } catch (error) {
    console.error("GET EMPLOYEE BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching employee"
    });
  }
};
// ==========================
// Delete Employee
// ==========================
const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    const {
      id: currentUserId,
      companyId,
      role: currentUserRole
    } = req.user;

    // ==========================
    // Verify company
    // ==========================
    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }

    // ==========================
    // Only Manager can delete
    // ==========================
    if (currentUserRole !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only manager can delete employees"
      });
    }

    // ==========================
    // Get current Manager
    // ==========================
    const [manager] = await db.promise().query(
      `
      SELECT manager_id
      FROM managers
      WHERE user_id = ?
        AND company_id = ?
        AND status = 'active'
      LIMIT 1
      `,
      [currentUserId, companyId]
    );

    if (manager.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Manager profile could not be found"
      });
    }

    const managerId = manager[0].manager_id;

    // ==========================
    // Delete employee belonging
    // to this Manager
    // ==========================
    const [result] = await db.promise().query(
      `
      DELETE FROM employees
      WHERE employee_id = ?
        AND company_id = ?
        AND manager_id = ?
      `,
      [employeeId, companyId, managerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully"
    });

  } catch (error) {
    console.error("DELETE EMPLOYEE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete employee"
    });
  }
};

// ==========================
// Update Employee Status
// ==========================

const updateEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const {
            id: currentUserId,
            companyId,
            role: currentUserRole
        } = req.user;

        // ==========================
        // Verify company
        // ==========================
        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        // ==========================
        // Only Manager can update
        // employee status
        // ==========================
        if (currentUserRole !== "manager") {
            return res.status(403).json({
                success: false,
                message: "Only manager can update employee status"
            });
        }

        // ==========================
        // Validate status
        // ==========================
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        // ==========================
        // Get current Manager
        // ==========================
        const [manager] = await db.promise().query(
            `
            SELECT manager_id
            FROM managers
            WHERE user_id = ?
              AND company_id = ?
              AND status = 'active'
            LIMIT 1
            `,
            [currentUserId, companyId]
        );

        if (manager.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Manager profile could not be found"
            });
        }

        const managerId = manager[0].manager_id;

        // ==========================
        // Update employee status
        // only if employee belongs
        // to this Manager
        // ==========================
        const [result] = await db.promise().query(
            `
            UPDATE employees
            SET status = ?
            WHERE employee_id = ?
              AND company_id = ?
              AND manager_id = ?
            `,
            [status, id, companyId, managerId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Status Updated"
        });

    } catch (error) {
        console.error("UPDATE EMPLOYEE STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Update Failed"
        });
    }
};
// ==========================
// Get Employee Profile
// ==========================
const getEmployeeProfile = async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(employeeId) ||
      employeeId <= 0 ||
      !userId ||
      !companyId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee profile request"
      });
    }

    const isManager = ["owner", "manager"].includes(role);

    const sql = `
      SELECT
        employee_id,
        employee_code,
        full_name,
        email,
        phone,
        department,
        designation,
        status
      FROM employees
      WHERE employee_id = ?
        AND company_id = ?
        ${isManager ? "" : "AND user_id = ?"}
      LIMIT 1
    `;

    const params = isManager
      ? [employeeId, companyId]
      : [employeeId, companyId, userId];

    if (role !== "employee" && !isManager) {
      return res.status(403).json({
        success: false,
        message: "Employee profile access denied"
      });
    }

    const [rows] = await db.promise().query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found"
      });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error("GET EMPLOYEE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching employee profile"
    });
  }
};
// ==========================
// Get Logged-in Employee
// ==========================
const getMyEmployeeProfile = async (req, res) => {
    try {
        const { id: userId, companyId } = req.user;

        if (!userId || !companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        const [result] = await db.promise().query(
            `
            SELECT
                employee_id,
                user_id,
                company_id,
                manager_id,
                role_id,
                full_name,
                email,
                phone,
                department,
                designation,
                status,
                employee_code
            FROM employees
            WHERE user_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [userId, companyId]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee profile is not linked to this account"
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        console.error("GET MY EMPLOYEE PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch logged-in employee profile"
        });
    }
};

const changePassword =
(req, res) => {

  const id =
  req.params.id;

  const {
    newPassword
  } = req.body;

  db.query(

    `

      UPDATE employees

      SET password = ?

      WHERE employee_id = ?

    `,

    [

      newPassword,
      id

    ],

    (err) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.json({

        message:
        "Password Updated"

      });

    }

  );

};
// ==========================
// Update Employee Profile
// ==========================
const updateEmployeeProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone, designation } = req.body;
        const { companyId } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        // Verify employee belongs to this company
        const [employee] = await db.promise().query(
            `
            SELECT employee_id
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [id, companyId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Check duplicate phone only inside this company
        if (phone) {
            const [duplicate] = await db.promise().query(
                `
                SELECT employee_id
                FROM employees
                WHERE phone = ?
                  AND employee_id != ?
                  AND company_id = ?
                LIMIT 1
                `,
                [phone, id, companyId]
            );

            if (duplicate.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number already exists"
                });
            }
        }

        await db.promise().query(
            `
            UPDATE employees
            SET
                full_name = ?,
                phone = ?,
                designation = ?
            WHERE employee_id = ?
              AND company_id = ?
            `,
            [
                full_name,
                phone,
                designation,
                id,
                companyId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully"
        });

    } catch (error) {
        console.error("UPDATE EMPLOYEE PROFILE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};


// ==========================
// Employee Statistics
// ==========================
const getEmployeeStats = async (req, res) => {
    try {
        const employeeId = Number(req.params.id);
        const { companyId, id: userId, role } = req.user;

          if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
              return res.status(400).json({
                  success: false,
                  message: "Invalid employee ID"
              });
          }

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        // First verify that this employee belongs to the
        // authenticated user's company.
        const [employee] = await db.promise().query(
            `
            SELECT employee_id
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
// ==========================
// Employee Statistics Authorization
// ==========================
if (role === "employee") {
    const [ownEmployee] = await db.promise().query(
        `
        SELECT employee_id
        FROM employees
        WHERE employee_id = ?
          AND company_id = ?
          AND user_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [employeeId, companyId, userId]
    );

    if (ownEmployee.length !== 1) {
        return res.status(403).json({
            success: false,
            message: "You cannot view another employee's statistics"
        });
    }

} else if (role === "manager" || role === "owner") {
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

    if (managerRows.length !== 1) {
        return res.status(403).json({
            success: false,
            message: "Manager access denied"
        });
    }

} else {
    return res.status(403).json({
        success: false,
        message: "Statistics access denied"
    });
}

        // Total leads created by this employee
        const [leadResult] = await db.promise().query(
    `
    SELECT COUNT(*) AS totalLeads
    FROM leads
    WHERE company_id = ?
      AND (
          (created_by_type = 'employee' AND created_by_id = ?)
          OR assigned_employee_id = ?
      )
    `,
    [companyId, employeeId, employeeId]
);

        // Total follow-ups handled by this employee
        const [followupResult] = await db.promise().query(
            `
            SELECT COUNT(DISTINCT f.lead_id) AS totalFollowups
            FROM follow_ups f
            WHERE employee_id = ?
              AND lead_id IN (
                  SELECT id
                  FROM leads
                  WHERE company_id = ?
              )
            `,
            [employeeId, companyId]
        );

        // Total converted leads
        const [convertedResult] = await db.promise().query(
    `
    SELECT COUNT(*) AS convertedLeads
    FROM leads
    WHERE company_id = ?
      AND lead_status = 'converted'
      AND (
          (created_by_type = 'employee' AND created_by_id = ?)
          OR assigned_employee_id = ?
      )
    `,
    [companyId, employeeId, employeeId]
);

        // Total pending leads
        const [pendingResult] = await db.promise().query(
    `
    SELECT COUNT(*) AS pendingLeads
    FROM leads
    WHERE company_id = ?
      AND lead_status NOT IN ('converted', 'closed')
      AND (
          (created_by_type = 'employee' AND created_by_id = ?)
          OR assigned_employee_id = ?
      )
    `,
    [companyId, employeeId, employeeId]
);

        return res.status(200).json({
            totalLeads: leadResult[0].totalLeads,
            totalFollowups: followupResult[0].totalFollowups,
            convertedLeads: convertedResult[0].convertedLeads,
            pendingLeads: pendingResult[0].pendingLeads
        });

    } catch (error) {
        console.error("GET EMPLOYEE STATS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee statistics"
        });
    }
};
// ==========================
// Update Employee
// ==========================

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            email,
            phone,
            department,
            designation,
            status
        } = req.body;

        const { companyId } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        // Verify employee belongs to this company
        const [employee] = await db.promise().query(
            `
            SELECT employee_id
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [id, companyId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Check duplicate email or phone within this company
        const [duplicate] = await db.promise().query(
            `
            SELECT employee_id
            FROM employees
            WHERE (email = ? OR phone = ?)
              AND employee_id != ?
              AND company_id = ?
            LIMIT 1
            `,
            [email, phone, id, companyId]
        );

        if (duplicate.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email or phone number already exists"
            });
        }

        // Update employee details.
        // Password is intentionally NOT modified here.
        await db.promise().query(
            `
            UPDATE employees
            SET
                full_name = ?,
                email = ?,
                phone = ?,
                department = ?,
                designation = ?,
                status = ?
            WHERE employee_id = ?
              AND company_id = ?
            `,
            [
                full_name,
                email,
                phone,
                department,
                designation,
                status,
                id,
                companyId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Employee Updated Successfully"
        });

    } catch (error) {
        console.error("UPDATE EMPLOYEE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update employee"
        });
    }
};
// ==========================
// GET EMPLOYEE NOTE
// ==========================
const getEmployeeNote = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const { companyId } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        const [rows] = await db.promise().query(
            `
            SELECT en.note
            FROM employee_notes en
            INNER JOIN employees e
                ON en.employee_id = e.employee_id
            WHERE en.employee_id = ?
              AND e.company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
        );

        if (rows.length === 0) {
            return res.status(200).json({
                note: ""
            });
        }

        return res.status(200).json(rows[0]);

    } catch (error) {
        console.error("GET EMPLOYEE NOTE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch note"
        });
    }
};

// ==========================
// SAVE EMPLOYEE NOTE
// ==========================
const saveEmployeeNote = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const { note } = req.body;
        const { companyId } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        // Verify employee belongs to authenticated user's company
        const [employee] = await db.promise().query(
            `
            SELECT employee_id
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await db.promise().query(
            `
            INSERT INTO employee_notes (
                employee_id,
                note
            )
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
                note = VALUES(note)
            `,
            [employeeId, note]
        );

        return res.status(200).json({
            success: true,
            message: "Note saved successfully"
        });

    } catch (error) {
        console.error("SAVE EMPLOYEE NOTE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save note"
        });
    }
};

// ==========================
// DELETE EMPLOYEE NOTE
// ==========================
const deleteEmployeeNote = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const { companyId } = req.user;

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company"
            });
        }

        // Verify employee belongs to authenticated user's company
        const [employee] = await db.promise().query(
            `
            SELECT employee_id
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        await db.promise().query(
            `
            DELETE FROM employee_notes
            WHERE employee_id = ?
            `,
            [employeeId]
        );

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });

    } catch (error) {
        console.error("DELETE EMPLOYEE NOTE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete note"
        });
    }
};

const retryEmployeeInvitation = async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(employeeId) ||
      employeeId <= 0 ||
      !companyId ||
      !userId ||
      !["owner", "manager"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Invitation access denied"
      });
    }

    // Verify that the Manager belongs to this company.
    const [managers] = await db.promise().query(
      `SELECT manager_id
       FROM managers
       WHERE user_id = ?
         AND company_id = ?
         AND status = 'active'
       LIMIT 1`,
      [userId, companyId]
    );

    if (managers.length !== 1) {
      return res.status(403).json({
        success: false,
        message: "Manager access denied"
      });
    }

    // Only recover employees managed by this Manager.
    const [employees] = await db.promise().query(
      `SELECT employee_id, email, status,
              user_id, clerk_invitation_id
       FROM employees
       WHERE employee_id = ?
         AND company_id = ?
         AND manager_id = ?
       LIMIT 1`,
      [
        employeeId,
        companyId,
        managers[0].manager_id
      ]
    );

    const employee = employees[0];

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (
      employee.status !== "invited" ||
      employee.user_id !== null
    ) {
      return res.status(409).json({
        success: false,
        message: "Employee is not awaiting activation"
      });
    }

    
    const previousInvitationId =
      employee.clerk_invitation_id;

    if (previousInvitationId) {
      const result =
        await clerkClient.invitations.getInvitationList({
          query: previousInvitationId,
          limit: 20
        });

      const previous = (result.data || []).find(
        item => item.id === previousInvitationId
      );

      if (!previous) {
        return res.status(409).json({
          success: false,
          message:
            "Previous invitation could not be verified. " +
            "Review its status in Clerk."
        });
      }

      if (previous.status === "accepted") {
        return res.status(409).json({
          success: false,
          message:
            "Invitation already accepted in Clerk. " +
            "Employee account linking must be completed."
        });
      }

      if (previous.status === "pending") {
        await clerkClient.invitations.revokeInvitation(
          previousInvitationId
        );
      } else if (
        !["expired", "revoked"].includes(previous.status)
      ) {
        return res.status(409).json({
          success: false,
          message: "Invitation status requires review."
        });
      }
    }

    const invitation = await clerkClient.invitations.createInvitation({
  emailAddress: employee.email,
  publicMetadata: {
    crmCompanyId: companyId,
    crmEmployeeId: employee.employee_id,
    crmRole: "employee"
  }
});

    // Link invitation without replacing an existing link.
    const [updated] = await db.promise().query(
      `UPDATE employees
       SET clerk_invitation_id = ?
       WHERE employee_id = ?
         AND company_id = ?
         AND manager_id = ?
         AND user_id IS NULL
         AND status = 'invited'
         AND clerk_invitation_id <=> ?`,
      [
        invitation.id,
        employeeId,
        companyId,
        managers[0].manager_id,
        previousInvitationId
      ]
    );

    if (updated.affectedRows !== 1) {
      console.error(
        "INVITATION LINK CONFLICT:",
        { employeeId, companyId, invitationId: invitation.id }
      );

      return res.status(409).json({
        success: false,
        message:
          "Invitation was created, but employee linking needs review"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee invitation sent successfully"
    });

  } catch (error) {
    const code = error.errors?.[0]?.code;

    if (code === "dev_monthly_email_limit_exceeded") {
      return res.status(503).json({
        success: false,
        message:
          "Clerk development email limit reached. " +
          "Retry when email delivery is available."
      });
    }

    if (code === "form_identifier_exists") {
      return res.status(409).json({
        success: false,
        message:
          "This email already has a Clerk account. " +
          "Invitation requires administrator review."
      });
    }

    console.error(
      "RETRY EMPLOYEE INVITATION ERROR:",
      error
    );

    return res.status(502).json({
      success: false,
      message:
        "Unable to send employee invitation. Try again later."
    });
  }
};

// ==========================
// Export
// ==========================
module.exports = {

  createEmployee,
  getEmployees,
  getMyEmployeeProfile,
  getEmployeeById,
  getEmployeeNote,
  saveEmployeeNote,
  deleteEmployeeNote,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeProfile,
  changePassword,
  getEmployeeStats,
  updateEmployee,
  updateEmployeeProfile,
  retryEmployeeInvitation

};