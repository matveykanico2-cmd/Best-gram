# RetryNet migration progress

## Audited

`link.md`, `Task.md`, the frontend, Worker API, SQL migrations, local runtime and Git history were reviewed.

## Working now

- `npm install` installs the WebSocket dependency.
- `npm run dev` / `npm start` launches the real local API server.
- SQLite persists accounts, sessions, posts, feed, messages and feature data.
- `ws://host/api/realtime` broadcasts authenticated-client chat events.
- Local media is stored in `data/media/`.
- `npm test`, `npm run lint`, `npm run typecheck` and `npm run db:migrate` are available.
- Cloud deployment remains available through the Worker/D1/R2 adapter.

## Not falsely claimed as complete

The requirements in `link.md` specifically demand a React 19/Vite/TypeScript frontend, NestJS backend, PostgreSQL/Drizzle and Socket.IO. The existing product is a single-file frontend plus a Cloudflare Worker API, and its verified local runtime is Node + SQLite + WebSocket. Those are compatible deployment modes but not the same architecture. A full React/Nest/PostgreSQL rewrite must be performed as a separate migration while preserving the current database and production behavior; this repository does not claim that rewrite is complete.
