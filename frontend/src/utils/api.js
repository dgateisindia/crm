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
  if (clerkTokenGetter) {
    const token = await clerkTokenGetter();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
