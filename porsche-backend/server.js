import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import prisma from "./prisma/client.js";

dotenv.config();

//Routes 
import contactRoutes from "./routes/contact.js";
import adminRoutes from "./routes/admin.js";

const app = express();

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

prisma.$connect()
    .then(() => {
        console.log('✅ Connected to Postgres database via Prisma');
        createDefaultAdmin();
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    await prisma.$disconnect();
    console.log('Database connection closed');
    process.exit(0);
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

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

export default app;
