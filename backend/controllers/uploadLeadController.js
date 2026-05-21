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


    rows.forEach(

      (row) => {

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
          important_lead

        } = row;


        const duplicateSql = `

          SELECT *

          FROM leads

          WHERE

          phone = ?

          OR email = ?

        `;


        db.query(

          duplicateSql,

          [

            phone,
            email

          ],

          (

            err,
            duplicateResult

          ) => {

            if (
              duplicateResult
              .length > 0
            ) {

              duplicates++;

              return;

            }


            const insertSql = `
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
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?
              )
            `;


            db.query(

              insertSql,

              [

                company_name,
                contact_person_name,
                email,
                phone,
                address || "",
                website || "",
                source || "",
                city || "",
                remarks || "",
                lead_status || "new",
                lead_mode || "phone_call",
                important_lead || false,
                created_by_id

              ]

            );

            inserted++;

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

    console.log(error);

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