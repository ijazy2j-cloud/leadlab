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
npm run db:schema   # Creates tables
npm run db:seed     # Seeds principles, activities, and demo users
```

### Run the dev server

```bash
npm run dev
```

This starts both the backend (port 4000) and frontend (port 5173) concurrently. Open http://localhost:5173 in your browser.

The app loads directly to the dashboard — no login screen. In local dev, the backend mock middleware defaults to **Ravindu Silva** (the first seeded user) if no `x-user-id` header is present.

## Testing as a different user (local dev only)

To see the app as a different demo user, set the `x-user-id` header on your requests. The easiest way is to install a browser extension like ModHeader and add:

```
x-user-id: 2   # Priya Wickramasinghe
x-user-id: 3   # Tom Harper
x-user-id: 4   # Aisha Khan
```

Remove the header (or set it back to `1`) to return to Ravindu Silva.

## Production-like run (local)

To test the full production bundle locally:

```bash
npm run build      # Builds React into /static
npm start          # Starts Express serving the static files on port 4000
```

Open http://localhost:4000 in your browser.

## Authentication

**Production:** Auth is handled by HSBC SSO at the network layer. The backend validates the SSO session via `middleware/auth-production.js`. No login screen is presented to the user — SSO handles identity before the request reaches LeadLab.

**Local dev:** The mock middleware (`middleware/auth.js`) reads an optional `x-user-id` header and falls back to Ravindu Silva if no header is present.

**Sign out:** Routes to the SSO logout URL. The URL is currently a placeholder (`/logout`) — IT to provide the production value.

## Project structure

```
leadlab/
  routes/           Thin route files (URL definitions + middleware mounting)
  controllers/      One per resource — request/response, validation, permissions
  services/         One per resource — pure DB operations, no HTTP knowledge
  middleware/       auth, validate, error handlers
  frontend/         React app with Vite and Tailwind
  local-modules/    HSBC IT config module (see TODOs below)
  dhp-config.json   DHP deployment config (see TODOs below)
  build.sh          DHP build script (see TODOs below)
  node_options      Node runtime options for DHP
```

## Demo users

| ID | Name | Role | Team |
|----|------|------|------|
| 1 | Ravindu Silva | Operations Lead | Colombo |
| 2 | Priya Wickramasinghe | Customer Service Manager | Colombo |
| 3 | Tom Harper | Regional Director | London |
| 4 | Aisha Khan | Product Lead | Singapore |

---

## DHP TODO list — must be resolved before first deployment

| # | File | TODO |
|---|------|------|
| 1 | `local-modules/config.mjs` | Replace skeleton with official IT template. Expected exports: `efxEnv`, `envSettings`. |
| 2 | `middleware/auth-production.js` | Import `efxEnv` from `local-modules/config.mjs` once template is received. |
| 3 | `middleware/auth-production.js` | Install `@hsbc/hsbc-cert` when available on DHP. |
| 4 | `server.mjs` | Switch `import { auth }` from `auth.js` to `auth-production.js` when deploying to DHP. |
| 5 | `frontend/src/lib/auth.js` (`LOGOUT_URL`) | Replace `/logout` placeholder with the SSO logout URL provided by IT. |
| 6 | `dhp-config.json` | Replace skeleton with actual DHP cluster/region config from IT. |
| 7 | `build.sh` | Replace skeleton with actual DHP build script from IT. |
| 8 | `server.mjs` (`stash-url`) | Replace `"TODO"` in `/health` response with the actual Bitbucket URL. |
