const express =
require("express");

const router =
express.Router();

const {
  getDashboardStats,
  getEmployeeStats,
} = require(
  "../controllers/dashboardController"
);

router.get(
  "/stats",
  getDashboardStats
);
router.get(
  "/employee/:id",
  getEmployeeStats
);

module.exports =
router;