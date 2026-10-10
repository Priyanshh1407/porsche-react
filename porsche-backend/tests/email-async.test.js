// ERR-03 (now via the UPG-03 outbox): a slow or hung SMTP server must not block, fail or lose a
// contact submission.
import net from 'net';
import { jest } from '@jest/globals';
import request from 'supertest';

let app;
let prisma;
let outbox;
let smtp;
let connections = 0;
const sockets = new Set();

beforeAll(async () => {
    // An SMTP server that accepts connections and never says a word (worst case: no greeting).
    smtp = net.createServer((socket) => { connections += 1; sockets.add(socket); });
    await new Promise((resolve) => smtp.listen(0, '127.0.0.1', resolve));
    Object.assign(process.env, {
        EMAIL_HOST: '127.0.0.1',
        EMAIL_PORT: String(smtp.address().port),
        EMAIL_USER: 'test',
        EMAIL_PASS: 'not-demo-mode', // real nodemailer sends, against the hung server
        EMAIL_TIMEOUT_MS: '400',
    });
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
    outbox = await import('../utils/emailOutbox.js');
});

afterAll(async () => {
    process.env.EMAIL_PASS = ''; // back to demo mode for any later import
    await prisma.contact.deleteMany({ where: { email: 'err03@example.com' } });
    await prisma.$disconnect();
    sockets.forEach((s) => s.destroy());
    await new Promise((resolve) => smtp.close(resolve));
});

let contactId;

test('the visitor gets 201 without the request ever touching the mail server', async () => {
    const res = await request(app).post('/api/contact/submit').send({
        firstName: 'Err', lastName: 'Three', email: 'err03@example.com', phone: '5550303',
        inquiryType: 'Sales', message: 'Testing a hung mail server.',
    });
    expect(res.statusCode).toBe(201);
    contactId = res.body.data.id;
    expect(connections).toBe(0); // the route only records the emails; delivery is the worker's job
    expect(await prisma.emailOutbox.count({ where: { contactId, status: 'pending' } })).toBe(2);
});

test('the worker times out on the hung server, records why, and schedules a retry (nothing lost)', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        await outbox.runOnce({ contactIds: [contactId] }); // default sender: real nodemailer
    } finally {
        errorSpy.mockRestore();
    }
    expect(connections).toBeGreaterThan(0);
    const rows = await prisma.emailOutbox.findMany({ where: { contactId } });
    expect(rows).toHaveLength(2);
    for (const row of rows) {
        expect(row.status).toBe('pending');
        expect(row.attempts).toBe(1);
        expect(row.lastError).toBe('Greeting never received'); // nodemailer's greetingTimeout (EMAIL_TIMEOUT_MS)
        expect(row.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    }
});
