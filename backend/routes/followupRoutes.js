const express =
require("express");

const router =
express.Router();

const {

  addFollowup,
  getFollowups,
getEmployeeFollowups

} = require(

"../controllers/followupController"
    
);




// Add Followup
router.post(
  "/add",
  addFollowup
);


// Get Followups
router.get(
  "/all",
  getFollowups
);

// Get Employee Followups
router.get(
  "/employee/:employeeId",
  getEmployeeFollowups
);

module.exports =
router;