/**
 * Simple static HTTP development server.
 * Serves files from the current working directory on port 3000.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Simple .env parser to avoid external dependencies
let envConfig = {};
try {
  const envFile = fs.readFileSync(path.join(ROOT, '.env'), 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envConfig[match[1].trim()] = match[2].trim();
    }
  });
} catch (e) {
  console.warn("Could not read .env file");
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0]; // strip query params
  if (urlPath === '/') urlPath = '/index.html';

  if (urlPath === '/env.js') {
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    const envVars = {
      SUPABASE_URL: envConfig.SUPABASE_URL,
      SUPABASE_ANON_KEY: envConfig.SUPABASE_ANON_KEY
    };
    res.end(`window.ENV = ${JSON.stringify(envVars)};`);
    return;
  }

  const filePath = path.join(ROOT, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Fichier non trouvé');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Erreur interne du serveur');
      }
      return;
    }
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', '✔ Serveur de développement démarré !');
  console.log(`\x1b[36m%s\x1b[0m`, `  ➜  Local:   http://localhost:${PORT}/`);
  console.log('\nAppuyez sur Ctrl+C pour arrêter.\n');
});
