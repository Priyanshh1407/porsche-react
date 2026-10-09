// VAL-02: the contact form must accept real people's names and phone numbers, and still reject junk.
import request from 'supertest';

let app;
let prisma;
const createdIds = [];
let ipCounter = 0;

beforeAll(async () => {
    // Each request gets its own client IP via X-Forwarded-For (as behind a real proxy), so the
    // 5-per-hour contact limiter doesn't interfere with this file's ~10 submissions.
    process.env.TRUST_PROXY = '1';
    ({ default: app } = await import('../server.js'));
    ({ default: prisma } = await import('../prisma/client.js'));
});

afterAll(async () => {
    if (createdIds.length) await prisma.contact.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
    delete process.env.TRUST_PROXY;
});

const submit = async (overrides) => {
    ipCounter += 1;
    const res = await request(app)
        .post('/api/contact/submit')
        .set('X-Forwarded-For', `203.0.113.${ipCounter}`)
        .send({
            firstName: 'Anna', lastName: 'Schmidt', email: `val02-${ipCounter}@example.com`,
            phone: '+15555550123', inquiryType: 'Sales', message: 'Please call me about a test drive.',
            ...overrides,
        });
    if (res.body?.data?.id) createdIds.push(res.body.data.id);
    return res;
};

const errorFields = (res) => (res.body.errors || []).map((e) => e.path);

describe('VAL-02: names', () => {
    test.each([
        ['José', 'Müller'],
        ['Zoë', "O'Connor-Brontë"],
        ['François', 'Lefèvre'],
        ['李', '明华'],
        ['Mary Ann', 'St. John'],
    ])('accepts %s %s', async (firstName, lastName) => {
        const res = await submit({ firstName, lastName });
        expect(res.statusCode).toBe(201);
    });

    test.each([
        ['digits', 'Anna2'],
        ['markup', '<b>Anna</b>'],
        ['symbols', 'Anna$$'],
    ])('rejects a first name with %s', async (_, firstName) => {
        const res = await submit({ firstName });
        expect(res.statusCode).toBe(400);
        expect(errorFields(res)).toContain('firstName');
    });
});

describe('VAL-02: phone numbers', () => {
    test.each(['+49 711 9110', '+1 (555) 555-0123', '0711 911 0', '+44 20 7946 0958', '555.555.0123'])(
        'accepts %s', async (phone) => {
            const res = await submit({ phone });
            expect(res.statusCode).toBe(201);
        }
    );

    test.each(['call me', '12345', '+1 555 555 0123 4567 8901', '555-0123 ext. 4'])(
        'rejects %s', async (phone) => {
            const res = await submit({ phone });
            expect(res.statusCode).toBe(400);
            expect(errorFields(res)).toContain('phone');
        }
    );
});
