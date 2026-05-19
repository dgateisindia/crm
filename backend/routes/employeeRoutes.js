const express = require("express");

const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee
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
router.delete(
  "/delete/:id",
  deleteEmployee
);
router.get(
  "/:id",
  getEmployeeById
);


module.exports = router;