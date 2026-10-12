// AUD-01: the lead details show what happened to the lead, oldest first (audit events + emails).
import { render, screen, within } from '@testing-library/react';
import LeadTimeline, { describeEvent } from './LeadTimeline';

const json = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });

afterEach(() => { delete global.fetch; });

test('lists events and emails in time order, with who did it', async () => {
    global.fetch = jest.fn(() => json({ data: {
        events: [
            { id: 'a', at: '2026-10-12T09:00:00Z', actor: 'public', action: 'lead_created', after: { source: 'Website' } },
            { id: 'b', at: '2026-10-12T11:00:00Z', actor: 'admin:boss@example.com', action: 'status_changed', before: { status: 'new' }, after: { status: 'contacted' } },
        ],
        emails: [{ kind: 'customer_confirmation', status: 'sent', attempts: 1, sentAt: '2026-10-12T10:00:00Z', createdAt: '2026-10-12T09:00:00Z' }],
    } }));
    render(<LeadTimeline contactId="lead-1" />);
    const items = await screen.findAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual([
        expect.stringMatching(/Enquiry received via Website.*visitor/),
        expect.stringMatching(/Customer confirmation email sent/),
        expect.stringMatching(/Status: new → contacted.*boss@example\.com/),
    ]);
    expect(global.fetch.mock.calls[0][0]).toBe('/api/admin/contacts/lead-1/timeline');
});

test('shows an error line when the timeline cannot be loaded', async () => {
    global.fetch = jest.fn(() => json({ success: false }, 500));
    render(<LeadTimeline contactId="lead-1" />);
    expect(await screen.findByText(/Couldn't load the timeline/)).toBeInTheDocument();
});

test('says so when there is no history (leads from before the audit log)', async () => {
    global.fetch = jest.fn(() => json({ data: { events: [], emails: [] } }));
    render(<LeadTimeline contactId="lead-1" />);
    const region = await screen.findByRole('region', { name: 'Timeline' });
    expect(await within(region).findByText(/No history recorded/)).toBeInTheDocument();
});

test.each([
    [{ action: 'notes_changed', after: { notes: 'Call Friday' } }, 'Notes: “Call Friday”'],
    [{ action: 'notes_changed', after: { notes: null } }, 'Notes cleared'],
    [{ action: 'lead_triaged', after: { score: 'hot', summary: 'Ready to buy' } }, 'AI triage: hot (Ready to buy)'],
    [{ action: 'something_new' }, 'something new'],
])('describeEvent %#', (event, text) => {
    expect(describeEvent(event)).toBe(text);
});
