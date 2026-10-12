// Phase 10: AI lead triage. Every lead gets a durable triage job in the same transaction as the
// lead; a worker (lease + FOR UPDATE SKIP LOCKED, like the email outbox) asks Gemini for a score,
// a one-line summary and a next step as structured JSON, validates it, and stores it with an audit
// event. Without GEMINI_API_KEY the jobs simply wait: adding the key later triages the backlog.
// The model is replaced by a scripted fake here (no network, no key needed).
import request from 'supertest';
import { jest } from '@jest/globals';

let app;
let prisma;
let triage;
let token;
const DOMAIN = 'triage.test';
let seq = 0;
const ip = () => `192.0.2.${++seq % 250}`;

beforeAll(async () => {
    process.env.TRUST_PROXY = '1';
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
    triage = await import('../services/ai/triage.js');
    const login = await request(app).post('/api/admin/login').set('X-Forwarded-For', `192.0.2.251`)
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    token = login.body.token;
});

afterAll(async () => {
    const leads = await prisma.contact.findMany({ where: { email: { endsWith: `@${DOMAIN}` } }, select: { id: true } });
    await prisma.auditEvent.deleteMany({ where: { contactId: { in: leads.map((l) => l.id) } } });
    await prisma.contact.deleteMany({ where: { email: { endsWith: `@${DOMAIN}` } } }); // cascades to LeadTriage
    await prisma.$disconnect();
    delete process.env.TRUST_PROXY;
});

const newLead = async (overrides = {}) => {
    const res = await request(app).post('/api/contact/submit').set('X-Forwarded-For', ip()).send({
        firstName: 'Tri', lastName: 'Age', email: `lead${seq}-${Date.now()}@${DOMAIN}`, phone: '5550188',
        inquiryType: 'Test_Drive', modelInterest: 'Taycan', message: 'I would like a test drive next week, ready to buy.', ...overrides,
    });
    expect(res.statusCode).toBe(201);
    return res.body.data.id;
};
const row = (contactId) => prisma.leadTriage.findUnique({ where: { contactId } });
const makeDue = (ids) => prisma.leadTriage.updateMany({ where: { contactId: { in: ids } }, data: { nextAttemptAt: new Date(Date.now() - 1000) } });

/** A fake model: answers with `reply(prompt)`, records every prompt. */
const fakeModel = (reply) => {
    const prompts = [];
    return {
        prompts,
        model: 'fake-gemini',
        generateJson: jest.fn(async ({ prompt, schema }) => {
            prompts.push(prompt);
            expect(schema).toBe(triage.TRIAGE_SCHEMA); // structured output is always requested
            return { value: await reply(prompt), model: 'fake-gemini' };
        }),
    };
};
const good = () => ({ score: 'hot', summary: 'Wants a Taycan test drive next week; ready to buy.', nextStep: 'Call today to book the drive.' });

test('a new lead gets a pending triage job in the same transaction', async () => {
    const id = await newLead();
    expect(await row(id)).toEqual(expect.objectContaining({ status: 'pending', attempts: 0, score: null }));
});

test('the worker stores a valid result, records it in the audit log, and never sends contact details', async () => {
    const id = await newLead();
    const client = fakeModel(good);
    await triage.runTriageOnce({ client, contactIds: [id] });
    expect(await row(id)).toEqual(expect.objectContaining({
        status: 'done', attempts: 1, score: 'hot', model: 'fake-gemini',
        summary: good().summary, nextStep: good().nextStep,
    }));
    const prompt = client.prompts[0];
    expect(prompt).toContain('ready to buy'); // the message is what gets judged
    expect(prompt).not.toContain(DOMAIN); // no email
    expect(prompt).not.toContain('5550188'); // no phone
    const event = await prisma.auditEvent.findFirst({ where: { contactId: id, action: 'lead_triaged' } });
    expect(event).toEqual(expect.objectContaining({ actor: 'ai', after: { score: 'hot', summary: good().summary } }));
});

test.each([
    ['a score outside the schema', () => ({ ...good(), score: 'super-hot' })],
    ['a missing field', () => ({ score: 'warm', summary: 'x' })],
    ['an over-long summary', () => ({ ...good(), summary: 'x'.repeat(400) })],
    ['not an object', () => 'hot'],
    ['an API error', () => { throw new Error('503 model overloaded'); }],
])('%s is never stored: the job is retried later', async (_, reply) => {
    const id = await newLead();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await triage.runTriageOnce({ client: fakeModel(reply), contactIds: [id] });
    errorSpy.mockRestore();
    const r = await row(id);
    expect(r).toEqual(expect.objectContaining({ status: 'pending', attempts: 1, score: null, summary: null }));
    expect(r.lastError).toEqual(expect.any(String));
    expect(r.nextAttemptAt.getTime()).toBeGreaterThan(Date.now()); // backed off
});

test('after MAX_ATTEMPTS failures the job is marked failed', async () => {
    const id = await newLead();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const client = fakeModel(() => ({ nonsense: true }));
    for (let i = 0; i < triage.MAX_ATTEMPTS; i++) {
        await makeDue([id]);
        await triage.runTriageOnce({ client, contactIds: [id] });
    }
    errorSpy.mockRestore();
    expect(await row(id)).toEqual(expect.objectContaining({ status: 'failed', attempts: triage.MAX_ATTEMPTS }));
    expect(client.generateJson).toHaveBeenCalledTimes(triage.MAX_ATTEMPTS);
});

test('without an API key nothing is attempted; the job waits for the key', async () => {
    const id = await newLead();
    expect(await triage.runTriageOnce({ client: null, contactIds: [id] })).toBe(0);
    expect(await row(id)).toEqual(expect.objectContaining({ status: 'pending', attempts: 0 }));
    // Key added later: the backlog is triaged.
    await triage.runTriageOnce({ client: fakeModel(good), contactIds: [id] });
    expect((await row(id)).status).toBe('done');
});

test('two workers at once never triage the same lead twice', async () => {
    const ids = [await newLead(), await newLead(), await newLead(), await newLead()];
    const client = fakeModel(async () => { await new Promise((r) => setTimeout(r, 50)); return good(); });
    await Promise.all([
        triage.runTriageOnce({ client, contactIds: ids, batchSize: 1 }),
        triage.runTriageOnce({ client, contactIds: ids, batchSize: 1 }),
    ]);
    expect(client.generateJson).toHaveBeenCalledTimes(4);
    expect((await prisma.leadTriage.findMany({ where: { contactId: { in: ids } } })).every((r) => r.status === 'done')).toBe(true);
});

test('the admin list shows the triage and can filter by score', async () => {
    const hot = await newLead();
    const cold = await newLead({ message: 'Just browsing, maybe in a few years.' });
    await triage.runTriageOnce({ client: fakeModel(good), contactIds: [hot] });
    await triage.runTriageOnce({ client: fakeModel(() => ({ score: 'cold', summary: 'Browsing only.', nextStep: 'Add to the newsletter.' })), contactIds: [cold] });

    const auth = { Authorization: `Bearer ${token}` };
    const all = await request(app).get(`/api/admin/contacts?q=${DOMAIN}&limit=100`).set(auth);
    expect(all.statusCode).toBe(200);
    expect(all.body.data.find((c) => c.id === hot).triage).toEqual(expect.objectContaining({ status: 'done', score: 'hot', summary: good().summary }));
    expect(all.body.ai).toEqual(expect.objectContaining({ enabled: expect.any(Boolean) }));

    const onlyCold = await request(app).get(`/api/admin/contacts?q=${DOMAIN}&limit=100&score=cold`).set(auth);
    expect(onlyCold.body.data.map((c) => c.id)).toContain(cold);
    expect(onlyCold.body.data.map((c) => c.id)).not.toContain(hot);
    expect((await request(app).get('/api/admin/contacts?score=lukewarm').set(auth)).statusCode).toBe(400);
});

test('validateTriage trims and accepts exactly the schema', () => {
    expect(triage.validateTriage({ score: 'warm', summary: '  Asks about leasing. ', nextStep: 'Send offer.' }))
        .toEqual({ score: 'warm', summary: 'Asks about leasing.', nextStep: 'Send offer.' });
    expect(() => triage.validateTriage({ score: 'warm', summary: '', nextStep: 'x' })).toThrow();
    expect(() => triage.validateTriage(null)).toThrow();
});

test('the stored model is the one that answered (e.g. the fallback)', async () => {
    const id = await newLead();
    const client = { model: 'gemini-3.8-flash', generateJson: async () => ({ value: good(), model: 'gemini-3.6-flash' }) };
    await triage.runTriageOnce({ client, contactIds: [id] });
    expect((await row(id)).model).toBe('gemini-3.6-flash');
});
