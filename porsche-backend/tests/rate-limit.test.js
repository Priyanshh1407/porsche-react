// SEC-03: brute-force and spam protection. Each Jest test file gets its own module registry,
// so these limiters start empty and other test files' requests don't count against them.
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

afterAll(async () => {
    await prisma.$disconnect();
});

describe('SEC-03: admin login rate limit', () => {
    const login = (password) => request(app)
        .post('/api/admin/login')
        .send({ email: process.env.ADMIN_EMAIL, password });

    test('successful logins do not count toward the limit', async () => {
        for (let i = 0; i < 6; i++) {
            const res = await login(process.env.ADMIN_PASSWORD);
            expect(res.statusCode).toBe(200);
        }
    });

    test('the 6th failed attempt is blocked with 429, and so is the correct password afterwards', async () => {
        for (let i = 0; i < 5; i++) {
            const res = await login('wrong-password');
            expect(res.statusCode).toBe(401);
        }
        const blocked = await login('wrong-password');
        expect(blocked.statusCode).toBe(429);
        expect(blocked.body.success).toBe(false);

        const correctButBlocked = await login(process.env.ADMIN_PASSWORD);
        expect(correctButBlocked.statusCode).toBe(429);
        expect(correctButBlocked.body.token).toBeUndefined();
    });
});

describe('SEC-03: contact form rate limit', () => {
    test('the 6th submission in an hour is blocked with 429 (rejected attempts count too)', async () => {
        const invalid = { firstName: 'A', email: 'not-an-email' }; // 400s: nothing written to the DB
        for (let i = 0; i < 5; i++) {
            const res = await request(app).post('/api/contact/submit').send(invalid);
            expect(res.statusCode).toBe(400);
        }
        const blocked = await request(app).post('/api/contact/submit').send(invalid);
        expect(blocked.statusCode).toBe(429);
    });
});
