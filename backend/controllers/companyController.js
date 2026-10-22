const db = require("../db");
const { createClerkClient, getAuth } = require("@clerk/express");
const crypto = require("crypto");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

// =====================================================
// REGISTER COMPANY AND MANAGER
// Uses the already-authenticated Clerk user.
// Does NOT create or delete a Clerk account.
// =====================================================

const registerCompany = async (req, res) => {
  let connection = null;
  let transactionStarted = false;

  try {
    // -------------------------------------------------
    // 1. Verify Clerk authentication
    // -------------------------------------------------

    const auth = getAuth(req);

    if (!auth.isAuthenticated || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email and sign in before registering.",
      });
    }

    const clerkUserId = auth.userId;

    // -------------------------------------------------
    // 2. Validate registration input
    // -------------------------------------------------

    const {
      companyName,
      managerName,
      email,
      planType,
    } = req.body;

    if (!companyName || !managerName || !email || !planType) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, manager name, email, and plan are required.",
      });
    }

    if (
      typeof companyName !== "string" ||
      typeof managerName !== "string" ||
      typeof email !== "string" ||
      companyName.trim().length === 0 ||
      companyName.trim().length > 255 ||
      managerName.trim().length === 0 ||
      managerName.trim().length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !["trial", "monthly", "yearly"].includes(planType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid registration details.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCompanyName = companyName.trim();
    const normalizedManagerName = managerName.trim();

    // -------------------------------------------------
    // 3. Verify the Clerk user's email
    // -------------------------------------------------

    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const verifiedEmail = (clerkUser.emailAddresses || []).find(
      (address) =>
        address.id === clerkUser.primaryEmailAddressId &&
        address.verification?.status === "verified"
    );

    if (
      !verifiedEmail ||
      verifiedEmail.emailAddress.toLowerCase() !== normalizedEmail
    ) {
      return res.status(403).json({
        success: false,
        message:
          "The authenticated Clerk account must have this verified email address.",
      });
    }

    // -------------------------------------------------
    // 4. Select the plan
    // -------------------------------------------------

    let planId;
    let amount;

    if (planType === "monthly") {
      planId = 1;
      amount = 999;
    } else if (planType === "yearly") {
      planId = 2;
      amount = 9999;
    } else {
      planId = 1;
      amount = 0;
    }

    const [plans] = await db.promise().query(
      `SELECT id, price, billing_interval, trial_days
       FROM plans
       WHERE id = ? AND is_active = 1
       LIMIT 1`,
      [planId]
    );

    if (plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The selected plan is unavailable.",
      });
    }

    const plan = plans[0];

    if (planType !== "trial" && Number(plan.price) !== amount) {
      return res.status(400).json({
        success: false,
        message:
          "The selected plan price does not match the configured price.",
      });
    }

    // -------------------------------------------------
    // 5. Prevent duplicate CRM registrations
    // -------------------------------------------------

    const [existingUsers] = await db.promise().query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = ?
          OR clerk_user_id = ?
       LIMIT 1`,
      [normalizedEmail, clerkUserId]
    );

    const [existingManagers] = await db.promise().query(
      `SELECT manager_id
       FROM managers
       WHERE LOWER(email) = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    if (existingUsers.length > 0 || existingManagers.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Please sign in instead.",
      });
    }

    // -------------------------------------------------
    // 6. Begin MySQL transaction
    // -------------------------------------------------

    connection = await db.promise().getConnection();

    await connection.beginTransaction();
    transactionStarted = true;

    // -------------------------------------------------
    // 7. Create company
    // -------------------------------------------------

    const baseSlug = normalizedCompanyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 180);

    const companySlug =
      `${baseSlug || "company"}-${crypto.randomBytes(4).toString("hex")}`;

    const [companyResult] = await connection.query(
      `INSERT INTO companies (name, slug, status)
       VALUES (?, ?, 'active')`,
      [normalizedCompanyName, companySlug]
    );

    const companyId = companyResult.insertId;

    // -------------------------------------------------
    // 8. Create CRM user
    // -------------------------------------------------

    const [userResult] = await connection.query(
      `INSERT INTO users
        (
          clerk_user_id,
          company_id,
          name,
          email,
          password,
          role,
          status
        )
       VALUES (?, ?, ?, ?, NULL, 'manager', 'active')`,
      [
        clerkUserId,
        companyId,
        normalizedManagerName,
        normalizedEmail,
      ]
    );

    const userId = userResult.insertId;

    // -------------------------------------------------
    // 9. Create manager record
    // -------------------------------------------------

    const managerCode =
      `MGR${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    await connection.query(
      `INSERT INTO managers
        (
          company_id,
          user_id,
          manager_code,
          full_name,
          email,
          password,
          designation,
          status
        )
       VALUES (?, ?, ?, ?, ?, NULL, 'Manager', 'active')`,
      [
        companyId,
        userId,
        managerCode,
        normalizedManagerName,
        normalizedEmail,
      ]
    );

    // -------------------------------------------------
    // 10. Create subscription
    // -------------------------------------------------

    let subscriptionStatus;
    let trialStartAt = null;
    let trialEndAt = null;

    if (planType === "trial") {
      subscriptionStatus = "trialing";
      trialStartAt = new Date();

      trialEndAt = new Date(
        Date.now() +
          Number(plan.trial_days || 30) * 24 * 60 * 60 * 1000
      );
    } else {
      subscriptionStatus = "pending_payment";
    }

    await connection.query(
      `INSERT INTO subscriptions
        (
          company_id,
          plan_id,
          status,
          trial_start_at,
          trial_end_at,
          subscription_start_at,
          subscription_end_at
        )
       VALUES (?, ?, ?, ?, ?, NULL, NULL)`,
      [
        companyId,
        planId,
        subscriptionStatus,
        trialStartAt,
        trialEndAt,
      ]
    );

    // -------------------------------------------------
    // 11. Commit transaction
    // -------------------------------------------------

    await connection.commit();
    transactionStarted = false;

    // -------------------------------------------------
    // 12. Return result
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        planType === "trial"
          ? "Company registered. Your free trial has started."
          : "Company registered. Complete payment to activate your subscription.",

      company: {
        id: companyId,
        name: normalizedCompanyName,
        slug: companySlug,
      },

      manager: {
        id: userId,
        name: normalizedManagerName,
        email: normalizedEmail,
        clerkUserId,
      },

      subscription: {
        planType,
        planId,
        amount,
        currency: "INR",
        status: subscriptionStatus,
        trialStartAt,
        trialEndAt,
      },
    });
  } catch (error) {
    console.error("COMPANY REGISTRATION ERROR:", error);

    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("REGISTRATION ROLLBACK ERROR:", rollbackError);
      }
    }

    // Do not delete the Clerk user here.
    // The Clerk account was created by the frontend.

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  registerCompany,
};