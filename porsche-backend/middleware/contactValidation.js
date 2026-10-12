import { body, validationResult } from "express-validator";
import { INQUIRY_TYPES, MODEL_VALUES } from "../config/contactOptions.js";

// The rules for a new lead, shared by the contact form (routes/contact.js) and the AI concierge's
// booking tool (services/ai/tools.js), so a lead is held to the same standard however it arrives.

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
export const contactValidation = [
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

/**
 * Runs the contact-form rules on a plain object (no HTTP request). Returns { errors, data }:
 * `errors` as [{ field, message }], `data` the sanitised values (trimmed, email normalised).
 */
export async function validateLead(input) {
    const req = { body: { ...input } };
    await Promise.all(contactValidation.map((rule) => rule.run(req)));
    const errors = validationResult(req).array().map((e) => ({ field: e.path, message: e.msg }));
    return { errors, data: req.body };
}
