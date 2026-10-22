
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const {
  requireAuth
} = require("../middleware/authMiddleware");

const {
  uploadLeads,
  previewLeads
} = require("../controllers/uploadLeadController");

const router = express.Router();

const uploadDirectory = path.resolve(
  __dirname,
  "../uploads"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true
});

// ==========================================
// SECURE EXCEL UPLOAD CONFIGURATION
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const filename =
      crypto.randomUUID() + extension;

    cb(null, filename);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    const allowedExtensions = [
      ".xlsx",
      ".xls"
    ];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Only Excel files (.xlsx, .xls) are allowed."
        )
      );
    }

    cb(null, true);
  }
});

// ==========================================
// UPLOAD ERROR HANDLING
// ==========================================


function handleUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Excel file must not exceed 10 MB."
              : "Invalid Excel upload."
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Invalid upload file."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an Excel file."
      });
    }

    // Clean up after the controller finishes,
    // including validation failures and errors.
    let cleaned = false;

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;

      require("fs").promises.unlink(req.file.path)
        .catch((err) => {
          if (err.code !== "ENOENT") {
            console.error(
              "Excel temporary file cleanup failed:",
              err.message
            );
          }
        });
    };

    res.once("finish", cleanup);
    res.once("close", cleanup);

    next();
  });
}

// ==========================================
// PREVIEW LEADS
// ==========================================

router.post(
  "/upload-preview",
  requireAuth,
  handleUpload,
  previewLeads
);

// ==========================================
// IMPORT LEADS
// ==========================================

router.post(
  "/upload",
  requireAuth,
  handleUpload,
  uploadLeads
);

module.exports = router;
