import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

// UPG-03: delivery state of a lead's emails (customer confirmation + admin notification), as
// recorded by the backend's email outbox. Read-only; the outbox worker retries on its own.
const MAX_ATTEMPTS = 5; // utils/emailOutbox.js MAX_ATTEMPTS
const label = (kind) => kind.replace('_', ' ');

const describe = (e) => {
    if (e.status === 'sent') return `${label(e.kind)}: sent`;
    if (e.status === 'failed') return `${label(e.kind)}: failed after ${e.attempts} attempts`;
    return e.attempts > 0 ? `${label(e.kind)}: retrying (attempt ${e.attempts} of ${MAX_ATTEMPTS} failed)` : `${label(e.kind)}: queued`;
};

function summary(emails) {
    if (emails.some((e) => e.status === 'failed')) return { text: 'Email failed', style: 'bg-red-100 text-red-800', Icon: XCircle };
    if (emails.every((e) => e.status === 'sent')) return { text: 'Emails sent', style: 'bg-green-100 text-green-800', Icon: CheckCircle };
    const retries = Math.max(...emails.map((e) => e.attempts));
    if (retries > 0) return { text: `Retrying (${retries}/${MAX_ATTEMPTS})`, style: 'bg-amber-100 text-amber-800', Icon: AlertCircle };
    return { text: 'Sending', style: 'bg-gray-100 text-gray-700', Icon: Clock };
}

export default function EmailDeliveryBadge({ emails = [] }) {
    // Leads created before the outbox existed have no rows: their delivery was never recorded.
    if (emails.length === 0) return <span className="text-xs text-gray-400" title="Created before email tracking">—</span>;
    const { text, style, Icon } = summary(emails);
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style}`}
            title={emails.map(describe).join('\n')}
        >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {text}
        </span>
    );
}
