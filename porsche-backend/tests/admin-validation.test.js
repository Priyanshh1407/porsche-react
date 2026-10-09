// VAL-01: admin endpoints reject bad input with 400 instead of crashing with 500 (or storing junk).
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

let token;
let contactId;

beforeAll(async () => {
    const login = await request(app).post('/api/admin/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    token = login.body.token;
    const contact = await prisma.contact.create({ data: {
        firstName: 'Val', lastName: 'One', email: 'val01@example.com', phone: '5550100',
        inquiryType: 'Sales', message: 'Admin validation test contact.',
    } });
    contactId = contact.id;
});

afterAll(async () => {
    await prisma.contact.deleteMany({ where: { email: 'val01@example.com' } });
    await prisma.$disconnect();
});

const get = (url) => request(app).get(url).set('Authorization', `Bearer ${token}`);
const put = (url, body) => request(app).put(url).set('Authorization', `Bearer ${token}`).send(body);
const del = (url) => request(app).delete(url).set('Authorization', `Bearer ${token}`);
const fields = (res) => (res.body.errors || []).map((e) => e.field);

describe('GET /api/admin/contacts', () => {
    test.each([
        ['?page=-1', 'page'], ['?page=abc', 'page'], ['?page=0', 'page'],
        ['?limit=0', 'limit'], ['?limit=1000', 'limit'],
        ['?status=banana', 'status'], ['?inquiryType=Nonsense', 'inquiryType'],
    ])('%s -> 400 on %s', async (query, field) => {
        const res = await get(`/api/admin/contacts${query}`);
        expect(res.statusCode).toBe(400);
        expect(fields(res)).toContain(field);
    });

    test.each(['', '?page=2&limit=5', '?status=all', '?status=qualified', '?inquiryType=Sales'])('%s -> 200', async (query) => {
        const res = await get(`/api/admin/contacts${query}`);
        expect(res.statusCode).toBe(200);
    });
});

describe('PUT /api/admin/contacts/:id', () => {
    test('a malformed id -> 400', async () => {
        const res = await put('/api/admin/contacts/not-a-uuid', { status: 'contacted' });
        expect(res.statusCode).toBe(400);
        expect(fields(res)).toContain('id');
    });

    test("status 'banana' -> 400 and nothing stored", async () => {
        const res = await put(`/api/admin/contacts/${contactId}`, { status: 'banana' });
        expect(res.statusCode).toBe(400);
        expect(fields(res)).toContain('status');
        expect((await prisma.contact.findUnique({ where: { id: contactId } })).status).toBe('new');
    });

    test('notes over 500 characters -> 400', async () => {
        const res = await put(`/api/admin/contacts/${contactId}`, { notes: 'x'.repeat(600) });
        expect(res.statusCode).toBe(400);
        expect(fields(res)).toContain('notes');
    });

    test('a valid status and 500-character notes are stored', async () => {
        const res = await put(`/api/admin/contacts/${contactId}`, { status: 'qualified', notes: 'y'.repeat(500) });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('qualified');
    });

    test('an unknown (well-formed) id -> 404', async () => {
        const res = await put('/api/admin/contacts/00000000-0000-4000-8000-000000000000', { status: 'contacted' });
        expect(res.statusCode).toBe(404);
    });
});

describe('GET /api/admin/export', () => {
    test.each(['?startDate=abc', '?endDate=31-12-2026', '?status=banana'])('%s -> 400', async (query) => {
        const res = await get(`/api/admin/export${query}`);
        expect(res.statusCode).toBe(400);
    });

    test('a valid date range -> CSV', async () => {
        const res = await get('/api/admin/export?startDate=2026-01-01&endDate=2026-12-31');
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toContain('text/csv');
    });
});

describe('id-based routes', () => {
    test('GET details with a malformed id -> 400', async () => {
        expect((await get('/api/admin/contacts/not-a-uuid/details')).statusCode).toBe(400);
    });

    test('DELETE with a malformed id -> 400', async () => {
        expect((await del('/api/admin/contacts/not-a-uuid')).statusCode).toBe(400);
    });

    test('DELETE an unknown (well-formed) id -> 404', async () => {
        expect((await del('/api/admin/contacts/00000000-0000-4000-8000-000000000000')).statusCode).toBe(404);
    });
});
