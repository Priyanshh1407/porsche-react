import express from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../prisma/client.js";
import { sendContactEmails } from "../utils/emailService.js";
import notificationService from "../utils/notifications.js";
import { sanitizeInput, spamCheck } from "../middleware/validation.js";

const router = express.Router();

// Contact form rate limiting
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    max: 100, // Increased for testing (was 5)
    message: {
        success: false,
        message: 'Too many contact submissions. Please try again'
    }
});

// Validation
const contactValidation = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name should be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),

    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email address'),

    body('phone')
        .isMobilePhone()
        .withMessage('Please enter a valid mobile number'),

    body('inquiryType')
        .isIn(['Sales', 'Service', 'Test_Drive', 'Parts', 'Financing', 'General'])
        .withMessage('Please enter a valid inquiry type'),

    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),

    body('modelInterest')
        .optional()
        .isIn(['911', '718_Cayman', '718_Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'CarreraGT', 'Cayman_GT4RS', 'GT2RS_911', 'GT3RS', 'Spyder_918', 'TurboS_911', 'Other', 'Not_specified']),

    body('preferredContactMethod')
        .optional()
        .isIn(['Email', 'Phone', 'Either']),

    body('preferredContactTime')
        .optional()
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