const db =
require("../db");


// ==========================
// Add Lead
// ==========================
const addLead =
async (req, res) => {

  try {

    const {

      company_name,
      contact_person_name,
      designation,
      phone,
      email,
      address,
      website,
      city,
      source,
      lead_mode,
      lead_status,
      created_by_id,
      created_by_type,
      created_by_name

    } = req.body;


    // Phone validation
    if (!/^\d{10}$/.test(phone)) {

      return res.status(400).json({

        message:
        "Phone number must contain exactly 10 digits"

      });

    }


    const [result] =
    await db.promise().query(

      `INSERT INTO leads
      (
        company_name,
        contact_person_name,
        designation,
        phone,
        email,
        address,
        website,
        city,
        source,
        lead_mode,
        lead_status,
        created_by_id,
        created_by_type,
        created_by_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [

        company_name,
        contact_person_name,
        designation || "",
        phone,
        email,
        address || "",
        website || "",
        city,
        source,
        lead_mode,
        lead_status,
        created_by_id,
        created_by_type,
        created_by_name

      ]

    );

    res.status(201)
    .json({

      message:
      "Lead Added Successfully",

      id:
      result.insertId

    });

  }

  catch (error) {

    res.status(500)
    .json({

      message:
      "Failed to Add Lead"

    });

  }

};


// ==========================
// Get All Leads
// ==========================
const getLeads =
async (req, res) => {

  try {

   const [rows] =
      await db.promise().query(

        `SELECT *

        FROM leads

        ORDER BY id DESC`

      );

    res.json(rows);

  }

  catch (error) {

    //console.log(error);

    res.status(500)
    .json({

      message:
      "Failed to Fetch Leads"

    });

  }

};


// ==========================
// Delete Lead
// ==========================
const deleteLead =
async (req, res) => {

  try {

    const { id } =
    req.params;

    await db.promise().query(

      `DELETE FROM leads
       WHERE id=?`,

      [id]

    );

    res.json({

      message:
      "Lead Deleted Successfully"

    });

  }

  catch (error) {

    //console.log(error);

    res.status(500)
    .json({

      message:
      "Failed to Delete Lead"

    });

  }

};


// ==========================
// Get Employee Leads
// ==========================
const getEmployeeLeads =
async (req, res) => {

  try {

    const {
      employeeId
    } =
    req.params;
  

    

    const [rows] =
    await db.promise().query(

      `SELECT *

      FROM leads

      WHERE created_by_type = 'employee'

      AND created_by_id = ?

      ORDER BY id DESC`,

      [employeeId]

    );
    

    res.json(rows);

  }

  catch (error) {

    //console.log(error);

    res.status(500)
    .json({

      message:
      "Failed to Fetch Employee Leads"

    });

  }

};

const getEmployeeImportantLeads =
async (req, res) => {

  try {

    const { employeeId } = req.params;

    const [rows] =
    await db.promise().query(

      `SELECT *
       FROM leads
       WHERE important_lead = 1
       AND created_by_type = 'employee'
       AND created_by_id = ?
       ORDER BY id DESC`,

      [employeeId]

    );

    res.json(rows);

  }

  catch (error) {

    res.status(500).json({
      message:
      "Failed to fetch important leads"
    });

  }

};
const getEmployeeConvertedLeads =
async (req, res) => {

  try {

    const { employeeId } = req.params;

    const [rows] =
    await db.promise().query(

      `SELECT *
       FROM leads
       WHERE lead_status = 'converted'
       AND created_by_type = 'employee'
       AND created_by_id = ?
       ORDER BY id DESC`,

      [employeeId]

    );

    res.json(rows);

  }

  catch (error) {

    res.status(500).json({
      message:
      "Failed to fetch converted leads"
    });

  }

};
const getEmployeeNotInterestedLeads =
async (req, res) => {

  try {

    const { employeeId } = req.params;

    const [rows] =
    await db.promise().query(

      `SELECT *
       FROM leads
       WHERE lead_status = 'not_interested'
       AND created_by_type = 'employee'
       AND created_by_id = ?
       ORDER BY id DESC`,

      [employeeId]

    );

    res.json(rows);

  }

  catch (error) {

    res.status(500).json({
      message:
      "Failed to fetch not interested leads"
    });

  }

};
// ==========================
// Get Lead By ID
// ==========================
const getLeadById =
async (req, res) => {

  try {

    const { id } =
    req.params;

    const [rows] =
    await db.promise().query(

      `SELECT *

       FROM leads

       WHERE id=?`,

      [id]

    );

    if (
      rows.length === 0
    ) {

      return res.status(404)
      .json({

        message:
        "Lead Not Found"

      });

    }

    res.json(
      rows[0]
    );

  }

  catch (error) {

    //console.log(error);

    res.status(500)
    .json({

      message:
      "Failed to Fetch Lead"

    });

  }

};


// ==========================
// Update Lead
// ==========================
const updateLead =
async (req, res) => {

  try {

    const { id } =
    req.params;

   const {

      company_name,
      contact_person_name,
      designation,
      phone,
      email,
      address,
      website,
      city,
      source,
      lead_mode,
      lead_status,
      remarks,
      important_lead

} = req.body;


    await db.promise().query(

      `UPDATE leads
        SET

        company_name=?,

        contact_person_name=?,

        designation=?,

        phone=?,

        email=?,

        address=?,

        website=?,

        city=?,

        source=?,

        lead_mode=?,

        lead_status=?,

        remarks=?,

        important_lead=?

        WHERE id=?`,

      [

        company_name,
        contact_person_name,
        designation,
        phone,
        email,
        address,
        website,
        city,
        source,
        lead_mode,
        lead_status,
        remarks,
        important_lead, 
        id

      ]

    );

    res.json({

      message:
      "Lead Updated Successfully"

    });

  }

  catch (error) {

    //console.log(error);

    res.status(500)
    .json({

      message:
      "Failed to Update Lead"

    });

  }

};
// ==========================
// Get Important Leads
// ==========================
const getImportantLeads =
async (req, res) => {

  try {

    const [rows] =
    await db.promise().query(

      `SELECT *

       FROM leads

       WHERE important_lead = 1

       ORDER BY id DESC`

    );

    res.json(rows);

  }

  catch (error) {

    //console.log(error);

    res.status(500).json({

      message:
      "Failed to fetch important leads"

    });

  }

};
// ==========================
// Converted Leads
// ==========================
const getConvertedLeads =
async (req, res) => {

try {

const [rows] =
await db.promise().query(

`SELECT *

FROM leads

WHERE lead_status = 'converted'

ORDER BY id DESC`

);

res.json(rows);

}

catch (error) {

//  console.log(error);

res.status(500).json({

message:
"Failed to fetch converted leads"

});

}

};


// ==========================
// Not Interested Leads
// ==========================
const getNotInterestedLeads =
async (req, res) => {

try {

const [rows] =
await db.promise().query(

`SELECT *

FROM leads

WHERE lead_status = 'not_interested'

ORDER BY id DESC`

);

res.json(rows);

}

catch (error) {

//  console.log(error);

res.status(500).json({

message:
"Failed to fetch not interested leads"

});

}

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

  updateLead,

  getImportantLeads,

  getConvertedLeads,

  getNotInterestedLeads,

  getEmployeeImportantLeads,

  getEmployeeConvertedLeads,

  getEmployeeNotInterestedLeads

};