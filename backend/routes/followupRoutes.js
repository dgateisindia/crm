const express =
require("express");

const router =
express.Router();

const {

  addFollowup,

  getFollowups,

  getEmployeeFollowups,

  getLeadFollowups

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


module.exports =
router;