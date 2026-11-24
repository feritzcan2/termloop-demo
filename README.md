# Launchpad

A small release dashboard: upcoming releases, their checklists, and recent activity.

This repository is the sample project used in the [TermLoop](https://github.com/feritzcan2/termloop) screenshots and demos. Its branches, pull requests and commits were made by Claude Code and Codex agents working in parallel TermLoop Tasks. All data is fictional.

```sh
pnpm dev    # http://localhost:4173
pnpm test
```

## Rate limiting and proxies

`/api/*` is limited to 60 requests per minute per client. By default the client is the socket address and `X-Forwarded-For` is ignored, because clients can forge it to dodge the limit.

Behind a reverse proxy, every request would share the proxy's address. Set `TRUST_PROXY=1` to key on the `X-Forwarded-For` header instead (the rightmost entry, which the proxy appends). Only enable it when the server is reachable solely through a proxy you control.

```sh
TRUST_PROXY=1 pnpm dev
```

## Branches

- `main`: released versions
- `develop`: integration branch; feature branches merge here first
