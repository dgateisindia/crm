import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import api from "../utils/api";
import CrmAccessError from "../components/CrmAccessError";

export default function AuthRedirect() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [status, setStatus] = useState("loading");
  const [httpError, setHttpError] = useState(500);

  // Always keep the latest Clerk token getter.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus("signed-out");
      return;
    }

    let cancelled = false;

    async function verifyUser() {
      setStatus("loading");

      try {
        const token = await getTokenRef.current();

        if (cancelled) return;

        if (!token) {
          setStatus("unauthorized");
          return;
        }

        const response = await api.get(
          "/auth/current-user",
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            timeout: 15000
          }
        );

        if (cancelled) return;

        const role =
          response.data?.user?.role?.toLowerCase();

        if (role === "manager" || role === "owner") {
          setStatus("manager");
        } else if (role === "employee") {
          setStatus("employee");
        } else {
          setStatus("forbidden");
        }
      } catch (error) {
        if (cancelled) return;

        console.error(
          "CRM access verification failed:",
          error.response?.status || error.message
        );

        const httpStatus = error.response?.status;
        setHttpError(httpStatus || 503);

        if (httpStatus === 401) {
          setStatus("unauthorized");
        } else if (httpStatus === 403) {
          setStatus("forbidden");
        } else {
          setStatus("error");
        }
      }
    }

    verifyUser();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || status === "loading") {
    return <div>Verifying D-GATE CRM access...</div>;
  }

  if (status === "signed-out") {
    return <Navigate to="/clerk-login" replace />;
  }

  if (status === "manager") {
    return <Navigate to="/manager/dashboard" replace />;
  }

  if (status === "employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (status === "unauthorized") {
    return <Navigate to="/401" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/403" replace />;
  }

  return <CrmAccessError status={httpError} />;
}
