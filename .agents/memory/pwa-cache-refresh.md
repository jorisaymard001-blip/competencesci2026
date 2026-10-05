---
name: PWA cache refresh
description: Cache invalidation for updated app-shell styles and scripts.
---

The service worker returns cached static assets before its background refresh completes. Increment the static shell cache version when changing app-shell CSS or JavaScript so clients stop receiving the old UI.

**Why:** An already controlled preview continued showing old styles after edits and a workflow restart until the previous static cache was invalidated.

**How to apply:** For app-shell asset changes, advance the static cache version and preserve API, image, and notification-preference caches unless those data caches also need invalidation.
