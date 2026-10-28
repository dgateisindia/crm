import axios from "axios";
import { CRM_API_URL } from "../config/urls";

const api = axios.create({
  baseURL: CRM_API_URL,
});


let clerkTokenGetter = null;

export function setClerkTokenGetter(getter) {
  clerkTokenGetter = getter;
}

api.interceptors.request.use(async (config) => {
  const existingAuthorization =
    config.headers?.get?.("Authorization") ??
    config.headers?.Authorization ??
    config.headers?.authorization;

  if (!existingAuthorization && clerkTokenGetter) {
    const token = await clerkTokenGetter();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});

export default api;
