import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "storyFlow-cache-v1";
const IMAGE_CACHE_NAME = "storyFlow-image-cache-v1";
const urlsToCache = [
  "/", 
  "/index.html",
  "/logo.png",
  "/app.css",
  "/manifest.json",
  "/app.bundle.js"
];

// ==============================
// 🔹 INSTALL EVENT
// ==============================
self.addEventListener("install", (event) => {
  console.log("🛠️ Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.error("Error caching assets during install:", err);
      });
    })
  );
});

// ==============================
// 🔹 ACTIVATE EVENT
// ==============================
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activated!");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
  );
  self.clients.claim();
});

// ==============================
// 🔹 FETCH EVENT (Offline Support + Image Runtime Cache)
// ==============================

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Jika request gambar dari CDN/Story API (mungkin photoUrl pada story)
  if (
    event.request.destination === "image" &&
    event.request.url.match(/https:\/\/story-api\.dicoding\.dev/)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => caches.match("/logo.png")); // fallback logo jika offline dan belum dicache
        })
      )
    );
    return;
  }

  // Untuk asset statis dan SPA fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") {
            return caches.match("/index.html").then((indexHtml) => {
              if (indexHtml) return indexHtml;
              return new Response("<h2>Offline & cache unavailable</h2>", {
                headers: { "Content-Type": "text/html" },
                status: 503,
                statusText: "Service Unavailable",
              });
            });
          }
          return new Response("Offline content unavailable", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});

// ==============================
// 🔹 PUSH NOTIFICATION
// ==============================
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "New Notification", message: event.data.text() };
  }

  const title = data.title || "New Story Available!";
  const options = {
    body: data.message || "Check out the latest story!",
    icon: "./logo.png",
    badge: "./logo.png",
    vibrate: [200, 100, 200],
    actions: [
      { action: "open", title: "Lihat Detail" },
      { action: "close", title: "Tutup" },
    ],
    data: {
      url: data.url || "/#/home",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ==============================
// 🔹 NOTIFICATION CLICK
// ==============================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes("#/home") && "focus" in client)
          return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/#/home");
    })
  );
});

// ==============================
// 🔹 Pesan dari halaman
// ==============================
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "NEW_STORY") {
    const { title, description, icon } = event.data.payload;
    self.registration.showNotification(title, {
      body: description,
      icon: icon || "./logo.png",
      badge: "./logo.png",
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Lihat Story" },
        { action: "close", title: "Tutup" },
      ],
      data: { url: "/#/home" },
    });
  }
});
