import React from "react";

export default function CrmAccessError({
  status = 500,
  message
}) {
  const isConflict = status === 409;
  const isServerError = status >= 500;

  const title = isConflict
    ? "CRM account linking conflict"
    : isServerError
      ? "CRM service temporarily unavailable"
      : "Unable to verify CRM access";

  const description = message ||
    (isConflict
      ? "This Google account needs administrator review."
      : "Your CRM access could not be verified. Please try again.");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        fontFamily: "Arial, sans-serif"
      }}
    >
      <section style={{ maxWidth: 480, textAlign: "center" }}>
        <h1>{title}</h1>
        <p>{description}</p>
        <p>HTTP status: {status}</p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </section>
    </main>
  );
}