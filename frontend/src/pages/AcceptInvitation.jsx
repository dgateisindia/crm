
import { SignUp } from "@clerk/react";
import "../styles/clerklogin.css";

export default function AcceptInvitation() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        background: "#f5f6f9"
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "480px"
        }}
      >
        <h1
          style={{
            color: "#071739",
            fontSize: "25px",
            fontWeight: 750,
            marginBottom: "12px"
          }}
        >
          D-GATE Employee Invitation
        </h1>

        <p style={{ marginBottom: "20px" }}>
          Complete your invitation to access the internal CRM.
        </p>

        <SignUp
          routing="virtual"
          forceRedirectUrl="/auth-redirect"
          fallbackRedirectUrl="/auth-redirect"
        />
      </section>
    </main>
  );
}
