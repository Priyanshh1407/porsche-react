// Reads the expiry ("exp", seconds since epoch) from a JWT without verifying it.
// The browser can't verify the signature (only the server has the secret) and doesn't need to:
// this is only used to log out on time. Every API request is still verified by the server.
export function getTokenExpiry(token) {
    try {
        const payload = token.split('.')[1];
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const { exp } = JSON.parse(json);
        return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
        return null;
    }
}

/** True when the token is missing, malformed, has no expiry, or has expired. */
export function isTokenExpired(token, now = Date.now()) {
    const expiry = token ? getTokenExpiry(token) : null;
    return expiry === null || expiry <= now;
}
