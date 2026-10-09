import prisma from '../prisma/client.js';

// ERR-02: a real round-trip to Postgres, bounded in time. With the pg driver adapter,
// prisma.$connect() resolves without opening a connection, so it can't tell whether the DB is up.
export async function checkDatabase(timeoutMs = 3000) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`no response within ${timeoutMs} ms`)), timeoutMs);
    });
    try {
        await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);
    } finally {
        clearTimeout(timer);
    }
}
