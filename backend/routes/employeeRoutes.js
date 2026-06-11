const express =
require("express");

const router =
express.Router();

const {

  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployeeStatus,
  getEmployeeProfile,
  changePassword,
  getEmployeeStats,
  updateEmployee

} = require(
  "../controllers/employeeController"
);
// Create Employee
router.post(
  "/create",
  createEmployee
);
// Get All Employees
router.get(
  "/all",
  getEmployees
);
// Get Employee by ID
router.get(
  "/profile/:id",
  getEmployeeProfile
);
// Update Employee Status
router.put(
  "/change-password/:id",
  changePassword
);
// Get Employee Statistics
router.get(
  "/stats/:id",
  getEmployeeStats
);
// Update Employee Status
router.put(
  "/status/:id",
  updateEmployeeStatus
);
// Delete Employee
router.delete(
  "/delete/:id",
  deleteEmployee
);
// Update Employee
router.put(
  "/update/:id",
  updateEmployee
);

// ALWAYS LAST
router.get(
  "/:id",
  getEmployeeById
);

module.exports =
router;