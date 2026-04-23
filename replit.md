# Workspace — Compétences CI

## Overview

pnpm workspace monorepo using TypeScript. Mobile web app for Côte d'Ivoire to find schools and public service competitions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS + React Query + Framer Motion
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── competences-ci/     # React mobile web app (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # DB seed script (40 schools, 15 competitions)
└── ...
```

## App Features

- **Authentication**: Sign up, log in, log out (SHA256+salt, localStorage, users in DB)
- **40 schools**: 20 public + 20 private across Abidjan, Bouaké, Daloa, Korhogo, Yamoussoukro, etc.
- **15 competitions**: Concours de la fonction publique ivoirienne with statuses (open/closed/upcoming)
- **Filters**: By city, diploma level, school type
- **Detail pages**: Full school info + costs + star ratings + reviews; full competition info + practical docs/steps/conditions
- **Favorites**: Save schools/competitions per user (localStorage)
- **Mes candidatures**: Track application status (en cours/inscrit/admis/refusé) per user (localStorage)
- **Trouver ma voie**: 5-step orientation quiz recommending schools + competitions
- **Conseils & Orientation**: 4 articles (choisir filière, après bac, réussir concours, filières demandées)
- **Notifications**: Bell icon with unread badge, swipe left=delete / swipe right=save, saved tab, mark-all-read
- **Messaging**: Contact form → sends email to competencesci2004@gmail.com via nodemailer
- **i18n**: Full FR/EN language switching via useT() hook + translations object
- **Dark mode**: Toggle with CSS variables on .dark class on <html>
- **Mode hors ligne**: Service worker caches API responses (schools/competitions)
- **Profile**: Avatar picker, search history, usage stats, all tools accessible
- **Push notifications**: Service worker registered, browser Notification API permission requested
- **Mobile-first**: Optimized for mobile with bottom nav (4 tabs), max-w-md layout

## Database Schema

- `users` table: id, name, email, password_hash, created_at
- `schools` table: id, name, type (public/private), city, address, phone, website, email, description, diplomas[], domains[], accreditation, founded
- `competitions` table: id, title, ministry, city, diploma, status (open/closed/upcoming), openDate, closeDate, positions, description, requirements[], process[], contact, website
- `messages` table: id, name, email, subject, message, created_at

## API Endpoints

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login
- `GET /api/schools?city=&type=&diploma=` — list schools
- `GET /api/schools/:id` — school detail
- `GET /api/competitions?city=&diploma=&status=` — list competitions
- `GET /api/competitions/:id` — competition detail
- `GET /api/cities` — all cities
- `GET /api/diplomas` — all diploma levels
- `POST /api/messages` — send message

## Seeding

Run `pnpm --filter @workspace/scripts run seed` to re-seed all 40 schools and 15 competitions.

## Password Hashing

Passwords are hashed with SHA-256 + application salt via Node.js built-in `crypto` module.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes

## i18n & UI updates (April 2026)

- `src/lib/i18n.ts` — full FR/EN dictionary covering nav, sidebar, hamburger drawer, theme/lang toggles, schools, competitions, conseils, candidatures, orientation, login/register, favorites, common.
- `src/components/Layout.tsx` — restored hamburger menu (mobile/tablet only, on the left when no back arrow). Opens a slide-in drawer (`x:-100%` spring) sharing `SidebarContent` with the desktop sidebar. Drawer locks body scroll, closes on backdrop tap or X. All labels use `t()`.
- `src/components/InAppNotificationToast.tsx` — floating top-of-screen toast shown 1.2 s after open if `unreadCount > 0`, 30 min cooldown via `cci_inapp_toast_last`, auto-dismiss after 8 s, hidden on `/notifications`. Works without browser permission so users always see pending alerts.
