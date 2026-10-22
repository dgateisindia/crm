
const db = require("../db");
const XLSX = require("xlsx");

// ==========================
// Export Leads
// ==========================
const exportLeads = async (req, res) => {
  try {
    const { id: userId, companyId, role } = req.user;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const normalizedRole = String(role || "").toLowerCase();

    if (!["owner", "manager", "employee"].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const {
      status = "all",
      category = "all",
      employeeId = "all",
      period,
      range,
      startDate,
      endDate,
    } = req.query;

    // Support both Employee and Manager date parameters
    const selectedRange = period ?? range ?? "all";

    const conditions = ["l.company_id = ?"];
    const params = [companyId];

    // ==========================
    // Employee Authorization
    // ==========================
    if (normalizedRole === "employee") {
      const [employees] = await db.promise().query(
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

      if (employees.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Employee profile is not linked to this account",
        });
      }

      const crmEmployeeId = employees[0].employee_id;

      // Export only assigned leads or unassigned
      // leads created by this employee.
      conditions.push(
        `(
          l.assigned_employee_id = ?
          OR (
            l.assigned_employee_id IS NULL
            AND l.created_by_type = 'employee'
            AND l.created_by_id = ?
          )
        )`
      );

      params.push(crmEmployeeId, crmEmployeeId);
    }

    // ==========================
    // Status Filter
    // ==========================
    if (status !== "all") {
      conditions.push(
        `LOWER(
          REPLACE(
            REPLACE(TRIM(l.lead_status), '_', ' '),
            '-', ' '
          )
        ) = LOWER(?)`
      );

      params.push(String(status).replace(/[_-]+/g, " "));
    }

    // ==========================
    // Category Filter
    // ==========================
    if (category !== "all") {
      conditions.push("l.category = ?");
      params.push(category);
    }

    // ==========================
    // Manager Employee Filter
    // ==========================
    if (
      normalizedRole !== "employee" &&
      employeeId !== "all"
    ) {
      if (!/^\d+$/.test(String(employeeId))) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee filter",
        });
      }

      conditions.push("l.assigned_employee_id = ?");
      params.push(Number(employeeId));
    }

    // ==========================
    // Date Range Filter
    // ==========================
    if (selectedRange === "today") {
      conditions.push("l.created_at >= CURDATE()");
      conditions.push("l.created_at < CURDATE() + INTERVAL 1 DAY");

    } else if (selectedRange === "15days") {
      conditions.push(
        "l.created_at >= CURDATE() - INTERVAL 14 DAY"
      );
      conditions.push(
        "l.created_at < CURDATE() + INTERVAL 1 DAY"
      );

    } else if (selectedRange === "month") {
      conditions.push(
        "l.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"
      );
      conditions.push(
        "l.created_at < CURDATE() + INTERVAL 1 DAY"
      );

    } else if (selectedRange === "year") {
      conditions.push(
        "l.created_at >= MAKEDATE(YEAR(CURDATE()), 1)"
      );
      conditions.push(
        "l.created_at < CURDATE() + INTERVAL 1 DAY"
      );

    } else if (selectedRange === "custom") {
      if (
        !startDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
        (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate))
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid custom start and end dates are required",
        });
      }

      const finalEndDate = endDate || startDate;

      if (finalEndDate < startDate) {
        return res.status(400).json({
          success: false,
          message: "End date cannot be before start date",
        });
      }

      conditions.push("l.created_at >= ?");
      conditions.push(
        "l.created_at < DATE_ADD(?, INTERVAL 1 DAY)"
      );

      params.push(startDate, finalEndDate);

    } else if (selectedRange !== "all") {
      return res.status(400).json({
        success: false,
        message: "Invalid date range",
      });
    }

    // ==========================
    // Fetch Export Records
    // ==========================
    const sql = `
      SELECT
        l.id AS Lead_ID,
        l.company_name AS Company,
        l.contact_person_name AS Contact_Person,
        l.designation AS Designation,
        l.phone AS Phone,
        l.email AS Email,
        l.website AS Website,
        l.address AS Address,
        l.city AS City,
        l.source AS Source,
        l.category AS Category,
        l.lead_status AS Status,
        l.priority AS Priority,
        l.remarks AS Remarks,
        l.created_by_name AS Created_By,
        l.assigned_employee_id AS Assigned_Employee_ID,
        l.created_at AS Created_At
      FROM leads l
      WHERE ${conditions.join(" AND ")}
      ORDER BY l.id DESC
    `;

    const [rows] = await db.promise().query(sql, params);

    // ==========================
    // Generate Excel Workbook
    // ==========================
    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Leads"
    );

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    const filename = `CRM_Leads_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).send(buffer);

  } catch (error) {
    console.error("EXPORT LEADS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to export leads",
    });
  }
};

// ==========================
// Get Export Filters
// ==========================
const getExportFilters = async (req, res) => {
  try {
    const {
      id: userId,
      companyId,
      role
    } = req.user;

    if (!companyId) {
      return res.status(403).json({
        success: false,
        message: "User is not associated with a company",
      });
    }

    const normalizedRole = String(role || "").toLowerCase();

    if (!["owner", "manager", "employee"].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const conditions = ["l.company_id = ?"];
    const params = [companyId];

    // ==========================
    // Employee-specific categories
    // ==========================
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

      if (employeeRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Employee profile is not linked to this account",
        });
      }

      const crmEmployeeId = employeeRows[0].employee_id;

      conditions.push(
        `(
          l.assigned_employee_id = ?
          OR (
            l.assigned_employee_id IS NULL
            AND l.created_by_type = 'employee'
            AND l.created_by_id = ?
          )
        )`
      );

      params.push(crmEmployeeId, crmEmployeeId);
    }

    // ==========================
    // Available Categories
    // ==========================
    const [categories] = await db.promise().query(
      `
      SELECT DISTINCT l.category
      FROM leads l
      WHERE ${conditions.join(" AND ")}
        AND l.category IS NOT NULL
        AND TRIM(l.category) <> ''
      ORDER BY l.category
      `,
      params
    );

    // ==========================
    // Manager Employee Filters
    // ==========================
    let employees = [];

    if (
      normalizedRole === "manager" ||
      normalizedRole === "owner"
    ) {
      const [employeeRows] = await db.promise().query(
        `
        SELECT employee_id, full_name
        FROM employees
        WHERE company_id = ?
          AND status = 'active'
        ORDER BY full_name
        `,
        [companyId]
      );

      employees = employeeRows;
    }

    return res.status(200).json({
      categories: categories.map((row) => row.category),
      employees,
    });

  } catch (error) {
    console.error("EXPORT FILTERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load export filters",
    });
  }
};

// ==========================
// Exports
// ==========================
module.exports = {
  exportLeads,
  getExportFilters,
};
