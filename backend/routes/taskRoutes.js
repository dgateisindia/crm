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

const {
  getEmployeeTasks,
  getTaskFollowups,
  connectTaskToLead,
  uploadTasks,
  moveTaskToNotInterested,
  saveTaskFollowup
} = require(
  "../controllers/taskController"
);

router.get(
  "/employee/:employeeId",
  getEmployeeTasks
);
router.get(
  "/followups/:employeeId",
  getTaskFollowups
);
router.put(
  "/connect/:taskId",
  connectTaskToLead
);
router.put(
  "/not-interested/:taskId",
  moveTaskToNotInterested
);
router.post(
  "/upload",
  upload.single("file"),
  uploadTasks
);
router.post(
  "/followup",
  saveTaskFollowup
);

module.exports =
router;