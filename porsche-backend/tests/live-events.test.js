// Live admin notifications (SSE). EventSource can't send an Authorization header, so the admin
// first trades the JWT for a single-use ticket valid 30 s, then opens the stream with it. Events
// travel through Postgres NOTIFY, sent inside the transaction that makes the change: they arrive
// only once it commits, and reach every API instance.
import http from 'http';
import request from 'supertest';

let app;
let prisma;
let events;
let server;
let base;
let token;
const DOMAIN = 'live.test';
let seq = 0;
const ip = () => `198.51.100.${++seq}`;

beforeAll(async () => {
    process.env.TRUST_PROXY = '1';
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
    events = await import('../utils/events.js');
    server = await new Promise((resolve) => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
    base = `http://127.0.0.1:${server.address().port}`;
    const login = await request(app).post('/api/admin/login').set('X-Forwarded-For', ip())
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    token = login.body.token;
});

afterAll(async () => {
    await events.closeLiveEvents();
    await new Promise((resolve) => server.close(resolve));
    const leads = await prisma.contact.findMany({ where: { email: { endsWith: `@${DOMAIN}` } }, select: { id: true } });
    await prisma.auditEvent.deleteMany({ where: { contactId: { in: leads.map((l) => l.id) } } });
    await prisma.contact.deleteMany({ where: { email: { endsWith: `@${DOMAIN}` } } });
    await prisma.$disconnect();
    delete process.env.TRUST_PROXY;
});

const ticket = async () => {
    const res = await request(app).post('/api/admin/events/ticket').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(201);
    return res.body.ticket;
};

/** Opens the stream; resolves once the server has sent its first bytes (subscribed). */
function openStream(t) {
    return new Promise((resolve, reject) => {
        const req = http.get(`${base}/api/admin/events?ticket=${encodeURIComponent(t)}`, (res) => {
            const stream = { res, status: res.statusCode, received: [], ended: false, waiters: [] };
            let buffer = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                buffer += chunk;
                let cut;
                while ((cut = buffer.indexOf('\n\n')) !== -1) {
                    const block = buffer.slice(0, cut);
                    buffer = buffer.slice(cut + 2);
                    const type = /^event: (.+)$/m.exec(block)?.[1];
                    const data = /^data: (.+)$/m.exec(block)?.[1];
                    if (type && data) stream.received.push({ type, data: JSON.parse(data) });
                    stream.waiters = stream.waiters.filter((w) => !w());
                }
                if (stream.status === 200 && !stream.ready) { stream.ready = true; resolve(stream); }
            });
            res.on('end', () => { stream.ended = true; stream.waiters = stream.waiters.filter((w) => !w()); });
            if (res.statusCode !== 200) { res.resume(); resolve(stream); }
            stream.close = () => req.destroy();
        });
        req.on('error', reject);
    });
}

/** Waits until `predicate(stream)` holds (checked on every event), failing after `ms`. */
const waitFor = (stream, predicate, ms = 5000) => new Promise((resolve, reject) => {
    if (predicate(stream)) return resolve();
    const timer = setTimeout(() => reject(new Error(`timed out; received: ${JSON.stringify(stream.received.map((e) => e.type))}`)), ms);
    stream.waiters.push(() => { if (!predicate(stream)) return false; clearTimeout(timer); resolve(); return true; });
});

const submit = async () => {
    const res = await request(app).post('/api/contact/submit').set('X-Forwarded-For', ip()).send({
        firstName: 'Live', lastName: 'Event', email: `lead${seq}-${Date.now()}@${DOMAIN}`, phone: '5550142',
        inquiryType: 'Sales', modelInterest: 'Taycan', message: 'Live event test lead.',
    });
    expect(res.statusCode).toBe(201);
    return res.body.data.id;
};

test('a ticket needs an admin token', async () => {
    expect((await request(app).post('/api/admin/events/ticket')).statusCode).toBe(401);
    const res = await request(app).post('/api/admin/events/ticket').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expect.objectContaining({ ticket: expect.any(String), expiresIn: 30 }));
});

test('the stream refuses a missing, unknown or already used ticket', async () => {
    expect((await request(app).get('/api/admin/events')).statusCode).toBe(401);
    expect((await request(app).get('/api/admin/events?ticket=not-a-ticket')).statusCode).toBe(401);
    const t = await ticket();
    const first = await openStream(t);
    expect(first.status).toBe(200);
    expect(first.res.headers['content-type']).toMatch(/^text\/event-stream/);
    const second = await openStream(t);
    expect(second.status).toBe(401); // single use
    first.close();
});

test('tickets expire after their time to live', () => {
    let now = 1_000_000;
    const store = events.createTicketStore({ ttlMs: 30_000, now: () => now });
    const a = store.issue({ email: 'a@x', exp: 9e9 });
    const b = store.issue({ email: 'b@x', exp: 9e9 });
    now += 29_000;
    expect(store.redeem(a)).toEqual(expect.objectContaining({ email: 'a@x' }));
    now += 2_000;
    expect(store.redeem(b)).toBeNull(); // 31 s old
});

test('a new lead reaches every connected admin, after it is committed', async () => {
    const one = await openStream(await ticket());
    const two = await openStream(await ticket());
    const id = await submit();
    const hasLead = (s) => s.received.some((e) => e.type === 'lead.created' && e.data.id === id);
    await Promise.all([waitFor(one, hasLead), waitFor(two, hasLead)]);
    const event = one.received.find((e) => e.data.id === id);
    expect(event.data).toEqual(expect.objectContaining({ name: 'Live Event', modelInterest: 'Taycan', inquiryType: 'Sales' }));
    one.close();
    two.close();
});

test('a status change is announced as lead.updated', async () => {
    const stream = await openStream(await ticket());
    const id = await submit();
    await request(app).put(`/api/admin/contacts/${id}`).set('Authorization', `Bearer ${token}`).send({ status: 'contacted' });
    await waitFor(stream, (s) => s.received.some((e) => e.type === 'lead.updated' && e.data.id === id && e.data.status === 'contacted'));
    stream.close();
});

test('a rolled-back change sends nothing', async () => {
    const stream = await openStream(await ticket());
    const marker = `rollback-${Date.now()}`;
    await expect(prisma.$transaction(async (tx) => {
        await events.publish(tx, 'lead.updated', { id: marker });
        throw new Error('roll back');
    })).rejects.toThrow('roll back');
    // NOTIFY is delivered in commit order: once a later committed event has arrived, the rolled-back
    // one can no longer come.
    const after = `${marker}-committed`;
    await prisma.$transaction((tx) => events.publish(tx, 'lead.updated', { id: after }));
    await waitFor(stream, (s) => s.received.some((e) => e.data.id === after));
    expect(stream.received.some((e) => e.data.id === marker)).toBe(false);
    stream.close();
});

test('closing live events ends open streams (graceful shutdown)', async () => {
    const stream = await openStream(await ticket());
    await events.closeLiveEvents();
    await waitFor(stream, (s) => s.ended);
});
