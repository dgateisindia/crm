const express =
require("express");

const router =
express.Router();

const {

  addLead,

  getLeads,

  deleteLead,

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


// Delete Lead
router.delete(
  "/delete/:id",
  deleteLead
);


module.exports =
router;