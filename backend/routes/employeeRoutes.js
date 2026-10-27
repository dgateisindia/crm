const express = require("express");
const db = require("../db");

const router = express.Router();
// ==========================
// Employee Notes Authorization
// ==========================
const authorizeEmployeeNotes = async (req, res, next) => {
  try {
    const employeeId = Number(req.params.id);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(employeeId) ||
      employeeId <= 0 ||
      !userId ||
      !companyId
    ) {
      return res.status(403).json({
        success: false,
        message: "Notes access denied"
      });
    }

    if (role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Employee notes are private"
      });
    }

    const [employees] = await db.promise().query(
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

    if (employees.length !== 1) {
      return res.status(404).json({
        success: false,
        message: "Employee notes not found"
      });
    }

    return next();

  } catch (error) {
    console.error("EMPLOYEE NOTES AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to authorize employee notes"
    });
  }
};


const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getMyEmployeeProfile,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeProfile,
  getEmployeeStats,
  updateEmployee,
  updateEmployeeProfile,
  retryEmployeeInvitation,
  getEmployeeNote,
  saveEmployeeNote,
  deleteEmployeeNote
} = require("../controllers/employeeController");

const {
  requireAuth
} = require("../middleware/authMiddleware");

const {
  requireRole
} = require("../middleware/roleMiddleware");



// DGATE_EMPLOYEE_SECURITY_GUARDS_V1
// Verify access to an employee record before updating it.
const authorizeEmployeeChange = async (req, res, next) => {
  try {
    const employeeId = Number(req.params.id);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(employeeId) ||
      employeeId <= 0 ||
      !userId ||
      !companyId ||
      !["employee", "manager", "owner"].includes(role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const [employees] = await db.promise().query(
      `SELECT employee_id, user_id, manager_id,
              email, status, clerk_invitation_id
       FROM employees
       WHERE employee_id = ?
         AND company_id = ?
       LIMIT 1`,
      [employeeId, companyId]
    );

    if (!employees.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const employee = employees[0];

    if (role === "employee") {
      if (
        req.path !== `/update-profile/${employeeId}` ||
        Number(employee.user_id) !== Number(userId) ||
        employee.status !== "active"
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only edit your own profile"
        });
      }
    } else {
      const [managers] = await db.promise().query(
        `SELECT manager_id
         FROM managers
         WHERE user_id = ?
           AND company_id = ?
           AND status = 'active'
         LIMIT 1`,
        [userId, companyId]
      );

      if (
        managers.length !== 1 ||
        Number(managers[0].manager_id) !==
          Number(employee.manager_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Employee management access denied"
        });
      }
    }

    req.authorizedEmployee = employee;
    next();
  } catch (error) {
    console.error("EMPLOYEE ACCESS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Employee authorization failed"
    });
  }
};

// Only Clerk-linked employees may be activated.
const protectEmployeeStatus = (req, res, next) => {
  const employee = req.authorizedEmployee;
  const status = req.body?.status;

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid employee status"
    });
  }

  if (
    employee.status === "invited" ||
    (status === "active" && employee.user_id == null)
  ) {
    return res.status(409).json({
      success: false,
      message: "Activation requires an accepted Clerk invitation"
    });
  }

  next();
};

// Prevent editing identity and activation state through general edit.
const protectEmployeeEdit = (req, res, next) => {
  const employee = req.authorizedEmployee;

  if (
    req.body?.status !== undefined &&
    req.body.status !== employee.status
  ) {
    return res.status(409).json({
      success: false,
      message: "Use the employee status endpoint"
    });
  }

  if (
    employee.user_id != null &&
    String(req.body?.email || "").trim().toLowerCase() !==
      String(employee.email).trim().toLowerCase()
  ) {
    return res.status(409).json({
      success: false,
      message: "Linked employee email cannot be changed here"
    });
  }

  next();
};

// Avoid orphaned Clerk accounts and outstanding invitations.
const protectEmployeeDeletion = (req, res, next) => {
  const employee = req.authorizedEmployee;

  if (
    employee.user_id != null ||
    employee.clerk_invitation_id != null
  ) {
    return res.status(409).json({
      success: false,
      message: "Revoke Clerk access before deleting this employee"
    });
  }

  next();
};
// ==========================
// Create Employee
// ==========================
router.post(
  "/create",
  requireAuth,
  requireRole("owner", "manager"),
  createEmployee
);

// ==========================
// Retry Employee Invitation
// ==========================
router.post(
  "/:id/retry-invitation",
  requireAuth,
  requireRole("owner", "manager"),
  retryEmployeeInvitation
);

// ==========================
// Get All Employees
// ==========================
router.get(
  "/all",
  requireAuth,
  getEmployees
);


// ==========================
// Get Employee Profile
// ==========================
router.get(
  "/profile/:id",
  requireAuth,
  getEmployeeProfile
);


// ==========================
// Change Password
// ==========================

router.put(
  "/change-password/:id",
  requireAuth,
  (req, res) => {
    return res.status(410).json({
      success: false,
      message:
        "Password changes are managed through D-GATE Account."
    });
  }
);



// ==========================
// Employee Statistics
// ==========================
router.get(
  "/stats/:id",
  requireAuth,
  getEmployeeStats
);


// ==========================
// Update Employee Status
// ==========================
router.put(
  "/status/:id",
  requireAuth,
  requireRole("owner", "manager"),
  authorizeEmployeeChange,
  protectEmployeeStatus,
  updateEmployeeStatus
);


// ==========================
// Delete Employee
// ==========================
router.delete(
  "/delete/:id",
  requireAuth,
  requireRole("owner", "manager"),
  authorizeEmployeeChange,
  protectEmployeeDeletion,
  deleteEmployee
);


// ==========================
// Update Employee
// ==========================
router.put(
  "/update/:id",
  requireAuth,
  requireRole("owner", "manager"),
  authorizeEmployeeChange,
  protectEmployeeEdit,
  updateEmployee
);


// ==========================
// Update Employee Profile
// ==========================
router.put(
  "/update-profile/:id",
  requireAuth,
  authorizeEmployeeChange,
  updateEmployeeProfile
);


// ==========================
// Employee Notes
// ==========================

// Read own notes
router.get(
  "/notes/:id",
  requireAuth,
  authorizeEmployeeNotes,
  getEmployeeNote
);

// Save own notes
router.post(
  "/notes/:id",
  requireAuth,
  authorizeEmployeeNotes,
  saveEmployeeNote
);

// Delete own notes
router.delete(
  "/notes/:id",
  requireAuth,
  authorizeEmployeeNotes,
  deleteEmployeeNote
);
// ==========================
// Get Logged-in Employee
// ==========================

router.get(
  "/me",
  requireAuth,
  getMyEmployeeProfile
);


// ==========================
// Get Employee By ID
// ALWAYS LAST
// ==========================
router.get(
  "/:id",
  requireAuth,
  getEmployeeById
);


module.exports = router;