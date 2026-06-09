const express =
require("express");

const router =
express.Router();

const multer =
require("multer");

const xlsx =
require("xlsx");

const db =
require("../db");

const {

  addLead,

  getLeads,

  deleteLead,

  getEmployeeLeads,

  getLeadById,

  updateLead,

  getImportantLeads,

  getConvertedLeads,

  getNotInterestedLeads,

  getEmployeeImportantLeads,

  getEmployeeConvertedLeads,

  getEmployeeNotInterestedLeads



} = require(
  "../controllers/leadController"
);

// Multer Config
const upload =
multer({
  dest: "uploads/"
});

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

// Employee Leads
router.get(
  "/employee/:employeeId",
  getEmployeeLeads
);
router.get(
  "/employee/:employeeId/important",
  getEmployeeImportantLeads
);

router.get(
  "/employee/:employeeId/converted",
  getEmployeeConvertedLeads
);

router.get(
  "/employee/:employeeId/not-interested",
  getEmployeeNotInterestedLeads
);


// Important Leads

router.get(

"/important",

getImportantLeads

);
//converted leads
router.get(
"/converted",
getConvertedLeads
);
//not interested leads

router.get(
"/not-interested",
getNotInterestedLeads
);

// Lead Details
router.get(
  "/:id",
  getLeadById
);

// Update Lead
router.put(
  "/update/:id",
  updateLead
);


module.exports =
router;