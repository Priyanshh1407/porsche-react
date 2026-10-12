import express from "express";
import { authenticateAdmin } from "../middleware/auth.js";
import { tickets, openStream } from "../utils/events.js";

// Phase 9: live admin notifications over Server-Sent Events (see utils/events.js).
const router = express.Router();

// POST /api/admin/events/ticket - trade the admin JWT for a single-use stream ticket (30 s)
router.post('/ticket', authenticateAdmin, (req, res) => {
    const ticket = tickets.issue({ email: req.admin.email, exp: req.admin.exp });
    res.status(201).json({ success: true, ticket, expiresIn: tickets.ttlSeconds });
});

// GET /api/admin/events?ticket=... - the event stream (text/event-stream)
router.get('/', async (req, res) => {
    const admin = tickets.redeem(req.query.ticket);
    if (!admin) {
        return res.status(401).json({ success: false, message: 'Missing, expired or already used ticket.' });
    }
    try {
        await openStream(req, res, { expiresAt: admin.exp * 1000 });
    } catch (error) {
        console.error('Live events unavailable:', error.message);
        if (!res.headersSent) res.status(503).json({ success: false, message: 'Live updates are unavailable right now.' });
    }
});

export default router;
