// serve.mjs — Static dev server for ישיבת פאר יוסף
// Usage: node serve.mjs
// Serves project root at http://localhost:3000

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml':  'application/xml; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.pdf':  'application/pdf',
};

createServer(async (req, res) => {
  // Strip query string
  const urlPath = req.url.split('?')[0];

  // Resolve file path safely
  let filePath = normalize(join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  // Default to index.html for directory requests
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    // Clean URLs: /donate → donate.html, mirroring how Netlify serves the site.
    // Internal links point at the extension-less form, so local dev must resolve it too.
    if (!extname(filePath)) {
      try { await stat(filePath + '.html'); filePath += '.html'; } catch { /* will 404 below */ }
    }
  }

  try {
    const data = await readFile(filePath);
    const ext  = extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
    console.log(`200 ${urlPath}`);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 Not Found: ${urlPath}`);
    console.log(`404 ${urlPath}`);
  }
}).listen(PORT, () => {
  console.log(`\n✅ Server running → http://localhost:${PORT}\n`);
});
