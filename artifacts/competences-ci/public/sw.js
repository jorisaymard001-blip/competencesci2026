// ── Compétences CI — Service Worker ──────────────────────────────────────────
const STATIC_CACHE = "competences-ci-static-v4";
const API_CACHE    = "competences-ci-api-v2";
const IMG_CACHE    = "competences-ci-img-v1";

// Assets to precache on install (shell)
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.png",
];

// ── INSTALL ───────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {})
    )
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const CURRENT = [STATIC_CACHE, API_CACHE, IMG_CACHE];
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => !CURRENT.includes(k)).map((k) => caches.delete(k)))
      ),
    ])
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") return;

  // ── API calls: network-first, fallback to cache ───────────────────────────
  if (url.pathname.includes("/api/")) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          const response = await fetch(request.clone());
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: "Hors ligne — données non disponibles" }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        }
      })
    );
    return;
  }

  // ── Images: cache-first ───────────────────────────────────────────────────
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached ?? new Response("", { status: 408 });
        }
      })
    );
    return;
  }

  // ── Navigation: network-first, fallback to /index.html ───────────────────
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          caches.open(STATIC_CACHE).then((c) => c.put(request, response.clone())).catch(() => {});
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/index.html");
          return fallback ?? new Response("<h1>Hors ligne</h1>", { headers: { "Content-Type": "text/html" } });
        })
    );
    return;
  }

  // ── Static assets (JS, CSS, fonts): stale-while-revalidate ───────────────
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => null);
        return cached ?? await networkFetch ?? new Response("", { status: 408 });
      })
    );
  }
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "Compétences CI", body: "Nouveau message reçu", icon: "/icon-192x192.png" };
  try { data = { ...data, ...event.data?.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon ?? "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: data.tag ?? "competences-ci",
      data,
      actions: [
        { action: "open", title: "Ouvrir" },
        { action: "dismiss", title: "Ignorer" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const focused = clients.find((c) => c.focus);
        if (focused) return focused.focus();
        return self.clients.openWindow(event.notification.data?.url ?? "/");
      })
  );
});
