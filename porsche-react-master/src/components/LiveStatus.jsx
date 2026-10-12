// Phase 9: whether the dashboard is receiving live updates.
const LOOK = {
    live: { dot: 'bg-green-500', text: 'Live', title: 'New leads and changes appear automatically' },
    connecting: { dot: 'bg-gray-300', text: 'Connecting', title: 'Connecting to live updates' },
    reconnecting: { dot: 'bg-amber-500', text: 'Reconnecting', title: 'Live updates interrupted; reconnecting' },
    offline: { dot: 'bg-gray-400', text: 'Offline', title: 'Live updates are off; refresh the page to see new leads' },
};

export default function LiveStatus({ status }) {
    const look = LOOK[status] || LOOK.offline;
    return (
        <span className="flex items-center gap-1.5 text-xs text-gray-600" title={look.title} data-testid="live-status">
            <span className={`relative inline-flex h-2 w-2 rounded-full ${look.dot}`} aria-hidden="true">
                {status === 'live' && <span className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping motion-reduce:animate-none" />}
            </span>
            {look.text}
        </span>
    );
}
