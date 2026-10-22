const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const {
  getDashboardStats,
  getLeadStatusChart,
  getEmployeePerformance,
  getLeadTrend,
  getEmployeeStats,
  getEmployeeFollowupChart,
  getEmployeeLeadStatusChart,
  getEmployeeLeadTrend,
  getEmployeeWelcome,
  getEmployeeNotRespondedLeads,
  getManagerNotRespondedLeads
} = require("../controllers/dashboardController");

// =====================================================
// Apply authentication to all dashboard routes
// =====================================================

router.use(requireAuth);

// =====================================================
// Manager Dashboard
// =====================================================


router.get(
  "/stats",
  requireRole("owner", "manager"),
  getDashboardStats
);

router.get(
  "/lead-status",
  requireRole("owner", "manager"),
  getLeadStatusChart
);

router.get(
  "/employee-performance",
  requireRole("owner", "manager"),
  getEmployeePerformance
);

router.get(
  "/lead-trend",
  requireRole("owner", "manager"),
  getLeadTrend
);

router.get(
  "/manager/not-responded",
  requireRole("owner", "manager"),
  getManagerNotRespondedLeads
);


// =====================================================
// Employee Dashboard
// =====================================================

router.get(
  "/employee/:id/lead-status",
  getEmployeeLeadStatusChart
);

router.get(
  "/employee/:id/lead-trend",
  getEmployeeLeadTrend
);

router.get(
  "/employee/:id/followup-chart",
  getEmployeeFollowupChart
);

router.get(
  "/employee/:id/welcome",
  getEmployeeWelcome
);

router.get(
  "/employee/:id/not-responded",
  getEmployeeNotRespondedLeads
);

router.get(
  "/employee/:id",
  getEmployeeStats
);

// =====================================================
// Export
// =====================================================

module.exports = router;