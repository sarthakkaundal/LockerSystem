const API_BASE = import.meta.env.VITE_API_URL ?? "";

const TOKEN_KEY = "locker_token";
const USER_KEY = "locker_user";

/** Called when an authenticated request returns 401 (e.g. expired JWT). */
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

function handleUnauthorizedIfNeeded(path, status, hadToken) {
  if (status !== 401 || !hadToken) return;
  if (String(path).includes("/api/auth/login")) return;
  clearSession();
  onUnauthorized?.();
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function persistSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authHeaders() {
  const token = getStoredToken();
  const h = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function api(path, options = {}) {
  const token = getStoredToken();
  const headers = { ...options.headers };
  const body = options.body;
  const isJson =
    body != null &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob);
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: isJson ? JSON.stringify(body) : body,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || "Invalid response" };
  }

  if (!res.ok) {
    handleUnauthorizedIfNeeded(path, res.status, Boolean(token));
    const err = new Error(data?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function apiText(path, options = {}) {
  const token = getStoredToken();
  const headers = { ...options.headers, ...authHeaders() };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    handleUnauthorizedIfNeeded(path, res.status, Boolean(token));
    const err = new Error(text || res.statusText || "Request failed");
    err.status = res.status;
    throw err;
  }
  return text;
}
