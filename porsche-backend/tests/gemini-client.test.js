// The real @google/genai client code (services/ai/client.js), against a local HTTP server that
// answers like the Gemini REST API. Checks what is actually sent (model, key, system prompt,
// JSON schema, tools, function results) and that answers are parsed, without an API key or network.
import http from 'http';
import { createGeminiClient } from '../services/ai/client.js';

let server;
let baseUrl;
const requests = [];
let reply = () => ({});

beforeAll(async () => {
    server = http.createServer((req, res) => {
        let body = '';
        req.on('data', (d) => { body += d; });
        req.on('end', () => {
            const parsed = JSON.parse(body || '{}');
            requests.push({ url: req.url, headers: req.headers, body: parsed });
            const out = reply(parsed);
            res.writeHead(out.status || 200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(out.json ?? out));
        });
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => new Promise((r) => server.close(r)));
beforeEach(() => { requests.length = 0; });

const candidate = (parts) => ({ candidates: [{ content: { role: 'model', parts }, finishReason: 'STOP' }] });
const client = () => createGeminiClient({ apiKey: 'test-key', model: 'gemini-3.8-flash', baseUrl });

test('generateJson asks for structured output with the schema and parses the JSON answer', async () => {
    reply = () => candidate([{ text: '{"score":"warm","summary":"s","nextStep":"n"}' }]);
    const schema = { type: 'object', properties: { score: { type: 'string' } } };
    const out = await client().generateJson({ system: 'SYS', prompt: 'PROMPT', schema, maxOutputTokens: 300 });
    expect(out).toEqual({ score: 'warm', summary: 's', nextStep: 'n' });
    const [r] = requests;
    expect(r.url).toMatch(/\/models\/gemini-3\.8-flash:generateContent/);
    expect(r.headers['x-goog-api-key']).toBe('test-key');
    expect(r.body.systemInstruction.parts[0].text).toBe('SYS');
    expect(r.body.contents[0].parts[0].text).toBe('PROMPT');
    expect(r.body.generationConfig).toEqual(expect.objectContaining({ responseMimeType: 'application/json', responseJsonSchema: schema, maxOutputTokens: 300 }));
});

test('generateJson rejects a non-JSON or empty answer', async () => {
    reply = () => candidate([{ text: 'not json' }]);
    await expect(client().generateJson({ system: 's', prompt: 'p', schema: {} })).rejects.toThrow(/not valid JSON/);
    reply = () => ({ candidates: [{ content: { role: 'model', parts: [] }, finishReason: 'MAX_TOKENS' }] });
    await expect(client().generateJson({ system: 's', prompt: 'p', schema: {} })).rejects.toThrow(/MAX_TOKENS/);
});

test('chat sends the tools, returns function calls, and the follow-up carries the function result', async () => {
    reply = () => candidate([{ functionCall: { id: 'fc1', name: 'get_model', args: { slug: 'taycan' } }, thoughtSignature: 'c2ln' }]);
    const tools = [{ name: 'get_model', description: 'd', parametersJsonSchema: { type: 'object', properties: { slug: { type: 'string' } } } }];
    const first = await client().chat({ system: 'SYS', contents: [{ role: 'user', parts: [{ text: 'hi' }] }], tools });
    expect(first.functionCalls).toEqual([{ id: 'fc1', name: 'get_model', args: { slug: 'taycan' } }]);
    expect(requests[0].body.tools[0].functionDeclarations[0].name).toBe('get_model');

    reply = () => candidate([{ text: 'The Taycan has 761 HP.' }]);
    const contents = [
        { role: 'user', parts: [{ text: 'hi' }] },
        first.content,
        { role: 'user', parts: [{ functionResponse: { id: 'fc1', name: 'get_model', response: { result: { power: '761 HP' } } } }] },
    ];
    const second = await client().chat({ system: 'SYS', contents, tools });
    expect(second).toEqual(expect.objectContaining({ text: 'The Taycan has 761 HP.', functionCalls: [] }));
    const sent = requests[1].body.contents;
    expect(sent[1].parts[0].thoughtSignature).toBe('c2ln'); // the model's turn is sent back unchanged
    expect(sent[2].parts[0].functionResponse.response.result.power).toBe('761 HP');
});

test('an API error surfaces as an error', async () => {
    reply = () => ({ status: 429, json: { error: { code: 429, message: 'Resource exhausted', status: 'RESOURCE_EXHAUSTED' } } });
    await expect(client().chat({ system: 's', contents: [{ role: 'user', parts: [{ text: 'x' }] }] })).rejects.toThrow();
});
