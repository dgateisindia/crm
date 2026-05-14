const db =
require("../db");


// Get All Leads
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


// Get Employee Leads
const getEmployeeLeads =
(req, res) => {

  const employeeId =
    req.params.id;

  const sql = `
  SELECT *
  FROM leads
  WHERE created_by = ?
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
          "Error fetching leads",
        });
      }

      res.status(200)
      .json(result);
    }
  );
};


// Add Lead
const addLead =
(req, res) => {

  const {
    company_name,
    contact_person,
    phone,
    email,
    address,
    special_event,
    event_date,
    lead_status,
    remarks,
    created_by,
  } = req.body;

  const sql = `
  INSERT INTO leads (
    company_name,
    contact_person,
    phone,
    email,
    address,
    special_event,
    event_date,
    lead_status,
    remarks,
    created_by
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      company_name,
      contact_person,
      phone,
      email,
      address,
      special_event,
      event_date,
      lead_status,
      remarks,
      created_by,
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


module.exports = {
  addLead,
  getLeads,
  getEmployeeLeads,
};