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
  moveTaskToNotInterested,
  saveTaskFollowup
} = require(
  "../controllers/taskController"
);
const{
  uploadLeads
}= require("../controllers/uploadLeadController");

router.get(
  "/employee/:employeeId",
  getEmployeeTasks
);
router.get(
  "/followups/:employeeId",
  getTaskFollowups
);
router.put(
  "/connect/:leadId",
  connectTaskToLead
);
router.put(
  "/not-interested/:leadId",
  moveTaskToNotInterested
);
router.post(
  "/upload",
  upload.single("file"),
  uploadLeads
);
router.post(
  "/followup",
  saveTaskFollowup
);

module.exports =
router;