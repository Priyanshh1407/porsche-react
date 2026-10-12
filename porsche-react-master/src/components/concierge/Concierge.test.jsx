// Phase 11: the AI concierge widget. Shown only where it helps and only when the backend says the
// assistant is available; the chat sends the whole conversation and renders replies, model links
// and booking confirmations.
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConciergeLauncher, { showsConcierge, resetConciergeStatusForTests } from './ConciergeLauncher';
import ConciergePanel from './ConciergePanel';

const json = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });

beforeEach(() => resetConciergeStatusForTests());
afterEach(() => { delete global.fetch; });

test.each([
    ['/', false], // home page is frozen
    ['/models/taycan', false], // 3D showroom
    ['/models/911-gt3-rs', false],
    ['/models/Taycan', false], // old URL of a showroom
    ['/admin/dashboard', false],
    ['/models', true],
    ['/contact', true],
    ['/configurator', true],
    ['/models/macan-gts', true], // photo page
    ['/models/taycan/details', true], // classic detail page
    ['/models/no-such-car', false],
])('showsConcierge(%s) = %s', (path, expected) => {
    expect(showsConcierge(path)).toBe(expected);
});

const renderLauncher = (path) => render(<MemoryRouter initialEntries={[path]}><ConciergeLauncher /></MemoryRouter>);

test('appears when the assistant is available, and opens the chat', async () => {
    global.fetch = jest.fn(() => json({ success: true, available: true }));
    renderLauncher('/models');
    fireEvent.click(await screen.findByRole('button', { name: 'Open the Porsche concierge chat' }));
    expect(await screen.findByRole('dialog', { name: 'Porsche concierge' })).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith('/api/concierge/status', expect.anything());
});

test('stays hidden without an API key on the server', async () => {
    global.fetch = jest.fn(() => json({ success: true, available: false }));
    renderLauncher('/contact');
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /concierge/ })).toBeNull();
});

test('on the home page it does not even ask the server', () => {
    global.fetch = jest.fn(() => json({ available: true }));
    renderLauncher('/');
    expect(global.fetch).not.toHaveBeenCalled();
});

const renderPanel = () => render(<MemoryRouter><ConciergePanel onClose={() => {}} /></MemoryRouter>);
const type = (text) => {
    fireEvent.change(screen.getByLabelText('Your message'), { target: { value: text } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};

test('sends the conversation and shows the reply with links to the models it named', async () => {
    global.fetch = jest.fn(() => json({ success: true, reply: 'The Taycan is our electric model.', models: [{ name: 'Taycan', url: '/models/taycan' }] }));
    renderPanel();
    type('Electric cars?');
    expect(await screen.findByText('The Taycan is our electric model.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Taycan →' })).toHaveAttribute('href', '/models/taycan');
    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ messages: [{ role: 'user', text: 'Electric cars?' }] });

    global.fetch.mockImplementation(() => json({ success: true, reply: 'About 270 miles.', models: [] }));
    type('Range?');
    await screen.findByText('About 270 miles.');
    expect(JSON.parse(global.fetch.mock.calls[1][1].body).messages).toEqual([
        { role: 'user', text: 'Electric cars?' },
        { role: 'assistant', text: 'The Taycan is our electric model.' },
        { role: 'user', text: 'Range?' },
    ]);
});

test('a booked test drive shows a confirmation', async () => {
    global.fetch = jest.fn(() => json({ success: true, reply: 'Done!', models: [], booking: { id: 'x', model: 'Taycan' } }));
    renderPanel();
    type('Yes, send it');
    expect(await screen.findByRole('status')).toHaveTextContent('Test drive request sent for the Taycan');
});

test('unavailable (503) shows a friendly message with the contact form', async () => {
    global.fetch = jest.fn(() => json({ success: false, message: 'x' }, 503));
    renderPanel();
    type('hello');
    expect(await screen.findByRole('alert')).toHaveTextContent('The assistant is unavailable right now');
    expect(screen.getByRole('link', { name: 'Contact form' })).toHaveAttribute('href', '/contact');
});

test('the input is capped at 2000 characters', () => {
    renderPanel();
    expect(screen.getByLabelText('Your message')).toHaveAttribute('maxLength', '2000');
});
