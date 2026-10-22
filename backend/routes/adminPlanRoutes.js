const express = require("express");
const { getAuth } = require("@clerk/express");
const db = require("../db");

const router = express.Router();

// =====================================================
// PLATFORM ADMIN AUTHORIZATION
// =====================================================

// Add authorized Clerk user IDs to your backend .env:
//
// SAAS_ADMIN_CLERK_USER_IDS=user_id_1,user_id_2
//
// This is separate from normal CRM company roles.
// A normal CRM Manager must not automatically receive
// access to platform-wide pricing administration.

function requirePlatformAdmin(req, res, next) {
    try {
        const auth = getAuth(req);

        if (!auth || !auth.isAuthenticated || !auth.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const allowedAdmins = (
            process.env.SAAS_ADMIN_CLERK_USER_IDS || ""
        )
            .split(",")
            .map(id => id.trim())
            .filter(Boolean);

           
        if (
            allowedAdmins.length === 0 ||
            !allowedAdmins.includes(auth.userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Platform administrator access required."
            });
        }

        req.platformAdminId = auth.userId;

        next();
    } catch (error) {
        console.error("Platform admin authorization error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify administrator access."
        });
    }
}

// All endpoints in this router require platform admin access.
router.use(requirePlatformAdmin);

// =====================================================
// HELPERS
// =====================================================

function query(sql, values = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, results) => {
            if (error) {
                return reject(error);
            }

            resolve(results);
        });
    });
}

function validatePlan(body) {
    const name = String(body.name ?? "").trim();
    const description =
        body.description == null
            ? null
            : String(body.description).trim();

    const price = Number(body.price);
    const trialDays = Number(body.trial_days);
    const billingInterval = body.billing_interval;

    if (!name || name.length > 100) {
        return "Plan name is required and must not exceed 100 characters.";
    }

    if (
        body.price === undefined ||
        body.price === null ||
        body.price === "" ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 99999999.99
    ) {
        return "Enter a valid non-negative price.";
    }

    if (!["monthly", "yearly"].includes(billingInterval)) {
        return "Billing interval must be monthly or yearly.";
    }

    if (
        !Number.isInteger(trialDays) ||
        trialDays < 0 ||
        trialDays > 365
    ) {
        return "Trial duration must be between 0 and 365 days.";
    }

    if (description !== null && description.length > 10000) {
        return "Plan description is too long.";
    }

    if (
        body.is_active !== undefined &&
        ![true, false, 0, 1].includes(body.is_active)
    ) {
        return "is_active must be true or false.";
    }

    return null;
}

function normalizePlan(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        billing_interval: row.billing_interval,
        trial_days: row.trial_days,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at
    };
}

// =====================================================
// GET /api/admin/plans
// Fetch every pricing option.
// =====================================================

router.get("/", async (req, res) => {
    try {
        const rows = await query(`
            SELECT
                id,
                name,
                description,
                price,
                billing_interval,
                trial_days,
                is_active,
                created_at,
                updated_at
            FROM plans
            ORDER BY
                billing_interval ASC,
                price ASC,
                id ASC
        `);

        return res.status(200).json({
            success: true,
            data: rows.map(normalizePlan)
        });
    } catch (error) {
        console.error("Fetch plans error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch pricing plans."
        });
    }
});

// =====================================================
// GET /api/admin/plans/:id
// Fetch one pricing option.
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID."
            });
        }

        const rows = await query(
            `
                SELECT
                    id,
                    name,
                    description,
                    price,
                    billing_interval,
                    trial_days,
                    is_active,
                    created_at,
                    updated_at
                FROM plans
                WHERE id = ?
                LIMIT 1
            `,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Pricing plan not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: normalizePlan(rows[0])
        });
    } catch (error) {
        console.error("Fetch individual plan error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch pricing plan."
        });
    }
});

// =====================================================
// POST /api/admin/plans
// Create a pricing option.
// =====================================================

router.post("/", async (req, res) => {
    try {
        const validationError = validatePlan(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const {
            name,
            description = null,
            price,
            billing_interval,
            trial_days,
            is_active = true
        } = req.body;

        const result = await query(
            `
                INSERT INTO plans (
                    name,
                    description,
                    price,
                    billing_interval,
                    trial_days,
                    is_active
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                String(name).trim(),
                description == null
                    ? null
                    : String(description).trim(),
                Number(price),
                billing_interval,
                Number(trial_days),
                is_active === true || is_active === 1 ? 1 : 0
            ]
        );

        const rows = await query(
            `
                SELECT
                    id,
                    name,
                    description,
                    price,
                    billing_interval,
                    trial_days,
                    is_active,
                    created_at,
                    updated_at
                FROM plans
                WHERE id = ?
                LIMIT 1
            `,
            [result.insertId]
        );

        return res.status(201).json({
            success: true,
            message: "Pricing option created successfully.",
            data: normalizePlan(rows[0])
        });
    } catch (error) {
        console.error("Create plan error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create pricing option."
        });
    }
});

// =====================================================
// PUT /api/admin/plans/:id
// Update a pricing option.
// =====================================================

router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID."
            });
        }

        const validationError = validatePlan(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const {
            name,
            description = null,
            price,
            billing_interval,
            trial_days,
            is_active = true
        } = req.body;

        const result = await query(
            `
                UPDATE plans
                SET
                    name = ?,
                    description = ?,
                    price = ?,
                    billing_interval = ?,
                    trial_days = ?,
                    is_active = ?
                WHERE id = ?
            `,
            [
                String(name).trim(),
                description == null
                    ? null
                    : String(description).trim(),
                Number(price),
                billing_interval,
                Number(trial_days),
                is_active === true || is_active === 1 ? 1 : 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            const existing = await query(
                "SELECT id FROM plans WHERE id = ? LIMIT 1",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Pricing plan not found."
                });
            }
        }

        const rows = await query(
            `
                SELECT
                    id,
                    name,
                    description,
                    price,
                    billing_interval,
                    trial_days,
                    is_active,
                    created_at,
                    updated_at
                FROM plans
                WHERE id = ?
                LIMIT 1
            `,
            [id]
        );

        return res.status(200).json({
            success: true,
            message: "Pricing option updated successfully.",
            data: normalizePlan(rows[0])
        });
    } catch (error) {
        console.error("Update plan error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update pricing option."
        });
    }
});

// =====================================================
// PATCH /api/admin/plans/:id/status
// Activate or deactivate a plan without deleting it.
// =====================================================

router.patch("/:id/status", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { is_active } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan ID."
            });
        }

        if (![true, false, 0, 1].includes(is_active)) {
            return res.status(400).json({
                success: false,
                message: "is_active must be true or false."
            });
        }

        const result = await query(
            `
                UPDATE plans
                SET is_active = ?
                WHERE id = ?
            `,
            [
                is_active === true || is_active === 1 ? 1 : 0,
                id
            ]
        );

        if (result.affectedRows === 0) {
            const existing = await query(
                "SELECT id FROM plans WHERE id = ? LIMIT 1",
                [id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Pricing plan not found."
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Pricing plan status updated successfully."
        });
    } catch (error) {
        console.error("Update plan status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update pricing plan status."
        });
    }
});

module.exports = router;