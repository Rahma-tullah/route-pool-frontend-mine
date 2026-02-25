const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = {
  signup: (data) =>
    fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  sendOTP: (email) =>
    fetch(`${API_BASE_URL}/api/auth/send-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).then((r) => r.json()),

  verifyOTP: (email, otp) =>
    fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    }).then((r) => r.json()),

  logout: () =>
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then((r) => r.json()),

  createDelivery: (data) =>
    fetch(`${API_BASE_URL}/api/deliveries`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  getDeliveries: () =>
    fetch(`${API_BASE_URL}/api/deliveries`, {
      credentials: "include",
    }).then((r) => r.json()),

  getBatches: () =>
    fetch(`${API_BASE_URL}/api/batches`, {
      credentials: "include",
    }).then((r) => r.json()),
};
