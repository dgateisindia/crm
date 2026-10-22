
const {
  getAuth,
  createClerkClient
} = require("@clerk/express");

const db = require("../db");

// =====================================================
// CLERK CLIENT
// =====================================================

const clerkClient = createClerkClient({
  secretKey:
    process.env.CLERK_SECRET_KEY,

  publishableKey:
    process.env.CLERK_PUBLISHABLE_KEY
});

// =====================================================
// SUBSCRIPTION ENTITLEMENT HELPER
// =====================================================

const checkSaasEntitlement = async (companyId) => {
  const allowedId = Number(process.env.INTERNAL_COMPANY_ID);
  if (!Number.isSafeInteger(allowedId) || allowedId < 1 || Number(companyId) !== allowedId) {
    return { accessMode: "blocked", reason: "not_internal_company" };
  }
  const [rows] = await db.promise().query(
    "SELECT id, name, status FROM companies WHERE id = ? LIMIT 1", [allowedId]
  );
  if (rows.length !== 1 || rows[0].status !== "active" || rows[0].name !== "D-GATE Integrated Services") {
    return { accessMode: "blocked", reason: "internal_company_inactive_or_mismatch" };
  }
  return { accessMode: "full", reason: "internal_dgate_company" };
};

// =====================================================
// SUBSCRIPTION ERROR RESPONSE
// =====================================================

const handleEntitlementError = (
  error,
  res
) => {

  if (error.status === 503) {
    return res.status(503).json({
      success: false,
      message: error.message
    });
  }

  console.error(
    "SAAS ENTITLEMENT ERROR:",
    error
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to verify subscription"
  });
};

// =====================================================
// SUBSCRIPTION ACCESS ENFORCEMENT
// =====================================================

const enforceSubscriptionAccess = (
  entitlement,
  res
) => {

  // Active subscription or trial
  if (entitlement.accessMode === "full") {
    return true;
  }

  // Expired subscription
  // Allow authentication for read-only access
  if (entitlement.accessMode === "read_only") {
    return true;
  }

  // Cancelled, suspended, or unapproved
  res.status(403).json({
    success: false,

    code: "SUBSCRIPTION_BLOCKED",

    accessMode: "blocked",

    message:
      "CRM subscription access is not available"
  });

  return false;
};

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const requireAuth = (
  req,
  res,
  next
) => {

  try {

    // ===============================================
    // STEP 1: VERIFY CLERK AUTHENTICATION
    // ===============================================

    const auth = getAuth(req);
    console.log("D-GATE AUTH CHECK:", {
  hasBearerToken:
    req.headers.authorization?.startsWith("Bearer ") === true,

  authenticated: auth.isAuthenticated === true,

  hasClerkUserId: Boolean(auth.userId),

  internalCompanyIdConfigured:
    Number(process.env.INTERNAL_COMPANY_ID) === 1,

  requestOrigin: req.headers.origin
});

    if (
      !auth.isAuthenticated ||
      !auth.userId
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const clerkUserId = auth.userId;

    // ===============================================
    // STEP 2: FIND EXISTING CRM USER
    // ===============================================

    const sql = `
      SELECT
        id,
        clerk_user_id,
        company_id,
        name,
        email,
        role,
        status

      FROM users

      WHERE clerk_user_id = ?

      LIMIT 1
    `;

    db.query(
      sql,
      [clerkUserId],

      async (err, results) => {

        try {

          // =========================================
          // DATABASE ERROR
          // =========================================

          if (err) {
            console.error(
              "AUTH USER LOOKUP ERROR:",
              err
            );

            return res.status(500).json({
              success: false,

              message:
                "Authentication lookup failed"
            });
          }

          // =========================================
          // STEP 3: FIRST-TIME CRM EMPLOYEE
          // =========================================

          if (!results.length) {

            // Only this route may complete
            // first-time employee linking.

            if (req.path !== "/current-user") {
              return res.status(403).json({
                success: false,

                message:
                  "CRM user account not found"
              });
            }

            try {

              // -------------------------------------
              // Get authenticated Clerk user
              // -------------------------------------

              const clerkUser =
                await clerkClient.users.getUser(
                  clerkUserId
                );

              // -------------------------------------
              // Read trusted Clerk public metadata
              // -------------------------------------

              const publicMetadata =
                clerkUser.publicMetadata || {};

              const crmCompanyId =
                Number(
                  publicMetadata.crmCompanyId
                );

              const crmEmployeeId =
                Number(
                  publicMetadata.crmEmployeeId
                );

              const crmRole =
                publicMetadata.crmRole;

              // -------------------------------------

              // -------------------------------------
              // Recover a verified accepted invitation
              // when Google sign-in did not transfer
              // invitation metadata to the Clerk user.
              // -------------------------------------

              let resolvedCompanyId = crmCompanyId;
              let resolvedEmployeeId = crmEmployeeId;
              let resolvedRole = crmRole;

              const metadataMissing =
                publicMetadata.crmCompanyId == null &&
                publicMetadata.crmEmployeeId == null &&
                publicMetadata.crmRole == null;

              if (metadataMissing) {
                const primaryEmail =
                  (clerkUser.emailAddresses || []).find(
                    address =>
                      address.id ===
                        clerkUser.primaryEmailAddressId &&
                      address.verification?.status === "verified"
                  );

                if (!primaryEmail) {
                  return res.status(403).json({
                    success: false,
                    message: "Verified employee email required"
                  });
                }

                const normalizedEmail =
                  primaryEmail.emailAddress.trim().toLowerCase();

                const internalCompanyId =
                  Number(process.env.INTERNAL_COMPANY_ID);

                if (
                  !Number.isSafeInteger(internalCompanyId) ||
                  internalCompanyId < 1
                ) {
                  return res.status(503).json({
                    success: false,
                    message: "Internal CRM company is not configured"
                  });
                }

                const [pendingEmployees] =
                  await db.promise().query(
                    `SELECT
                       e.employee_id,
                       e.company_id,
                       e.clerk_invitation_id
                     FROM employees e
                     INNER JOIN companies c
                       ON c.id = e.company_id
                     WHERE LOWER(TRIM(e.email)) = ?
                       AND e.company_id = ?
                       AND e.status = 'invited'
                       AND e.user_id IS NULL
                       AND c.status = 'active'
                       AND e.clerk_invitation_id IS NOT NULL
                     LIMIT 2`,
                    [normalizedEmail, internalCompanyId]
                  );

                if (pendingEmployees.length !== 1) {
                  return res.status(403).json({
                    success: false,
                    message:
                      "No unique pending employee invitation found"
                  });
                }

                const pending = pendingEmployees[0];

                const response =
                  await clerkClient.invitations.getInvitationList({
                    query: pending.clerk_invitation_id,
                    status: "accepted",
                    limit: 50
                  });

                const invitation =
                  (response.data || []).find(
                    item =>
                      item.id === pending.clerk_invitation_id &&
                      item.status === "accepted"
                  );

                const invitationMetadata =
                  invitation?.publicMetadata || {};

                if (
                  !invitation ||
                  invitation.emailAddress.trim().toLowerCase() !==
                    normalizedEmail ||
                  Number(invitationMetadata.crmCompanyId) !==
                    Number(pending.company_id) ||
                  Number(invitationMetadata.crmEmployeeId) !==
                    Number(pending.employee_id) ||
                  invitationMetadata.crmRole !== "employee"
                ) {
                  return res.status(403).json({
                    success: false,
                    message:
                      "Accepted employee invitation could not be verified"
                  });
                }

                resolvedCompanyId = Number(pending.company_id);
                resolvedEmployeeId = Number(pending.employee_id);
                resolvedRole = "employee";
              }

              // Validate invitation metadata
              // -------------------------------------

              if (
                resolvedRole !== "employee" ||
                !Number.isSafeInteger(resolvedCompanyId) ||
                resolvedCompanyId <= 0 ||
                !Number.isSafeInteger(resolvedEmployeeId) ||
                resolvedEmployeeId <= 0
              ) {
                return res.status(403).json({
                  success: false,

                  message:
                    "CRM employee metadata not found"
                });
              }

              // -------------------------------------
              // Verify employee record and company
              // -------------------------------------

              const [employeeRows] =
                await db.promise().query(
                  `
                  SELECT
                    e.employee_id,
                    e.email,
                    e.status,
                    e.user_id,

                    c.status AS company_status

                  FROM employees e

                  INNER JOIN companies c
                    ON c.id = e.company_id

                  WHERE e.employee_id = ?
                    AND e.company_id = ?

                  LIMIT 1
                  `,
                  [
                    resolvedEmployeeId,
                    resolvedCompanyId
                  ]
                );

              const employeeRecord =
                employeeRows[0];

              // -------------------------------------
              // Verify Clerk primary email
              // -------------------------------------

              const verifiedEmail =
                (
                  clerkUser.emailAddresses || []
                ).find(
                  (address) =>
                    address.id ===
                      clerkUser.primaryEmailAddressId &&
                    address.verification?.status ===
                      "verified"
                );

              if (
                !employeeRecord ||
                employeeRecord.user_id !== null ||
                ![
                  "invited",
                  "active"
                ].includes(employeeRecord.status) ||
                employeeRecord.company_status !==
                  "active" ||
                !verifiedEmail ||
                verifiedEmail.emailAddress
                  .trim()
                  .toLowerCase() !==
                  String(employeeRecord.email)
                    .trim()
                    .toLowerCase()
              ) {
                return res.status(403).json({
                  success: false,

                  message:
                    "Employee invitation verification failed"
                });
              }

              // -------------------------------------
              // Verify SaaS subscription
              // -------------------------------------

              let entitlement;

              try {
                entitlement =
                  await checkSaasEntitlement(resolvedCompanyId);

              } catch (error) {
                return handleEntitlementError(
                  error,
                  res
                );
              }

              if (
                !enforceSubscriptionAccess(
                  entitlement,
                  res
                )
              ) {
                return;
              }

              // -------------------------------------
              // Get verified Clerk name
              // -------------------------------------

              const clerkName = [
                clerkUser.firstName,
                clerkUser.lastName
              ]
                .filter(Boolean)
                .join(" ")
                .trim() || null;

              // -------------------------------------
              // Pass verified employee to controller
              // -------------------------------------

              req.user = {
                id: null,

                clerkUserId:
                  clerkUserId,

                companyId: resolvedCompanyId,

                employeeId: resolvedEmployeeId,

                name:
                  clerkName,

                email:
                  verifiedEmail.emailAddress,

                role:
                  "employee",

                accessMode:
                  entitlement.accessMode,

                subscriptionReason:
                  entitlement.reason
              };

              return next();

            } catch (error) {

              console.error(
                "FIRST-TIME CLERK USER ERROR:",
                error
              );

              return res.status(500).json({
                success: false,

                message:
                  "Unable to resolve Clerk employee"
              });
            }
          }

          // =========================================
          // STEP 4: EXISTING CRM USER
          // =========================================

          const user = results[0];

          // -----------------------------------------
          // Verify CRM account
          // -----------------------------------------

          if (user.status !== "active") {
            return res.status(403).json({
              success: false,

              message:
                "CRM account is not active"
            });
          }

          // -----------------------------------------
          // Verify company assignment
          // -----------------------------------------

          if (!user.company_id) {
            return res.status(403).json({
              success: false,

              message:
                "CRM company is not assigned"
            });
          }

          // -----------------------------------------
          // Verify CRM company status
          // -----------------------------------------

          const [companyRows] =
            await db.promise().query(
              `
              SELECT status
              FROM companies
              WHERE id = ?
              LIMIT 1
              `,
              [user.company_id]
            );

          if (
            companyRows.length !== 1 ||
            companyRows[0].status !== "active"
          ) {
            return res.status(403).json({
              success: false,

              message:
                "CRM company is not active"
            });
          }

          // =========================================
          // STEP 5: NORMALIZE ROLE
          // =========================================

          let role = user.role;

          if (role === "owner") {
            role = "manager";
          }

          // =========================================
          // STEP 6: VERIFY SAAS ENTITLEMENT
          // =========================================

          let entitlement;

          try {
            entitlement =
              await checkSaasEntitlement(
                user.company_id
              );

          } catch (error) {
            return handleEntitlementError(
              error,
              res
            );
          }

          if (
            !enforceSubscriptionAccess(
              entitlement,
              res
            )
          ) {
            return;
          }

          // =========================================
          // STEP 7: SET AUTHENTICATED CRM USER
          // =========================================

          req.user = {
            id:
              user.id,

            clerkUserId:
              user.clerk_user_id,

            companyId:
              user.company_id,

            name:
              user.name,

            email:
              user.email,

            role:
              role,

            accessMode:
              entitlement.accessMode,

            subscriptionReason:
              entitlement.reason
          };

          // =========================================
          // STEP 8: CONTINUE
          // =========================================

          return next();

        } catch (error) {

          console.error(
            "AUTH MIDDLEWARE INNER ERROR:",
            error
          );

          return res.status(500).json({
            success: false,
            message: "Authentication error"
          });
        }
      }
    );

  } catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  requireAuth
};
