const express = require("express");

const router = express.Router();

const db = require("../db");


// Save Follow-up
router.post("/", (req, res) => {

    const {

        lead_id,
        followup_date,
        followup_type,
        remark,
        status

    } = req.body;

    const sql = `

        INSERT INTO followups (

            lead_id,
            followup_date,
            followup_type,
            remark,
            status

        )

        VALUES (?, ?, ?, ?, ?)

    `;

    db.query(

        sql,

        [

            lead_id,
            followup_date,
            followup_type,
            remark,
            status

        ],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({

                    success: false,
                    message: "Database Error"

                });

            }

            res.status(200).json({

                success: true,
                message: "Follow-up Saved Successfully"

            });

        }

    );

});

module.exports = router;