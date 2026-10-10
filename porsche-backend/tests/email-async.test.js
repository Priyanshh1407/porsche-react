// ERR-03: a slow or hung SMTP server must not block (or fail) a contact submission.
import net from 'net';
import { jest } from '@jest/globals';
import request from 'supertest';

let app;
let prisma;
let smtp;
let errorSpy;
const sockets = new Set();

beforeAll(async () => {
    // An SMTP server that accepts connections and never says a word (worst case: no greeting).
    smtp = net.createServer((socket) => { sockets.add(socket); });
    await new Promise((resolve) => smtp.listen(0, '127.0.0.1', resolve));
    Object.assign(process.env, {
        EMAIL_HOST: '127.0.0.1',
        EMAIL_PORT: String(smtp.address().port),
        EMAIL_USER: 'test',
        EMAIL_PASS: 'not-demo-mode',
        EMAIL_TIMEOUT_MS: '400', // short so the background failure arrives within the test
    });
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
});

afterAll(async () => {
    process.env.EMAIL_PASS = ''; // back to demo mode for any later import
    await prisma.contact.deleteMany({ where: { email: 'err03@example.com' } });
    await prisma.$disconnect();
    sockets.forEach((s) => s.destroy());
    await new Promise((resolve) => smtp.close(resolve));
});

beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errorSpy.mockRestore());

const emailFailureLogged = () => errorSpy.mock.calls.some((c) => String(c[0]).includes('Email sending failed'));

test('the lead is saved and the visitor gets 201 before the hung email attempt has even failed', async () => {
    const res = await request(app).post('/api/contact/submit').send({
        firstName: 'Err', lastName: 'Three', email: 'err03@example.com', phone: '5550303',
        inquiryType: 'Sales', message: 'Testing a hung mail server.',
    });

    expect(res.statusCode).toBe(201);
    // Ordering, not timing: if the route awaited the send, the SMTP timeout would have fired and
    // been logged BEFORE this response arrived. (A wall-clock limit was flaky on a busy machine
    // and could not tell the difference once EMAIL_TIMEOUT_MS is short.)
    expect(emailFailureLogged()).toBe(false);
    expect(await prisma.contact.findUnique({ where: { id: res.body.data.id } })).not.toBeNull();
});

test('the email failure is logged in the background instead of being lost silently', async () => {
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline && !emailFailureLogged()) {
        await new Promise((r) => setTimeout(r, 100));
    }
    expect(emailFailureLogged()).toBe(true);
});
