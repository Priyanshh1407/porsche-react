// Audit log: every change to a lead, every export and every admin login is recorded, written in the
// same transaction as the change itself (a rolled-back change leaves no event, and an event that
// can't be written rolls the change back). Each lead has a timeline.
import request from 'supertest';
import { jest } from '@jest/globals';

let app;
let prisma;
let token;
const DOMAIN = 'audit.test';
let seq = 0;
const ip = () => `203.0.113.${++seq}`; // one client IP per request: the per-IP limiters stay out of it

beforeAll(async () => {
    process.env.TRUST_PROXY = '1';
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
    const login = await request(app).post('/api/admin/login').set('X-Forwarded-For', ip())
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    token = login.body.token;
});

afterAll(async () => {
    const leads = await prisma.contact.findMany({ where: { email: { endsWith: `@${DOMAIN}` } }, select: { id: true } });
    await prisma.auditEvent.deleteMany({ where: { OR: [{ contactId: { in: leads.map((l) => l.id) } }, { meta: { path: ['marker'], equals: DOMAIN } }] } });
    await prisma.contact.deleteMany({ where: { email: { endsWith: `@${DOMAIN}` } } });
    await prisma.$disconnect();
    delete process.env.TRUST_PROXY;
});

const auth = (req) => req.set('Authorization', `Bearer ${token}`);
const submit = async (overrides = {}) => {
    const res = await request(app).post('/api/contact/submit').set('X-Forwarded-For', ip()).send({
        firstName: 'Audit', lastName: 'Trail', email: `lead${seq}-${Date.now()}@${DOMAIN}`, phone: '5550142',
        inquiryType: 'Sales', modelInterest: 'Taycan', message: 'Audit log test lead.', ...overrides,
    });
    expect(res.statusCode).toBe(201);
    return res.body.data.id;
};
const eventsFor = (contactId) => prisma.auditEvent.findMany({ where: { contactId }, orderBy: [{ at: 'asc' }, { id: 'asc' }] });

test('a new lead records lead_created by "public", without the visitor\'s contact details', async () => {
    const id = await submit();
    const events = await eventsFor(id);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(expect.objectContaining({ action: 'lead_created', actor: 'public', contactId: id }));
    expect(events[0].after).toEqual({ source: 'Website', inquiryType: 'Sales', modelInterest: 'Taycan' });
    expect(JSON.stringify(events[0])).not.toContain(DOMAIN); // no email (or other PII) copied into the log
});

test('a status change and a notes change are recorded with before/after, by the admin', async () => {
    const id = await submit();
    const res = await auth(request(app).put(`/api/admin/contacts/${id}`)).send({ status: 'contacted', notes: 'Called back.' });
    expect(res.statusCode).toBe(200);
    const events = (await eventsFor(id)).filter((e) => e.action !== 'lead_created');
    expect(events.map((e) => e.action).sort()).toEqual(['notes_changed', 'status_changed']);
    const status = events.find((e) => e.action === 'status_changed');
    expect(status).toEqual(expect.objectContaining({ actor: `admin:${process.env.ADMIN_EMAIL}`, before: { status: 'new' }, after: { status: 'contacted' } }));
    expect(events.find((e) => e.action === 'notes_changed')).toEqual(expect.objectContaining({ before: { notes: null }, after: { notes: 'Called back.' } }));
});

test('an update that changes nothing records nothing', async () => {
    const id = await submit();
    await auth(request(app).put(`/api/admin/contacts/${id}`)).send({ status: 'new' });
    expect((await eventsFor(id)).map((e) => e.action)).toEqual(['lead_created']);
});

test('if the audit event cannot be written, the change is rolled back (same transaction)', async () => {
    const id = await submit();
    // Scoped to this one lead: test files share the database and run in parallel.
    await prisma.$executeRawUnsafe(`
        CREATE OR REPLACE FUNCTION audit_test_fail() RETURNS trigger AS $$
        BEGIN
            IF NEW."contactId" = '${id}' AND NEW.action = 'status_changed' THEN RAISE EXCEPTION 'audit insert failed (test)'; END IF;
            RETURN NEW;
        END $$ LANGUAGE plpgsql;`);
    await prisma.$executeRawUnsafe('CREATE TRIGGER audit_test_fail BEFORE INSERT ON "AuditEvent" FOR EACH ROW EXECUTE FUNCTION audit_test_fail();');
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        const res = await auth(request(app).put(`/api/admin/contacts/${id}`)).send({ status: 'qualified' });
        expect(res.statusCode).toBe(500);
        expect((await prisma.contact.findUnique({ where: { id } })).status).toBe('new');
    } finally {
        errorSpy.mockRestore();
        await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS audit_test_fail ON "AuditEvent";');
        await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS audit_test_fail();');
    }
});

test('deleting a lead is recorded, and its history outlives it', async () => {
    const id = await submit();
    expect((await auth(request(app).delete(`/api/admin/contacts/${id}`))).statusCode).toBe(200);
    const events = await eventsFor(id);
    expect(events.map((e) => e.action)).toEqual(['lead_created', 'lead_deleted']);
    expect(events[1].before).toEqual(expect.objectContaining({ status: 'new', inquiryType: 'Sales' }));
});

test('a CSV export is recorded with its filters and row count', async () => {
    const since = new Date();
    const res = await auth(request(app).get('/api/admin/export?status=closed'));
    expect(res.statusCode).toBe(200);
    const exports = await prisma.auditEvent.findMany({ where: { action: 'export', at: { gte: since } } });
    const mine = exports.find((e) => e.meta?.filters?.status === 'closed');
    expect(mine).toEqual(expect.objectContaining({ actor: `admin:${process.env.ADMIN_EMAIL}` }));
    expect(mine.meta.rows).toEqual(expect.any(Number));
});

test('logins are recorded (ok and failed), with the email tried but never the password', async () => {
    const tried = `intruder-${Date.now()}@${DOMAIN}`;
    const bad = await request(app).post('/api/admin/login').set('X-Forwarded-For', ip()).send({ email: tried, password: 'hunter2-secret' });
    expect(bad.statusCode).toBe(401);
    const failed = await prisma.auditEvent.findFirst({ where: { action: 'login_failed', meta: { path: ['email'], equals: tried } } });
    expect(failed).toEqual(expect.objectContaining({ actor: 'public', ip: expect.any(String) }));
    expect(JSON.stringify(failed)).not.toContain('hunter2');
    await prisma.auditEvent.update({ where: { id: failed.id }, data: { meta: { ...failed.meta, marker: DOMAIN } } });

    const since = new Date();
    await request(app).post('/api/admin/login').set('X-Forwarded-For', ip()).send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    const ok = await prisma.auditEvent.findFirst({ where: { action: 'login_ok', at: { gte: since } } });
    expect(ok).toEqual(expect.objectContaining({ actor: `admin:${process.env.ADMIN_EMAIL}` }));
    expect(JSON.stringify(ok)).not.toContain(process.env.ADMIN_PASSWORD);
});

test('GET /contacts/:id/timeline lists the lead\'s events oldest first, with its emails', async () => {
    const id = await submit();
    await auth(request(app).put(`/api/admin/contacts/${id}`)).send({ status: 'qualified' });
    const res = await auth(request(app).get(`/api/admin/contacts/${id}/timeline`));
    expect(res.statusCode).toBe(200);
    expect(res.body.data.events.map((e) => e.action)).toEqual(['lead_created', 'status_changed']);
    expect(res.body.data.emails.map((e) => e.kind).sort()).toEqual(['admin_notification', 'customer_confirmation']);
    expect((await request(app).get(`/api/admin/contacts/${id}/timeline`)).statusCode).toBe(401); // admin only
});

test('GET /audit pages newest first with a cursor, never repeating or skipping an event', async () => {
    const ids = [await submit(), await submit(), await submit()];
    const seen = [];
    let cursor = null;
    for (let i = 0; i < 50 && seen.filter((e) => ids.includes(e.contactId)).length < 3; i++) {
        const res = await auth(request(app).get(`/api/admin/audit?limit=2${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`));
        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(2);
        seen.push(...res.body.data);
        cursor = res.body.nextCursor;
        if (!cursor) break;
    }
    const mine = seen.filter((e) => ids.includes(e.contactId));
    expect(mine.map((e) => e.contactId)).toEqual([...ids].reverse()); // newest first
    expect(new Set(seen.map((e) => e.id)).size).toBe(seen.length); // no duplicates across pages
    expect((await auth(request(app).get('/api/admin/audit?cursor=garbage'))).statusCode).toBe(400);
});
