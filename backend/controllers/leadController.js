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
// Add Lead
// ==========================
const addLead =
(req, res) => {

  const {

    company_name,

    contact_person_name,

    contact_person_number,

    email,

    phone,

    address,

    website,

    source,

    priority,

    city,

    remarks,

    lead_status

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


  const sql = `
    INSERT INTO leads (

      company_name,

      contact_person_name,

      contact_person_number,

      email,

      phone,

      address,

      website,

      source,

      priority,

      city,

      remarks,

      lead_status

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    sql,
    [

      company_name,

      contact_person_name,

      contact_person_number,

      email,

      phone,

      address,

      website,

      source,

      priority,

      city,

      remarks,

      lead_status

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

};


// ==========================
// Export
// ==========================
module.exports = {

  addLead,

  getLeads,

  deleteLead,

};