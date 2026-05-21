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

// Create Employee
router.post(
  "/create",
  createEmployee
);

// IMPORTANT:
// Put fixed routes first
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

module.exports =
router;