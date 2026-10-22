export const CRM_API_URL =
  (import.meta.env.VITE_API_URL || "/api")
    .replace(/\/$/, "");

export const SAAS_LOGIN_URL = "/#/clerk-login";

export const CRM_APP_URL =
  window.location.origin;
