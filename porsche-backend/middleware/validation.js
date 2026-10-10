import { validationResult } from "express-validator";

// Responds 400 with one entry per invalid field. express-validator v7 names the field `path`
// (v6 used `param`, which made `field` always undefined). The rejected value is not echoed back.
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

// (sanitizeInput was removed in SEC-02: it was never mounted, and rewriting input on the way in
// corrupts stored data. Untrusted values are escaped on output instead, see utils/emailService.js.)

// (spamCheck was removed in Phase 4: it was never mounted, and its "too many capitals" rule
// tested lower-cased text, so it could never match. The contact form is rate-limited instead.)

export { handleValidationErrors };
