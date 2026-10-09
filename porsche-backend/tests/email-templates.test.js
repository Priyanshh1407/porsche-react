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
