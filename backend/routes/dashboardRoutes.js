const express =
require("express");

const router =
express.Router();

const {
  getDashboardStats,
  getLeadStatusChart,
  getEmployeePerformance,
  getLeadTrend,
  getEmployeeStats
} = require(
  "../controllers/dashboardController"
);

router.get("/stats", getDashboardStats);

router.get("/lead-status", getLeadStatusChart);

router.get("/employee-performance", getEmployeePerformance);

router.get("/lead-trend", getLeadTrend);

router.get(
  "/employee/:id",
  getEmployeeStats
);

module.exports =
router;