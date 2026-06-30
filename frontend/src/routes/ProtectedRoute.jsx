import {
  Navigate,
  useLocation,
} from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  // No token → 401 page
  if (!token) {
    return <Navigate to="/401" replace />;
  }

  // Employee trying manager page → 403 page
  if (
    location.pathname.startsWith("/manager") &&
    role !== "manager"
  ) {
    return <Navigate to="/403" replace />;
  }

  // Manager trying employee page → 403 page
  if (
    location.pathname.startsWith("/employee") &&
    role !== "employee"
  ) {
    return <Navigate to="/403" replace />;
  }

  return children;
}