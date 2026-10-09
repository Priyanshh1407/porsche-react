import { validationResult } from "express-validator";

// handle validation erros 
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// (sanitizeInput was removed in SEC-02: it was never mounted, and rewriting input on the way in
// corrupts stored data. Untrusted values are escaped on output instead, see utils/emailService.js.)

// check for spam patterns 
const spamCheck = (req, res, next) => {
    const { message, firstName, lastName } = req.body;

    // common span patterns
    const spamPatterns = [
        /(?:https?:\/\/|www\.)[^\s]+/gi, // URLs
        /\b(?:viagra|casino|poker|loan|bitcoin|crypto)\b/gi, // Spam keywords
        /(.)\1{4,}/g, // Repeated characters
        /[A-Z]{10,}/, // Too many capitals
    ];

    const fullText = `${firstName} ${lastName} ${message}\n\n`.toLowerCase();

    for (let pattern of spamPatterns) {
        if (pattern.test(fullText)) {
            return res.status(400).json({
                success: false,
                message: 'Your message appears to contain spam content. Please revise and try again.'
            });
        }
    }

    next();
};
export { handleValidationErrors, spamCheck };