const express =
require("express");

const router =
express.Router();

const {
  addLead,
  getLeads,
  getEmployeeLeads,
  deleteLead,
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

//delete lead
router.delete(
  "/delete/:id",
  deleteLead
);
        
module.exports =
router;