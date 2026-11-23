# RetryNet migration progress

## Audited

`link.md`, `Task.md`, the frontend, Worker API, SQL migrations, local runtime and Git history were reviewed.

## Working now

- `npm install` installs the WebSocket dependency.
- `npm start` launches the real local SQLite/Worker-compatible API server; `npm run dev` launches the React/Nest development stack.
- SQLite persists accounts, sessions, posts, feed, messages and feature data.
- `ws://host/api/realtime` broadcasts authenticated-client chat events.
- Local media is stored in `data/media/`.
- `npm test`, `npm run lint`, `npm run typecheck` and `npm run db:migrate` are available.
- Cloud deployment remains available through the Worker/D1/R2 adapter.

## Not falsely claimed as complete

The migration is now present as a parallel production stack: `apps/web` (React/Vite), `apps/api` (NestJS/Drizzle/PostgreSQL), shared contracts, Docker infrastructure and a PostgreSQL migration. The legacy Worker/SQLite mode is intentionally preserved for backward-compatible local and Cloudflare operation. Remaining link.md features such as calls, marketplace and media S3 wiring require their dedicated modules and are not marked complete merely because the base stack builds.

## Migration checks

- `npm run build` — React, NestJS and Worker build pass.
- `npm run typecheck` — API TypeScript and legacy runtime checks pass.
- `npm run test:stack` — API schema test and legacy smoke test pass.
- `apps/api/drizzle/0000_initial.sql` — PostgreSQL tables, foreign keys and indexes.
