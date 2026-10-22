
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
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

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <HashRouter>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      <ClerkTokenBridge>
        <App />
      </ClerkTokenBridge>
    </ClerkProvider>
  </HashRouter>
);
