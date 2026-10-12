// The test database must store any Unicode text, like production (UTF8). An embedded Postgres
// initialised with the Windows code page (WIN1252) could not store e.g. Cyrillic, and hid that
// the API's own name validation is what rejects it.
let prisma;
beforeAll(async () => { ({ default: prisma } = await import('../prisma/client.js')); });
afterAll(() => prisma.$disconnect());

test('the database encoding is UTF8 and round-trips non-Latin text', async () => {
    const [{ server_encoding: encoding }] = await prisma.$queryRaw`SELECT current_setting('server_encoding') AS server_encoding`;
    expect(encoding).toBe('UTF8');
    const [{ text }] = await prisma.$queryRaw`SELECT ${'Владимир 東京 🏎'}::text AS text`;
    expect(text).toBe('Владимир 東京 🏎');
});
