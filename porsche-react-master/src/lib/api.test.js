// BUG-04: every backend call goes through apiFetch, which takes its base URL from configuration.
const loadApi = (apiUrl) => {
    let mod;
    jest.isolateModules(() => {
        if (apiUrl === undefined) delete process.env.REACT_APP_API_URL;
        else process.env.REACT_APP_API_URL = apiUrl;
        mod = require('./api');
    });
    return mod;
};

beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    localStorage.clear();
});

afterAll(() => {
    delete process.env.REACT_APP_API_URL;
});

test('uses relative /api paths when REACT_APP_API_URL is unset (CRA dev proxy)', async () => {
    const { apiFetch } = loadApi(undefined);
    await apiFetch('/api/contact/submit');
    expect(fetch).toHaveBeenCalledWith('/api/contact/submit', expect.any(Object));
});

test('prefixes REACT_APP_API_URL and tolerates a trailing slash', async () => {
    const { apiFetch } = loadApi('https://api.example.com/');
    await apiFetch('/api/admin/stats');
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/api/admin/stats', expect.any(Object));
});

test('serialises json bodies with the JSON content type', async () => {
    const { apiFetch } = loadApi(undefined);
    await apiFetch('/api/contact/submit', { method: 'POST', json: { a: 1 } });
    const [, options] = fetch.mock.calls[0];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.body).toBe('{"a":1}');
});

test('adds the stored admin token only when auth is requested', async () => {
    localStorage.setItem('adminToken', 'tok123');
    const { apiFetch } = loadApi(undefined);

    await apiFetch('/api/admin/stats', { auth: true });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer tok123');

    await apiFetch('/api/contact/models');
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined();
});
