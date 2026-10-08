/*
 * Test environment. Loaded by Jest before any test or app module.
 *
 * dotenv never overrides variables that are already set, so everything set here wins over
 * porsche-backend/.env. That keeps tests off the real database, the real admin credentials
 * and the real SMTP account.
 */
const DEFAULT_TEST_DB = 'postgresql://porsche_test:porsche_test@localhost:5433/porsche_test';

const url = process.env.DATABASE_URL_TEST || DEFAULT_TEST_DB;
// Refuse anything that does not look like the throwaway test database.
if (!/\/porsche_test(\?|$)/.test(url)) {
    throw new Error(`Refusing to run tests: DATABASE_URL_TEST must point at a database named "porsche_test" (got a different database).`);
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = url;
process.env.JWT_SECRET = 'test-only-jwt-secret-not-used-anywhere-else-0123456789';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'test-admin-password';
process.env.FRONTEND_URL = 'http://localhost:3000';
// An empty EMAIL_PASS puts utils/emailService.js into its demo (console-only) mode.
process.env.EMAIL_HOST = '';
process.env.EMAIL_PORT = '';
process.env.EMAIL_USER = '';
process.env.EMAIL_PASS = '';
process.env.EMAIL_FROM = 'noreply@test.local';

module.exports = { DEFAULT_TEST_DB };
