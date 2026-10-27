import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ClerkLogin from "./pages/ClerkLogin";
import AcceptInvitation from "./pages/AcceptInvitation";
import "./index.css";
import "./styles/crm-responsive.css";
import { HashRouter } from "react-router-dom";
import { ClerkProvider, useAuth } from "@clerk/react";
import { useLayoutEffect } from "react";
import { setClerkTokenGetter } from "./utils/api";

function ClerkTokenBridge({ children }) {
  const { getToken } = useAuth();
  useLayoutEffect(() => {
    setClerkTokenGetter(getToken);
    return () => setClerkTokenGetter(null);
  }, [getToken]);
  return children;
}

const path = window.location.pathname;
const isSignIn = /^\/sign-in(?:\/|$)/.test(path);
const isInvitation = /^\/accept-invitation(?:\/|$)/.test(path);
const crmRedirect = `${window.location.origin}/#/auth-redirect`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    signInUrl="/sign-in"
    signInForceRedirectUrl={crmRedirect}
    signInFallbackRedirectUrl={crmRedirect}
    signUpForceRedirectUrl={crmRedirect}
    signUpFallbackRedirectUrl={crmRedirect}
  >
    <ClerkTokenBridge>
      {isSignIn ? (
        <ClerkLogin />
      ) : isInvitation ? (
        <AcceptInvitation />
      ) : (
        <HashRouter><App /></HashRouter>
      )}
    </ClerkTokenBridge>
  </ClerkProvider>
);