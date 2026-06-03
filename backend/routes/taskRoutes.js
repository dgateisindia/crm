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
  connectTaskToLead,
  uploadTasks
} = require(
  "../controllers/taskController"
);

router.get(
  "/employee/:employeeId",
  getEmployeeTasks
);
router.put(
  "/connect/:taskId",
  connectTaskToLead
);
router.post(
  "/upload",
  upload.single("file"),
  uploadTasks
);

module.exports =
router;