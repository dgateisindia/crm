import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
