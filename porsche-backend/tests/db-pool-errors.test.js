// A dropped idle database connection (Postgres restart, failover, network blip) makes the pg pool
// emit 'error'. Without a listener, Node treats that as fatal and the whole API process crashed.
// The pool must log it and carry on (pg opens a fresh connection for the next query).
import { jest } from '@jest/globals';
import prisma, { pool } from '../prisma/client.js';

afterAll(() => prisma.$disconnect());

test('an idle-connection error is logged, not fatal', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        expect(() => pool.emit('error', new Error('Connection terminated unexpectedly'), {})).not.toThrow();
        expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/idle database connection/i), 'Connection terminated unexpectedly');
    } finally {
        errorSpy.mockRestore();
    }
    const [{ ok }] = await prisma.$queryRaw`SELECT 1 AS ok`; // and the app still reaches the database
    expect(ok).toBe(1);
});
