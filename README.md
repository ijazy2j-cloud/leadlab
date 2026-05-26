# LeadLab

An internal web app that helps HSBC leaders practise the How We Lead framework in their day to day work.

## Getting started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Install dependencies

```bash
npm run install:all
```

### Set up the database

```bash
npm run db:setup
```

This runs the Prisma migration and seeds the database with the six leadership principles, activities, and four demo users.

### Switch database for local dev (SQLite)

The schema uses PostgreSQL for DHP deployment. For local development without PostgreSQL installed, switch to SQLite first:

```bash
npm --prefix backend run db:use-sqlite
```

This regenerates the Prisma client for SQLite and updates `DATABASE_URL` in `backend/.env`. You only need to run this once (or again after `db:use-postgresql`).

To switch back to PostgreSQL (e.g. before deploying or testing against a local PG instance):

```bash
npm --prefix backend run db:use-postgresql
```

### Run the dev server

```bash
npm run dev
```

This starts both the backend (port 4000) and frontend (port 5173) concurrently. Open http://localhost:5173 in your browser.

## Production-like run (local)

To test the full production bundle locally:

```bash
npm run build          # Builds React into backend/public
npm --prefix backend run start   # Starts Express serving the static files on port 4000
```

Open http://localhost:4000 in your browser.

## Resetting the database

```bash
npm --prefix backend run db:reset
npm --prefix backend run db:seed
```

## Project structure

```
leadlab/
  backend/              Express API (ES modules), Prisma, PostgreSQL
  frontend/             React app with Vite and Tailwind
  local-modules/        Skeleton for HSBC IT config module (see TODOs below)
  dhp-config.json       DHP deployment config skeleton (see TODOs below)
  build.sh              DHP build script skeleton (see TODOs below)
  node_options          Node runtime options for DHP
```

## Run modes

| Mode | Command | Frontend served by | Database |
|------|---------|-------------------|----------|
| Dev | `npm run dev` | Vite on port 5173 | Local (see .env) |
| Production-like | `npm run build && npm --prefix backend run start` | Express on port 4000 | Injected by DHP |

## DHP deployment

Push to the internal Bitbucket repository. DHP builds via `restabuild` using `build.sh`.

The backend listens on port 8080 in production (set `PORT=8080` or let DHP inject it). After startup, the server self-tests `/health` and exits with code 1 if it does not return 200.

Auth in production uses the `dps-jwt-token` cookie verified against the DPS login public key. The mock auth middleware (`auth.js`) is used in development only; it reads `x-user-id` from headers.

## Demo users

| Name | Role | Team |
|------|------|------|
| Ravindu Silva | Operations Lead | Colombo |
| Priya Wickramasinghe | Customer Service Manager | Colombo |
| Tom Harper | Regional Director | London |
| Aisha Khan | Product Lead | Singapore |

---

## DHP TODO list — must be resolved before first deployment

The following items require input from HSBC IT before LeadLab can be deployed to DHP.

| # | File | TODO |
|---|------|------|
| 1 | `local-modules/config.mjs` | Replace skeleton with official IT template. Expected exports: `efxEnv`, `envSettings` (database config for pgmaker). |
| 2 | `backend/src/middleware/auth-production.js` | Import `efxEnv` from `local-modules/config.mjs` once template is received (currently hardcoded to `"uat"`). |
| 3 | `backend/src/middleware/auth-production.js` | Install `@hsbc/hsbc-cert` (HSBC internal npm package) when available on DHP. |
| 4 | `backend/src/server.mjs` | Switch `import { auth }` from `auth.js` to `auth-production.js` when deploying to DHP. |
| 5 | `dhp-config.json` | Replace skeleton with actual DHP cluster/region config once template is received from IT. |
| 6 | `build.sh` | Replace skeleton with actual DHP build script once template is received from IT. Confirm whether additional steps (asset copying, env file generation) are needed. |
| 7 | `node_options` | Confirm with IT what flags DHP expects (current skeleton sets `--max-old-space-size=2048`). |
| 8 | `backend/src/server.mjs` (`stash-url`) | Replace `"TODO: replace with internal Bitbucket URL once repo is created"` in the `/health` response with the actual Bitbucket URL. |
| 9 | `backend/.env` | `DATABASE_URL` is a placeholder. On DHP this is injected via `local-modules/config.mjs`. Confirm pgmaker connection string format with IT. |
| 10 | `package.json` (root) | DHP may require specific script names. Confirm `"build"` is the correct entry point with IT. |
