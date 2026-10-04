import { createRoot } from "react-dom/client";
import App from "./App";
import { apiOrigin } from "./lib/api-url";
import "./index.css";

if (apiOrigin) {
  (window as Window & { __COMPETENCES_CI_API_ORIGIN__?: string }).__COMPETENCES_CI_API_ORIGIN__ = apiOrigin;
}

// ── Service Worker registration ───────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const base = import.meta.env.BASE_URL ?? "/";
    try {
      const registration = await navigator.serviceWorker.register(`${base}sw.js`, {
        scope: base,
      });

      // Check for updates every 60 seconds
      setInterval(() => registration.update().catch(() => {}), 60_000);

      // When a new SW is waiting, show a simple update notification
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New version available — could dispatch a custom event here
            console.info("[SW] Nouvelle version disponible. Rechargez la page.");
          }
        });
      });
    } catch (err) {
      console.warn("[SW] Enregistrement échoué :", err);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
