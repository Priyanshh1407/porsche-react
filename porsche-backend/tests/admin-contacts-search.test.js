// BUG-05: search, filter and pagination happen on the server, over ALL contacts.
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

const TAG = 'Searchtest';
let token;

beforeAll(async () => {
    const login = await request(app).post('/api/admin/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    token = login.body.token;
    // 25 tagged contacts: more than the old fixed page of 10.
    await prisma.contact.createMany({
        data: Array.from({ length: 25 }, (_, i) => ({
            firstName: `Person${i}`, lastName: TAG, email: `bug05-${i}@Example.COM`, phone: `555${String(i).padStart(4, '0')}`,
            inquiryType: 'Sales', message: 'Search pagination test contact.',
            status: i < 3 ? 'qualified' : 'new',
        })),
    });
    // Decoys that must NOT match the search (including a qualified one), so an API that
    // ignored `q` would fail these tests instead of passing by accident on a near-empty DB.
    await prisma.contact.createMany({
        data: Array.from({ length: 6 }, (_, i) => ({
            firstName: `Decoy${i}`, lastName: 'Unrelated', email: `decoy-${i}@other.org`, phone: `777${String(i).padStart(4, '0')}`,
            inquiryType: 'Service', message: 'Should never match the search.',
            status: i < 2 ? 'qualified' : 'contacted',
        })),
    });
});

afterAll(async () => {
    await prisma.contact.deleteMany({ where: { lastName: { in: [TAG, 'Unrelated'] } } });
    await prisma.$disconnect();
});

const list = (query) => request(app).get(`/api/admin/contacts?${query}`).set('Authorization', `Bearer ${token}`);

test('pages through all matches on the server (contact #11+ reachable)', async () => {
    const res = await list(`q=${TAG}&limit=10&page=3`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.pagination).toEqual(expect.objectContaining({ current: 3, pages: 3, total: 25, limit: 10 }));
});

test('search is case-insensitive and covers name, email and phone', async () => {
    expect((await list('q=searchTEST')).body.pagination.total).toBe(25);
    expect((await list('q=bug05-7@example.com')).body.data.map((c) => c.firstName)).toEqual(['Person7']);
    expect((await list('q=5550012')).body.data.map((c) => c.firstName)).toEqual(['Person12']);
});

test('search combines with the status filter', async () => {
    const res = await list(`q=${TAG}&status=qualified`);
    expect(res.body.pagination.total).toBe(3);
    expect(res.body.data.every((c) => c.status === 'qualified')).toBe(true);
});

test('an over-long search term is rejected', async () => {
    const res = await list(`q=${'x'.repeat(101)}`);
    expect(res.statusCode).toBe(400);
});
