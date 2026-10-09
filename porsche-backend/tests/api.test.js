// Core API flows. TEST-02: every test creates its own fixtures and can run alone or in any order.
// (The original version shared an admin token and a contact id between tests, and the status
// test did `if (!createdContactId) return;`, so run on its own it passed without asserting
// anything.) Credentials come from tests/test-env.cjs, never hardcoded fallbacks.
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

const TEST_EMAIL_DOMAIN = '@api-test.example.com';

const loginAsAdmin = async () => {
    const res = await request(app)
        .post('/api/admin/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    expect(res.statusCode).toBe(200);
    return res.body.token;
};

const createContact = (overrides = {}) => prisma.contact.create({
    data: {
        firstName: 'Fixture', lastName: 'Contact', email: `fixture-${Date.now()}-${Math.random()}${TEST_EMAIL_DOMAIN}`,
        phone: '5550199', inquiryType: 'Sales', message: 'Fixture contact for the API tests.',
        ...overrides,
    },
});

afterAll(async () => {
    await prisma.contact.deleteMany({ where: { email: { endsWith: TEST_EMAIL_DOMAIN } } });
    await prisma.$disconnect();
});

describe('Contact API', () => {
    test('GET /api/contact/health answers healthy', async () => {
        const res = await request(app).get('/api/contact/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('healthy');
    });

    test('rejects a submission with an invalid email and names the field', async () => {
        const res = await request(app).post('/api/contact/submit').send({
            firstName: 'Test', lastName: 'User', email: 'invalid-email', phone: '+1234567890',
            inquiryType: 'Sales', message: 'This is a test message.',
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors.map((e) => e.path)).toContain('email');
    });

    test('stores a valid submission and returns its id', async () => {
        const email = `submit${TEST_EMAIL_DOMAIN}`;
        const res = await request(app).post('/api/contact/submit').send({
            firstName: 'Automated', lastName: 'Tester', email, phone: '+15555555555',
            inquiryType: 'Sales', message: 'This is an automated test message for the contact form.', modelInterest: '911',
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);

        const stored = await prisma.contact.findUnique({ where: { id: res.body.data.id } });
        expect(stored).toEqual(expect.objectContaining({ email, modelInterest: '911', status: 'new' }));
    });
});

describe('Admin API', () => {
    test('login with the configured credentials returns a token', async () => {
        expect(typeof (await loginAsAdmin())).toBe('string');
    });

    test('admin routes reject a request without a token', async () => {
        const res = await request(app).get('/api/admin/contacts');
        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('lists contacts with a valid token, including a just-created one', async () => {
        const token = await loginAsAdmin();
        const contact = await createContact({ lastName: 'Listed' });
        const res = await request(app)
            .get(`/api/admin/contacts?q=${encodeURIComponent(contact.email)}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data.map((c) => c.id)).toEqual([contact.id]);
    });

    test('updates a contact status and records when it was contacted', async () => {
        const token = await loginAsAdmin();
        const contact = await createContact();
        const res = await request(app)
            .put(`/api/admin/contacts/${contact.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'contacted' });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('contacted');
        expect(res.body.data.contactedAt).not.toBeNull();
    });

    test('analytics returns all four sections with the right shapes', async () => {
        const token = await loginAsAdmin();
        await createContact({ modelInterest: 'Taycan' });
        const res = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Object.keys(res.body.data).sort()).toEqual(['conversions', 'peakHours', 'popularModels', 'trends']);
        expect(res.body.data.popularModels[0]).toEqual(expect.objectContaining({ model: expect.any(String), count: expect.any(Number) }));
    });
});
