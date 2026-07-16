import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../prisma/client.js";
import Analytics from "../utils/analytics.js";
import ExportService from "../utils/exportService.js";
import notificationService from "../utils/notifications.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Simple admin check (in production, use proper user management)
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(
                { email: email, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
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
        res.status(400).json({
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
        const [
            ConversionStats,
            ModelPopularity,
            InquiryTrends,
            peakHours
        ] = await Promise.all([
            Analytics.getConversionStats(30),
            Analytics.getInquiryTrends(30),
            Analytics.getModelPopularity(7),
            Analytics.getPeakHours(30),
        ]);

        res.json({
            success: true,
            data: {
                conversions: ConversionStats,
                popularModels: ModelPopularity,
                trends: InquiryTrends,
                peakHours: peakHours
            }
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