import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { handle } from './src/api.mjs';
import { createRateLimiter } from './src/rate-limit.mjs';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const root = new URL('./public/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4173);

const limiter = createRateLimiter({ limit: 60, windowMs: 60_000 });

createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    const verdict = limiter(req.socket.remoteAddress ?? 'unknown');
    if (!verdict.allowed) {
      res
        .writeHead(429, { 'content-type': 'application/json', 'retry-after': String(verdict.retryAfter) })
        .end(JSON.stringify({ error: 'Too many requests' }));
      return;
    }
  }
  const api = handle(req.method, req.url);
  if (api) {
    res.writeHead(api.status, api.headers).end(api.body);
    return;
  }
  const path = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0];
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`Launchpad running at http://localhost:${port}`));
