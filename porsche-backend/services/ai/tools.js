// Phase 11: the concierge's tools. Gemini decides which to call; this code runs them. They are the
// assistant's only source of facts (data/catalogue.json, generated from the frontend's model data)
// and its only way to act (book_test_drive -> createLead, under the contact form's rules).
import fs from 'fs';
import prisma from '../../prisma/client.js';
import { createLead } from '../leads.js';
import { validateLead } from '../../middleware/contactValidation.js';

export const CATALOGUE = JSON.parse(fs.readFileSync(new URL('../../data/catalogue.json', import.meta.url), 'utf8'));
const CATEGORIES = [...new Set(CATALOGUE.map((m) => m.category))];
const SLUGS = CATALOGUE.map((m) => m.slug);
const bySlug = (slug) => CATALOGUE.find((m) => m.slug === String(slug || '').toLowerCase()) || null;
const summary = ({ slug, name, category, description, url }) => ({ slug, name, category, description, url });

export const MAX_BOOKINGS_PER_HOUR = 3; // per visitor IP (the contact form allows 5 submissions)

/** Function declarations sent to Gemini (JSON Schema parameters). */
export const TOOL_DECLARATIONS = [
    {
        name: 'search_models',
        description: 'Lists the Porsche models on this website, optionally filtered by category and/or a free-text query (matched against name, description and specs such as "electric", "V8", "manual").',
        parametersJsonSchema: {
            type: 'object',
            properties: {
                category: { type: 'string', enum: CATEGORIES },
                query: { type: 'string', maxLength: 60 },
            },
        },
    },
    {
        name: 'get_model',
        description: 'Full details and specs of one model on this website. specs is null when the site lists none for it.',
        parametersJsonSchema: {
            type: 'object',
            properties: { slug: { type: 'string', enum: SLUGS } },
            required: ['slug'],
        },
    },
    {
        name: 'compare_models',
        description: 'Specs of 2 to 4 models side by side.',
        parametersJsonSchema: {
            type: 'object',
            properties: { slugs: { type: 'array', items: { type: 'string', enum: SLUGS }, minItems: 2, maxItems: 4 } },
            required: ['slugs'],
        },
    },
    {
        name: 'book_test_drive',
        description: 'Books a test drive (sends the request to the sales team). Only call this after the visitor has seen a summary of ALL these details and explicitly confirmed them in the chat; then set confirmed to true.',
        parametersJsonSchema: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                modelSlug: { type: 'string', enum: SLUGS },
                preferredContactTime: { type: 'string', enum: ['Morning', 'Afternoon', 'Evening', 'Anytime'] },
                notes: { type: 'string', maxLength: 500, description: 'Anything the visitor asked to pass on (dates, questions).' },
                confirmed: { type: 'boolean', description: 'true only after the visitor explicitly confirmed the summary' },
            },
            required: ['firstName', 'lastName', 'email', 'phone', 'modelSlug', 'confirmed'],
        },
    },
];

function searchModels({ category, query } = {}) {
    const q = String(query || '').trim().toLowerCase();
    const models = CATALOGUE
        .filter((m) => !category || m.category === category)
        .filter((m) => !q || [m.name, m.fullName, m.description, m.category, ...Object.values(m.specs || {})].join(' ').toLowerCase().includes(q))
        .map(summary);
    return { models };
}

function getModel({ slug } = {}) {
    const model = bySlug(slug);
    return model ? { model } : { error: `Model "${slug}" was not found on this site. Use search_models to see the available models.` };
}

function compareModels({ slugs } = {}) {
    const list = Array.isArray(slugs) ? slugs.slice(0, 4) : [];
    const models = list.map(bySlug);
    if (models.length < 2 || models.some((m) => !m)) return { error: 'Give 2 to 4 valid model slugs from search_models.' };
    return { models };
}

async function bookTestDrive(args = {}, { ip, userAgent }) {
    if (args.confirmed !== true) {
        return { error: 'Not booked: first show the visitor a summary of the details and ask them to confirm; then call again with confirmed=true.' };
    }
    const model = bySlug(args.modelSlug);
    if (!model) return { error: 'Not booked: unknown model. Use a slug from search_models.' };

    const notes = typeof args.notes === 'string' ? args.notes.trim().slice(0, 500) : '';
    const message = `Test drive request for the ${model.name} via the website assistant.${notes ? ` Visitor's note: ${notes}` : ''}`.slice(0, 1000);
    const { errors, data } = await validateLead({
        firstName: args.firstName, lastName: args.lastName, email: args.email, phone: args.phone,
        inquiryType: 'Test_Drive', message, modelInterest: model.contactValue,
        preferredContactMethod: 'Either', preferredContactTime: args.preferredContactTime || 'Anytime',
    });
    if (errors.length) return { error: 'Not booked: some details are invalid. Ask the visitor to correct them.', errors };

    // Counted in the database, so the limit holds across API instances and restarts.
    const recent = await prisma.contact.count({
        where: { source: 'Concierge', ipAddress: ip, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= MAX_BOOKINGS_PER_HOUR) {
        return { error: 'Not booked: the booking limit for this visitor was reached. Suggest the contact form or calling the dealership.' };
    }

    const lead = await createLead({
        ...data, status: 'new', source: 'Concierge', ipAddress: ip, userAgent,
    }, { actor: 'ai', ip });
    return { booked: true, model: model.name, leadId: lead.id };
}

/**
 * Runs one tool call. Returns { result, booking?, slugs } where `result` goes back to the model
 * (never internal ids), `booking` to the visitor, and `slugs` are the models it returned.
 */
export async function runTool(name, args, context) {
    switch (name) {
        case 'search_models': {
            const result = searchModels(args);
            return { result, slugs: result.models.map((m) => m.slug) };
        }
        case 'get_model': {
            const result = getModel(args);
            return { result, slugs: result.model ? [result.model.slug] : [] };
        }
        case 'compare_models': {
            const result = compareModels(args);
            return { result, slugs: (result.models || []).map((m) => m.slug) };
        }
        case 'book_test_drive': {
            const { leadId, ...result } = await bookTestDrive(args, context);
            return { result, booking: leadId ? { id: leadId, model: result.model } : undefined, slugs: [] };
        }
        default:
            return { result: { error: `Unknown tool ${name}.` }, slugs: [] };
    }
}

export const modelBySlug = bySlug;
