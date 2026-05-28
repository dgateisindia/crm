const express =
require("express");

const router =
express.Router();

const multer =
require("multer");

const xlsx =
require("xlsx");

const db =
require("../db");

const {

  addLead,

  getLeads,

  deleteLead,

  getEmployeeLeads,

  getLeadById,

  updateLead,

  getImportantLeads,

  getConvertedLeads,

  getNotInterestedLeads



} = require(
  "../controllers/leadController"
);

// Multer Config
const upload =
multer({
  dest: "uploads/"
});

// Add Lead
router.post(
  "/add",
  addLead
);

// Get All Leads
router.get(
  "/all",
  getLeads
);

// Delete Lead
router.delete(
  "/delete/:id",
  deleteLead
);

// Employee Leads
router.get(
  "/employee/:employeeId",
  getEmployeeLeads
);
// Important Leads

router.get(

"/important",

getImportantLeads

);
//converted leads
router.get(
"/converted",
getConvertedLeads
);
//not interested leads

router.get(
"/not-interested",
getNotInterestedLeads
);

// Lead Details
router.get(
  "/:id",
  getLeadById
);

// Update Lead
router.put(
  "/update/:id",
  updateLead
);

// Upload Excel
router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {

    try {

      const workbook =
        xlsx.readFile(
          req.file.path
        );

      const sheetName =
        workbook.SheetNames[0];

      const sheet =
        workbook.Sheets[
          sheetName
        ];

      const data =
        xlsx.utils.sheet_to_json(
          sheet
        );

      let inserted = 0;
      let duplicates = 0;

      for (const row of data) {

        try {

          await db.promise().query(

            `INSERT INTO leads
            (
              company_name,
              contact_person_name,
              phone,
              email,
              city,
              source,
              lead_mode,
              lead_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

            [
              row["Company Name"] ||
              row.company_name ||
              null,

              row["Contact Person"] ||
              row.contact_person_name ||
              null,

              row["Phone"] ||
              row.phone ||
              null,

              row["Email"] ||
              row.email ||
              null,

              row["City"] ||
              row.city ||
              null,

              "website",
              "phone_call",
              "new"
            ]
          );

          inserted++;

        } catch (error) {

          // Skip duplicate phone numbers
          if (
            error.code ===
            "ER_DUP_ENTRY"
          ) {

            duplicates++;

          } else {

            console.log(error);
            throw error;

          }
        }
      }

      res.json({
        inserted,
        duplicates,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Upload Failed"
      });
    }
  }
);

module.exports =
router;