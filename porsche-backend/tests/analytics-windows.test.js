/*
 * Reported: "no graphs in the admin dashboard or Analytics". With enquiries older than a week the
 * Model Popularity pie (last 7 days) was empty, and older than 30 days Contact Trends and the funnel
 * were empty too (the funnel said "Total Contacts 0" next to a dashboard card saying 5). Trends also
 * came back one row per (day, inquiry type), so one day with two enquiries drew two bars of 1.
 * Now: trends = the last 30 days, one point per day, empty days 0; popularity and funnel = all time.
 */
import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';
import { fillDailyTrend } from '../utils/analytics.js';

const adminToken = async () => {
    const res = await request(app)
        .post('/api/admin/login')
        .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    return res.body.token;
};

describe('fillDailyTrend', () => {
    const today = new Date('2026-10-11T15:00:00Z');

    test('one point per day for the window, oldest first, ending today; missing days are 0', () => {
        const out = fillDailyTrend([{ date: '2026-10-09', count: 2 }], 5, today);
        expect(out).toEqual([
            { date: '2026-10-07', count: 0 },
            { date: '2026-10-08', count: 0 },
            { date: '2026-10-09', count: 2 },
            { date: '2026-10-10', count: 0 },
            { date: '2026-10-11', count: 0 },
        ]);
    });

    test('several rows for the same day (e.g. per inquiry type) are added up', () => {
        const out = fillDailyTrend([{ date: '2026-10-11', count: 1 }, { date: '2026-10-11', count: 3 }], 2, today);
        expect(out).toEqual([{ date: '2026-10-10', count: 0 }, { date: '2026-10-11', count: 4 }]);
    });

    test('rows outside the window are ignored', () => {
        expect(fillDailyTrend([{ date: '2026-01-01', count: 9 }], 2, today)).toEqual([
            { date: '2026-10-10', count: 0 },
            { date: '2026-10-11', count: 0 },
        ]);
    });
});

describe('GET /api/admin/analytics with older enquiries', () => {
    const ids = [];
    const DAY = 24 * 60 * 60 * 1000;

    beforeAll(async () => {
        const base = { lastName: 'Window', phone: '+15555550123', inquiryType: 'Sales', message: 'Analytics window test.' };
        const rows = [
            { ...base, firstName: 'Old', email: 'window-old@example.com', modelInterest: 'CarreraGT', createdAt: new Date(Date.now() - 60 * DAY) },
            { ...base, firstName: 'New1', email: 'window-new1@example.com', modelInterest: 'CarreraGT', inquiryType: 'Sales' },
            { ...base, firstName: 'New2', email: 'window-new2@example.com', modelInterest: 'CarreraGT', inquiryType: 'Service' },
        ];
        for (const data of rows) ids.push((await prisma.contact.create({ data })).id);
    });

    afterAll(async () => {
        await prisma.contact.deleteMany({ where: { id: { in: ids } } });
        await prisma.$disconnect();
    });

    test('popularity and funnel count all enquiries, not just the last week or month', async () => {
        const res = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${await adminToken()}`);
        expect(res.statusCode).toBe(200);
        const { popularModels, conversions } = res.body.data;
        const carreraGt = popularModels.find((m) => m.model === 'Carrera GT');
        expect(carreraGt.count).toBeGreaterThanOrEqual(3); // includes the 60-day-old one
        expect(conversions.total).toBeGreaterThanOrEqual(3);
    });

    test('trends: 30 daily points ending today, one per day, today counting both new enquiries', async () => {
        const res = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${await adminToken()}`);
        const { trends } = res.body.data;
        expect(trends).toHaveLength(30);
        expect(trends[0]).toEqual({ date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), count: expect.any(Number) });
        expect(new Set(trends.map((t) => t.date)).size).toBe(30);
        expect(trends[29].count).toBeGreaterThanOrEqual(2); // Sales + Service on the same day: one point
    });
});
