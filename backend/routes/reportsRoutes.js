const express = require("express");

const router = express.Router();

const {
  getCompanyReport,
  getEmployeeReport
} = require("../controllers/reportsController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get(
  "/company",
  requireAuth,
  requireRole("owner", "manager"),
  getCompanyReport
);

router.get(
  "/employee/:id",
  requireAuth,
  getEmployeeReport
);

module.exports = router;