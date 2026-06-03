const express =
require("express");

const router =
express.Router();

const {

  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployeeStatus

} = require(
  "../controllers/employeeController"
);

// Create Employee
router.post(
  "/create",
  createEmployee
);

// IMPORTANT:
router.get(
  "/all",
  getEmployees
);

// Dynamic route LAST
router.get(
  "/:id",
  getEmployeeById
);

// Delete
router.delete(
  "/delete/:id",
  deleteEmployee
);
// Update Status
router.put(
  "/status/:id",
  updateEmployeeStatus
);

module.exports =
router;