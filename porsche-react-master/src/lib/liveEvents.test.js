// Phase 9: the admin's live connection. Ticket first (EventSource can't send the JWT), then the
// stream; on any drop: back off, get a NEW ticket (they are single use) and reconnect.
import { connectLiveEvents } from './liveEvents';

class FakeEventSource {
    static instances = [];
    constructor(url) { this.url = url; this.listeners = {}; this.closed = false; FakeEventSource.instances.push(this); }
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
    emit(type, data) { (this.listeners[type] || []).forEach((fn) => fn({ data: JSON.stringify(data) })); }
    close() { this.closed = true; }
}

const json = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });
let ticketNo;

beforeEach(() => {
    jest.useFakeTimers();
    FakeEventSource.instances = [];
    global.EventSource = FakeEventSource;
    ticketNo = 0;
    global.fetch = jest.fn(() => json({ ticket: `t${++ticketNo}`, expiresIn: 30 }, 201));
    localStorage.setItem('adminToken', 'jwt');
});

afterEach(() => {
    jest.useRealTimers();
    delete global.EventSource;
    localStorage.clear();
});

const flush = async () => { for (let i = 0; i < 5; i++) await Promise.resolve(); };

test('gets a ticket with the admin token, then opens the stream with it', async () => {
    const onStatus = jest.fn();
    connectLiveEvents({ onEvent: () => {}, onStatus });
    await flush();
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/events/ticket', expect.objectContaining({ method: 'POST', headers: { Authorization: 'Bearer jwt' } }));
    expect(FakeEventSource.instances[0].url).toBe('/api/admin/events?ticket=t1');
    FakeEventSource.instances[0].onopen();
    expect(onStatus).toHaveBeenLastCalledWith('live');
});

test('passes events on by type', async () => {
    const onEvent = jest.fn();
    connectLiveEvents({ onEvent, onStatus: () => {} });
    await flush();
    FakeEventSource.instances[0].emit('lead.created', { id: 'l1', name: 'Ana Lee' });
    expect(onEvent).toHaveBeenCalledWith('lead.created', { id: 'l1', name: 'Ana Lee' });
});

test('a dropped stream reconnects with a fresh ticket, backing off', async () => {
    const onStatus = jest.fn();
    connectLiveEvents({ onEvent: () => {}, onStatus });
    await flush();
    const first = FakeEventSource.instances[0];
    first.onerror();
    expect(first.closed).toBe(true);
    expect(onStatus).toHaveBeenLastCalledWith('reconnecting');
    jest.advanceTimersByTime(999);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(1);
    await flush();
    expect(FakeEventSource.instances[1].url).toBe('/api/admin/events?ticket=t2');
    FakeEventSource.instances[1].onerror(); // fails again: waits longer
    jest.advanceTimersByTime(1999);
    await flush();
    expect(FakeEventSource.instances).toHaveLength(2);
    jest.advanceTimersByTime(1);
    await flush();
    expect(FakeEventSource.instances).toHaveLength(3);
});

test('a refused ticket (logged out) stops for good', async () => {
    global.fetch = jest.fn(() => json({ success: false }, 401));
    const onStatus = jest.fn();
    connectLiveEvents({ onEvent: () => {}, onStatus });
    await flush();
    jest.advanceTimersByTime(60_000);
    await flush();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(FakeEventSource.instances).toHaveLength(0);
    expect(onStatus).toHaveBeenLastCalledWith('offline');
});

test('disconnect closes the stream and cancels any pending reconnect', async () => {
    const disconnect = connectLiveEvents({ onEvent: () => {}, onStatus: () => {} });
    await flush();
    FakeEventSource.instances[0].onerror();
    disconnect();
    jest.advanceTimersByTime(60_000);
    await flush();
    expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('without EventSource support it reports offline and does nothing', () => {
    delete global.EventSource;
    const onStatus = jest.fn();
    connectLiveEvents({ onEvent: () => {}, onStatus });
    expect(onStatus).toHaveBeenCalledWith('offline');
    expect(global.fetch).not.toHaveBeenCalled();
});
