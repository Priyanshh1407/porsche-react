import crypto from "crypto";
import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import Analytics from "../utils/analytics.js";
import ExportService from "../utils/exportService.js";
import notificationService from "../utils/notifications.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Constant-time string comparison. Hashing first gives timingSafeEqual equal-length inputs,
// so neither the length nor the matching prefix of the secret leaks through response time.
const safeEqual = (a, b) => {
    const digest = (value) => crypto.createHash('sha256').update(String(value)).digest();
    return crypto.timingSafeEqual(digest(a), digest(b));
};

// Brute-force protection (SEC-03): 5 failed attempts per IP per 15 minutes.
// Successful logins are not counted, so the real admin is never locked out by normal use.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many failed login attempts. Please try again in 15 minutes.'
    }
});

// POST /api/admin/login - Admin login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body ?? {};

        if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Fail closed (SEC-01): with the variables unset, `undefined === undefined` used to
        // grant admin access. Startup validation should prevent this; this is the second line.
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
            console.error('Admin login attempted but ADMIN_EMAIL / ADMIN_PASSWORD are not configured.');
            return res.status(503).json({
                success: false,
                message: 'Admin login is not available'
            });
        }

        // Evaluate both comparisons (no short-circuit) so timing doesn't reveal which one failed.
        const emailMatches = safeEqual(email.trim().toLowerCase(), adminEmail.trim().toLowerCase());
        const passwordMatches = safeEqual(password, adminPassword);

        if (emailMatches && passwordMatches) {
            const token = jwt.sign(
                { email: adminEmail, role: 'admin' },
                process.env.JWT_SECRET,
                { algorithm: 'HS256', expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful.',
                token: token
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});


// GET /api/admin/contacts - Get all contacts (paginated)
router.get('/contacts', authenticateAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const inquiryType = req.query.inquiryType;

        //Build filter
        const where = {};
        if (status && status !== 'all') where.status = status;
        if (inquiryType) where.inquiryType = inquiryType;

        // get contacts
        const contacts = await prisma.contact.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit
        });

        const total = await prisma.contact.count({ where });

        res.json({
            success: true,
            data: contacts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total: total,
                limit: limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts'
        });
    }
});

// PUT /api/admin/contacts/:id - Update contact status
router.put('/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        const { status, notes } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (status === 'contacted') updateData.contactedAt = new Date();

        const contact = await prisma.contact.update({
            where: { id: req.params.id },
            data: updateData
        });

        res.json({
            success: true,
            message: 'Contact updated successfully',
            data: contact
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update contact'
        });
    }
});

// GET /api/admin/stats - Get contact statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
    try {
        const stats = await prisma.contact.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });
        
        let total = 0;
        let newContacts = 0;
        let contactedLeads = 0;
        let qualifiedLeads = 0;
        let closedLeads = 0;
        
        stats.forEach(stat => {
            const count = stat._count.status;
            total += count;
            if (stat.status === 'new') newContacts += count;
            if (stat.status === 'contacted') contactedLeads += count;
            if (stat.status === 'qualified') qualifiedLeads += count;
            if (stat.status === 'closed') closedLeads += count;
        });
        
        const overview = {
            total,
            newContacts,
            contactedLeads,
            qualifiedLeads,
            closedLeads
        };

        const inquiryTypeStatsData = await prisma.contact.groupBy({
            by: ['inquiryType'],
            _count: { inquiryType: true }
        });
        
        const inquiryTypes = inquiryTypeStatsData.map(stat => ({
            _id: stat.inquiryType,
            count: stat._count.inquiryType
        }));

        const modelStatsData = await prisma.contact.groupBy({
            by: ['modelInterest'],
            _count: { modelInterest: true }
        });
        
        const modelInterest = modelStatsData.map(stat => ({
            _id: stat.modelInterest,
            count: stat._count.modelInterest
        }));

        res.json({
            success: true,
            data: {
                overview,
                inquiryTypes,
                modelInterest
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', authenticateAdmin, async (req, res) => {
    try {
        // Each query is named where it starts, so a result can't land under the wrong key.
        // (BUG-02: positional destructuring of Promise.all had swapped trends and popularModels.)
        const queries = {
            conversions: Analytics.getConversionStats(30),
            trends: Analytics.getInquiryTrends(30),
            popularModels: Analytics.getModelPopularity(7),
            peakHours: Analytics.getPeakHours(30),
        };
        const keys = Object.keys(queries);
        const results = await Promise.all(Object.values(queries));
        const data = Object.fromEntries(keys.map((key, i) => [key, results[i]]));

        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics'
        });
    }
});

// GET /api/admin/export - Export contacts to CSV
router.get('/export', authenticateAdmin, async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.inquiryType) filters.inquiryType = req.query.inquiryType;
        if (req.query.startDate) filters.createdAt = { $gte: new Date(req.query.startDate) };
        if (req.query.endDate) {
            filters.createdAt = filters.createdAt || {};
            filters.createdAt.$lte = new Date(req.query.endDate);
        }

        await ExportService.exportToCSV(filters, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to export contacts'
        });
    }
});

// GET /api/admin/contacts/:id/details - Get detailed contact information
router.get('/contacts/:id/details', authenticateAdmin, async (req, res) => {
    try {
        const contactDetails = await ExportService.exportContactDetails(req.params.id);

        res.json({
            success: true,
            data: contactDetails
        });
    } catch (error) {
        if (error.message === 'Contact not found') {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact details'
        });
    }
});

// DELETE /api/admin/contacts/:id - Delete a contact
router.delete('/contacts/:id', authenticateAdmin, async (req, res) => {
    try {
        const contact = await prisma.contact.delete({
            where: { id: req.params.id }
        });

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact'
        });
    }
});

// GET /api/admin/notifications - Server-Sent Events for real-time updates
router.get('/notifications', authenticateAdmin, (req, res) => {
    notificationService.subscribe(res, req.admin.email);
});


export default router;