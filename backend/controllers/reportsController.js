const db = require("../db");

// =====================================================
// Shared helpers
// =====================================================

const getDateFilter = (range, startDate, endDate, column) => {
    const allowedRanges = ["today", "15days", "month", "year", "custom"];

    if (!allowedRanges.includes(range)) {
        throw new Error("Invalid report date range");
    }

    switch (range) {
        case "today":
            return {
                sql: `DATE(${column}) = CURDATE()`,
                params: [],
            };

        case "15days":
            return {
                sql: `${column} >= DATE_SUB(NOW(), INTERVAL 15 DAY)`,
                params: [],
            };

        case "month":
            return {
                sql: `
                    ${column} >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND ${column} < DATE_ADD(
                        DATE_FORMAT(CURDATE(), '%Y-%m-01'),
                        INTERVAL 1 MONTH
                    )
                `,
                params: [],
            };

        case "year":
            return {
                sql: `
                    ${column} >= MAKEDATE(YEAR(CURDATE()), 1)
                    AND ${column} < MAKEDATE(YEAR(CURDATE()) + 1, 1)
                `,
                params: [],
            };

        case "custom": {
            const validDate = (value) =>
                typeof value === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(value) &&
                !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
                new Date(`${value}T00:00:00Z`)
                    .toISOString()
                    .startsWith(value);

            if (!validDate(startDate)) {
                throw new Error("A valid start date is required (YYYY-MM-DD)");
            }

            const finalEndDate = endDate || startDate;

            if (!validDate(finalEndDate)) {
                throw new Error("A valid end date is required (YYYY-MM-DD)");
            }

            if (finalEndDate < startDate) {
                throw new Error("End date cannot be before start date");
            }

            if (finalEndDate > new Date().toISOString().slice(0, 10)) {
                throw new Error("Future dates are not allowed");
            }

            return {
                sql: `DATE(${column}) BETWEEN ? AND ?`,
                params: [startDate, finalEndDate],
            };
        }
    }
};

const queryRows = async (sql, params = []) => {
    const [rows] = await db.promise().query(sql, params);
    return rows;
};

const getCompanyId = (req) => {
    const companyId = Number(req.user?.companyId);

    if (!Number.isInteger(companyId) || companyId <= 0) {
        return null;
    }

    return companyId;
};

// =====================================================
// MANAGER / COMPANY REPORT
// GET /reports/company?range=today
// =====================================================

const getCompanyReport = async (req, res) => {
    try {
        const companyId = getCompanyId(req);

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company",
            });
        }

        const range = req.query.range || "today";
        const { startDate, endDate } = req.query;

        const leadDate = getDateFilter(
            range,
            startDate,
            endDate,
            "l.created_at"
        );

        const followupDate = getDateFilter(
            range,
            startDate,
            endDate,
            "f.created_at"
        );

        // ---------------------------------------------
        // Total leads
        // ---------------------------------------------

        const leadCounts = await queryRows(
            `
            SELECT
                COUNT(*) AS totalLeads,

                COALESCE(
                    SUM(LOWER(TRIM(lead_status)) = 'converted'),
                    0
                ) AS convertedLeads,

                COALESCE(
                    SUM(
                        LOWER(TRIM(COALESCE(lead_status, '')))
                        <> 'converted'
                    ),
                    0
                ) AS pendingLeads

            FROM leads l
            WHERE l.company_id = ?
              AND ${leadDate.sql}
            `,
            [companyId, ...leadDate.params]
        );

        // ---------------------------------------------
        // Actual follow-up activities
        // ---------------------------------------------

        const followupCounts = await queryRows(
            `
            SELECT COUNT(*) AS totalFollowups
            FROM follow_ups f
            INNER JOIN leads l
                ON l.id = f.lead_id
            WHERE l.company_id = ?
              AND ${followupDate.sql}
            `,
            [companyId, ...followupDate.params]
        );

        // ---------------------------------------------
        // Employees belonging to this company
        // ---------------------------------------------

        const employeeCounts = await queryRows(
            `
            SELECT COUNT(*) AS totalEmployees
            FROM employees
            WHERE company_id = ?
            `,
            [companyId]
        );

        // ---------------------------------------------
        // Lead status chart
        // ---------------------------------------------

        const statusChart = await queryRows(
            `
            SELECT
                COALESCE(lead_status, 'unknown') AS lead_status,
                COUNT(*) AS total
            FROM leads l
            WHERE l.company_id = ?
              AND ${leadDate.sql}
            GROUP BY lead_status
            ORDER BY total DESC
            `,
            [companyId, ...leadDate.params]
        );

        // ---------------------------------------------
        // Lead creation trend
        // ---------------------------------------------

        const trendChart = await queryRows(
            `
            SELECT
                DATE(l.created_at) AS date,
                COUNT(*) AS total
            FROM leads l
            WHERE l.company_id = ?
              AND ${leadDate.sql}
            GROUP BY DATE(l.created_at)
            ORDER BY DATE(l.created_at)
            `,
            [companyId, ...leadDate.params]
        );

        // ---------------------------------------------
        // Employee performance
        //
        // Count leads created by an employee OR
        // assigned to that employee.
        //
        // Use employees.user_id for created_by_id.
        // Use employees.employee_id for assignments.
        // COUNT(DISTINCT) avoids counting the same lead twice.
        // ---------------------------------------------

        const employeePerformance = await queryRows(
            `
            SELECT
                e.employee_id,
                e.full_name,
                COUNT(DISTINCT l.id) AS totalLeads,

                COUNT(
                    DISTINCT CASE
                        WHEN LOWER(TRIM(l.lead_status)) = 'converted'
                        THEN l.id
                    END
                ) AS convertedLeads

            FROM employees e

            LEFT JOIN leads l
                ON l.company_id = e.company_id
                AND (
                    l.assigned_employee_id = e.employee_id
                    OR (
                        l.created_by_type = 'employee'
                        AND l.created_by_id = e.user_id
                    )
                )
                AND ${leadDate.sql}

            WHERE e.company_id = ?

            GROUP BY e.employee_id, e.full_name
            ORDER BY totalLeads DESC
            `,
            [...leadDate.params, companyId]
        );

        const totals = leadCounts[0];

        return res.json({
            totalLeads: Number(totals.totalLeads || 0),
            totalFollowups: Number(
                followupCounts[0].totalFollowups || 0
            ),
            convertedLeads: Number(totals.convertedLeads || 0),
            pendingLeads: Number(totals.pendingLeads || 0),
            totalEmployees: Number(
                employeeCounts[0].totalEmployees || 0
            ),
            statusChart,
            trendChart,
            employeePerformance,
        });
    } catch (error) {
        console.error("GET COMPANY REPORT ERROR:", error);

        const isValidationError = [
            "Invalid report date range",
        ].includes(error.message) ||
            /date|required|future/i.test(error.message);

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: isValidationError
                ? error.message
                : "Failed to generate company report",
        });
    }
};

// =====================================================
// EMPLOYEE REPORT
// GET /reports/employee/:id?range=today
// =====================================================

const getEmployeeReport = async (req, res) => {
    try {
        const companyId = getCompanyId(req);
        const employeeId = Number(req.params.id);

        if (!companyId) {
            return res.status(403).json({
                success: false,
                message: "User is not associated with a company",
            });
        }

        if (!Number.isInteger(employeeId) || employeeId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID",
            });
        }

        const range = req.query.range || "today";
        const { startDate, endDate } = req.query;

        // ---------------------------------------------
        // Verify employee belongs to the logged-in company
        // ---------------------------------------------

        const employees = await queryRows(
            `
            SELECT employee_id, user_id, company_id
            FROM employees
            WHERE employee_id = ?
              AND company_id = ?
            LIMIT 1
            `,
            [employeeId, companyId]
        );

        if (!employees.length) {
            return res.status(404).json({
                success: false,
                message: "Employee not found in your company",
            });
        }

        const employee = employees[0];

        // If the logged-in user is an employee, restrict
        // the report to that employee's own account.
        if (
            req.user.role === "employee" &&
            Number(req.user.id) !== Number(employee.user_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You cannot view another employee's report",
            });
        }

        const leadDate = getDateFilter(
            range,
            startDate,
            endDate,
            "l.created_at"
        );

        const followupDate = getDateFilter(
            range,
            startDate,
            endDate,
            "f.created_at"
        );

        // Employee-created leads use users.id.
        // Manager-assigned leads use employees.employee_id.
        // Employee-created leads use employees.employee_id.
        // Assigned leads also use employees.employee_id.
        const employeeLeadScope = `
            (
                l.assigned_employee_id = ?
                OR (
                    l.assigned_employee_id IS NULL
                    AND l.created_by_type = 'employee'
                    AND l.created_by_id = ?
                )
            )
        `;

        const employeeLeadParams = [
            employee.employee_id,
            employee.employee_id,
        ];
        // ---------------------------------------------
        // Lead totals
        // ---------------------------------------------

        const leadCounts = await queryRows(
            `
            SELECT
                COUNT(*) AS totalLeads,

                COALESCE(
                    SUM(LOWER(TRIM(l.lead_status)) = 'converted'),
                    0
                ) AS convertedLeads,

                COALESCE(
                    SUM(
                        LOWER(TRIM(COALESCE(l.lead_status, '')))
                        <> 'converted'
                    ),
                    0
                ) AS pendingLeads

            FROM leads l

            WHERE l.company_id = ?
              AND ${employeeLeadScope}
              AND ${leadDate.sql}
            `,
            [
                companyId,
                ...employeeLeadParams,
                ...leadDate.params,
            ]
        );

        // ---------------------------------------------
        // Actual follow-up activities by this employee
        // ---------------------------------------------

        const followupCounts = await queryRows(
            `
            SELECT COUNT(DISTINCT f.lead_id) AS totalFollowups
            FROM follow_ups f

            INNER JOIN leads l
                ON l.id = f.lead_id

            WHERE f.employee_id = ?
              AND l.company_id = ?
              AND ${followupDate.sql}
            `,
            [
                employee.employee_id,
                companyId,
                ...followupDate.params,
            ]
        );

        // ---------------------------------------------
        // Lead status chart
        // ---------------------------------------------

        const statusChart = await queryRows(
            `
            SELECT
                COALESCE(l.lead_status, 'unknown') AS lead_status,
                COUNT(*) AS total

            FROM leads l

            WHERE l.company_id = ?
              AND ${employeeLeadScope}
              AND ${leadDate.sql}

            GROUP BY l.lead_status
            ORDER BY total DESC
            `,
            [
                companyId,
                ...employeeLeadParams,
                ...leadDate.params,
            ]
        );

        // ---------------------------------------------
        // Lead creation trend
        // ---------------------------------------------

        const trendChart = await queryRows(
            `
            SELECT
                DATE(l.created_at) AS date,
                COUNT(*) AS total

            FROM leads l

            WHERE l.company_id = ?
              AND ${employeeLeadScope}
              AND ${leadDate.sql}

            GROUP BY DATE(l.created_at)
            ORDER BY DATE(l.created_at)
            `,
            [
                companyId,
                ...employeeLeadParams,
                ...leadDate.params,
            ]
        );

        const totals = leadCounts[0];

        const totalLeads = Number(totals.totalLeads || 0);
        const convertedLeads = Number(totals.convertedLeads || 0);

        const conversionRate = totalLeads > 0
            ? Number(((convertedLeads / totalLeads) * 100).toFixed(2))
            : 0;

        return res.json({
            totalLeads,
            totalFollowups: Number(
                followupCounts[0].totalFollowups || 0
            ),
            convertedLeads,
            pendingLeads: Number(totals.pendingLeads || 0),
            conversionRate,
            statusChart,
            trendChart,
        });
    } catch (error) {
        console.error("GET EMPLOYEE REPORT ERROR:", error);

        const isValidationError =
            /date|required|future|invalid report date range/i.test(
                error.message
            );

        return res.status(isValidationError ? 400 : 500).json({
            success: false,
            message: isValidationError
                ? error.message
                : "Failed to generate employee report",
        });
    }
};

module.exports = {
    getCompanyReport,
    getEmployeeReport,
};