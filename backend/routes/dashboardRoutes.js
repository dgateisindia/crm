const express =
require("express");

const router =
express.Router();

const {
  getDashboardStats,
  getLeadStatusChart,
  getEmployeePerformance,
  getLeadTrend,
  getEmployeeStats,
  getEmployeeFollowupChart,
  getEmployeeLeadStatusChart,
  getEmployeeLeadTrend,
  getEmployeeWelcome
} = require(
  "../controllers/dashboardController"
);

router.get("/stats", getDashboardStats);

router.get("/lead-status", getLeadStatusChart);

router.get("/employee-performance", getEmployeePerformance);

router.get("/lead-trend", getLeadTrend);
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
  "/employee/:id",
  getEmployeeStats
);


module.exports =
router;