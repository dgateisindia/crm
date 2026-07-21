const express =
require("express");

const router =
express.Router();

const {

  createManager,
  getManagers,
  getManagerProfile,
  updateManagerProfile,
  changeManagerPassword

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
router.get("/profile/:id", getManagerProfile);

router.put("/update-profile/:id", updateManagerProfile);

router.put("/change-password/:id", changeManagerPassword);

// ==========================
// Get All Managers
// ==========================
router.get(
  "/all",
  getManagers
);


module.exports =
router;