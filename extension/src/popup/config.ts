const raw = import.meta.env.VITE_SITE_URL;
export const SITE_URL =
  raw && raw.startsWith("http") ? raw : "http://localhost:3000";
