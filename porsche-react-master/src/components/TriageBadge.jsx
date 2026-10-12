import { Sparkles } from 'lucide-react';

// Phase 10: AI lead triage (backend services/ai/triage.js). Hover shows the one-line summary.
const SCORE = {
    hot: { text: 'Hot', style: 'bg-red-100 text-red-800' },
    warm: { text: 'Warm', style: 'bg-amber-100 text-amber-800' },
    cold: { text: 'Cold', style: 'bg-sky-100 text-sky-800' },
};

function look(triage, aiEnabled) {
    if (triage.status === 'done' && SCORE[triage.score]) return { ...SCORE[triage.score], title: triage.summary };
    if (triage.status === 'failed') return { text: 'Triage failed', style: 'bg-gray-100 text-gray-600', title: 'The AI could not triage this lead (gave up after several attempts).' };
    return aiEnabled
        ? { text: 'AI triage…', style: 'bg-gray-100 text-gray-600', title: 'Queued for AI triage' }
        : { text: 'AI off', style: 'bg-gray-100 text-gray-500', title: 'AI triage is off: add GEMINI_API_KEY to porsche-backend/.env and restart the backend. Queued leads are then triaged.' };
}

export default function TriageBadge({ triage, aiEnabled }) {
    if (!triage) return null;
    const { text, style, title } = look(triage, aiEnabled);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${style}`} title={title}>
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {text}
        </span>
    );
}
