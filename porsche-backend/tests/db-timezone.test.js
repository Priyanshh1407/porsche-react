// The app's database sessions always run in UTC, whatever the server's TimeZone setting.
// Timestamps are stored as UTC "timestamp without time zone" (Prisma), and raw SQL compares them
// with now()/CURRENT_DATE, which Postgres evaluates in the SESSION time zone. On a server set to
// e.g. Asia/Calcutta (a default local Windows install) leases, retries and analytics windows were
// off by 5.5 hours. The Docker test DB runs in UTC, which hid it; the embedded one does not.
import prisma from '../prisma/client.js';

afterAll(() => prisma.$disconnect());

test('every session uses UTC', async () => {
    const [{ TimeZone }] = await prisma.$queryRaw`SHOW TimeZone`;
    expect(TimeZone).toBe('UTC');
});

test('now() in SQL and new Date() in JS agree (within a few seconds)', async () => {
    const [{ now }] = await prisma.$queryRaw`SELECT now()::timestamp AS now`;
    expect(Math.abs(now.getTime() - Date.now())).toBeLessThan(5000);
});
