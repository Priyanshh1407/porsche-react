import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { apiFetch, readJson } from '../../lib/api';
import { findModel } from '../../data/models';
import { SHOWROOM_SLUGS } from '../../data/modelPages';

// Phase 11: the AI concierge's launcher. Small on purpose: the chat itself is a separate chunk,
// downloaded on first open. Shown only where it helps (model list, photo model pages, contact,
// configurator); never on the home page or the 3D showrooms, which stay exactly as designed.
// It asks the backend whether the assistant is available: no GEMINI_API_KEY -> no launcher.
const ConciergePanel = lazy(() => import('./ConciergePanel'));

export function showsConcierge(pathname) {
    if (['/models', '/contact', '/configurator'].includes(pathname)) return true;
    const m = pathname.match(/^\/models\/([^/]+)(\/details)?\/?$/);
    if (!m) return false;
    const model = findModel(m[1]);
    if (!model) return false;
    return Boolean(m[2]) || !SHOWROOM_SLUGS.has(model.slug);
}

let statusPromise = null; // asked once per page load
const fetchAvailable = () => {
    statusPromise ||= apiFetch('/api/concierge/status')
        .then(async (res) => (res.ok ? Boolean((await readJson(res))?.available) : false))
        .catch(() => false);
    return statusPromise;
};
export const resetConciergeStatusForTests = () => { statusPromise = null; };

export default function ConciergeLauncher() {
    const { pathname } = useLocation();
    const wanted = showsConcierge(pathname);
    const [available, setAvailable] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!wanted) return undefined;
        let cancelled = false;
        fetchAvailable().then((ok) => { if (!cancelled) setAvailable(ok); });
        return () => { cancelled = true; };
    }, [wanted]);

    if (!wanted || !available) return null;
    return (
        <>
            {open && (
                <Suspense fallback={null}>
                    <ConciergePanel onClose={() => setOpen(false)} />
                </Suspense>
            )}
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Open the Porsche concierge chat"
                    className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-black/90 px-4 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-white/20 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    <span className="hidden sm:inline">Ask the concierge</span>
                </button>
            )}
        </>
    );
}
