
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
  clerkMiddleware,
  getAuth,
  createClerkClient
} = require("@clerk/express");

const {
  requireAuth
} = require("./middleware/authMiddleware");

// =====================================================
// EXPRESS APPLICATION
// =====================================================

if (process.env.INTERNAL_CRM_MODE !== "true") {
  throw new Error("INTERNAL_CRM_MODE=true is required for this independent CRM build");
}
const app = express();

// =====================================================
// DATABASE
// =====================================================

const db = require("./db");

// =====================================================
// ROUTES
// =====================================================

const clerkWebhookRoutes = require(
  "./routes/clerkWebhookRoutes"
);

const authRoutes = require(
  "./routes/authRoutes"
);

const companyRoutes = require(
  "./routes/companyRoutes"
);

const employeeRoutes = require(
  "./routes/employeeRoutes"
);

const leadRoutes = require(
  "./routes/leadRoutes"
);

const dashboardRoutes = require(
  "./routes/dashboardRoutes"
);

const managerRoutes = require(
  "./routes/managerRoutes"
);

const uploadRoutes = require(
  "./routes/uploadRoutes"
);

const followupRoutes = require(
  "./routes/followupRoutes"
);

const reportsRoutes = require(
  "./routes/reportsRoutes"
);

const taskRoutes = require(
  "./routes/taskRoutes"
);

const adminPlanRoutes = require(
  "./routes/adminPlanRoutes"
);

// =====================================================
// CLERK MIDDLEWARE
// =====================================================

app.use(clerkMiddleware());

const clerkClient = createClerkClient({
  secretKey:
    process.env.CLERK_SECRET_KEY,

  publishableKey:
    process.env.CLERK_PUBLISHABLE_KEY
});

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = (
  process.env.CRM_ALLOWED_ORIGINS ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      console.log(
        "CORS blocked origin:",
        origin
      );

      return callback(
        new Error(
          "Origin not allowed by CORS"
        )
      );
    },

    credentials: true
  })
);

// =====================================================
// STATIC UPLOADS
// =====================================================

// Uploaded spreadsheets are private temporary files.
// Never expose them through a public static route.
app.use("/uploads", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Not found"
  });
});

// =====================================================
// CLERK WEBHOOK
// =====================================================
// Must remain before express.json().
// The webhook needs the raw request body.
// =====================================================

app.use(
  "/api/webhooks",
  clerkWebhookRoutes
);

// =====================================================
// JSON BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// INTERNAL SAAS PROVISIONING BRIDGE
// =====================================================
// Uses separate server-to-server authentication.
// Do not apply customer subscription middleware.
// =====================================================

// SaaS provisioning bridge disabled in internal-only CRM.

// =====================================================
// SUBSCRIPTION WRITE PROTECTION
// =====================================================
// This runs after requireAuth.
//
// full:
//   Normal role-based CRM access.
//
// read_only:
//   No data-changing API requests.
//
// blocked:
//   No CRM access.
//
// Existing role and tenant protections must still
// run inside each route/controller.
// =====================================================

const requireSubscriptionWriteAccess = (
  req,
  res,
  next
) => {

  const accessMode =
    req.user?.accessMode;

  // ---------------------------------------
  // Require verified subscription context
  // ---------------------------------------

  if (
    ![
      "full",
      "read_only",
      "blocked"
    ].includes(accessMode)
  ) {
    return res.status(403).json({
      success: false,

      code:
        "SUBSCRIPTION_CONTEXT_MISSING",

      message:
        "CRM subscription access could not be verified"
    });
  }

  // ---------------------------------------
  // Block suspended/inactive subscriptions
  // ---------------------------------------

  if (accessMode === "blocked") {
    return res.status(403).json({
      success: false,

      code: "SUBSCRIPTION_BLOCKED",

      message:
        "CRM subscription access is not available"
    });
  }

  // ---------------------------------------
  // Normal active subscriptions
  // ---------------------------------------

  if (accessMode === "full") {
    return next();
  }

  // =====================================================
// READ-ONLY CRM ENDPOINT ALLOWLIST
// =====================================================
// Paths here are relative to their mounted router.
// Only existing, verified viewing endpoints
// should be permitted after subscription expiry.

const readOnlyRoutes = {
  "/api/employee": [
    /^\/all$/,
    /^\/profile\/\d+$/,
    /^\/stats\/\d+$/,
    /^\/notes\/\d+$/,
    /^\/me$/,
    /^\/\d+$/
  ],

  "/api/leads": [
    /^\/all$/,
    /^\/assignment-employees$/,
    /^\/employee\/\d+$/,
    /^\/employee\/\d+\/all$/,
    /^\/employee\/\d+\/important$/,
    /^\/employee\/\d+\/converted$/,
    /^\/employee\/\d+\/not-interested$/,
    /^\/important$/,
    /^\/converted$/,
    /^\/not-interested$/,
    /^\/export-filters$/,
    /^\/export$/,
    /^\/\d+$/
  ],

  "/api/dashboard": [
    /^\/stats$/,
    /^\/lead-status$/,
    /^\/employee-performance$/,
    /^\/lead-trend$/,
    /^\/manager\/not-responded$/,
    /^\/employee\/\d+\/lead-status$/,
    /^\/employee\/\d+\/lead-trend$/,
    /^\/employee\/\d+\/followup-chart$/,
    /^\/employee\/\d+\/welcome$/,
    /^\/employee\/\d+\/not-responded$/,
    /^\/employee\/\d+$/
  ],

  "/api/followups": [
    /^\/all$/,
    /^\/employee\/\d+$/,
    /^\/lead\/\d+$/,
    /^\/lead-history\/\d+$/
  ],

  "/api/managers": [
    /^\/profile\/\d+$/,
    /^\/all$/
  ],

  "/api/tasks": [
    /^\/employee\/\d+$/,
    /^\/followups\/\d+$/
  ],

  "/api/reports": [
    /^\/company$/,
    /^\/employee\/\d+$/
  ]
};

// =====================================================
// VERIFY EXPLICIT READ-ONLY ENDPOINTS
// =====================================================

const requestPath =
  new URL(
    req.originalUrl,
    "http://localhost"
  ).pathname;

const allowedReadOnlyRequest =
  req.method === "GET" &&
  Object.entries(readOnlyRoutes).some(
    ([basePath, patterns]) => {

      if (
        requestPath !== basePath &&
        !requestPath.startsWith(basePath + "/")
      ) {
        return false;
      }

      const relativePath =
        requestPath.slice(basePath.length) || "/";

      return patterns.some(
        (pattern) => pattern.test(relativePath)
      );
    }
  );

if (!allowedReadOnlyRequest) {
    return res.status(403).json({
      success: false,

      code:
        "SUBSCRIPTION_READ_ONLY",

      accessMode: "read_only",

      message:
        "Your subscription has expired. Editing and importing are disabled. Renew to restore full access."
    });
  }

  // ---------------------------------------
  // GET/HEAD requests
  // ---------------------------------------
  // These are permitted by this middleware
  // only when read-only mode is enabled
  // in a later step.
  //
  // We must audit individual GET handlers
  // for side effects before activation.
  // ---------------------------------------

  return next();
};

// =====================================================
// CUSTOMER BUSINESS API MIDDLEWARE
// =====================================================
// Authenticate first, then enforce subscription
// restrictions, then execute the existing router.
// =====================================================

const protectCrmData = [
  requireAuth,
  requireSubscriptionWriteAccess
];

// =====================================================
// ADMIN PLAN ROUTES
// =====================================================
// Existing administrative authorization stays
// inside adminPlanRoutes.
// This route must be audited separately.
// =====================================================

// SaaS plan administration disabled in internal-only CRM.

// =====================================================
// AUTHENTICATION ROUTES
// =====================================================
// Keep these outside protectCrmData because
// first-time account linking uses this router.
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// COMPANY REGISTRATION
// =====================================================

app.use(
  "/api/companies",
  companyRoutes
);

// =====================================================
// EMPLOYEE ROUTES
// =====================================================

app.use(
  "/api/employee",
  ...protectCrmData,
  employeeRoutes
);

// =====================================================
// LEAD ROUTES
// =====================================================

app.use(
  "/api/leads",
  ...protectCrmData,
  leadRoutes
);

// =====================================================
// EXCEL UPLOAD ROUTES
// =====================================================
// Both upload-preview and upload are POST.
//
// In read-only mode they will be blocked
// before Multer processes the uploaded file.
// =====================================================

app.use(
  "/api/leads",
  ...protectCrmData,
  uploadRoutes
);

// =====================================================
// DASHBOARD ROUTES
// =====================================================

app.use(
  "/api/dashboard",
  ...protectCrmData,
  dashboardRoutes
);

// =====================================================
// FOLLOW-UP ROUTES
// =====================================================

app.use(
  "/api/followups",
  ...protectCrmData,
  followupRoutes
);

// =====================================================
// MANAGER ROUTES
// =====================================================

app.use(
  "/api/managers",
  ...protectCrmData,
  managerRoutes
);

// =====================================================
// TASK ROUTES
// =====================================================

app.use(
  "/api/tasks",
  ...protectCrmData,
  taskRoutes
);

// =====================================================
// REPORT ROUTES
// =====================================================

app.use(
  "/api/reports",
  ...protectCrmData,
  reportsRoutes
);

// =====================================================
// BASIC SERVER TEST
// =====================================================

app.get(
  "/",
  (req, res) => {
    res.send(
      "Backend Running Successfully"
    );
  }
);

// =====================================================
// DATABASE TEST
// =====================================================

app.get(
  "/api/test-db",
  (req, res) => {
    db.query(
      "SELECT * FROM employee_roles",

      (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,

            message:
              "Database Error",

            error
          });
        }

        return res.status(200).json({
          success: true,

          message:
            "Database Connected Successfully",

          data: result
        });
      }
    );
  }
);

// =====================================================
// CLERK AUTHENTICATION TEST
// =====================================================

app.get(
  "/api/clerk-test",

  async (req, res) => {
    try {
      const auth = getAuth(req);

      console.log(
        "\n========== CLERK AUTH TEST =========="
      );

      console.log(
        "Token type:",
        auth.tokenType
      );

      console.log(
        "Authenticated:",
        auth.isAuthenticated
      );

      console.log(
        "User ID:",
        auth.userId
      );

      console.log(
        "Session ID:",
        auth.sessionId
      );

      console.log(
        "=====================================\n"
      );

      if (!auth.isAuthenticated) {
        return res.status(401).json({
          success: false,

          message:
            "Clerk authentication failed",

          tokenType:
            auth.tokenType || null,

          isAuthenticated:
            auth.isAuthenticated,

          userId:
            auth.userId || null,

          sessionId:
            auth.sessionId || null
        });
      }

      const user =
        await clerkClient.users.getUser(
          auth.userId
        );

      return res.status(200).json({
        success: true,

        message:
          "Clerk backend authentication working",

        clerkUserId:
          auth.userId,

        email:
          user.emailAddresses?.[0]
            ?.emailAddress || null
      });

    } catch (error) {
      console.error(
        "CLERK TEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Clerk test error",

        error:
          error.message
      });
    }
  }
);

// =====================================================
// TENANT TEST
// =====================================================

app.get(
  "/api/tenant-test",

  requireAuth,

  (req, res) => {
    return res.status(200).json({
      success: true,

      message:
        "Tenant context successfully resolved",

      user: req.user
    });
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,

  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);
