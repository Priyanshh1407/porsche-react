// Phase 10/11: the one place that talks to Google Gemini (@google/genai).
//
// Everything AI is optional: without GEMINI_API_KEY, getAiClient() returns null, triage jobs wait
// and the concierge reports itself unavailable. Add the key to .env and restart: both switch on.
//
// The rest of the code depends only on this small interface, so tests inject a scripted fake:
//   generateJson({ system, prompt, schema, maxOutputTokens }) -> { value, model } (structured output)
//   chat({ system, contents, tools, maxOutputTokens, model }) -> { content, text, functionCalls, model }
// `content` is the model's turn exactly as returned; it goes back into the history unchanged
// (Gemini 3 needs its thought signatures preserved across function-calling turns).
//
// Resilience (found with the real API on 2026-10-12: the newest model answered 503 "high demand"
// and 504 for a while): a transient error (408/429/5xx/timeout) on the primary model is retried
// on the fallback models, in order. Thinking is set to "low": thinking tokens count against
// maxOutputTokens, and with the default level a small cap returned no text at all.
import { GoogleGenAI } from '@google/genai';

// Newest generally available Flash model (GA 2026-09-02, checked against the Gemini API docs on
// 2026-10-12). Override with GEMINI_MODEL without a code change.
export const DEFAULT_MODEL = 'gemini-3.8-flash';
// Stable older models, tried in order. Free-tier quotas are per model, so a chain also rides out
// a rate limit on one of them (5 requests/minute per model on the free tier).
export const DEFAULT_FALLBACK_MODELS = 'gemini-3.6-flash,gemini-3.5-flash-lite';
const TIMEOUT_MS = 15_000; // per attempt (a 503/429 comes back in about a second; a hang is cut here)

export const aiEnabled = (env = process.env) => Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim());
export const aiModel = (env = process.env) => (env.GEMINI_MODEL && env.GEMINI_MODEL.trim()) || DEFAULT_MODEL;
/** GEMINI_FALLBACK_MODEL: comma-separated list; empty = no fallback. */
export const aiFallbackModels = (env = process.env) => {
    const value = env.GEMINI_FALLBACK_MODEL === undefined ? DEFAULT_FALLBACK_MODELS : env.GEMINI_FALLBACK_MODEL;
    return [...new Set(value.split(',').map((m) => m.trim()).filter((m) => m && m !== aiModel(env)))];
};

/** Worth trying another model: overload, rate limit, server error or timeout (not 400/401/403). */
export function isTransient(error) {
    const status = Number(error?.status ?? error?.code);
    if ([408, 429, 500, 502, 503, 504].includes(status)) return true;
    return /UNAVAILABLE|DEADLINE_EXCEEDED|RESOURCE_EXHAUSTED|timed? ?out|abort|ECONNRESET|fetch failed/i.test(String(error?.message || ''));
}

export function createGeminiClient({ apiKey, model, fallbackModels = [], baseUrl }) {
    // baseUrl: optional (GEMINI_BASE_URL), for a proxy or the local fake Gemini the E2E tests use.
    // SDK retries off: the fallback below is the retry, so a visitor never waits for 5 attempts.
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: TIMEOUT_MS, retryOptions: { attempts: 1 }, ...(baseUrl ? { baseUrl } : {}) } });

    /** Runs `call(modelName)` on `first`, then on each fallback while the failure is transient. */
    async function withFallback(first, call) {
        const chain = [first, ...fallbackModels.filter((m) => m !== first)];
        let lastError;
        for (const name of chain) {
            try {
                return { response: await call(name), model: name };
            } catch (error) {
                lastError = error;
                if (!isTransient(error)) throw error;
            }
        }
        throw lastError;
    }

    return {
        model,
        fallbackModels,
        async generateJson({ system, prompt, schema, maxOutputTokens = 1024 }) {
            const { response, model: used } = await withFallback(model, (name) => ai.models.generateContent({
                model: name,
                contents: prompt,
                config: {
                    systemInstruction: system,
                    responseMimeType: 'application/json',
                    responseJsonSchema: schema,
                    maxOutputTokens,
                    temperature: 0.2,
                    thinkingConfig: { thinkingLevel: 'LOW' },
                },
            }));
            const text = response.text;
            if (!text) throw new Error(`empty response (finish reason: ${response.candidates?.[0]?.finishReason || 'unknown'})`);
            try {
                return { value: JSON.parse(text), model: used };
            } catch {
                throw new Error('response is not valid JSON');
            }
        },
        // `model`: pin a model for the follow-up calls of one reply (its thought signatures belong
        // to it); then there is no fallback.
        async chat({ system, contents, tools = [], maxOutputTokens = 2048, model: pinned }) {
            const run = (name) => ai.models.generateContent({
                model: name,
                contents,
                config: {
                    systemInstruction: system,
                    tools: tools.length ? [{ functionDeclarations: tools }] : undefined,
                    maxOutputTokens,
                    temperature: 0.4,
                    thinkingConfig: { thinkingLevel: 'LOW' },
                },
            });
            const { response, model: used } = pinned ? { response: await run(pinned), model: pinned } : await withFallback(model, run);
            const content = response.candidates?.[0]?.content || { role: 'model', parts: [] };
            return { content, text: response.text || '', functionCalls: response.functionCalls || [], model: used };
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
    const fallbackModels = aiFallbackModels();
    if (!cached || cached.model !== model || cached.fallbackModels.join() !== fallbackModels.join()) {
        cached = createGeminiClient({ apiKey: process.env.GEMINI_API_KEY.trim(), model, fallbackModels, baseUrl: process.env.GEMINI_BASE_URL || undefined });
    }
    return cached;
}

/** Tests: replace the client (a fake, or null for "no key"); undefined restores the real one. */
export function setAiClientForTests(client) {
    override = client;
}
