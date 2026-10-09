// Child-process helper for tests/health.test.js: imports the app with whatever DATABASE_URL the
// parent passed (e.g. an unreachable one) and prints the /health and /ready responses as JSON.
import request from 'supertest';

const { default: app } = await import('../../server.js');
const health = await request(app).get('/health');
const started = Date.now();
const ready = await request(app).get('/ready');
console.log(JSON.stringify({
    health: health.statusCode,
    ready: ready.statusCode,
    readyBody: ready.body,
    readyMs: Date.now() - started,
}));
process.exit(0);
