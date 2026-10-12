// Phase 10/11: the one place that talks to Google Gemini (@google/genai).
//
// Everything AI is optional: without GEMINI_API_KEY, getAiClient() returns null, triage jobs wait
// and the concierge reports itself unavailable. Add the key to .env and restart: both switch on.
//
// The rest of the code depends only on this small interface, so tests inject a scripted fake:
//   generateJson({ system, prompt, schema, maxOutputTokens }) -> parsed JSON (structured output)
//   chat({ system, contents, tools, maxOutputTokens })        -> { content, text, functionCalls }
// `content` is the model's turn exactly as returned; it goes back into the history unchanged
// (Gemini 3 needs its thought signatures preserved across function-calling turns).
import { GoogleGenAI } from '@google/genai';

// Newest generally available Flash model (GA 2026-09-02, checked against the Gemini API docs on
// 2026-10-12). Override with GEMINI_MODEL without a code change.
export const DEFAULT_MODEL = 'gemini-3.8-flash';
const TIMEOUT_MS = 20_000;

export const aiEnabled = (env = process.env) => Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());
export const aiModel = (env = process.env) => (env.GEMINI_MODEL && env.GEMINI_MODEL.trim()) || DEFAULT_MODEL;

export function createGeminiClient({ apiKey, model }) {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: TIMEOUT_MS } });
    return {
        model,
        async generateJson({ system, prompt, schema, maxOutputTokens = 512 }) {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    systemInstruction: system,
                    responseMimeType: 'application/json',
                    responseJsonSchema: schema,
                    maxOutputTokens,
                    temperature: 0.2,
                },
            });
            const text = response.text;
            if (!text) throw new Error(`empty response (finish reason: ${response.candidates?.[0]?.finishReason || 'unknown'})`);
            try {
                return JSON.parse(text);
            } catch {
                throw new Error('response is not valid JSON');
            }
        },
        async chat({ system, contents, tools = [], maxOutputTokens = 800 }) {
            const response = await ai.models.generateContent({
                model,
                contents,
                config: {
                    systemInstruction: system,
                    tools: tools.length ? [{ functionDeclarations: tools }] : undefined,
                    maxOutputTokens,
                    temperature: 0.4,
                },
            });
            const content = response.candidates?.[0]?.content || { role: 'model', parts: [] };
            return { content, text: response.text || '', functionCalls: response.functionCalls || [] };
        },
    };
}

let override; // undefined = use the environment; null or a fake = tests
let cached = null;

/** The Gemini client, or null when no API key is configured. */
export function getAiClient() {
    if (override !== undefined) return override;
    if (!aiEnabled()) return null;
    const model = aiModel();
    if (!cached || cached.model !== model) cached = createGeminiClient({ apiKey: process.env.GEMINI_API_KEY.trim(), model });
    return cached;
}

/** Tests: replace the client (a fake, or null for "no key"); undefined restores the real one. */
export function setAiClientForTests(client) {
    override = client;
}
