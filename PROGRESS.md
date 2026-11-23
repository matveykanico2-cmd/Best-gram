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
- Social API: post ownership edits/deletes, reactions, comments/replies, shares, saves, follows, notifications, blocks and reports.
- Messaging API: authenticated REST access to chat users/history plus Socket.IO compatibility events and call/WebRTC signaling.
- Feature API: communities, community membership, videos, playlists, marketplace listings and media upload/download (25 MB limit and MIME filter).
- Admin API: role-protected stats, user listing and verification actions; global throttling is enabled.

## Remaining acceptance limitations

- Production PostgreSQL, Redis, S3 and TURN must be supplied through deployment environment variables/services; the repository includes Docker Compose and the reproducible SQL migration but cannot verify external infrastructure without those services running.
- WebRTC signaling and call history are implemented; a real two-device media call still needs an operator test with a reachable STUN/TURN service.
- The preserved legacy Worker frontend remains available alongside the new React/Nest stack for backward compatibility.
- `apps/web/src` is now fully `.ts/.tsx`; Vite, React Query, route pages and the client entrypoint no longer use JavaScript/JSX source files.
- New online pages are wired to API-backed routes: communities, marketplace, calls, videos and settings.
- Realtime follows the Shalter2 pattern: authenticated Socket.IO handshake, presence snapshots, reconnect-compatible events, typing indicators and targeted message delivery.
- Optional online profile adds Caddy HTTPS reverse proxy under `infrastructure/proxy/Caddyfile`.
