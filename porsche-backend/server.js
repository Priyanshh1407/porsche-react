import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import prisma from "./prisma/client.js";
import { validateEnv } from "./config/env.js";
import { checkDatabase } from "./utils/dbHealth.js";

dotenv.config({ quiet: true });

// Fail closed on missing configuration (SEC-01).
try {
    validateEnv().forEach((warning) => console.warn(`⚠️  ${warning}`));
} catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
}

//Routes
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Behind a reverse proxy (Render, Railway, Nginx) every request arrives from the proxy's IP,
// so all visitors would share one rate-limit bucket. TRUST_PROXY = number of proxy hops to
// trust for X-Forwarded-For; unset/0 = connect directly, trust nothing (SEC-03).
const trustProxyHops = Number(process.env.TRUST_PROXY || 0);
if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops);

//Security
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Create admin user if it doesn't exist (for development)
const createDefaultAdmin = async () => {
    // This is just for logging - actual admin auth is handled via environment variables
    console.log('📧 Admin email:', process.env.ADMIN_EMAIL);
    console.log('🔐 Admin login configured');
};

//Body parsing 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ERR-02: liveness vs readiness.
// /health: the process is up (never touches the DB, so a DB outage doesn't get the app restarted).
// /ready:  the app can serve traffic (real DB round-trip); 503 tells a load balancer to wait.
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/ready', async (req, res) => {
    try {
        await checkDatabase(2000);
        res.json({ status: 'ready' });
    } catch (err) {
        console.error(`Readiness check failed: ${err.message}`);
        res.status(503).json({ status: 'unavailable', reason: 'database' });
    }
});

app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

//Basic Routing 
app.get('/', (req, res) => {
    res.json({
        message: 'Porsche contact system api',
        status: 'Running',
        version: '1.0.0'
    });
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route Not Found'
    });
});

// ERR-02: only start accepting traffic once the database really answers, and shut down cleanly
// on SIGTERM (what Docker, Render and Railway send) as well as SIGINT (Ctrl+C).
async function start() {
    try {
        await checkDatabase(5000);
    } catch (err) {
        console.error(`❌ Database unreachable (${err.message}). Refusing to start.`);
        process.exit(1);
    }
    console.log('✅ Connected to Postgres database via Prisma');
    createDefaultAdmin();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running on port:${server.address().port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = (signal) => {
        console.log(`\n${signal} received: shutting down...`);
        // Stop accepting new connections, let in-flight requests finish, then close the pool.
        server.close(async () => {
            await prisma.$disconnect();
            console.log('Database connection closed');
            process.exit(0);
        });
        // Don't hang forever on keep-alive connections.
        setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

if (process.env.NODE_ENV !== 'test') {
    start();
}

export default app;
