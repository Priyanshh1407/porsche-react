import express from "express";
import { validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import { createLead } from "../services/leads.js";
import { MODEL_OPTIONS } from "../config/contactOptions.js";
import { contactValidation } from "../middleware/contactValidation.js";

const router = express.Router();

// Contact form rate limiting
// 5 per IP per hour (SEC-03: had been left at 100 "for testing"). Counts every attempt,
// including rejected ones, so the form can't be used to relay unlimited email.
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many contact submissions. Please try again'
    }
});


// Routes 
// POST /api/contact/submit - Submit contact form
router.post('/submit', contactLimiter, contactValidation, async (req, res) => {
    try {
        // check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // extract client information
        const clientip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        // Create new contact
        const contactData = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            inquiryType: req.body.inquiryType,
            message: req.body.message,
            modelInterest: req.body.modelInterest || 'Not_specified',
            preferredContactMethod: req.body.preferredContactMethod || 'Either',
            preferredContactTime: req.body.preferredContactTime || 'Anytime',
            ipAddress: clientip,
            userAgent: userAgent,
            source: 'Website',
            status: 'new'
        };

        // UPG-03 + AUD-01: the lead, the emails it needs and its audit event are saved in one
        // transaction (services/leads.js), so a lead can never exist without them. The outbox worker
        // delivers (and retries) the emails; the visitor's request never waits on SMTP (ERR-03).
        const contact = await createLead(contactData, { actor: 'public', ip: clientip });

        // Success response
        res.status(201).json({
            success: true,
            message: 'Your inquiry has been submitted successfully! We will contact you soon.',
            data: {
                id: contact.id,
                submittedAt: contact.createdAt
            }
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.'
        });
    }
});

//GET /api/contact/models - Get available Porsche models
router.get('/models', (req, res) => {
    res.json({
        success: true,
        data: MODEL_OPTIONS
    });
});

// Health check
router.get("/health", (req, res) => {
    res.json({
        success: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

export default router;