// Dev server only: Create React App loads this file during `npm start`; it is not part of the
// production build. The "proxy" setting in package.json still forwards /api to the backend.
//
// The dev server compresses every response on the fly. For the 3D models that meant brotli-
// compressing up to 66 MB on each request (4.7 s for the GT3 RS) and dropping Content-Length, so
// the showroom's loader could not compute a percentage and sat at "LOADING 0%". This serves the
// .glb files straight from public/, unchanged, with their real size and a cache header. It runs
// before the dev server's compression middleware.
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

module.exports = function setupProxy(app) {
    app.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        let urlPath;
        try {
            urlPath = decodeURIComponent(req.path);
        } catch {
            return next();
        }
        if (!urlPath.endsWith('.glb')) return next();
        const file = path.resolve(PUBLIC_DIR, `.${urlPath}`);
        if (!file.startsWith(PUBLIC_DIR + path.sep) || !fs.existsSync(file)) return next();

        const stat = fs.statSync(file);
        const lastModified = stat.mtime.toUTCString();
        res.setHeader('Content-Type', 'model/gltf-binary');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Last-Modified', lastModified);
        const since = req.headers['if-modified-since'];
        if (since && new Date(since) >= new Date(lastModified)) {
            res.statusCode = 304;
            return res.end();
        }
        res.setHeader('Content-Length', stat.size);
        if (req.method === 'HEAD') return res.end();
        return fs.createReadStream(file).pipe(res);
    });
};
