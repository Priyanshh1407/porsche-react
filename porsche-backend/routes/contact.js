import express from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../prisma/client.js";
import { sendContactEmails } from "../utils/emailService.js";
import notificationService from "../utils/notifications.js";
import { spamCheck } from "../middleware/validation.js";
import { INQUIRY_TYPES } from "../config/contactOptions.js";

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

// VAL-02: names in any script (José Müller, Zoë O'Connor-Brontë, 李明华, Mary Ann St. John).
// Must start with a letter; then letters, combining marks, spaces, apostrophes, hyphens, dots.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

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
        .isLength({ min: 1, max: 50 })
        .withMessage('First name should be between 1 and 50 characters')
        .matches(NAME_PATTERN)
        .withMessage('First name can only contain letters, spaces, hyphens, apostrophes and dots'),

    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name should be between 1 and 50 characters')
        .matches(NAME_PATTERN)
        .withMessage('Last name can only contain letters, spaces, hyphens, apostrophes and dots'),

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
        .isIn(['911', '718_Cayman', '718_Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'CarreraGT', 'Cayman_GT4RS', 'GT2RS_911', 'GT3RS', 'Spyder_918', 'TurboS_911', 'Other', 'Not_specified']),

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

        const contact = await prisma.contact.create({
            data: contactData
        });

        // send emails(customer confirmation + admin notification)
        try {
            await sendContactEmails(contact);
        } catch (emailError) {
            console.log('Email sending failed: ', emailError.message);
            // Don't fail the request if email fails
        }

        // Notify admins in real-time
        notificationService.newContact(contact);

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
    const models = [
        { value: '911', label: '911', category: 'Sports Cars' },
        { value: '718_Cayman', label: '718 Cayman', category: 'Sports Cars' },
        { value: '718_Boxster', label: '718 Boxster', category: 'Sports Cars' },
        { value: 'Cayenne', label: 'Cayenne', category: 'SUV' },
        { value: 'Macan', label: 'Macan', category: 'SUV' },
        { value: 'Panamera', label: 'Panamera', category: 'Sedan' },
        { value: 'Taycan', label: 'Taycan', category: 'Electric' },
        { value: 'CarreraGT', label: 'Carrera GT', category: 'Supercar' },
        { value: 'Cayman_GT4RS', label: 'Cayman GT4 RS', category: 'Sports Cars' },
        { value: 'GT2RS_911', label: '911 GT2 RS', category: 'Sports Cars' },
        { value: 'GT3RS', label: '911 GT3 RS', category: 'Sports Cars' },
        { value: 'Spyder_918', label: '918 Spyder', category: 'Supercar' },
        { value: 'TurboS_911', label: '911 Turbo S', category: 'Sports Cars' },
        { value: 'Other', label: 'Other', category: 'Other' }
    ];

    res.json({
        success: true,
        data: models
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