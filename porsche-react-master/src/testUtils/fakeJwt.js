// Builds a JWT-shaped token for tests. The signature is fake; the browser never verifies it
// (the server does), it only reads the `exp` claim.
const base64url = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const fakeJwt = (expiresInSeconds = 3600) =>
    `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({ role: 'admin', exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.signature`;
