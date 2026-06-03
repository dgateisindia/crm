const express =
require("express");

const router =
express.Router();

const {

  addFollowup,

  getFollowups,

  getEmployeeFollowups,

  getLeadFollowups,

  getLeadHistory

} = require(

"../controllers/followupController"

);


// Add Followup
router.post(
"/add",
addFollowup
);


// Get All Followups
router.get(
"/all",
getFollowups
);


// Employee Followups
router.get(
"/employee/:employeeId",
getEmployeeFollowups
);


// Lead Followups
router.get(
"/lead/:leadId",
getLeadFollowups
);

// Lead History
router.get(
"/lead-history/:leadId",
getLeadHistory
);

module.exports =
router;