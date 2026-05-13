import { Navigate }
from "react-router-dom";

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

  // Not logged in
  if (!token) {
    return (
      <Navigate to="/" />
    );
  }

  // Only manager access
  if (
    role !== "manager"
  ) {
    return (
      <Navigate to="/" />
    );
  }

  return children;
}