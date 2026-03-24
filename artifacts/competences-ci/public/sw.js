const CACHE_NAME = "competences-ci-v2";
const API_CACHE = "competences-ci-api-v1";

const STATIC_URLS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_URLS).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
            .map((k) => caches.delete(k))
        )
      ),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Cache API responses (schools and competitions) for offline use
  if (url.pathname.includes("/api/schools") || url.pathname.includes("/api/competitions")) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          const response = await fetch(event.request.clone());
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          const cached = await cache.match(event.request);
          if (cached) return cached;
          return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
        }
      })
    );
    return;
  }

  // For navigation requests, serve from cache if offline
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html").then((r) => r || fetch(event.request))
      )
    );
    return;
  }

  // Static assets: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok && event.request.method === "GET") {
            caches.open(CACHE_NAME).then((c) => c.put(event.request, response.clone())).catch(() => {});
          }
          return response;
        }).catch(() => cached || new Response("Offline", { status: 503 }));
      })
    );
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  let data = { title: "Compétences CI", body: "Nouveau message reçu", icon: "/favicon.ico" };
  try {
    data = event.data?.json() ?? data;
  } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag ?? "competences-ci",
      data: data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow("/");
    })
  );
});
