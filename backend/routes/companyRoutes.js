const express = require("express");

const router = express.Router();

const {
  registerCompany
} = require("../controllers/companyController");

// =====================================================
// COMPANY REGISTRATION
// =====================================================
// Customers must register through D-GATE SaaS.
// Direct registration is disabled by default.
// =====================================================

router.post("/register", (req, res) => res.status(403).json({
  success: false, code: "INTERNAL_CRM_ONLY", message: "Company registration is disabled."
}));

module.exports = router;