const db = require("../db");
const XLSX = require("xlsx");
const {
  mapExcelRow
} = require("../utils/excelColumnMapper");

// ==========================================
// Helpers
// ==========================================

const normalizePhone = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  let phone = value
    .toString()
    .trim()
    .replace(/\D/g, "");

  // Remove +91 / 91 prefix when 12 digits
  if (phone.startsWith("91") && phone.length === 12) {
    phone = phone.slice(2);
  }

  return phone;
};

const normalizeEmail = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return value.toString().trim().toLowerCase();
};

const normalizeStatus = (value) => {
  if (value === null || value === undefined || value === "") {
    return "new";
  }

  return value
    .toString()
    .trim()
    .toLowerCase();
};

const normalizeBoolean = (value) => {
  if (
    value === true ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    return [
      "true",
      "yes",
      "y",
      "important"
    ].includes(normalized);
  }

  return false;
};

// ==========================================
// DB Query Promise Wrapper
// ==========================================

const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });
};
const previewLeads = async (req, res) => {
  try {
const {
        id: userId,
        companyId,
        role,
        name
      } = req.user;


    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file contains no data."
      });
    }

    const validRows = [];
    const uploadErrors = [];

    const seenPhones = new Set();
    const seenEmails = new Set();

    let duplicates = 0;
    let invalid = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNumber = index + 2; // Excel header = row 1

      // Ignore completely empty rows
      const hasData = Object.values(row).some(
        value => String(value).trim() !== ""
      );

      if (!hasData) {
        continue;
      }

      const {
        mappedRow: mapped,
        unmappedColumns
      } = mapExcelRow(row);

      const company_name =
        mapped.company_name?.trim() || "";

      const contact_person_name =
        mapped.contact_person_name?.trim() || "";

      const designation =
        mapped.designation?.trim() || "";

      const email =
        normalizeEmail(mapped.email);

      const phone =
        normalizePhone(mapped.phone);

      const address =
        mapped.address?.trim() || "";

      const website =
        mapped.website?.trim() || "";

      const source =
        mapped.source?.trim() || "";

      const city =
        mapped.city?.trim() || "";

      const category =
        mapped.category?.trim() || "";

      const remarks =
        mapped.remarks?.trim() || "";

      const lead_status =
        normalizeStatus(mapped.lead_status);

      const lead_mode =
        mapped.lead_mode?.trim() || "";

      const important_lead =
        normalizeBoolean(mapped.important_lead);

      // -----------------------------
      // CATEGORY REQUIRED
      // -----------------------------
      if (!category) {
        invalid++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Category is required."
        });

        continue;
      }

      // -----------------------------
      // PHONE OR EMAIL REQUIRED
      // -----------------------------
      if (!phone && !email) {
        invalid++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Phone or Email is required."
        });

        continue;
      }

      // -----------------------------
      // PHONE VALIDATION
      // -----------------------------
      if (phone && !/^\d{10}$/.test(phone)) {
        invalid++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Phone number must contain exactly 10 digits."
        });

        continue;
      }

      // -----------------------------
      // DUPLICATE INSIDE SAME FILE
      // -----------------------------
      if (
        (phone && seenPhones.has(phone)) ||
        (email && seenEmails.has(email))
      ) {
        duplicates++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Duplicate lead found inside uploaded file."
        });

        continue;
      }

      // -----------------------------
      // DUPLICATE AGAINST DATABASE
      // -----------------------------
      let duplicateFound = false;

      if (phone || email) {
        let duplicateQuery = `
          SELECT id
          FROM leads
          WHERE company_id = ?
          AND (
            ${phone ? "phone = ?" : "1 = 0"}
            ${phone && email ? " OR " : ""}
            ${email ? "email = ?" : ""}
          )
          LIMIT 1
        `;

        const duplicateParams = [companyId];

        if (phone) {
          duplicateParams.push(phone);
        }

        if (email) {
          duplicateParams.push(email);
        }

        const [duplicateRows] = await db.promise().query(
          duplicateQuery,
          duplicateParams
        );

        if (duplicateRows.length > 0) {
          duplicateFound = true;
        }
      }

      if (duplicateFound) {
        duplicates++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Lead already exists in this company."
        });

        continue;
      }

      // -----------------------------
      // MARK AS SEEN
      // -----------------------------
      if (phone) {
        seenPhones.add(phone);
      }

      if (email) {
        seenEmails.add(email);
      }

      // -----------------------------
      // VALID ROW
      // -----------------------------
      validRows.push({
        rowNumber,
        company_name,
        contact_person_name,
        designation,
        email: email || null,
        phone: phone || null,
        address,
        website,
        source,
        city,
        category,
        remarks,
        lead_status,
        lead_mode,
        important_lead
      });
    }

    return res.status(200).json({
      success: true,
      message: "Excel file validated successfully.",
      totalRows: rows.length,
      validRows: validRows.length,
      duplicates,
      invalid,
      errors: uploadErrors,

      // We keep the validated rows for the next allocation step.
      previewRows: validRows
    });

  } catch (error) {
    console.error("Preview Leads Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to preview Excel file.",
      error: error.message
    });
  }
};
// ==========================================
// Validate Manager Lead Allocation
// ==========================================

const validateLeadAllocation = async (
  allocation,
  totalValidLeads,
  companyId,
  managerUserId
) => {

  // Allocation must be an array
  if (!Array.isArray(allocation)) {
    return {
      valid: false,
      message: "Allocation must be an array."
    };
  }

  if (allocation.length === 0) {
    return {
      valid: false,
      message: "Please assign the leads to at least one employee."
    };
  }

  // Check every allocation item
  for (const item of allocation) {

    if (
      !item ||
      !item.employee_id ||
      !Number.isInteger(Number(item.employee_id))
    ) {
      return {
        valid: false,
        message: "Invalid employee selected."
      };
    }

    if (
      item.count === undefined ||
      item.count === null ||
      !Number.isInteger(Number(item.count)) ||
      Number(item.count) <= 0
    ) {
      return {
        valid: false,
        message: "Each employee allocation must have a count greater than 0."
      };
    }

  }


  // Get current Manager
  const [managerRows] = await db.promise().query(
    `
      SELECT manager_id
      FROM managers
      WHERE user_id = ?
        AND company_id = ?
        AND status = 'active'
      LIMIT 1
    `,
    [
      managerUserId,
      companyId
    ]
  );


  if (managerRows.length === 0) {
    return {
      valid: false,
      message: "Manager profile not found."
    };
  }


  const managerId =
    managerRows[0].manager_id;


  // Total allocation
  const allocatedTotal =
    allocation.reduce(
      (total, item) =>
        total + Number(item.count),
      0
    );


  // Allocation MUST equal valid leads
  if (allocatedTotal !== totalValidLeads) {

    return {
      valid: false,

      message:
        `Allocated leads (${allocatedTotal}) must equal valid leads (${totalValidLeads}).`
    };

  }


  // Check duplicate employees in allocation
  const employeeIds =
    allocation.map(
      item => Number(item.employee_id)
    );

  const uniqueEmployeeIds =
    new Set(employeeIds);

  if (
    uniqueEmployeeIds.size !==
    employeeIds.length
  ) {

    return {
      valid: false,
      message:
        "The same employee cannot be selected more than once."
    };

  }


  // Verify every employee belongs
  // to this Manager and company
  for (
    const employeeId of employeeIds
  ) {

    const [employeeRows] =
      await db.promise().query(
        `
          SELECT
            employee_id,
            full_name,
            employee_code,
            status
          FROM employees
          WHERE employee_id = ?
            AND company_id = ?
            AND manager_id = ?
            AND status = 'active'
          LIMIT 1
        `,
        [
          employeeId,
          companyId,
          managerId
        ]
      );


    if (employeeRows.length === 0) {

      return {
        valid: false,

        message:
          `Employee ${employeeId} is not an active employee under this Manager.`
      };

    }

  }


  return {
    valid: true,
    managerId
  };

};



// ==========================================
// Upload Leads
// ==========================================

const uploadLeads = async (req, res) => {
  let connection = null;

  try {

    // --------------------------------------
    // File validation
    // --------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }


    // --------------------------------------
    // Authenticated CRM user
    // --------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }


    const {
      id: userId,
      companyId,
      role,
      name
    } = req.user;


    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company"
      });
    }


    // --------------------------------------
    // Role protection
    // --------------------------------------

    const normalizedRole = role?.toLowerCase();


    if (
      normalizedRole !== "owner" &&
      normalizedRole !== "manager" &&
      normalizedRole !== "employee"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }


    // ======================================
    // Manager Lead Allocation
    // ======================================

    let allocation = [];

    if (
      normalizedRole === "manager" ||
      normalizedRole === "owner"
    ) {

      try {

        allocation = JSON.parse(
          req.body.allocation || "[]"
        );

      } catch (error) {

        return res.status(400).json({
          success: false,
          message: "Invalid allocation data."
        });

      }

    }


    // ======================================
    // Employee allocation protection
    // ======================================

    if (normalizedRole === "employee") {

      if (
        req.body.allocation &&
        req.body.allocation !== "[]" &&
        req.body.allocation !== ""
      ) {

        return res.status(403).json({
          success: false,
          message: "Employees cannot assign leads to other employees."
        });

      }

    }


    // --------------------------------------
    // Read workbook
    // --------------------------------------

    const workbook = XLSX.readFile(
      req.file.path
    );


    if (
      !workbook.SheetNames ||
      workbook.SheetNames.length === 0
    ) {

      return res.status(400).json({
        success: false,
        message: "Excel file does not contain a worksheet"
      });

    }


    const sheetName =
      workbook.SheetNames[0];


    const sheet =
      workbook.Sheets[sheetName];


    const rows =
      XLSX.utils.sheet_to_json(sheet, {
        defval: ""
      });


    if (rows.length === 0) {

      return res.status(400).json({
        success: false,
        message: "Excel file contains no data"
      });

    }


    // --------------------------------------
    // Counters
    // --------------------------------------

    let inserted = 0;
    let duplicates = 0;
    let invalid = 0;

    const uploadErrors = [];

    const unmappedColumns =
      new Set();


    // ======================================
    // IMPORTANT
    // Store valid leads first.
    // Do NOT insert inside this loop.
    // ======================================

    const validRows = [];


    // Used to detect duplicates
    // inside the same Excel file.

    const seenPhones = new Set();
    const seenEmails = new Set();


    // --------------------------------------
    // Process each row sequentially
    // --------------------------------------

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {

      const originalRow =
        rows[index];


      const rowNumber =
        index + 2;


      // ------------------------------------
      // Ignore completely empty rows
      // ------------------------------------

      const isEmptyRow =
        Object.values(originalRow).every(
          (value) =>
            value === null ||
            value === undefined ||
            value.toString().trim() === ""
        );


      if (isEmptyRow) {
        continue;
      }


      // ------------------------------------
      // Map Excel columns → CRM fields
      // ------------------------------------

      const {
        mappedRow,
        unmappedColumns: rowUnmappedColumns
      } = mapExcelRow(originalRow);


      rowUnmappedColumns.forEach(
        (column) => {
          unmappedColumns.add(column);
        }
      );


      // ------------------------------------
      // Extract mapped fields
      // ------------------------------------

      const company_name =
        mappedRow.company_name
          ?.toString()
          .trim() || "";


      const contact_person_name =
        mappedRow.contact_person_name
          ?.toString()
          .trim() || "";


      const designation =
        mappedRow.designation
          ?.toString()
          .trim() || "";


      const phone =
        normalizePhone(
          mappedRow.phone
        );


      const email =
        normalizeEmail(
          mappedRow.email
        );


      const address =
        mappedRow.address
          ?.toString()
          .trim() || "";


      const website =
        mappedRow.website
          ?.toString()
          .trim() || "";


      const source =
        mappedRow.source
          ?.toString()
          .trim() || "";


      const city =
        mappedRow.city
          ?.toString()
          .trim() || "";


      const category =
        mappedRow.category
          ?.toString()
          .trim() || "";


      const remarks =
        mappedRow.remarks
          ?.toString()
          .trim() || "";


      const lead_status =
        normalizeStatus(
          mappedRow.lead_status
        );


      const lead_mode =
        mappedRow.lead_mode
          ?.toString()
          .trim() || "";


      const important_lead =
        normalizeBoolean(
          mappedRow.important_lead
        );


      // ------------------------------------
      // Category validation
      // ------------------------------------

      if (!category) {

        invalid++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Category is required"
        });

        continue;
      }


      // ------------------------------------
      // Phone OR Email required
      // ------------------------------------

      if (!phone && !email) {

        invalid++;

        uploadErrors.push({
          row: rowNumber,
          reason: "Phone or Email is required"
        });

        continue;
      }


      // ------------------------------------
      // Phone validation
      // ------------------------------------

      if (
        phone &&
        !/^\d{10}$/.test(phone)
      ) {

        invalid++;

        uploadErrors.push({
          row: rowNumber,
          reason:
            "Phone number must contain exactly 10 digits"
        });

        continue;
      }


      // ------------------------------------
      // Duplicate inside same file
      // ------------------------------------

      if (
        (phone && seenPhones.has(phone)) ||
        (email && seenEmails.has(email))
      ) {

        duplicates++;

        uploadErrors.push({
          row: rowNumber,
          reason:
            "Duplicate lead found inside uploaded file."
        });

        continue;
      }


      // ------------------------------------
      // Duplicate against database
      // ------------------------------------

      let duplicateSql = `
        SELECT id
        FROM leads
        WHERE company_id = ?
        AND (
          1 = 0
      `;


      const duplicateValues = [
        companyId
      ];


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


      duplicateSql += `
        )
        LIMIT 1
      `;


      const duplicateResult =
        await query(
          duplicateSql,
          duplicateValues
        );


      if (
        duplicateResult.length > 0
      ) {

        duplicates++;

        uploadErrors.push({
          row: rowNumber,
          reason:
            "Lead already exists (Phone/Email duplicate)"
        });

        continue;
      }


      // ------------------------------------
      // Mark as seen
      // ------------------------------------

      if (phone) {
        seenPhones.add(phone);
      }


      if (email) {
        seenEmails.add(email);
      }


      // ====================================
      // VALID ROW
      // ====================================

      validRows.push({

        rowNumber,

        company_name,

        contact_person_name,

        designation,

        email: email || null,

        phone: phone || null,

        address,

        website,

        source,

        city,

        category,

        remarks,

        lead_status,

        lead_mode,

        important_lead

      });

    }


    // ======================================
    // No valid leads
    // ======================================

    if (validRows.length === 0) {

      return res.status(400).json({
        success: false,
        message: "No valid leads available for upload.",
        totalRows: rows.length,
        inserted: 0,
        duplicates,
        invalid,
        errors: uploadErrors,
        unmappedColumns:
          Array.from(unmappedColumns)
      });

    }


    // ======================================
    // MANAGER ALLOCATION VALIDATION
    // ======================================

    let managerId = null;


    if (
      normalizedRole === "manager" ||
      normalizedRole === "owner"
    ) {

      const allocationValidation =
        await validateLeadAllocation(
          allocation,
          validRows.length,
          companyId,
          userId
        );


      if (!allocationValidation.valid) {

        return res.status(400).json({
          success: false,
          message:
            allocationValidation.message,
          totalRows: rows.length,
          validRows: validRows.length,
          duplicates,
          invalid,
          errors: uploadErrors
        });

      }


      managerId =
        allocationValidation.managerId;

    }


    // ======================================
    // Build assignment list
    // ======================================

    const assignments = [];


    if (
      normalizedRole === "manager" ||
      normalizedRole === "owner"
    ) {

      for (
        const item of allocation
      ) {

        const employeeId =
          Number(item.employee_id);

        const count =
          Number(item.count);


        for (
          let i = 0;
          i < count;
          i++
        ) {

          assignments.push(
            employeeId
          );

        }

      }

    }


    // Safety check
    if (
      (
        normalizedRole === "manager" ||
        normalizedRole === "owner"
      ) &&
      assignments.length !== validRows.length
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Lead assignment count does not match the number of valid leads."
      });

    }

let creatorId = userId;

if (normalizedRole === "employee") {
  const [employeeRows] = await db.promise().query(
    `
    SELECT employee_id
    FROM employees
    WHERE user_id = ?
      AND company_id = ?
      AND status = 'active'
    LIMIT 1
    `,
    [userId, companyId]
  );

  if (employeeRows.length !== 1) {
    return res.status(403).json({
      success: false,
      message: "Active employee profile not found."
    });
  }

  creatorId = employeeRows[0].employee_id;
}
    // ======================================
    // Insert valid leads
    // ======================================

    const createdByType =
      normalizedRole === "employee"
        ? "employee"
        : "manager";
        if (validRows.length > 0) {
  connection = await db.promise().getConnection();
  await connection.beginTransaction();
}


    for (
      let i = 0;
      i < validRows.length;
      i++
    ) {

      const lead =
        validRows[i];


      // Manager:
      // assign according to allocation.
      //
      // Employee:
      // no assignment to another employee.

      let assignedEmployeeId = null;


      if (
        normalizedRole === "manager" ||
        normalizedRole === "owner"
      ) {

        assignedEmployeeId =
          assignments[i];

      }


      // ------------------------------------
      // Insert lead
      // ------------------------------------

      
      const assignedById =
        normalizedRole === "manager" ||
        normalizedRole === "owner"
          ? userId
          : null;

      const insertSql = `
        INSERT INTO leads (
          company_id,
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
          assigned_employee_id,
          assigned_at,
          assigned_by_id,
          created_by_id,
          created_by_type,
          created_by_name
        )
        VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          CASE
            WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP
            ELSE NULL
          END,
          ?, ?, ?, ?
        )
      `;

      const insertValues = [
        companyId,
        lead.company_name,
        lead.contact_person_name,
        lead.designation,
        lead.email,
        lead.phone,
        lead.address,
        lead.website,
        lead.source,
        lead.city,
        lead.category,
        lead.remarks,
        lead.lead_status,
        lead.lead_mode,
        lead.important_lead,
        assignedEmployeeId,
        assignedEmployeeId,
        assignedById,
        creatorId,
        createdByType,
        name || ""
      ];

      await connection.query(insertSql, insertValues);

inserted++;
    }
    if (connection) {
  await connection.commit();
  connection.release();
  connection = null;
}


    // ======================================
    // Response
    // ======================================

    return res.status(200).json({

      success: true,

      message:
        "Upload Completed",

      totalRows:
        rows.length,

      validRows:
        validRows.length,

      inserted,

      duplicates,

      invalid,

      errors:
        uploadErrors,

      unmappedColumns:
        Array.from(unmappedColumns),

      allocation:
        (
          normalizedRole === "manager" ||
          normalizedRole === "owner"
        )
          ? allocation
          : []

    });


  } catch (error) {
    if (connection) {
  try {
    await connection.rollback();
  } catch (rollbackError) {
    console.error("Excel rollback error:", rollbackError);
  } finally {
    connection.release();
    connection = null;
  }
}

    console.error(
      "Excel upload error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Upload failed",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined

    });

  }
};

module.exports = {
  previewLeads,
  uploadLeads,
  validateLeadAllocation
  
};