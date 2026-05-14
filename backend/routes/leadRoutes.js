const express =
require("express");

const router =
express.Router();

const {
  addLead,
} = require(
  "../controllers/leadController"
);

router.post(
  "/add",
  addLead
);

module.exports =
router;