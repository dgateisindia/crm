const db =
require("../db");

const addLead = (
  req,
  res
) => {

  const {
    company_name,
    contact_person,
    phone,
    email,
    address,
    //website,
    special_event,
    event_date,
    lead_status,
    assigned_employee,
    //lead_source,
    //priority,
    remarks,
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
      assigned_employee,
      remarks
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
      //website,
      special_event,
      event_date,
      lead_status,
      assigned_employee,
      //lead_source,
      //priority,
      remarks,
    ],
    (err, result) => {

      if (err) {

            console.log(
              "SQL ERROR:",
              err
            );

            return res.status(500).json({
              message:
                err.message,
            });
          }

      res.status(201).json({
        message:
          "Lead Added Successfully",
      });
    }
  );
};

module.exports = {
  addLead,
};