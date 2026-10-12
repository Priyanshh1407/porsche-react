import { useEffect, useState } from 'react';
import { apiFetch, readJson } from '../lib/api';

// AUD-01: everything that happened to one lead, oldest first: the backend's audit events
// (created, status/notes changes, AI triage) merged with its outbox emails.
const EMAIL_LABEL = { customer_confirmation: 'Customer confirmation', admin_notification: 'Admin notification' };

export function describeEvent({ action, before, after }) {
    switch (action) {
        case 'lead_created': return `Enquiry received via ${after?.source || 'website'}`;
        case 'status_changed': return `Status: ${before?.status} → ${after?.status}`;
        case 'notes_changed': return after?.notes ? `Notes: “${after.notes}”` : 'Notes cleared';
        case 'lead_triaged': return `AI triage: ${after?.score}${after?.summary ? ` (${after.summary})` : ''}`;
        case 'lead_deleted': return 'Lead deleted';
        default: return action.replace(/_/g, ' ');
    }
}

const describeEmail = (e) => {
    const name = `${EMAIL_LABEL[e.kind] || e.kind} email`;
    if (e.status === 'sent') return `${name} sent`;
    if (e.status === 'failed') return `${name} failed after ${e.attempts} attempts`;
    return `${name} queued`;
};

const who = (actor) => {
    if (actor === 'public') return 'visitor';
    if (actor === 'ai') return 'AI';
    return actor?.startsWith('admin:') ? actor.slice(6) : actor;
};

const when = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export default function LeadTimeline({ contactId }) {
    const [state, setState] = useState({ status: 'loading', items: [] });

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await apiFetch(`/api/admin/contacts/${contactId}/timeline`, { auth: true });
                const body = await readJson(res);
                if (!res.ok || !body?.data) throw new Error('timeline');
                const items = [
                    ...body.data.events.map((e) => ({ key: e.id, at: e.at, text: describeEvent(e), by: who(e.actor) })),
                    ...body.data.emails.map((e) => ({ key: `email-${e.kind}`, at: e.sentAt || e.createdAt, text: describeEmail(e) })),
                ].sort((a, b) => new Date(a.at) - new Date(b.at));
                if (!cancelled) setState({ status: 'ready', items });
            } catch {
                if (!cancelled) setState({ status: 'error', items: [] });
            }
        })();
        return () => { cancelled = true; };
    }, [contactId]);

    return (
        <section aria-label="Timeline">
            <h4 className="block text-sm font-medium text-gray-700 mb-2">Timeline</h4>
            {state.status === 'loading' && <p className="text-xs text-gray-400">Loading…</p>}
            {state.status === 'error' && <p className="text-xs text-red-600">Couldn't load the timeline.</p>}
            {state.status === 'ready' && state.items.length === 0 && (
                <p className="text-xs text-gray-400">No history recorded for this lead.</p>
            )}
            {state.items.length > 0 && (
                <ol className="border-l border-gray-200 pl-3 space-y-2 max-h-48 overflow-y-auto">
                    {state.items.map((item) => (
                        <li key={item.key} className="text-xs">
                            <p className="text-gray-900">{item.text}</p>
                            <p className="text-gray-500">{when(item.at)}{item.by ? ` · ${item.by}` : ''}</p>
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
