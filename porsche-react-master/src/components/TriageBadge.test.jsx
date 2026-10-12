// Phase 10: the AI triage of a lead, at a glance.
import { render, screen } from '@testing-library/react';
import TriageBadge from './TriageBadge';

test.each([
    [{ status: 'done', score: 'hot', summary: 'Ready to buy.' }, true, 'Hot', /Ready to buy/],
    [{ status: 'done', score: 'cold', summary: 'Browsing.' }, true, 'Cold', /Browsing/],
    [{ status: 'pending' }, true, 'AI triage…', /queued/i],
    [{ status: 'pending' }, false, 'AI off', /GEMINI_API_KEY/],
    [{ status: 'failed' }, true, 'Triage failed', /could not/i],
])('%j (AI enabled: %s) -> "%s"', (triage, enabled, text, title) => {
    render(<TriageBadge triage={triage} aiEnabled={enabled} />);
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByText(text).closest('[title]').getAttribute('title')).toMatch(title);
});

test('leads from before triage existed show nothing', () => {
    const { container } = render(<TriageBadge triage={null} aiEnabled />);
    expect(container).toBeEmptyDOMElement();
});
