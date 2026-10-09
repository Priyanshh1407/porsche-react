// Fail-closed configuration check, run once at startup (SEC-01).
// A missing admin credential used to make `undefined === undefined` grant admin access,
// so the server now refuses to start without the variables auth depends on.

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const RECOMMENDED_SECRET_LENGTH = 32;

/**
 * Validates the environment. Throws if a required variable is missing or blank.
 * Returns warnings for settings that work but are weak.
 */
export function validateEnv(env = process.env) {
    const missing = REQUIRED.filter((name) => typeof env[name] !== 'string' || env[name].trim() === '');
    if (missing.length) {
        throw new Error(
            `Missing required environment variable(s): ${missing.join(', ')}. ` +
            'See porsche-backend/.env.example. Refusing to start.'
        );
    }

    const warnings = [];
    if (env.JWT_SECRET.length < RECOMMENDED_SECRET_LENGTH) {
        warnings.push(`JWT_SECRET is shorter than ${RECOMMENDED_SECRET_LENGTH} characters; use a long random value.`);
    }
    return warnings;
}
