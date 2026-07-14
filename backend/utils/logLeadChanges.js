const addLeadHistory = require("./addLeadHistory");

const normalizeValue = (value) => {

  if (value === null || value === undefined) {
    return "";
  }

  return value.toString().trim();

};

const logLeadChanges = async (
  previous,
  updated,
  leadId,
  employeeId
) => {

  const fields = [

    {
      key: "lead_status",
      name: "Status"
    },

    {
      key: "phone",
      name: "Phone"
    },

    {
      key: "email",
      name: "Email"
    },

    {
      key: "category",
      name: "Category"
    },

    {
      key: "source",
      name: "Source"
    },

    {
      key: "lead_mode",
      name: "Lead Mode"
    },

    {
      key: "important_lead",
      name: "Important Lead"
    },

    {
      key: "company_name",
      name: "Company Name"
    },

    {
      key: "contact_person_name",
      name: "Contact Person"
    },

    {
      key: "designation",
      name: "Designation"
    },

    {
      key: "city",
      name: "City"
    }

  ];

  for (const field of fields) {

    let oldValue = previous[field.key];
    let newValue = updated[field.key];

    // Handle Important Lead separately
    if (field.key === "important_lead") {

      oldValue = Number(oldValue);
      newValue = Number(newValue);

    } else {

      oldValue = normalizeValue(oldValue);
      newValue = normalizeValue(newValue);

    }

    // Skip if nothing changed
    if (oldValue === newValue) {
      continue;
    }

    await addLeadHistory({

      leadId,

      employeeId,

      followupMode: "manual update",

      remarks:
        `${field.name} changed from "${
            oldValue === "" ? "-" : oldValue
          }" to "${
            newValue === "" ? "-" : newValue
          }"`,

      leadStatus:
        updated.lead_status

    });

  }

};

module.exports = logLeadChanges;