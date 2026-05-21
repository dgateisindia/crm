const express =
require("express");

const router =
express.Router();

const {

  addLead,

  getLeads,

  deleteLead,

  getEmployeeLeads,
  getLeadById

} = require(
  "../controllers/leadController"
);


// Add Lead
router.post(
  "/add",
  addLead
);


// Get All Leads
router.get(
  "/all",
  getLeads
);
router.get(

  "/employee/:employeeId",

  getEmployeeLeads

);


// Delete Lead
router.delete(
  "/delete/:id",
  deleteLead
);

//LEad Details
router.get(
  "/:id",
  getLeadById
);

module.exports =
router;