// Single place that knows where the backend lives (BUG-04).
//
// REACT_APP_API_URL is baked in at build time, e.g. https://api.example.com for a deployed
// frontend. When it is unset, requests use relative /api/... paths, which the CRA dev server
// proxies to the backend on port 5000 (see "proxy" in package.json), so local development needs
// no configuration.
export const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');

/**
 * fetch() against the backend.
 * - `path` is the API path, e.g. '/api/contact/submit'.
 * - `json`: request body, serialised with the right Content-Type.
 * - `auth: true` adds the stored admin token as a Bearer header.
 * Returns the raw Response so callers keep checking `ok` / `status` as before.
 */
export async function apiFetch(path, { json, auth = false, headers = {}, ...options } = {}) {
    const finalHeaders = { ...headers };
    if (json !== undefined) finalHeaders['Content-Type'] = 'application/json';
    if (auth) {
        const token = localStorage.getItem('adminToken');
        if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: finalHeaders,
        body: json !== undefined ? JSON.stringify(json) : options.body,
    });
    // ARCH-01: one place handles a rejected admin token: AuthContext listens and logs out.
    if (auth && response.status === 401) {
        window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return response;
}
