import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Send, X } from 'lucide-react';
import { apiFetch, readJson, serverUnreachableMessage } from '../../lib/api';

// Phase 11: the chat. The conversation lives here and is sent with every message (the server
// keeps no chat state); the backend runs Gemini with tools over the site's own catalogue.
export const MAX_CHARS = 2000;
export const MAX_MESSAGES = 24; // backend services/ai/concierge.js MAX_MESSAGES

const GREETING = 'Hi! I can help you find a Porsche on this site, compare specs, or book a test drive. What are you looking for?';
const ERRORS = {
    429: 'Too many messages. Please wait a few minutes.',
    503: 'The assistant is unavailable right now. Please use the contact form.',
};

export default function ConciergePanel({ onClose }) {
    const [messages, setMessages] = useState([]); // [{ role, text, models?, booking? }]
    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const listRef = useRef(null);
    const inputRef = useRef(null);
    const full = messages.length >= MAX_MESSAGES - 1;

    useEffect(() => { inputRef.current?.focus(); }, []);
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
    useEffect(() => {
        const list = listRef.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [messages, busy]);

    const send = async (e) => {
        e.preventDefault();
        const text = draft.trim();
        if (!text || busy || full) return;
        const history = [...messages, { role: 'user', text }];
        setMessages(history);
        setDraft('');
        setError('');
        setBusy(true);
        try {
            const res = await apiFetch('/api/concierge/chat', {
                method: 'POST',
                json: { messages: history.map(({ role, text: t }) => ({ role, text: t })) },
            });
            const body = await readJson(res);
            if (!res.ok || !body?.success) {
                setError(ERRORS[res.status] || body?.message || serverUnreachableMessage());
                return;
            }
            setMessages([...history, { role: 'assistant', text: body.reply, models: body.models || [], booking: body.booking }]);
        } catch {
            setError(serverUnreachableMessage());
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-label="Porsche concierge"
            className="fixed inset-x-4 bottom-4 z-50 flex max-h-[80vh] flex-col overflow-hidden rounded-2xl bg-neutral-950 [color-scheme:dark] text-white shadow-2xl ring-1 ring-white/15 sm:inset-x-auto sm:right-4 sm:w-96"
        >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                    <p className="text-sm font-semibold">Porsche Concierge</p>
                    <p className="text-xs text-white/50">AI assistant · answers from this site's models</p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close the chat" className="rounded p-1 text-white/70 hover:text-white">
                    <X className="h-5 w-5" aria-hidden="true" />
                </button>
            </div>

            <ol ref={listRef} className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-3 text-sm [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent]" aria-live="polite">
                <li className="max-w-[85%] rounded-2xl bg-white/10 px-3 py-2">{GREETING}</li>
                {messages.map((m, i) => (
                    <li key={i} className={m.role === 'user' ? 'ml-auto max-w-[85%] rounded-2xl bg-red-700 px-3 py-2' : 'max-w-[85%] rounded-2xl bg-white/10 px-3 py-2'}>
                        <p className="whitespace-pre-line [overflow-wrap:anywhere]">{m.text}</p>
                        {m.models?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {m.models.map((model) => (
                                    <Link key={model.url} to={model.url} onClick={onClose} className="rounded-full bg-white/15 px-2 py-0.5 text-xs hover:bg-white/25">
                                        {model.name} →
                                    </Link>
                                ))}
                            </div>
                        )}
                        {m.booking && (
                            <p className="mt-2 flex items-center gap-1 rounded-lg bg-green-900/60 px-2 py-1 text-xs" role="status">
                                <CheckCircle className="h-4 w-4" aria-hidden="true" /> Test drive request sent for the {m.booking.model}
                            </p>
                        )}
                    </li>
                ))}
                {busy && <li className="w-12 rounded-2xl bg-white/10 px-3 py-2 text-white/60" aria-label="The assistant is typing">…</li>}
            </ol>

            {error && (
                <p className="mx-4 mb-2 rounded-lg bg-red-950 px-3 py-2 text-xs text-red-200" role="alert">
                    {error}{' '}
                    {error === ERRORS[503] && <Link to="/contact" onClick={onClose} className="underline">Contact form</Link>}
                </p>
            )}
            {full ? (
                <div className="border-t border-white/10 px-4 py-3 text-xs text-white/70">
                    This conversation is at its limit.{' '}
                    <button type="button" className="underline" onClick={() => { setMessages([]); setError(''); }}>Start a new one</button>
                </div>
            ) : (
                <form onSubmit={send} className="flex items-end gap-2 border-t border-white/10 px-3 py-3">
                    <label htmlFor="concierge-input" className="sr-only">Your message</label>
                    <textarea
                        id="concierge-input"
                        ref={inputRef}
                        rows={1}
                        maxLength={MAX_CHARS}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) send(e); }}
                        placeholder="Ask about a model…"
                        className="max-h-28 flex-1 resize-none rounded-xl [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [overflow-wrap:anywhere] bg-white/10 px-3 py-2 text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                    <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="rounded-xl bg-red-700 p-2 hover:bg-red-600 disabled:opacity-40">
                        <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                </form>
            )}
        </div>
    );
}
