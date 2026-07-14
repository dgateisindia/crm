const db = require("../db");

const addLeadHistory = async ({
  leadId,
  employeeId,
  followupMode = "manual update",
  remarks,
  leadStatus,
  status = "completed",
  nextFollowupDate = null
}) => {

  try {

    await db.promise().query(

      `
      INSERT INTO follow_ups
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
      VALUES
      (
        ?, ?, ?, ?, ?, ?, NOW(), ?
      )
      `,

      [
        leadId,
        employeeId,
        followupMode,
        remarks,
        leadStatus,
        status,
        nextFollowupDate
      ]

    );

  }

  catch (err) {

    console.log(err);

  }

};

module.exports = addLeadHistory;