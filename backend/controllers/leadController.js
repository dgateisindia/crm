const db =
require("../db");

const logLeadChanges =
require("../utils/logLeadChanges");
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
      category,
      source,
      important_lead,
      lead_mode,
      lead_status,
      created_by_id,
      created_by_type,
      created_by_name

    } = req.body;


          // Either Phone or Email is required
        if (!phone && !email) {

          return res.status(400).json({
            message: "Either Phone Number or Email is required."
          });

        }

        // Validate phone only if entered
        if (phone && !/^\d{10}$/.test(phone)) {

          return res.status(400).json({
            message: "Phone Number must contain exactly 10 digits."
          });

        }

        // Validate email only if entered
        if (email) {

          const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (!emailRegex.test(email)) {

            return res.status(400).json({
              message: "Please enter a valid Email Address."
            });

          }

        }

    const finalPhone = phone?.trim() || null;
    const finalEmail = email?.trim() || null;
    
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
        category,
        source,
        important_lead,
        lead_mode,
        lead_status,
        created_by_id,
        created_by_type,
        created_by_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,? , ?)`,

      [

        company_name,
        contact_person_name,
        designation || "",
        finalPhone,
        finalEmail,
        address || "",
        website || "",
        city,
        category,
        source,
        important_lead ? 1 : 0,
        lead_mode,
        lead_status,
        created_by_id,
        created_by_type,
        created_by_name

      ]

    );
    const followupStatuses = [
  "interested",
  "proposed",
  "offered",
  "meeting scheduled"
];

if (followupStatuses.includes(lead_status)) {

  await db.promise().query(

     `INSERT INTO follow_ups
  (
    lead_id,
    employee_id,
    followup_mode,
    remarks,
    lead_status,
    status,
    contact_date,
    next_followup_date
  )
  VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    result.insertId,
    created_by_id,
    lead_mode,
    "Lead created with status " + lead_status,
    lead_status,
    "pending"
  ]

  );

}

    res.status(201)
    .json({

      message:
      "Lead Added Successfully",

      id:
      result.insertId

    });

  }

 catch (error) {
  //console.log(error);

  res.status(500).json({
    message: error.message
  });
}
  }




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
       WHERE lead_status = 'not interested'
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
const updateLead = async (req, res) => {

  try {

    // ==========================
    // Get Lead ID
    // ==========================
    const { id } = req.params;

    // ==========================
    // Get Request Body
    // ==========================
    const {

      company_name,
      contact_person_name,
      designation,
      phone,
      email,
      address,
      website,
      city,
      category,
      source,
      lead_mode,
      lead_status,
      remarks,
      important_lead

    } = req.body;

    // ==========================
    // Clean Values
    // ==========================
    const cleanPhone = phone?.trim() || null;
    const cleanEmail = email?.trim() || null;

    // ==========================
    // Either Phone or Email Required
    // ==========================
    if (!cleanPhone && !cleanEmail) {

      return res.status(400).json({

        message:
          "Either Phone Number or Email is required."

      });

    }

    // ==========================
    // Phone Validation
    // ==========================
    if (cleanPhone && !/^\d{10}$/.test(cleanPhone)) {

      return res.status(400).json({

        message:
          "Phone Number must contain exactly 10 digits."

      });

    }

    // ==========================
    // Email Validation
    // ==========================
    if (cleanEmail) {

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {

        return res.status(400).json({

          message:
            "Please enter a valid Email Address."

        });

      }

    }

    // ==========================
    // Duplicate Check
    // ==========================
    const conditions = [];
    const values = [id];

    if (cleanPhone) {

      conditions.push("phone = ?");
      values.push(cleanPhone);

    }

    if (cleanEmail) {

      conditions.push("email = ?");
      values.push(cleanEmail);

    }

    if (conditions.length > 0) {

      const [duplicate] =
      await db.promise().query(

        `
        SELECT id
        FROM leads
        WHERE id <> ?
        AND (${conditions.join(" OR ")})
        `,

        values

      );

      if (duplicate.length > 0) {

        return res.status(400).json({

          message:
            "Phone Number or Email already exists."

        });

      }

    }

    // ==========================
    // Get Previous Lead
    // ==========================
    const [oldLead] =
    await db.promise().query(

      `
      SELECT *
      FROM leads
      WHERE id=?
      `,

      [id]

    );

    const previous =
    oldLead[0];

    // ==========================
    // Update Lead
    // ==========================
    await db.promise().query(

      `
      UPDATE leads
      SET

      company_name=?,
      contact_person_name=?,
      designation=?,
      phone=?,
      email=?,
      address=?,
      website=?,
      city=?,
      category=?,
      source=?,
      lead_mode=?,
      lead_status=?,
      remarks=?,
      important_lead=?

      WHERE id=?
      `,

      [

        company_name?.trim() || null,
        contact_person_name?.trim() || null,
        designation?.trim() || null,

        cleanPhone,
        cleanEmail,

        address?.trim() || null,
        website?.trim() || null,
        city?.trim() || null,
        category?.trim() || null,
        source?.trim() || null,
        lead_mode?.trim() || null,
        lead_status?.trim() || null,
        remarks?.trim() || null,

        important_lead,
        id

      ]

    );

    // ==========================
    // Save History
    // ==========================
    const employeeId =
      req.body.employee_id ||
      req.body.created_by_id ||
      previous.created_by_id;

    await logLeadChanges(

      previous,
      req.body,
      id,
      employeeId

    );

    // ==========================
    // Success
    // ==========================
    return res.json({

      message:
        "Lead Updated Successfully"

    });

  }

  catch (error) {

    console.error(error);

    return res.status(500).json({

      message:
        error.sqlMessage || error.message || "Failed to Update Lead"

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

WHERE lead_status = 'not interested'

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