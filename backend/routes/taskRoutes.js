const express =
require("express");

const router =
express.Router();

const multer =
require("multer");

const upload =
multer({
  dest: "uploads/"
});

const taskController =
require("../controllers/taskController");

const {
  uploadLeads
} = require(
  "../controllers/uploadLeadController"
);

router.get(
  "/employee/:employeeId",
  taskController.getEmployeeTasks
);

router.get(
  "/followups/:employeeId",
  taskController.getTaskFollowups
);

router.put(
  "/connect/:leadId",
  taskController.connectTaskToLead
);

router.put(
  "/not-interested/:leadId",
  taskController.moveTaskToNotInterested
);

router.post(
  "/followup",
  taskController.saveTaskFollowup
);

router.put(
  "/followups/edit/:leadId",
  taskController.editTaskFollowup
);

router.put(
  "/followups/add/:leadId",
  taskController.addTaskFollowup
);

router.post(
  "/upload",
  upload.single("file"),
  uploadLeads
);

module.exports =
router;