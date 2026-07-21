const db =
require("../db");



const XLSX =
require("xlsx");



// ==========================
// Upload Leads
// ==========================
const uploadLeads =
(req, res) => {
   

  try {

    if (!req.file) {

      return res.status(400)
      .json({

        message:
        "No file uploaded"

      });

    }

    const workbook =
    XLSX.readFile(
      req.file.path
    );

    const sheetName =
    workbook.SheetNames[0];

    const sheet =
    workbook.Sheets[
      sheetName
    ];

    const rows = XLSX.utils.sheet_to_json(sheet).map((row) => {
    const normalizedRow = {};

    Object.keys(row).forEach((key) => {
        normalizedRow[
            key
                .trim()
                .toLowerCase()
                .replace(/[\s_-]+/g, "_")
        ] = row[key];
    });

    return normalizedRow;
});

    let inserted =0;

    let duplicates =0;

    let uploadErrors =[];

    const created_by_id =
    req.body
    .created_by_id;

    const created_by_type =
    req.body
    .created_by_type;

    const created_by_name =
    req.body
    .created_by_name;
  ;
 

rows.forEach((row,index) => {
  if (
    Object.values(row).every(
        value =>
            value === null ||
            value === undefined ||
            value.toString().trim() === ""
    )
) {
    return;
}
  

  const company_name =
    row.company_name ||"";

  const contact_person_name = row.contact_person_name || "";
const designation = row.designation || "";
let phone = row.phone || "";

phone = phone
    .toString()
    .trim()
    .replace(/\D/g, "");

// Remove +91 or 91 prefix
if (phone.startsWith("91") && phone.length === 12) {
    phone = phone.slice(2);
}
const email = row.email || "";
const address = row.address || "";
const website = row.website || "";
const city = row.city || "";
const source = row.source || "";
const category = row.category || "";
const remarks = row.remarks || "";
const lead_status = (row.lead_status || "new").toString().trim().toLowerCase();
const lead_mode = row.lead_mode || "";
const important_lead = row.important_lead ?? false;
// Category is mandatory
if (!category || category.toString().trim() === "") {
    
    uploadErrors.push({
        row: index + 2,
        reason: "Category is required"
    });

    duplicates++;
    return;
}

    if (!phone && !email) {

    uploadErrors.push({
        row: index + 2,
        reason: "Phone or Email is required"
    });

    duplicates++;

    return;

}
if (phone && !/^\d{10}$/.test(phone)) {

    uploadErrors.push({
        row: index + 2,
        reason: "Phone number must contain exactly 10 digits"
    });

    duplicates++;

    return;

}


        let duplicateSql = `
SELECT *
FROM leads
WHERE 1=0
`;

const duplicateValues = [];
if (phone) {

    duplicateSql += `
    OR phone = ?
    `;

    duplicateValues.push(phone);

}

if (email) {

    duplicateSql += `
    OR email = ?
    `;

    duplicateValues.push(email);

}
db.query(

duplicateSql,

duplicateValues,

(err, duplicateResult) => {
  if (err) {
    return;
}

if (duplicateResult.length > 0) {

    uploadErrors.push({
        row: index + 2,
        reason: "Lead already exists (Phone/Email duplicate)"
    });

    duplicates++;

    return;

}
    


            const insertSql = `
              INSERT INTO leads (

                company_name,
                contact_person_name,
                designation,
                email,
                phone,
                address,
                website,
                source,
                city,
                category,
                remarks,
                lead_status,
                lead_mode,
                important_lead,
                created_by_id,
                created_by_type,
                created_by_name

              )

              VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?,?
              )
            `;
            

db.query(

  insertSql,

  [

    company_name,
    contact_person_name,
    designation || "",
    email || null,
    phone || null,
    address || "",
    website || "",
    source || "",
    city || "",
    category || "",
    remarks || "",
    lead_status ,
    lead_mode ,
    important_lead ,
    created_by_id,
    created_by_type,
    created_by_name

  ],

 (err, result) => {

    if (err) {

    console.log(err);

    uploadErrors.push({
        row: index + 2,
        reason: err.sqlMessage || "Database Error"
    });

    duplicates++;

    return;

}

    inserted++;
    const followupStatuses = [
  "interested",
  "proposed",
  "offered",
  "meeting scheduled"
];
if (
    created_by_type === "employee" &&
    followupStatuses.includes(lead_status)
) {

    db.query(
        `INSERT INTO follow_ups (
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

}

);

          }

        );

      }

    );


    setTimeout(() => {

      res.status(200).json({

    message: "Upload Completed",

    inserted,

    duplicates,

    errors: uploadErrors

});

    }, 3000);

  }

  catch (error) {

    //console.log(error);

    res.status(500)
    .json({

      message:
      "Upload failed"

    });

  }

};


module.exports = {

  uploadLeads

};