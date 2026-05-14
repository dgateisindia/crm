const express = require("express");

const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById
} = require("../controllers/employeeController");
//create employee
router.post(
  "/create-employee",
  createEmployee
);
//get all employees
router.get(
  "/employees",
  getEmployees
);
router.get(
  "/:id",
  getEmployeeById
);

module.exports = router;