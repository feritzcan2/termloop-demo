# Launchpad

Launchpad is a small release dashboard. It has no runtime dependencies.

- Run `pnpm test` after every behavior change.
- Keep `src/` free of I/O: route handlers live in `src/api.mjs`, the HTTP server in `server.mjs`.
- The UI in `public/` must stay keyboard accessible.
- All releases, customers and activity are sample data.
