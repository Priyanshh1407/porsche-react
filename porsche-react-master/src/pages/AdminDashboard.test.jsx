// BUG-05 + BUG-07: the Contacts tab pages/searches on the server, and every status is reachable.
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { AuthProvider } from '../context/AuthContext';
import { fakeJwt } from '../testUtils/fakeJwt';

const contact = (i, status = 'new') => ({
    id: `id-${i}`, firstName: `Person${i}`, lastName: 'Test', email: `p${i}@example.com`, phone: '5550000',
    modelInterest: 'GT3RS', inquiryType: 'Sales', status, createdAt: '2026-10-09T10:00:00Z',
});

const json = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });

let calls;
beforeEach(() => {
    calls = [];
    localStorage.setItem('adminToken', fakeJwt());
    global.fetch = jest.fn((url, options = {}) => {
        calls.push({ url, method: options.method || 'GET', body: options.body });
        const u = new URL(url, 'http://x');
        if (u.pathname === '/api/admin/stats') return json({ data: { overview: {} } });
        if (u.pathname === '/api/admin/analytics') return json({ data: { trends: [], popularModels: [], conversions: {}, peakHours: [] } });
        if (u.pathname === '/api/admin/contacts' && u.searchParams.get('limit') === '5') return json({ data: [contact(0)] });
        if (u.pathname === '/api/admin/contacts') {
            const page = Number(u.searchParams.get('page'));
            const items = page === 1 ? Array.from({ length: 20 }, (_, i) => contact(i + 1)) : [contact(21)];
            // UPG-03: one lead with its email delivery recorded by the outbox.
            items[0].emails = [{ kind: 'customer_confirmation', status: 'sent', attempts: 1 }, { kind: 'admin_notification', status: 'pending', attempts: 3 }];
            return json({ data: items, pagination: { current: page, pages: 2, total: 21, limit: 20 } });
        }
        if (options.method === 'PUT') return json({ success: true, data: {} });
        return json({});
    });
});

afterEach(() => {
    localStorage.clear();
    jest.useRealTimers();
});

const contactListCalls = () => calls.filter((c) => c.url.startsWith('/api/admin/contacts?') && !c.url.includes('limit=5'));

const openContactsTab = async () => {
    render(<AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider>);
    fireEvent.click(await screen.findByRole('button', { name: /Contacts/ }));
    await screen.findByText('Person20 Test');
};

test('the Contacts tab asks the server for page 1 and shows the total and page count', async () => {
    await openContactsTab();
    expect(contactListCalls()[0].url).toBe('/api/admin/contacts?page=1&limit=20');
    expect(screen.getByText(/21 contacts · page 1 of 2/)).toBeInTheDocument();
});

test('Next fetches page 2 from the server (contact #21 is reachable)', async () => {
    await openContactsTab();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Person21 Test')).toBeInTheDocument();
    expect(contactListCalls().some((c) => c.url === '/api/admin/contacts?page=2&limit=20')).toBe(true);
});

test('search is sent to the server (debounced) and restarts at page 1', async () => {
    await openContactsTab();
    fireEvent.change(screen.getByPlaceholderText('Search contacts...'), { target: { value: 'anna' } });
    await waitFor(() => expect(contactListCalls().some((c) => c.url === '/api/admin/contacts?page=1&limit=20&q=anna')).toBe(true));
});

test('every pipeline status can be chosen and is sent to the API (BUG-07)', async () => {
    await openContactsTab();
    const select = screen.getByRole('combobox', { name: 'Status for Person1 Test' });
    expect(within(select).getAllByRole('option').map((o) => o.value)).toEqual(['new', 'contacted', 'qualified', 'closed']);

    fireEvent.change(select, { target: { value: 'qualified' } });
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT')).toBe(true));
    const put = calls.find((c) => c.method === 'PUT');
    expect(put.url).toBe('/api/admin/contacts/id-1');
    expect(JSON.parse(put.body)).toEqual({ status: 'qualified' });
});

test('only real tabs are offered (the fake Settings tab is gone)', async () => {
    render(<AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider>);
    await screen.findByRole('button', { name: /Contacts/ });
    expect(screen.queryByRole('button', { name: /Settings/ })).not.toBeInTheDocument();
    for (const tab of [/Dashboard/, /Contacts/, /Analytics/]) {
        expect(screen.getByRole('button', { name: tab })).toBeInTheDocument();
    }
});

test('each lead in the Contacts tab shows its email delivery state from the API (UPG-03)', async () => {
    await openContactsTab();
    // A row's accessible name is its cell text, so each lead's row can be found by its email.
    const row = (email) => screen.getByRole('row', { name: (name) => name.includes(email) });
    expect(within(row('p1@example.com')).getByText('Retrying (3/5)')).toBeInTheDocument();
    expect(within(row('p2@example.com')).getByText('—')).toBeInTheDocument(); // created before the outbox
});

describe('charts (reported: no graphs on the dashboard or Analytics)', () => {
    const quietMonth = Array.from({ length: 30 }, (_, i) => ({ date: `2026-09-${String(i + 1).padStart(2, '0')}`, count: 0 }));
    const withAnalytics = (data) => {
        const base = global.fetch;
        global.fetch = jest.fn((url, options) => (new URL(url, 'http://x').pathname === '/api/admin/analytics'
            ? json({ data: { conversions: {}, peakHours: [], ...data } })
            : base(url, options)));
    };
    const renderDashboard = () => render(<AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider>);

    test('each chart says which period it covers, on the dashboard and the Analytics tab', async () => {
        withAnalytics({ trends: quietMonth, popularModels: [{ model: '911 GT3 RS', count: 2 }] });
        renderDashboard();
        expect(await screen.findAllByText('Last 30 days')).toHaveLength(1);
        expect(screen.getAllByText('All time')).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: /Analytics/ }));
        expect(await screen.findAllByText('Last 30 days')).toHaveLength(1);
        expect(screen.getAllByText('All time').length).toBeGreaterThanOrEqual(1);
    });

    test('with no enquiries the charts say so instead of showing a blank box', async () => {
        withAnalytics({ trends: quietMonth, popularModels: [] });
        renderDashboard();
        expect(await screen.findByText('No enquiries in the last 30 days')).toBeInTheDocument();
        expect(screen.getByText('No enquiries with a model yet')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Analytics/ }));
        expect(await screen.findByText('No enquiries in the last 30 days')).toBeInTheDocument();
        expect(screen.getByText('No enquiries with a model yet')).toBeInTheDocument();
    });

    test('with enquiries there is no empty-state message', async () => {
        withAnalytics({ trends: quietMonth.map((d, i) => (i === 29 ? { ...d, count: 3 } : d)), popularModels: [{ model: 'Taycan', count: 1 }] });
        renderDashboard();
        await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument()); // data arrived
        expect(screen.queryByText('No enquiries in the last 30 days')).not.toBeInTheDocument();
        expect(screen.queryByText('No enquiries with a model yet')).not.toBeInTheDocument();
    });
});

test('if analytics fail to load, the charts say so (not "no enquiries")', async () => {
    const base = global.fetch;
    global.fetch = jest.fn((url, options) => (new URL(url, 'http://x').pathname === '/api/admin/analytics'
        ? json({ success: false }, 500)
        : base(url, options)));
    render(<AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider>);
    expect(await screen.findAllByText("Couldn't load analytics")).toHaveLength(2);
    expect(screen.queryByText('No enquiries in the last 30 days')).not.toBeInTheDocument();
});

// Phase 9: live updates.
describe('live updates', () => {
    class FakeEventSource {
        static last;
        constructor(url) { this.url = url; this.listeners = {}; FakeEventSource.last = this; }
        addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
        emit(type, data) { (this.listeners[type] || []).forEach((fn) => fn({ data: JSON.stringify(data) })); }
        close() {}
    }
    beforeEach(() => {
        global.EventSource = FakeEventSource;
        FakeEventSource.last = null;
        const base = global.fetch;
        global.fetch = jest.fn((url, options = {}) => (url === '/api/admin/events/ticket'
            ? json({ ticket: 'tk', expiresIn: 30 }, 201)
            : base(url, options)));
    });
    afterEach(() => { delete global.EventSource; });

    test('shows Live once connected, and a new lead pops a toast and refreshes the dashboard', async () => {
        render(<AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider>);
        await waitFor(() => expect(FakeEventSource.last).not.toBeNull());
        expect(FakeEventSource.last.url).toBe('/api/admin/events?ticket=tk');
        FakeEventSource.last.onopen();
        expect(await screen.findByTestId('live-status')).toHaveTextContent('Live');

        const statsCalls = () => global.fetch.mock.calls.filter(([u]) => u === '/api/admin/stats').length;
        const before = statsCalls();
        FakeEventSource.last.emit('lead.created', { id: 'n1', name: 'Ana Lee', modelInterest: 'Taycan' });
        expect(await screen.findByRole('status')).toHaveTextContent('New lead: Ana Lee · Taycan');
        await waitFor(() => expect(statsCalls()).toBe(before + 1));
    });

    test('without EventSource the dashboard says Offline', async () => {
        delete global.EventSource;
        render(<AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider>);
        expect(await screen.findByTestId('live-status')).toHaveTextContent('Offline');
    });
});

// Phase 10: AI triage in the Contacts tab.
test('the AI score filter is sent to the server and the triage badge shows', async () => {
    const base = global.fetch;
    global.fetch = jest.fn((url, options) => {
        const u = new URL(url, 'http://x');
        if (u.pathname === '/api/admin/contacts' && u.searchParams.get('page')) {
            return base(url, options).then(async (r) => {
                const body = await r.json();
                body.data[0].triage = { status: 'done', score: 'hot', summary: 'Ready to buy.', nextStep: 'Call today.' };
                body.ai = { enabled: true, model: 'gemini-3.8-flash' };
                return { ok: true, status: 200, json: async () => body };
            });
        }
        return base(url, options);
    });
    await openContactsTab();
    expect(await screen.findByTitle('Ready to buy.')).toHaveTextContent('Hot');
    fireEvent.change(screen.getByRole('combobox', { name: 'AI score' }), { target: { value: 'hot' } });
    await waitFor(() => expect(global.fetch.mock.calls.some(([u]) => u === '/api/admin/contacts?page=1&limit=20&score=hot')).toBe(true));
});
