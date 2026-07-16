import prisma from '../prisma/client.js';

class ExportService {
    // Export contacts to CSV format
    static async exportToCSV(filters = {}, res) {
        try {
            // map mongoose filters to prisma where clauses
            const where = {};
            if (filters.status) where.status = filters.status;
            if (filters.inquiryType) where.inquiryType = filters.inquiryType;
            if (filters.createdAt) {
                where.createdAt = {};
                if (filters.createdAt.$gte) where.createdAt.gte = filters.createdAt.$gte;
                if (filters.createdAt.$lte) where.createdAt.lte = filters.createdAt.$lte;
            }

            const contacts = await prisma.contact.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });

            // CSV headers
            const headers = [
                'ID',
                'First Name',
                'Last Name',
                'Email',
                'Phone',
                'Inquiry Type',
                'Model Interest',
                'Message',
                'Status',
                'Preferred Contact Method',
                'Preferred Contact Time',
                'Created At',
                'Updated At',
                'Notes'
            ];

            // Convert contacts to CSV rows
            const csvRows = contacts.map(contact => [
                contact.id,
                contact.firstName,
                contact.lastName,
                contact.email,
                contact.phone,
                contact.inquiryType,
                contact.modelInterest,
                `"${contact.message.replace(/"/g, '""')}"`, // Escape quotes in message
                contact.status,
                contact.preferredContactMethod,
                contact.preferredContactTime,
                contact.createdAt.toISOString(),
                contact.updatedAt.toISOString(),
                contact.notes || ''
            ]);

            // Combine headers and rows
            const csvContent = [headers, ...csvRows]
                .map(row => row.join(','))
                .join('\n');

            // Set response headers for file download
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=porsche-contacts-${new Date().toISOString().split('T')[0]}.csv`
            );

            return res.send(csvContent);

        } catch (error) {
            console.error('CSV export error:', error);
            throw error;
        }
    }

    // Export specific contact details
    static async exportContactDetails(contactId) {
        try {
            const contact = await prisma.contact.findUnique({
                where: { id: contactId }
            });
            if (!contact) {
                throw new Error('Contact not found');
            }

            return {
                personalInfo: {
                    name: `${contact.firstName} ${contact.lastName}`,
                    email: contact.email,
                    phone: contact.phone
                },
                inquiryDetails: {
                    type: contact.inquiryType,
                    modelInterest: contact.modelInterest,
                    message: contact.message,
                    preferredContact: contact.preferredContactMethod,
                    preferredTime: contact.preferredContactTime
                },
                tracking: {
                    status: contact.status,
                    source: contact.source,
                    createdAt: contact.createdAt,
                    updatedAt: contact.updatedAt,
                    contactedAt: contact.contactedAt,
                    notes: contact.notes
                },
                technical: {
                    ipAddress: contact.ipAddress,
                    userAgent: contact.userAgent
                }
            };
        } catch (error) {
            console.error('Contact details export error:', error);
            throw error;
        }
    }
}

export default ExportService;
