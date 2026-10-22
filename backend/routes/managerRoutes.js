const { requireAuth } = require("../middleware/authMiddleware");
const express =
require("express");

const router =
express.Router();

router.use(requireAuth);

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
router.post("/create", (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Manager creation requires the Clerk invitation workflow."
  });
});
router.get("/profile/:id", getManagerProfile);

router.put("/update-profile/:id", updateManagerProfile);

router.put("/change-password/:id", (req, res) => {
  return res.status(410).json({
    success: false,
    message: "Password changes are managed through Clerk."
  });
});
// ==========================
// Get All Managers
// ==========================
router.get(
  "/all",
  getManagers
);


module.exports =
router;