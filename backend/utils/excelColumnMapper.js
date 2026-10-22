// ==========================================
// Excel Column Mapper
// Converts different Excel column names
// into standard CRM lead field names.
// ==========================================

const COLUMN_ALIASES = {
  company_name: [
    "company",
    "company_name",
    "company name",
    "organization",
    "organization_name",
    "organization name",
    "business",
    "business_name",
    "business name",
    "firm",
    "firm_name",
    "firm name"
  ],

  contact_person_name: [
    "name",
    "person_name",
    "person name",
    "contact",
    "contact_name",
    "contact name",
    "contact_person",
    "contact person",
    "contact_person_name",
    "contact person name",
    "contacted_name",
    "contacted name"
  ],

  designation: [
    "designation",
    "job_title",
    "job title",
    "position",
    "role",
    "title"
  ],

  phone: [
    "phone",
    "phone_number",
    "phone number",
    "mobile",
    "mobile_number",
    "mobile number",
    "contact_number",
    "contact number",
    "telephone",
    "telephone_number",
    "telephone number",
    "whatsapp",
    "whatsapp_number",
    "whatsapp number"
  ],

  email: [
    "email",
    "email_id",
    "email id",
    "email_address",
    "email address",
    "mail",
    "mail_id",
    "mail id"
  ],

  address: [
    "address",
    "full_address",
    "full address",
    "location_address",
    "location address"
  ],

  website: [
    "website",
    "web",
    "web_url",
    "web url",
    "website_url",
    "website url"
  ],

  source: [
    "source",
    "lead_source",
    "lead source",
    "source_name",
    "source name"
  ],

  city: [
    "city",
    "location",
    "town",
    "district"
  ],

  category: [
    "category",
    "lead_category",
    "lead category",
    "business_category",
    "business category",
    "industry"
  ],

  remarks: [
    "remarks",
    "remark",
    "notes",
    "note",
    "comments",
    "comment",
    "description"
  ],

  lead_status: [
    "lead_status",
    "lead status",
    "status"
  ],

  lead_mode: [
    "lead_mode",
    "lead mode",
    "mode",
    "contact_mode",
    "contact mode"
  ],

  important_lead: [
    "important_lead",
    "important lead",
    "important",
    "priority",
    "high_priority",
    "high priority"
  ]
};


// ==========================================
// Normalize a column name
// ==========================================

const normalizeColumnName = (columnName) => {
  return columnName
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "_");
};


// ==========================================
// Create normalized alias lookup
// ==========================================

const aliasLookup = {};

Object.entries(COLUMN_ALIASES).forEach(
  ([crmField, aliases]) => {

    aliases.forEach((alias) => {

      const normalizedAlias =
        normalizeColumnName(alias);

      aliasLookup[normalizedAlias] =
        crmField;

    });

  }
);


// ==========================================
// Find CRM field for Excel column
// ==========================================

const mapColumnToCRMField = (columnName) => {

  const normalizedColumn =
    normalizeColumnName(columnName);

  return aliasLookup[normalizedColumn] || null;

};


// ==========================================
// Map complete Excel row
// ==========================================

const mapExcelRow = (row) => {

  const mappedRow = {};
  const unmappedColumns = [];

  Object.entries(row).forEach(
    ([columnName, value]) => {

      const crmField =
        mapColumnToCRMField(columnName);

      if (crmField) {

        mappedRow[crmField] = value;

      } else {

        unmappedColumns.push(columnName);

      }

    }
  );

  return {
    mappedRow,
    unmappedColumns
  };

};


module.exports = {
  COLUMN_ALIASES,
  normalizeColumnName,
  mapColumnToCRMField,
  mapExcelRow
};