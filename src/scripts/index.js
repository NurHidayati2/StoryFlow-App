import "leaflet/dist/leaflet.css";
import "../styles/styles.css";
import App from "./pages/app";
import CONFIG from "./utils/config"; // pastikan file config di-import
import { getToken } from "./data/auth.js";

const app = new App({
  navigationDrawer: document.getElementById("navigation-drawer"),
  drawerButton: document.getElementById("drawer-button"),
  content: document.getElementById("main-content"),
});

window.appInstance = app;

// ===============================
// 🔔 PUSH NOTIFICATION SETUP
// ===============================
if ("serviceWorker" in navigator && "PushManager" in window) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      const sub = await reg.pushManager.getSubscription();
      updatePushUI(!!sub);

      const btn = document.getElementById("push-toggle");
      const btnMobile = document.getElementById("push-toggle-mobile");
      if (btn || btnMobile) {
        const handleToggle = async () => {
          const currentSub = await reg.pushManager.getSubscription();

          if (currentSub) {
            // === Unsubscribe ===
            try {
              await deleteSubscription(currentSub); // 🧹 Hapus dari server
              await currentSub.unsubscribe(); // ❌ Hapus dari browser
              updatePushUI(false);
              alert("Push notification disabled!");
            } catch (e) {
              console.error("❌ Error saat unsubscribe:", e);
            }
          } else {
            // === Subscribe ===
            const vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
            const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

            const newSub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedKey,
            });

            console.log("Subscribed:", newSub);
            await saveSubscription(newSub);
            updatePushUI(true);
            alert("Push notification enabled!");
          }
        };

        btn?.addEventListener("click", handleToggle);
        btnMobile?.addEventListener("click", handleToggle);
      }
    } catch (err) {
      console.error("❌ Service Worker registration failed:", err);
    }
  });
}

// Helper ubah Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updatePushUI(isSubscribed) {
  const btn = document.getElementById("push-toggle");
  const btnMobile = document.getElementById("push-toggle-mobile");

  const text = isSubscribed ? "🔕 Unsubscribe" : "💌 Subscribe";

  if (btn) btn.textContent = text;
  if (btnMobile) btnMobile.textContent = text;
}

async function saveSubscription(subscription) {
  try {
    const token = getToken();
    if (!token) {
      console.warn(
        "❗ Tidak ada token login, push hanya bisa dilakukan untuk user login."
      );
      return;
    }

    const cleanSub = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    };

    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanSub),
    });

    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.message);

  } catch (e) {
    console.error("❌ Failed to save subscription:", e);
  }
}

async function deleteSubscription(subscription) {
  try {
    const token = getToken();
    if (!token) {
      console.warn(
        "❗ Tidak ada token login, tidak bisa unsubscribe di server."
      );
      return;
    }

    const cleanSub = {
      endpoint: subscription.endpoint,
    };

    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cleanSub),
    });

    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.message);

    console.log("✅ Unsubscribed from server:", data);
  } catch (e) {
    console.error("❌ Failed to delete subscription:", e);
  }
}

// ===============================
// 🧩 View Transition Helper
// ===============================
export function withViewTransition(callback) {
  // Jika browser mendukung View Transition API
  if (document.startViewTransition) {
    return document.startViewTransition(() => {
      try {
        callback();
      } catch (err) {
        console.error("Transition callback error:", err);
      }
    });
  }

  // Jika tidak didukung, jalankan biasa
  return callback();
}

// ===============================
// 🔔 Local Push (Client-side Notification)
// ===============================
export async function showLocalNotification(title, body) {
  console.log("🔔 Menjalankan showLocalNotification:", title, body);

  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker tidak tersedia.");
    return;
  }

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    console.warn("❌ Service Worker belum terdaftar.");
    return;
  }

  if (Notification.permission === "granted") {
    console.log("✅ Notifikasi diizinkan, menampilkan...");
    reg.showNotification(title, {
      body,
      icon: "/logo.png",
      badge: "/logo.png",
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Lihat Detail" },
        { action: "close", title: "Tutup" },
      ],
    });
  } else {
    console.warn(
      "🚫 Izin notifikasi belum diberikan:",
      Notification.permission
    );
  }
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Menambahkan tombol install di desktop view
  const installBtn = document.getElementById("install-storyflow");
  installBtn.style.display = "inline-block"; // Pastikan tombol muncul

  installBtn.addEventListener("click", async () => {
    // Menyembunyikan tombol setelah di-click
    installBtn.style.display = "none";

    // Menampilkan prompt instalasi
    deferredPrompt.prompt();
    
    const choiceResult = await deferredPrompt.userChoice;

    // Reset deferredPrompt untuk digunakan lagi jika diperlukan
    deferredPrompt = null;
  });
});
