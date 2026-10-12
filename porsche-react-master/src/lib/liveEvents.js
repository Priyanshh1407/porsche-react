import { API_BASE_URL, apiFetch, readJson } from './api';

// Phase 9: live admin notifications. EventSource can't send the JWT, so each connection first gets
// a single-use ticket (valid 30 s) with it. Any drop (network, server restart, token expiry) closes
// the stream; it reconnects after a back-off with a new ticket. A refused ticket means the login is
// gone (apiFetch has already told AuthContext), so it stops.
export const LIVE_EVENT_TYPES = ['lead.created', 'lead.updated', 'lead.deleted', 'lead.triaged'];
const MAX_DELAY_MS = 30_000;

/** Connects; returns a function that disconnects. `onStatus`: 'connecting' | 'live' | 'reconnecting' | 'offline'. */
export function connectLiveEvents({ onEvent, onStatus }) {
    if (typeof EventSource === 'undefined') {
        onStatus('offline');
        return () => {};
    }
    let source = null;
    let timer = null;
    let stopped = false;
    let delay = 1000;

    const retry = () => {
        if (stopped) return;
        onStatus('reconnecting');
        timer = setTimeout(connect, delay);
        delay = Math.min(delay * 2, MAX_DELAY_MS);
    };

    async function connect() {
        timer = null;
        onStatus('connecting');
        let res;
        try {
            res = await apiFetch('/api/admin/events/ticket', { method: 'POST', auth: true });
        } catch {
            return retry();
        }
        if (stopped) return;
        if (res.status === 401 || res.status === 403) { stopped = true; onStatus('offline'); return; }
        const body = res.ok ? await readJson(res) : null;
        if (!body?.ticket) return retry();

        source = new EventSource(`${API_BASE_URL}/api/admin/events?ticket=${encodeURIComponent(body.ticket)}`);
        source.onopen = () => { delay = 1000; onStatus('live'); };
        // EventSource would retry by itself with the same (now used) ticket; close and start over.
        source.onerror = () => { source.close(); source = null; retry(); };
        for (const type of LIVE_EVENT_TYPES) {
            source.addEventListener(type, (e) => {
                let data;
                try { data = JSON.parse(e.data); } catch { return; }
                onEvent(type, data);
            });
        }
    }

    connect();
    return () => {
        stopped = true;
        if (timer) clearTimeout(timer);
        source?.close();
    };
}
