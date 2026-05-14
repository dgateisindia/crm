const express =
require("express");

const router =
express.Router();

const {
  addLead,
  getLeads,
  getEmployeeLeads,
} = require(
  "../controllers/leadController"
);

//add lead

router.post(
  "/add",
  addLead
);

//get all leads
router.get(
  "/all",
  getLeads

);
  
//get employee leads
router.get(
  "/my-leads/:id",
  getEmployeeLeads
);

module.exports =
router;