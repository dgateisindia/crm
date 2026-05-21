const db =
require("../db");


// ==========================
// Get All Leads
// ==========================
const getLeads =
(req, res) => {

  const sql = `
    SELECT *
    FROM leads
    ORDER BY id DESC
  `;

  db.query(

    sql,

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500)
        .json({

          message:
          "Failed to fetch leads",

        });

      }

      res.status(200)
      .json(result);

    }

  );

};
// ==========================
// Get Employee Leads
// ==========================
const getEmployeeLeads =
(req, res) => {

  const employeeId =
  req.params.employeeId;

  const sql = `

    SELECT *

    FROM leads

    WHERE
    created_by_id = ?

    ORDER BY id DESC

  `;

  db.query(

    sql,

    [employeeId],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500)
        .json({

          message:
          "Failed to fetch employee leads"

        });

      }

      res.status(200)
      .json(result);

    }

  );

};

// ==========================
// Delete Lead
// ==========================
const deleteLead =
(req, res) => {

  const leadId =
  req.params.id;

  const sql =
  "DELETE FROM leads WHERE id = ?";

  db.query(

    sql,
    [leadId],

    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500)
        .json({

          message:
          "Failed to delete lead",

        });

      }

      res.status(200)
      .json({

        message:
        "Lead Deleted Successfully",

      });

    }

  );

};

// ==========================
// Get Lead By ID
// ==========================
const getLeadById =
(req, res) => {

  const leadId =
  req.params.id;

  const sql = `
    SELECT *
    FROM leads
    WHERE id = ?
  `;

  db.query(

    sql,

    [leadId],

    (err, result) => {

      if (err) {

        return res
        .status(500)
        .json(err);

      }

      res.status(200)
      .json(
        result[0]
      );

    }

  );

};
// ==========================
// Add Lead
// ==========================
const addLead =
(req, res) => {

  const {

    company_name,
    contact_person_name,
    email,
    phone,
    address,
    website,
    source,
    city,
    remarks,
    lead_status,
    lead_mode,
    important_lead,
    created_by_id

  } = req.body;


  // Validation
  if (

    !company_name ||
    !contact_person_name ||
    !phone ||
    !email

  ) {

    return res.status(400)
    .json({

      message:
      "Required fields are missing",

    });

  }


  // ==========================
  // Duplicate Check
  // ==========================
  const duplicateSql = `

    SELECT *

    FROM leads

    WHERE

    phone = ?

    OR email = ?

    OR (

      company_name = ?

      AND

      contact_person_name = ?

    )

  `;


  db.query(

    duplicateSql,

    [

      phone,
      email,
      company_name,
      contact_person_name

    ],

    (

      duplicateErr,
      duplicateResult

    ) => {

      if (
        duplicateErr
      ) {

        console.log(
          duplicateErr
        );

        return res.status(500)
        .json({

          message:
          "Duplicate check failed"

        });

      }


      // Duplicate Found
      if (
        duplicateResult
        .length > 0
      ) {

        return res.status(409)
        .json({

          message:
          "Duplicate lead already exists",

          duplicateLead:
          duplicateResult[0]

        });

      }


      // ==========================
      // Insert Lead
      // ==========================
      const sql = `
        INSERT INTO leads (

          company_name,
          contact_person_name,
          email,
          phone,
          address,
          website,
          source,
          city,
          remarks,
          lead_status,
          lead_mode,
          important_lead,
          created_by_id

        )

        VALUES (
          ?, ?, ?, ?, ?,?, ?, ?, ?, ?,?, ?, ?)
      `;


      db.query(

        sql,

        [

          company_name,
          contact_person_name,
          email,
          phone,
          address,
          website,
          source,
          city,
          remarks,
          lead_status,
          lead_mode,
          important_lead || false,
          created_by_id

        ],

        (err, result) => {

          if (err) {

            console.log(
              "SQL ERROR:",
              err
            );

            return res.status(500)
            .json({

              message:
              err.message,

            });

          }

          res.status(201)
          .json({

            message:
            "Lead Added Successfully",

          });

        }

      );

    }

  );

};


// ==========================
// Export
// ==========================
module.exports = {

  addLead,
  getLeads,
  deleteLead,
  getEmployeeLeads,
  getLeadById,
  
};