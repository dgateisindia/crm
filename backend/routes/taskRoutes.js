const express = require("express");
const router = express.Router();


const taskController = require("../controllers/taskController");



const {
  requireAuth
} = require("../middleware/authMiddleware");



// ==========================
// Employee Tasks
// ==========================
router.get(
  "/employee/:employeeId",
  requireAuth,
  taskController.getEmployeeTasks
);


router.get(
  "/followups/:employeeId",
  requireAuth,
  taskController.getTaskFollowups
);

router.post(
  "/followup",
  requireAuth,
  taskController.saveTaskFollowup
);

router.put(
  "/followups/add/:leadId",
  requireAuth,
  taskController.addTaskFollowup
);

router.put(
  "/followups/edit/:leadId",
  requireAuth,
  taskController.editTaskFollowup
);

// ==========================
// Move Task To Lead
// ==========================
router.put(
  "/connect/:leadId",
  requireAuth,
  taskController.connectTaskToLead
);

// ==========================
// Move Task To Not Interested
// ==========================
router.put(
  "/not-interested/:leadId",
  requireAuth,
  taskController.moveTaskToNotInterested
);



const { getTodayNotifications } = require("../controllers/todayFollowupController");
router.get("/notifications/today", requireAuth, getTodayNotifications);
module.exports = router;
