const express =
require("express");

const router =
express.Router();

const {

  createEmployee,

  getEmployees,

  getEmployeeById,

  deleteEmployee

} = require(
  "../controllers/employeeController"
);


// ==========================
// Create Employee
// ==========================
router.post(
  "/create",
  createEmployee
);


// ==========================
// Get All Employees
// ==========================
router.get(
  "/all",
  getEmployees
);


// ==========================
// Get Employee By ID
// ==========================
router.get(
  "/:id",
  getEmployeeById
);


// ==========================
// Delete Employee
// ==========================
router.delete(
  "/delete/:id",
  deleteEmployee
);


module.exports =
router;