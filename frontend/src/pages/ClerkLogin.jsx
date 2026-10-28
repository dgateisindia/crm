
import { SignIn, useAuth, useClerk, useUser } from "@clerk/react";


import "../styles/clerklogin.css";

export default function ClerkLogin() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const goToCRM = () => window.location.replace(`${window.location.origin}/#/auth-redirect`);



  const handleSignOut = async () => {
    await signOut();
    window.location.replace(`${window.location.origin}/sign-in`);
  };

  return (
    <div className="clerk-login-page">
      <section className="clerk-login-brand">
        <div className="clerk-brand-content">
          <div className="clerk-brand-logo">
            <img
              src="/image.png"
              alt="D-GATE CRM Logo"
              className="login-logo"
            />
          </div>

          <p className="clerk-brand-tag">
            CUSTOMER RELATIONSHIP MANAGEMENT
          </p>

          <h1>
            Manage relationships.
            <br />
            Grow your business.
          </h1>

          <p className="clerk-brand-description">
            One place to manage your leads, track follow-ups,
            and build stronger customer relationships.
          </p>

          <div className="clerk-brand-footer">
            D-GATE Internal CRM
          </div>
        </div>
      </section>

      <section className="clerk-login-form-section">
        <div className="clerk-login-form-wrapper">
          <div className="clerk-mobile-brand">
            <span>DGATE</span> CRM
          </div>

          <div className="clerk-login-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>

          {!isLoaded ? (
            <p>Loading secure sign-in...</p>
          ) : isSignedIn ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "24px",
              width: "100%"
            }}>
              <p style={{ color: "#64748b" }}>
                Clerk has an active session for:
              </p>

              <strong style={{
                color: "#071739",
                overflowWrap: "anywhere"
              }}>
                {user?.primaryEmailAddress?.emailAddress ||
                  user?.fullName ||
                  "Signed-in account"}
              </strong>

              <button
                type="button"
                onClick={goToCRM}
                style={{
                  padding: "14px",
                  background: "#071739",
                  color: "#fff",
                  border: 0,
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >
                Continue to CRM
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  padding: "14px",
                  background: "#fff",
                  color: "#071739",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  cursor: "pointer"
                }}
              >
                Sign out / Use another account
              </button>
            </div>
          ) : (
            <SignIn
              routing="path" path="/sign-in"
              forceRedirectUrl={`${window.location.origin}/#/auth-redirect`}
              fallbackRedirectUrl={`${window.location.origin}/#/auth-redirect`}
              appearance={{
                variables: {
                  colorPrimary: "#071739",
                  colorText: "#071739",
                  colorTextSecondary: "#64748b",
                  colorBackground: "#ffffff",
                  colorInputBackground: "#ffffff",
                  colorInputText: "#071739",
                  borderRadius: "10px",
                  fontFamily: "Inter, sans-serif"
                },
                elements: {
                  rootBox: { width: "100%" },
                  card: {
                    width: "100%",
                    boxShadow: "none",
                    border: "none",
                    background: "transparent"
                  },
                  headerTitle: { display: "none" },
                  headerSubtitle: { display: "none" },
                  footer: { background: "transparent" },
                  formButtonPrimary: {
                    backgroundColor: "#071739",
                    color: "#ffffff"
                  },
                  socialButtonsBlockButton: {
                    borderRadius: "10px"
                  }
                }
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

