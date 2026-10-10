// Fail-closed configuration check, run once at startup (SEC-01).
// A missing admin credential used to make `undefined === undefined` grant admin access,
// so the server now refuses to start without the variables auth depends on.

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];

/**
 * Validates the environment. Throws if a required variable is missing or blank.
 * (No minimum JWT_SECRET length, by developer decision; an empty one is still refused.)
 */
export function validateEnv(env = process.env) {
    const missing = REQUIRED.filter((name) => typeof env[name] !== 'string' || env[name].trim() === '');
    if (missing.length) {
        throw new Error(
            `Missing required environment variable(s): ${missing.join(', ')}. ` +
            'See porsche-backend/.env.example. Refusing to start.'
        );
    }
}
