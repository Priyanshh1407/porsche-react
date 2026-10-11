// Dev server only: `npm start` gzip/brotli-compressed the 66 MB models on every request (4.7 s of
// CPU for the GT3 RS) and dropped Content-Length, so the loader could not show progress (stuck at
// 0%). setupProxy.js serves .glb files straight from public/ before that compression runs.
const http = require('http');
const fs = require('fs');
const path = require('path');
const setupProxy = require('./setupProxy');

let server;
let base;
beforeAll((done) => {
    const handlers = [];
    setupProxy({ use: (fn) => handlers.push(fn) });
    server = http.createServer((req, res) => {
        req.path = req.url.split('?')[0];
        const run = (i) => (i < handlers.length ? handlers[i](req, res, () => run(i + 1)) : (res.statusCode = 404, res.end('fell through')));
        run(0);
    }).listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; done(); });
});
afterAll(() => new Promise((resolve) => { server.close(resolve); }));

const GLB = '2024_manthey_racing_porsche_911_gt3_rs.glb';
// Node's http client (the jsdom test environment has no fetch). Only the first bytes of a body
// are read, then the connection is closed: streaming a whole 66 MB model made the test slow and
// timing-dependent under load.
const get = (p, { method = 'GET', headers = {} } = {}) => new Promise((resolve, reject) => {
    const req = http.request(`${base}${p}`, { method, headers }, (res) => {
        const chunks = [];
        let length = 0;
        const done = () => resolve({ status: res.statusCode, headers: res.headers, head: Buffer.concat(chunks).subarray(0, 12) });
        res.on('data', (c) => {
            chunks.push(c);
            length += c.length;
            if (length >= 12) { res.removeAllListeners('end'); req.destroy(); done(); }
        });
        res.on('end', done);
    });
    req.on('error', (err) => (err.code === 'ECONNRESET' ? undefined : reject(err)));
    req.end();
});

test('serves a model uncompressed with its real size, so the loader can show progress', async () => {
    const size = fs.statSync(path.join(__dirname, '..', 'public', GLB)).size;
    const res = await get(`/${GLB}`, { headers: { 'Accept-Encoding': 'gzip, br' } });
    expect(res.status).toBe(200);
    expect(res.headers['content-encoding']).toBeUndefined();
    expect(Number(res.headers['content-length'])).toBe(size);
    const fd = fs.openSync(path.join(__dirname, '..', 'public', GLB), 'r');
    const head = Buffer.alloc(12);
    fs.readSync(fd, head, 0, 12, 0);
    fs.closeSync(fd);
    expect(res.head.equals(head)).toBe(true); // the file itself (GLB header), not a compressed stream
    expect(res.headers['content-type']).toBe('model/gltf-binary');
    expect(res.headers['cache-control']).toMatch(/max-age=[1-9]/);
});

test('answers a repeat visit with 304 instead of the whole file', async () => {
    const first = await get(`/${GLB}`, { method: 'HEAD' });
    const again = await get(`/${GLB}`, { headers: { 'If-Modified-Since': first.headers['last-modified'] } });
    expect(again.status).toBe(304);
});

test('leaves everything else (pages, /api, missing files, path tricks) to the dev server', async () => {
    for (const p of ['/', '/api/contact/models', '/missing.glb', '/..%2fpackage.json.glb']) {
        expect((await get(p)).status).toBe(404); // 404 here = passed on to the next handler
    }
});
