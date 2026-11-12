/* global process */

export const BACKEND_URL = (
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://chat-nova-bk.onrender.com"
).replace(/\/+$/, "");

export const COLORS = {
  background: "#11111c",
  surface: "#1d1b2e",
  surfaceLight: "#29263e",
  accent: "#8b5cf6",
  accentLight: "#a78bfa",
  text: "#f4f3f8",
  muted: "#a6a4b5",
  border: "#39364b",
  online: "#34d399",
  incoming: "#29263e",
};
