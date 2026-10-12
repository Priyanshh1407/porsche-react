import crypto from "crypto";
import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import Analytics from "../utils/analytics.js";
import ExportService from "../utils/exportService.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../middleware/validation.js";
import { CONTACT_STATUSES, INQUIRY_TYPES } from "../config/contactOptions.js";
import { audit, actorFor, decodeCursor, encodeCursor } from "../utils/audit.js";
import { publish } from "../utils/events.js";
import { SCORES } from "../services/ai/triage.js";
import { aiEnabled, aiModel } from "../services/ai/client.js";

const router = express.Router();

// VAL-01: every admin input is validated; bad input is a 400, never a 500 or stored junk.
const validContactId = [
    param('id').isUUID().withMessage('Contact id must be a UUID'),
];
const validListQuery = [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be an integer >= 1').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
    query('status').optional().isIn([...CONTACT_STATUSES, 'all']).withMessage(`status must be one of: all, ${CONTACT_STATUSES.join(', ')}`),
    query('inquiryType').optional().isIn(INQUIRY_TYPES).withMessage(`inquiryType must be one of: ${INQUIRY_TYPES.join(', ')}`),
    query('q').optional().trim().isLength({ max: 100 }).withMessage('search term can be at most 100 characters'),
    query('score').optional().isIn(SCORES).withMessage(`score must be one of: ${SCORES.join(', ')}`),
];
const validContactUpdate = [
    body('status').optional().isIn(CONTACT_STATUSES).withMessage(`status must be one of: ${CONTACT_STATUSES.join(', ')}`),
    body('notes').optional({ values: 'null' }).isString().withMessage('notes must be text')
        .isLength({ max: 500 }).withMessage('notes can be at most 500 characters'),
];
const validExportQuery = [
    query('status').optional().isIn(CONTACT_STATUSES).withMessage(`status must be one of: ${CONTACT_STATUSES.join(', ')}`),
    query('inquiryType').optional().isIn(INQUIRY_TYPES).withMessage(`inquiryType must be one of: ${INQUIRY_TYPES.join(', ')}`),
    query('startDate').optional().isISO8601().withMessage('startDate must be an ISO 8601 date, e.g. 2026-01-31'),
    query('endDate').optional().isISO8601().withMessage('endDate must be an ISO 8601 date, e.g. 2026-12-31'),
];

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

        // AUD-01: every login attempt is recorded (the email tried, never the password). A login is
        // not a data change, so a failed audit write is logged instead of blocking the admin.
        const recordLogin = (action, actor) => audit({ actor, action, meta: { email: email.trim().toLowerCase().slice(0, 254) }, ip: req.ip })
            .catch((err) => console.error('Audit write failed (login):', err.message));

        if (emailMatches && passwordMatches) {
            await recordLogin('login_ok', `admin:${adminEmail}`);
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
            await recordLogin('login_failed', 'public');
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
router.get('/contacts', authenticateAdmin, validListQuery, handleValidationErrors, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const inquiryType = req.query.inquiryType;
        const q = req.query.q;

        //Build filter
        const where = {};
        if (status && status !== 'all') where.status = status;
        if (inquiryType) where.inquiryType = inquiryType;
        if (req.query.score) where.triage = { is: { score: req.query.score } };
        // BUG-05: search runs on the server over all contacts (it used to filter one page of 10
        // in the browser). Case-insensitive match on name, email or phone.
        if (q) {
            where.OR = ['firstName', 'lastName', 'email', 'phone']
                .map((field) => ({ [field]: { contains: q, mode: 'insensitive' } }));
        }

        // get contacts. `id` breaks ties between equal createdAt values, so paging is stable
        // (without it, rows created in the same instant can repeat or vanish between pages).
        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                // UPG-03: delivery state for the dashboard badge. Never lastError: SMTP error text
                // can name internal hosts and doesn't belong in the browser.
                include: {
                    emails: { select: { kind: true, status: true, attempts: true } },
                    // Phase 10: never lastError (API error text) in the browser either.
                    triage: { select: { status: true, score: true, summary: true, nextStep: true, model: true } }
                },
                orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                take: limit,
                skip: (page - 1) * limit
            }),
            prisma.contact.count({ where })
        ]);

        res.json({
            success: true,
            data: contacts,
            // Phase 10: lets the dashboard explain a pending triage (no API key configured yet).
            ai: { enabled: aiEnabled(), model: aiEnabled() ? aiModel() : null },
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
router.put('/contacts/:id', authenticateAdmin, validContactId, validContactUpdate, handleValidationErrors, async (req, res) => {
    try {
        const { status, notes } = req.body;

        // AUD-01: read, update and record in one transaction. One event per field that really
        // changed; if an event can't be written, the update is rolled back.
        const contact = await prisma.$transaction(async (tx) => {
            const before = await tx.contact.findUnique({ where: { id: req.params.id }, select: { status: true, notes: true } });
            if (!before) throw Object.assign(new Error('Contact not found'), { code: 'P2025' });

            const updateData = {};
            if (status) updateData.status = status;
            if (notes !== undefined) updateData.notes = notes;
            if (status === 'contacted' && before.status !== 'contacted') updateData.contactedAt = new Date();

            const updated = await tx.contact.update({ where: { id: req.params.id }, data: updateData });
            const actor = actorFor(req);
            if (status && status !== before.status) {
                await audit({ actor, action: 'status_changed', contactId: updated.id, before: { status: before.status }, after: { status }, ip: req.ip }, tx);
            }
            if (notes !== undefined && (notes ?? null) !== (before.notes ?? null)) {
                await audit({ actor, action: 'notes_changed', contactId: updated.id, before: { notes: before.notes }, after: { notes: notes ?? null }, ip: req.ip }, tx);
            }
            if (updated.status !== before.status || (updated.notes ?? null) !== (before.notes ?? null)) {
                await publish(tx, 'lead.updated', { id: updated.id, status: updated.status });
            }
            return updated;
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
            // Funnel and popularity cover all enquiries (they must agree with the dashboard totals);
            // trends are the last 30 days, one point per day.
            conversions: Analytics.getConversionStats(),
            trends: Analytics.getInquiryTrends(30),
            popularModels: Analytics.getModelPopularity(),
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
router.get('/export', authenticateAdmin, validExportQuery, handleValidationErrors, async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.inquiryType) filters.inquiryType = req.query.inquiryType;
        if (req.query.startDate) filters.createdAt = { $gte: new Date(req.query.startDate) };
        if (req.query.endDate) {
            filters.createdAt = filters.createdAt || {};
            filters.createdAt.$lte = new Date(req.query.endDate);
        }

        // AUD-01: the export is recorded before any data leaves; no record, no file.
        const { csv, rows } = await ExportService.buildCsv(filters);
        const recorded = Object.fromEntries(['status', 'inquiryType', 'startDate', 'endDate']
            .filter((key) => req.query[key]).map((key) => [key, req.query[key]]));
        await audit({ actor: actorFor(req), action: 'export', meta: { filters: recorded, rows }, ip: req.ip });
        ExportService.sendCsv(res, csv);
    } catch (error) {
        console.error('CSV export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export contacts'
        });
    }
});

// GET /api/admin/contacts/:id/details - Get detailed contact information
router.get('/contacts/:id/details', authenticateAdmin, validContactId, handleValidationErrors, async (req, res) => {
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
router.delete('/contacts/:id', authenticateAdmin, validContactId, handleValidationErrors, async (req, res) => {
    try {
        // AUD-01: the event keeps a non-personal summary of what was deleted; the history (no
        // foreign key) outlives the lead.
        await prisma.$transaction(async (tx) => {
            const contact = await tx.contact.delete({
                where: { id: req.params.id },
                select: { id: true, status: true, inquiryType: true, modelInterest: true, source: true, createdAt: true }
            });
            const { id, ...summary } = contact;
            await audit({ actor: actorFor(req), action: 'lead_deleted', contactId: id, before: summary, ip: req.ip }, tx);
            await publish(tx, 'lead.deleted', { id });
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

// GET /api/admin/contacts/:id/timeline - Everything that happened to one lead, oldest first
// (audit events + its emails). Works for deleted leads too: their events outlive them.
router.get('/contacts/:id/timeline', authenticateAdmin, validContactId, handleValidationErrors, async (req, res) => {
    try {
        const [events, emails] = await Promise.all([
            prisma.auditEvent.findMany({
                where: { contactId: req.params.id },
                select: { id: true, at: true, actor: true, action: true, before: true, after: true, meta: true },
                orderBy: [{ at: 'asc' }, { id: 'asc' }]
            }),
            // Never lastError: SMTP error text can name internal hosts (as in GET /contacts).
            prisma.emailOutbox.findMany({
                where: { contactId: req.params.id },
                select: { kind: true, status: true, attempts: true, sentAt: true, createdAt: true },
                orderBy: { createdAt: 'asc' }
            })
        ]);
        res.json({ success: true, data: { events, emails } });
    } catch (error) {
        console.error('Timeline error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch the timeline' });
    }
});

// GET /api/admin/audit - The whole audit log, newest first. Keyset paging: `cursor` is the
// position of the last event seen, so pages never repeat or skip events while new ones arrive.
const validAuditQuery = [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
    query('cursor').optional().custom((value) => decodeCursor(value) !== null).withMessage('cursor is not valid'),
];
router.get('/audit', authenticateAdmin, validAuditQuery, handleValidationErrors, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50; // Express 5: req.query is read-only, so .toInt() can't convert it
        const after = req.query.cursor ? decodeCursor(req.query.cursor) : null;
        const where = after
            ? { OR: [{ at: { lt: after.at } }, { at: after.at, id: { lt: after.id } }] }
            : {};
        const events = await prisma.auditEvent.findMany({
            where,
            orderBy: [{ at: 'desc' }, { id: 'desc' }],
            take: limit + 1 // one extra tells whether there is a next page
        });
        const page = events.slice(0, limit);
        res.json({
            success: true,
            data: page,
            nextCursor: events.length > limit ? encodeCursor(page[page.length - 1]) : null
        });
    } catch (error) {
        console.error('Audit log error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch the audit log' });
    }
});

export default router;