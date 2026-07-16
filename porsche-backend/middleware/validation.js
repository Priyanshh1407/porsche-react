import { validationResult } from "express-validator";
import xss from "xss";

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

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        });
    }
    next();
};

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
export { handleValidationErrors, sanitizeInput, spamCheck };