
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const express = require("express");
const router = express.Router();

const db = require("../db");

// Employee-specific lead access control
const authorizeEmployeeLeads = async (req, res, next) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const { id: userId, companyId, role } = req.user;

    if (
      !Number.isSafeInteger(employeeId) ||
      employeeId <= 0 ||
      !userId ||
      !companyId
    ) {
      return res.status(403).json({
        success: false,
        message: "Employee lead access denied"
      });
    }

    const [employees] = await db.promise().query(
      `SELECT employee_id, manager_id
       FROM employees
       WHERE employee_id = ?
         AND company_id = ?
       LIMIT 1`,
      [employeeId, companyId]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    if (role === "employee") {
      const [own] = await db.promise().query(
        `SELECT employee_id
         FROM employees
         WHERE employee_id = ?
           AND company_id = ?
           AND user_id = ?
           AND status = 'active'
         LIMIT 1`,
        [employeeId, companyId, userId]
      );

      if (own.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You cannot access another employee's leads"
        });
      }

      return next();
    }

    if (role === "manager" || role === "owner") {
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
          Number(employees[0].manager_id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Manager access denied"
        });
      }

      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Lead access denied"
    });

  } catch (error) {
    console.error("EMPLOYEE LEAD AUTH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Employee lead authorization failed"
    });
  }
};

const {
  exportLeads,
  getExportFilters
} = require("../controllers/exportLeadController");

const {
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
} = require("../controllers/leadController");

// ==========================
// Add Lead
// ==========================
router.post(
  "/add",
  requireAuth,
  requireRole("owner", "manager", "employee"),
  addLead
);

// ==========================
// Assign Lead - Manager Only
// ==========================
router.put(
  "/assign/:id",
  requireAuth,
  requireRole("owner", "manager"),
  assignLead
);

// ==========================
// Employees Available for Assignment
// ==========================
router.get(
  "/assignment-employees",
  requireAuth,
  requireRole("owner", "manager"),
  getAssignmentEmployees
);

// ==========================
// General Lead List
// Manager: All company leads
// Employee: Created or assigned leads
// Filtering is handled by getLeads
// ==========================
router.get(
  "/all",
  requireAuth,
  getLeads
);

// ==========================
// Delete Lead - Manager Only
// ==========================
router.delete(
  "/delete/:id",
  requireAuth,
  requireRole("owner", "manager"),
  deleteLead
);

// ==========================
// Employee New Leads
// ==========================
router.get(
  "/employee/:employeeId",
  requireAuth,
  authorizeEmployeeLeads,
  getEmployeeLeads
);

// ==========================
// Employee All Leads
// ==========================
router.get(
  "/employee/:employeeId/all",
  requireAuth,
  authorizeEmployeeLeads,
  getAllEmployeeLeads
);

// ==========================
// Employee Important Leads
// ==========================
router.get(
  "/employee/:employeeId/important",
  requireAuth,
  authorizeEmployeeLeads,
  getEmployeeImportantLeads
);

// ==========================
// Employee Converted Leads
// ==========================
router.get(
  "/employee/:employeeId/converted",
  requireAuth,
  authorizeEmployeeLeads,
  getEmployeeConvertedLeads
);

// ==========================
// Employee Not Interested Leads
// ==========================
router.get(
  "/employee/:employeeId/not-interested",
  requireAuth,
  authorizeEmployeeLeads,
  getEmployeeNotInterestedLeads
);

// ==========================
// General Important Leads
// Manager Only
// ==========================
router.get(
  "/important",
  requireAuth,
  requireRole("owner", "manager"),
  getImportantLeads
);

// ==========================
// General Converted Leads
// Manager Only
// ==========================
router.get(
  "/converted",
  requireAuth,
  requireRole("owner", "manager"),
  getConvertedLeads
);

// ==========================
// General Not Interested Leads
// Manager Only
// ==========================
router.get(
  "/not-interested",
  requireAuth,
  requireRole("owner", "manager"),
  getNotInterestedLeads
);

// ==========================
// Export Filters - Manager Only
// ==========================
router.get(
  "/export-filters",
  requireAuth,
  requireRole("owner", "manager","employee"),
  getExportFilters
);

// ==========================
// Export Leads - Manager Only
// ==========================
router.get(
  "/export",
  requireAuth,
  requireRole("owner", "manager","employee"),
  exportLeads
);

// ==========================
// Update Lead
// Controller must enforce lead ownership
// ==========================
router.put(
  "/update/:id",
  requireAuth,
  requireRole("owner", "manager", "employee"),
  updateLead
);

// ==========================
// Lead Details
// Controller enforces company and
// employee-specific visibility
// ==========================
router.get(
  "/:id",
  requireAuth,
  getLeadById
);

module.exports = router;
