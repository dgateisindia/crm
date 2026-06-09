const express =
require("express");

const router =
express.Router();

const {
  getCompanyReport,
  getEmployeeReport
} = require(
  "../controllers/reportsController"
);

router.get(
  "/company",
  getCompanyReport
);

router.get(
  "/employee/:id",
  getEmployeeReport
);

module.exports =
router;