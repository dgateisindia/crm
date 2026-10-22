
const express = require("express");

const router = express.Router();

const {
  addFollowup,
  getFollowups,
  getEmployeeFollowups,
  getLeadFollowups,
  getLeadHistory
} = require("../controllers/followupController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// ==========================
// Add Followup
// ==========================
router.post(
  "/add",
  requireAuth,
  addFollowup
);

// ==========================
// Get All Followups
// Manager / Owner Only
// ==========================
router.get(
  "/all",
  requireAuth,
  requireRole("owner", "manager"),
  getFollowups
);

// ==========================
// Employee Followups
// ==========================
router.get(
  "/employee/:employeeId",
  requireAuth,
  getEmployeeFollowups
);

// ==========================
// Lead Followups
// ==========================
router.get(
  "/lead/:leadId",
  requireAuth,
  getLeadFollowups
);

// ==========================
// Lead History
// ==========================
router.get(
  "/lead-history/:leadId",
  requireAuth,
  getLeadHistory
);

module.exports = router;
