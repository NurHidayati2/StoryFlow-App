import CONFIG from "../utils/config.js";
import { getToken } from "./auth.js";

const BASE = CONFIG.BASE_URL;
export const ENDPOINTS = {
  REGISTER: `${BASE}/register`,
  LOGIN: `${BASE}/login`,
  STORIES: `${BASE}/stories`,
  STORIES_GUEST: `${BASE}/stories/guest`,
  STORY: (id) => `${BASE}/stories/${id}`,
};

export async function getStories({ page = 1, size = 20, location = 1 } = {}) {
  const token = getToken();
  const url = new URL(ENDPOINTS.STORIES);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  url.searchParams.set("location", String(location));

  try {
    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (!resp.ok || data.error) {
      throw new Error(data.message || `GET /stories gagal (${resp.status})`);
    }
    console.log("Berhasil mengambil data dari API", data.listStory);
    return data.listStory || [];
  } catch (err) {
    console.error("Gagal mengambil data dari API, coba ambil dari cache:", err);
    // Coba ambil data dari cache jika fetch gagal
    return caches.match(url.toString()).then((cachedData) => {
      return cachedData ? cachedData : []; // Kembalikan data cache atau array kosong
    });
  }
}

export async function getStoryDetail(id) {
  const resp = await fetch(ENDPOINTS.STORY(id), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error)
    throw new Error(data.message || "Gagal ambil detail");
  return data.story;
}

export async function addStory({ description, file, lat, lng }) {
  const fd = new FormData();
  fd.append("description", description || "");
  if (file) fd.append("photo", file);
  if (lat != null) fd.append("lat", lat);
  if (lng != null) fd.append("lon", lng);

  try {
    const response = await fetch("https://story-api.dicoding.dev/v1/stories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: fd,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Gagal mengirim data.");

    console.log("Story berhasil dikirim:", data);
    return data;
  } catch (err) {
    console.error("❌ Gagal mengirim data:", err);
  }
}

export async function addStoryGuest({ description, file, lat, lng }) {
  const fd = new FormData();
  fd.append("description", description || "");
  if (file) fd.append("photo", file);
  if (lat != null) fd.append("lat", lat);
  if (lng != null) fd.append("lon", lng);

  const resp = await fetch(ENDPOINTS.STORIES_GUEST, {
    method: "POST",
    body: fd,
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error)
    throw new Error(data.message || "Upload (guest) gagal");
  return data;
}

// =========================
// 🔔 Push Notification API
// =========================
export async function sendTestNotification(payload = {}) {
  const resp = await fetch(`${BASE}/push/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      title: payload.title || "New Story!",
      message: payload.message || "A story has been added.",
      icon: payload.icon || "/images/logo.png",
      url: payload.url || "/",
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error)
    throw new Error(data.message || "Gagal kirim notifikasi");
  return data;
}

export async function getReportById(id) {
  const resp = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`);
  const data = await resp.json();
  if (!resp.ok || data.error) throw new Error(data.message || "Gagal ambil detail");
  return data.story || data;
}
