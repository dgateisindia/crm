import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "@clerk/react";

import api from "../utils/api";
import CrmAccessError from "../components/CrmAccessError";


import {
  SubscriptionProvider
} from "../context/SubscriptionContext";


export default function ProtectedRoute({ children }) {

  const location = useLocation();

  const { isLoaded, isSignedIn, getToken } = useAuth();


  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


  // ==========================================
  // LOAD CURRENT CRM USER
  // ==========================================

  useEffect(() => {

    let cancelled = false;


    const loadCurrentUser = async () => {

      // ----------------------------------------
      // Wait until Clerk finishes loading
      // ----------------------------------------

      if (!isLoaded) {
        return;
      }


      // ----------------------------------------
      // User is not signed into Clerk
      // ----------------------------------------

      if (!isSignedIn) {

        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }

        return;
      }


      // ----------------------------------------
      // Get CRM user from backend
      // ----------------------------------------

      try {

        setLoading(true);
        setError(null);


        const token = await getToken();

        if (!token) {
          throw new Error("CLERK_SESSION_TOKEN_MISSING");
        }

        const response = await api.get(
          "/auth/current-user",
          {
            headers: {
              Authorization: "Bearer " + token
            }
          }
        );


        if (!cancelled) {

          setUser(
            response.data?.user || null
          );

        }

      } catch (err) {

        console.error(
          "PROTECTED ROUTE ERROR:",
          err
        );


        if (!cancelled) {

          setUser(null);

          setError(
            err.response?.status || 500
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    };


    loadCurrentUser();


    return () => {
      cancelled = true;
    };

  }, [isLoaded, isSignedIn, getToken]);


  // ==========================================
  // CLERK STILL LOADING
  // ==========================================

  if (!isLoaded) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading...
      </div>
    );

  }


  // ==========================================
  // NOT SIGNED IN
  // ==========================================

      if (!isSignedIn) {
      return (
        <Navigate
          to="/clerk-login" replace
        />
      );
    }
    


  // ==========================================
  // CRM USER LOOKUP IN PROGRESS
  // ==========================================

  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading CRM...
      </div>
    );

  }


  // ==========================================
  // AUTHENTICATED CLERK USER BUT NO CRM USER
  // ==========================================

  if (!user) {

    if (error === 401) {

      return (
        <Navigate
          to="/401"
          replace
        />
      );

    }


    if (error === 403) {

      return (
        <Navigate
          to="/403"
          replace
        />
      );

    }


    return <CrmAccessError status={error || 500} />;

  }


  // ==========================================
  // ROLE
  // ==========================================

  const role =
    user.role?.toLowerCase();


  // ==========================================
  // MANAGER / OWNER → MANAGER ROUTES
  // ==========================================

  if (
    location.pathname.startsWith("/manager") &&
    role !== "manager" &&
    role !== "owner"
  ) {

    return (
      <Navigate
        to="/403"
        replace
      />
    );

  }


  // ==========================================
  // EMPLOYEE → EMPLOYEE ROUTES
  // ==========================================

  if (
    location.pathname.startsWith("/employee") &&
    role !== "employee"
  ) {

    return (
      <Navigate
        to="/403"
        replace
      />
    );

  }
// ==========================================
// READ-ONLY ROUTE PROTECTION
// ==========================================

// ==========================================
// READ-ONLY ROUTE PROTECTION
// ==========================================

const readOnlyRoutes = [
  // Manager Leads
  /^\/manager\/add-leads$/,
  /^\/manager\/edit-lead\/[^/]+$/,

  // Employee Leads
  /^\/employee\/add-leads$/,
  /^\/employee\/edit-lead\/[^/]+$/,

  // Manager Employee Management
  /^\/manager\/create-employee$/,
  /^\/manager\/edit-employee\/[^/]+$/,

  // Manager Creation
  /^\/manager\/create-manager$/
];

const isReadOnlyRoute = readOnlyRoutes.some(
  (pattern) => pattern.test(location.pathname)
);

if (
  user.accessMode === "read_only" &&
  isReadOnlyRoute
) {
  const redirectPath =
    role === "employee"
      ? "/employee/my-leads"
      : "/manager/leads";

  return (
    <Navigate
      to={redirectPath}
      replace
    />
  );
}

 // ==========================================
// AUTHORIZED
// ==========================================

return (
  <SubscriptionProvider
    value={{
      accessMode:
        user.accessMode || "blocked",

      subscriptionReason:
        user.subscriptionReason || null,

      isReadOnly:
        user.accessMode === "read_only",

      canWrite:
        user.accessMode === "full"
    }}
  >
    {children}
  </SubscriptionProvider>
);
}