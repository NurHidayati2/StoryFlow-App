import CONFIG from "../utils/config.js";

const KEY_TOKEN = "auth_token";
const KEY_USER = "auth_user";

export function getToken() {
  return localStorage.getItem(KEY_TOKEN) || "";
}
export function isAuthenticated() {
  return Boolean(getToken());
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY_USER) || "{}");
  } catch {
    return {};
  }
}

export async function register({ name, email, password }) {
  const resp = await fetch(`${CONFIG.BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) throw new Error(data.message || "Register gagal");
  return data;
}

export async function login({ email, password }) {
  const resp = await fetch(`${CONFIG.BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) throw new Error(data.message || "Login gagal");

  const token = data?.loginResult?.token;
  const name = data?.loginResult?.name;
  localStorage.setItem(KEY_TOKEN, token || "");
  localStorage.setItem(KEY_USER, JSON.stringify({ email, name }));

  // beri tahu UI
  window.dispatchEvent(
    new CustomEvent("authchange", { detail: { login: true } })
  );
  return data;
}

export function logout() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
  window.dispatchEvent(
    new CustomEvent("authchange", { detail: { login: false } })
  );
}
