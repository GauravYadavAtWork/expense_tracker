import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export async function registerUser(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data.data;
}

export async function loginUser(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data.data;
}

export async function getProfile() {
  const { data } = await api.get("/auth/me");
  return data.data;
}

export async function getExpenses(params) {
  const { data } = await api.get("/expenses", { params });
  return data.data;
}

export async function createExpense(payload) {
  const { data } = await api.post("/expenses", payload);
  return data.data;
}
