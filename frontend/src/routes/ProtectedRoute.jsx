import {
  Navigate,
  useLocation,
} from "react-router-dom";

export default function ProtectedRoute({
  children,
}) {

  const token =
    localStorage.getItem(
      "token"
    );

  const role =
    localStorage.getItem(
      "role"
    );

  const location =
    useLocation();

  // No token → login
  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // Employee trying manager page
  if (
    location.pathname.startsWith(
      "/manager"
    ) &&
    role !== "manager"
  ) {
    return (
      <Navigate
        to="/employee/dashboard"
        replace
      />
    );
  }

  // Manager trying employee page
  if (
    location.pathname.startsWith(
      "/employee"
    ) &&
    role !== "employee"
  ) {
    return (
      <Navigate
        to="/manager/dashboard"
        replace
      />
    );
  }

  return children;
}