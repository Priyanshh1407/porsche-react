// SEC-02: visitor input must never become live HTML in outgoing emails.
import { getAdminEmailTemplate, getCustomerEmailTemplate } from '../utils/emailService.js';

const attack = '<script>alert(1)</script> <a href="https://evil.example">claim your prize</a>';

const contact = (overrides = {}) => ({
    firstName: 'Anna',
    lastName: "O'Brien",
    email: 'anna@example.com',
    phone: '+1 555 0123',
    inquiryType: 'Sales',
    modelInterest: 'GT3RS',
    preferredContactMethod: 'Email',
    preferredContactTime: 'Morning',
    message: attack,
    createdAt: new Date('2026-10-09T10:00:00Z'),
    ...overrides,
});

describe('admin notification email', () => {
    const { html } = getAdminEmailTemplate(contact());

    test('contains the message, HTML-escaped', () => {
        expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(html).toContain('&lt;a href=&quot;https://evil.example&quot;&gt;');
    });

    test('contains no visitor-supplied markup', () => {
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('href="https://evil.example"');
    });

    test('escapes quotes in other fields too', () => {
        expect(html).toContain('O&#39;Brien');
    });
});

describe('customer confirmation email', () => {
    const { html } = getCustomerEmailTemplate(contact());

    test('does not echo the free-text message back to the address the visitor typed', () => {
        expect(html).not.toContain('evil.example');
        expect(html).not.toContain('claim your prize');
        expect(html).not.toContain('Message:');
    });

    test('still confirms the inquiry details, escaped', () => {
        expect(html).toContain('Dear Anna O&#39;Brien');
        expect(html).toContain('SALES');
    });
});

describe('model names and priority (Phase 4 fixes)', () => {
    test.each([
        ['718_Cayman', '718 Cayman'],
        ['GT2RS_911', '911 GT2 RS'],
        ['TurboS_911', '911 Turbo S'],
        ['Spyder_918', '918 Spyder'],
    ])('customer email names %s as "%s" (was "718Cayman"-style)', (value, label) => {
        const { html } = getCustomerEmailTemplate(contact({ modelInterest: value }));
        expect(html).toContain(`interest in ${label}.`);
        expect(html).toContain(`<strong>Model Interest:</strong> ${label}`);
    });

    test('customer email says "our vehicles" when no model was chosen', () => {
        expect(getCustomerEmailTemplate(contact({ modelInterest: 'Not_specified' })).html).toContain('interest in our vehicles.');
    });

    test('admin email uses the model label', () => {
        expect(getAdminEmailTemplate(contact({ modelInterest: 'GT2RS_911' })).html).toContain('911 GT2 RS');
    });

    test.each([['Sales', 'HIGH'], ['Service', 'NORMAL'], ['Test_Drive', 'NORMAL']])(
        'admin email priority for %s is %s (Sales never matched the old lower-case check)', (inquiryType, priority) => {
            expect(getAdminEmailTemplate(contact({ inquiryType })).html).toContain(`Priority: ${priority}`);
        }
    );
});
