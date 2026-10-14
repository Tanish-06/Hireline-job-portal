import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send the httpOnly auth cookie with every request
});

// Resume links are stored as "/uploads/xyz.pdf". In production the backend is on another domain.
export const fileUrl = (path) => {
  if (!path) return "";
  const base = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).origin : "";
  return base + path;
};

// Turns any axios error into a readable message
export const getErrorMessage = (err) =>
  err.response?.data?.message || err.message || "Something went wrong";

export default api;
