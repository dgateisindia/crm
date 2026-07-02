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

    const rows =
    XLSX.utils
    .sheet_to_json(
      sheet
    );

    let inserted =
    0;

    let duplicates =
    0;

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


    rows.forEach(

      (row) => {

      const company_name =
        row.company_name ||
        row["Company Name"];

      const contact_person_name =
        row.contact_person_name ||
        row["Contact Person"];

      const designation =
        row.designation ||
        row["Designation"] ||
        "";

      const email =
        row.email ||
        row["Email"] ||
        "";

      const phone =
        row.phone ||
        row["Phone"];

      const address =
        row.address ||
        row["Address"] ||
        "";

      const website =
        row.website ||
        row["Website"] ||
        "";

      const source =
        row.source ||
        row["Source"] ||
        "";

      const city =
        row.city ||
        row["City"] ||
        "";
      const category =
        row.category ||
        row["Category"] ||
        "";

      const remarks =
        row.remarks ||
        row["Remarks"] ||
        "";

      const lead_status =
        (
          row.lead_status ||
          row["Lead Status"] ||
          row["Status"] ||
          "new"
        )
        .toString()
        .trim()
        .toLowerCase();

      const lead_mode =
        row.lead_mode ||
        row["Lead Mode"] ||
        "phone_call";

      const important_lead =
        row.important_lead ||
        row["Important Lead"] ||
        false;
        if (!phone && !email) {

    duplicates++;

    return;

}
if (phone && !/^\d{10}$/.test(phone)) {

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
            console.log({
              company_name,
              source,
              lead_status,
              lead_mode,
              designation
            });

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

        duplicates++;

        return;

    }

    inserted++;

}

);

          }

        );

      }

    );


    setTimeout(() => {

      res.status(200)
      .json({

        message:
        "Upload Completed",

        inserted,
        duplicates

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