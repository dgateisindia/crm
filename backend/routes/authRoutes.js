const express = require("express");

const router = express.Router();

const {
  getCurrentUser
} = require("../controllers/authController");

const {
  requireAuth
} = require("../middleware/authMiddleware");

// =====================================================
// LEGACY AUTHENTICATION DISABLED
// =====================================================

const legacyAuthDisabled = (req, res) => {
  return res.status(410).json({
    success: false,
    message:
      "This authentication method is no longer available. Please sign in through your D-GATE Account."
  });
};

router.post(
  "/login",
  legacyAuthDisabled
);

router.post(
  "/forgot-password",
  legacyAuthDisabled
);

router.post(
  "/reset-password",
  legacyAuthDisabled
);

// =====================================================
// CLERK AUTHENTICATION
// =====================================================

router.get(
  "/current-user",
  requireAuth,
  getCurrentUser
);

module.exports = router;