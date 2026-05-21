const express =
require("express");

const router =
express.Router();

const {

  createManager,
  getManagers

} = require(
  "../controllers/managerController"
);


// ==========================
// Create Manager
// ==========================
router.post(
  "/create",
  createManager
);


// ==========================
// Get All Managers
// ==========================
router.get(
  "/all",
  getManagers
);


module.exports =
router;