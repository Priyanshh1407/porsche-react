/*
 * Characterization tests for bugs confirmed in PROJECT_AUDIT_REPORT.md (audit #1).
 *
 * Each test asserts the CORRECT behaviour and is marked `test.failing` because the bug is
 * still present. When Phase 1 fixes a bug, its test starts passing, which makes Jest report
 * the `.failing` test as a failure. Then remove `.failing` so it stays as a regression test.
 */
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

const validContact = {
    firstName: 'Anna',
    lastName: 'Schmidt',
    email: 'anna.knownbugs@example.com',
    phone: '+15555550123',
    inquiryType: 'Sales',
    message: 'I would like to book a test drive this month.',
};

const adminToken = async () => {
    const res = await request(app)
        .post('/api/admin/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    return res.body.token;
};

const createdIds = [];

afterAll(async () => {
    if (createdIds.length) await prisma.contact.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
});

describe('BUG-01: contact form rejects blank optional dropdowns', () => {
    // Exactly what src/pages/Contact.jsx sends when the user leaves the optional selects untouched.
    // Fixed in Phase 1: kept as a regression test.
    test('accepts the UI payload with empty optional fields and stores the defaults', async () => {
        const res = await request(app)
            .post('/api/contact/submit')
            .send({ ...validContact, modelInterest: '', preferredContactMethod: '', preferredContactTime: '' });

        if (res.body?.data?.id) createdIds.push(res.body.data.id);
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);

        const stored = await prisma.contact.findUnique({ where: { id: res.body.data.id } });
        expect(stored).toEqual(expect.objectContaining({
            modelInterest: 'Not_specified',
            preferredContactMethod: 'Either',
            preferredContactTime: 'Anytime',
        }));
    });

    test('still rejects a non-empty value outside the allowed list', async () => {
        const res = await request(app)
            .post('/api/contact/submit')
            .send({ ...validContact, modelInterest: 'Trabant' });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors.map((e) => e.path)).toContain('modelInterest');
    });
});

describe('SEC-01: admin login fails open when admin env vars are missing', () => {
    let saved;
    beforeEach(() => {
        saved = { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD };
        delete process.env.ADMIN_EMAIL;
        delete process.env.ADMIN_PASSWORD;
    });
    afterEach(() => {
        process.env.ADMIN_EMAIL = saved.email;
        process.env.ADMIN_PASSWORD = saved.password;
    });

    test.failing('rejects an empty login body instead of issuing an admin token', async () => {
        const res = await request(app).post('/api/admin/login').send({});

        expect(res.statusCode).toBe(401);
        expect(res.body.token).toBeUndefined();
    });
});

describe('BUG-02: analytics returns trends and popularModels swapped', () => {
    beforeAll(async () => {
        const contact = await prisma.contact.create({
            data: { ...validContact, email: 'bug02@example.com', modelInterest: 'GT3RS' },
        });
        createdIds.push(contact.id);
    });

    test.failing('popularModels holds {model, count} and trends holds {_id: {date, inquiryType}, count}', async () => {
        const res = await request(app)
            .get('/api/admin/analytics')
            .set('Authorization', `Bearer ${await adminToken()}`);

        expect(res.statusCode).toBe(200);
        const { popularModels, trends } = res.body.data;
        expect(popularModels.length).toBeGreaterThan(0);
        expect(popularModels[0]).toEqual(expect.objectContaining({ model: expect.any(String), count: expect.any(Number) }));
        expect(trends.length).toBeGreaterThan(0);
        expect(trends[0]._id).toEqual(expect.objectContaining({ date: expect.any(String), inquiryType: expect.any(String) }));
    });
});
