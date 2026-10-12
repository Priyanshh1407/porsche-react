import express from "express";
import rateLimit from "express-rate-limit";
import { getAiClient } from "../services/ai/client.js";
import { converse } from "../services/ai/concierge.js";

// Phase 11: the AI concierge chat (Gemini + our tools; see services/ai/concierge.js).
const router = express.Router();

// 20 requests per 10 minutes per visitor: each reply can cost several model calls.
const chatLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Too many messages. Please wait a few minutes.' },
});

// GET /api/concierge/status - whether the chat is available (an API key is configured)
router.get('/status', (req, res) => {
    res.json({ success: true, available: Boolean(getAiClient()) });
});

// POST /api/concierge/chat { messages: [{ role: 'user' | 'assistant', text }] }
router.post('/chat', chatLimiter, async (req, res) => {
    const client = getAiClient();
    if (!client) {
        return res.status(503).json({ success: false, message: 'The assistant is unavailable right now. Please use the contact form.' });
    }
    try {
        const result = await converse({
            client,
            messages: req.body?.messages,
            context: { ip: req.ip || 'unknown', userAgent: req.headers['user-agent'] || 'unknown' },
        });
        res.json({ success: true, ...result });
    } catch (error) {
        if (error.status === 400) return res.status(400).json({ success: false, message: error.message });
        // No conversation content in the logs (it can contain contact details).
        console.error('Concierge error:', error.message);
        res.status(502).json({ success: false, message: 'The assistant could not answer just now. Please try again.' });
    }
});

export default router;
