import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { handle } from './src/api.mjs';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const root = new URL('./public/', import.meta.url).pathname;
// Pure helpers from src/ that the browser imports as ES modules.
const shared = new Set(['/src/focus.mjs']);
const srcRoot = new URL('./', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4173);

createServer(async (req, res) => {
  const api = handle(req.method, req.url);
  if (api) {
    res.writeHead(api.status, api.headers).end(api.body);
    return;
  }
  const urlPath = req.url.split('?')[0];
  if (shared.has(urlPath)) {
    res.writeHead(200, { 'content-type': types['.js'] }).end(await readFile(join(srcRoot, urlPath)));
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
