#!/usr/bin/env node
/*
 * Serves the production build the way a real host does: static files from build/ plus /api forwarded
 * to the backend. `npx serve -s build` has no /api forwarding, so every API call got index.html back
 * and the admin login said "Can't reach the server".
 *
 *   npm run build && npm run preview          (http://localhost:3000, API at http://localhost:5000)
 *   env: PORT (default 3000), API_PORT (default 5000)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BUILD = path.resolve(__dirname, '..', 'build');
const PORT = Number(process.env.PORT) || 3000;
const API_PORT = Number(process.env.API_PORT) || 5000;
const TYPES = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.map': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
    '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.glb': 'model/gltf-binary',
    '.hdr': 'application/octet-stream', '.txt': 'text/plain; charset=utf-8',
};

if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    console.error(`No build found at ${BUILD}. Run "npm run build" first.`);
    process.exit(1);
}

http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
        const upstream = http.request({ host: '127.0.0.1', port: API_PORT, path: req.url, method: req.method, headers: req.headers }, (r) => {
            res.writeHead(r.statusCode, r.headers);
            r.pipe(res);
        });
        upstream.on('error', () => {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end(`Backend not reachable on port ${API_PORT}. Start it: cd porsche-backend && npm start`);
        });
        req.pipe(upstream);
        return;
    }
    let file = path.join(BUILD, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(BUILD) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(BUILD, 'index.html'); // SPA routes
    const { size } = fs.statSync(file);
    res.writeHead(200, {
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Content-Length': size, // the 3D loader shows a real percentage
        // Hashed bundles never change; everything else is re-checked.
        'Cache-Control': /[\\/]static[\\/]/.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
}).listen(PORT, () => {
    console.log(`Production build on http://localhost:${PORT}  (/api -> http://localhost:${API_PORT})`);
});
