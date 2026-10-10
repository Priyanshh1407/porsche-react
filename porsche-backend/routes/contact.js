import express from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../prisma/client.js";
import { contactEmailsNestedWrite, nudgeEmailWorker } from "../utils/emailOutbox.js";
import { INQUIRY_TYPES, MODEL_OPTIONS, MODEL_VALUES } from "../config/contactOptions.js";

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

// VAL-02: Latin-alphabet names only (developer decision): English and related languages,
// accents included (José Müller, Zoë O'Connor-Brontë, François Lefèvre, Mary Ann St. John).
// Other scripts (Chinese, Cyrillic, Arabic, Greek, ...) are rejected. Must start with a letter;
// then Latin letters, combining accent marks, spaces, apostrophes, hyphens, dots.
const NAME_PATTERN = /^\p{Script=Latin}[\p{Script=Latin}\p{M}\s'’.-]*$/u;

// VAL-02: real phone numbers in common formats, landlines included (+49 711 9110, (555) 555-0123,
// 555.555.0123). Only digits, spaces, + ( ) . - and 7–15 digits (the E.164 maximum).
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const isPlausiblePhone = (value) => {
    const digits = String(value).replace(/\D/g, '').length;
    return PHONE_CHARS.test(String(value)) && digits >= 7 && digits <= 15;
};

// Validation
const contactValidation = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name should be between 2 and 50 characters')
        .matches(NAME_PATTERN)
        .withMessage('First name can only contain Latin letters (accents allowed), spaces, hyphens, apostrophes and dots'),

    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name should be between 2 and 50 characters')
        .matches(NAME_PATTERN)
        .withMessage('Last name can only contain Latin letters (accents allowed), spaces, hyphens, apostrophes and dots'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),

    body('phone')
        .trim()
        .custom(isPlausiblePhone)
        .withMessage('Please enter a valid phone number (7–15 digits)'),

    body('inquiryType')
        .isIn(INQUIRY_TYPES)
        .withMessage('Please enter a valid inquiry type'),

    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),

    // values: 'falsy' so an untouched <select> (sent as '') counts as "not provided" and falls
    // back to the defaults below; plain .optional() only skips undefined (BUG-01).
    body('modelInterest')
        .optional({ values: 'falsy' })
        .isIn(MODEL_VALUES),

    body('preferredContactMethod')
        .optional({ values: 'falsy' })
        .isIn(['Email', 'Phone', 'Either']),

    body('preferredContactTime')
        .optional({ values: 'falsy' })
        .isIn(['Morning', 'Afternoon', 'Evening', 'Anytime']),
];

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

        // UPG-03: the lead and the emails it needs are saved atomically (one nested write), so a lead
        // can never exist without its emails being recorded. The outbox worker delivers (and
        // retries) them; the visitor's request never waits on SMTP (ERR-03).
        const contact = await prisma.contact.create({
            data: { ...contactData, emails: contactEmailsNestedWrite() },
        });
        nudgeEmailWorker();

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