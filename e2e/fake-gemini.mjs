/*
 * A tiny stand-in for the Gemini REST API (POST /v1beta/models/<model>:generateContent), so the E2E
 * run exercises the real backend AI path (the @google/genai SDK, tools, triage worker) without an
 * API key or network. The backend is pointed at it with GEMINI_BASE_URL.
 *
 * Scripted, like a cooperative model:
 *   - triage request (structured output): a fixed hot/summary/next-step JSON;
 *   - "electric" -> search_models(Electric) -> "The Taycan is our electric model ...";
 *   - "book ... <email>" -> book_test_drive(confirmed) -> "Your request is with the sales team.";
 *   - anything else -> a polite fixed answer.
 */
import http from 'http';

const candidate = (parts) => ({ candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP' }] });

function answer(body) {
    if (body.generationConfig?.responseJsonSchema) {
        return candidate([{ text: JSON.stringify({ score: 'hot', summary: 'Wants a test drive soon.', nextStep: 'Call to schedule the drive.' }) }]);
    }
    const last = body.contents.at(-1).parts[0];
    if (last.functionResponse) {
        const { name, response } = last.functionResponse;
        if (name === 'search_models') {
            const names = response.result.models.map((m) => m.name).join(', ');
            return candidate([{ text: `The ${names} is our electric model, with 761 HP.` }]);
        }
        if (name === 'book_test_drive') {
            return candidate([{ text: response.result.booked ? 'Your request is with the sales team.' : `I could not book that: ${response.result.error}` }]);
        }
    }
    const text = (last.text || '').toLowerCase();
    if (text.includes('electric')) return candidate([{ functionCall: { id: 'e1', name: 'search_models', args: { category: 'Electric' } } }]);
    const email = /[\w.+-]+@[\w.-]+/.exec(last.text || '')?.[0];
    if (text.includes('book') && email) {
        return candidate([{ functionCall: { id: 'b1', name: 'book_test_drive', args: {
            firstName: 'Elena', lastName: 'Kurz', email, phone: '+49 711 911 0', modelSlug: 'taycan', confirmed: true,
        } } }]);
    }
    return candidate([{ text: 'I can help with the Porsche models on this site.' }]);
}

export function startFakeGemini() {
    const requests = [];
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            let raw = '';
            req.on('data', (d) => { raw += d; });
            req.on('end', () => {
                const body = JSON.parse(raw || '{}');
                requests.push({ url: req.url, key: req.headers['x-goog-api-key'], body });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(answer(body)));
            });
        }).listen(0, '127.0.0.1', () => resolve({ server, requests, url: `http://127.0.0.1:${server.address().port}` }));
    });
}
