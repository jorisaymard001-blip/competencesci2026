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

- **Authentication**: Sign up, log in, log out (stored in localStorage, users in DB)
- **40 schools**: 20 public + 20 private, from Abidjan, Bouaké, Daloa, Gagnoa, Korhogo, Man, San-Pédro, Yamoussoukro
- **15 competitions**: Concours de la fonction publique ivoirienne
- **Filters**: By city and diploma level
- **Detail pages**: Full info for each school and competition
- **Favorites**: Save schools/competitions per user (localStorage)
- **Messaging**: Contact form (stored in DB)
- **Mobile-first**: Optimized for mobile with bottom nav, French language

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
