
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import api from "../utils/api";

export default function AuthRedirect() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [status, setStatus] = useState("loading");

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
        const token = await getToken();

        if (cancelled) return;

        if (!token) {
          setStatus("signed-out");
          return;
        }

        const response = await api.get(
          "/auth/current-user",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (cancelled) return;

        const user = response.data?.user;
        const role = user?.role?.toLowerCase();

        if (role === "manager" || role === "owner") {
          setStatus("manager");
        } else if (role === "employee") {
          setStatus("employee");
        } else {
          setStatus("forbidden");
        }
      } catch (error) {
        if (cancelled) return;

        const httpStatus = error.response?.status;

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
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || status === "loading") {
    return <div>Verifying D-GATE CRM access...</div>;
  }

  if (status === "signed-out") {
    return <Navigate to="/" replace />;
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

  return <Navigate to="/500" replace />;
}
