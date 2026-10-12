import prisma from '../prisma/client.js';

/** Who made a request: 'admin:<email>' for an authenticated admin, otherwise 'public'. */
export const actorFor = (req) => (req.admin?.email ? `admin:${req.admin.email}` : 'public');

/**
 * Record one audit event. Pass the transaction client (`tx`) of the change being recorded, so the
 * change and its event commit or roll back together. Outside a change (logins, exports) pass
 * nothing and the default client is used.
 */
export function audit({ actor, action, contactId = null, before, after, meta, ip }, db = prisma) {
    return db.auditEvent.create({
        data: {
            actor: String(actor).slice(0, 120),
            action,
            contactId,
            before: before ?? undefined,
            after: after ?? undefined,
            meta: meta ?? undefined,
            ip: ip ? String(ip).slice(0, 64) : undefined,
        },
    });
}

// Keyset cursor for the audit list: "<ISO timestamp>|<id>" (base64url), newest first.
export const encodeCursor = (event) => Buffer.from(`${event.at.toISOString()}|${event.id}`).toString('base64url');
export function decodeCursor(cursor) {
    const [iso, id] = Buffer.from(String(cursor), 'base64url').toString('utf8').split('|');
    const at = new Date(iso);
    if (!id || Number.isNaN(at.getTime())) return null;
    return { at, id };
}
