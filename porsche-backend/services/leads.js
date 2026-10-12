import prisma from '../prisma/client.js';
import { contactEmailsNestedWrite, nudgeEmailWorker } from '../utils/emailOutbox.js';
import { audit } from '../utils/audit.js';
import { publish } from '../utils/events.js';

/**
 * Create a lead with everything that must exist with it, in ONE transaction: the contact, its
 * outbox emails (UPG-03), its audit event and its live notification. Used by the contact form and the AI concierge.
 * `data` is already validated. Returns the created contact.
 */
export async function createLead(data, { actor = 'public', ip } = {}) {
    const contact = await prisma.$transaction(async (tx) => {
        const created = await tx.contact.create({ data: { ...data, emails: contactEmailsNestedWrite() } });
        await audit({
            actor,
            action: 'lead_created',
            contactId: created.id,
            after: { source: created.source, inquiryType: created.inquiryType, modelInterest: created.modelInterest },
            ip,
        }, tx);
        // Phase 9: delivered to connected admins only once this transaction commits.
        await publish(tx, 'lead.created', {
            id: created.id, name: `${created.firstName} ${created.lastName}`, inquiryType: created.inquiryType,
            modelInterest: created.modelInterest, source: created.source,
        });
        return created;
    });
    nudgeEmailWorker();
    return contact;
}
