import request from 'supertest';
import app from '../server.js';
import prisma from '../prisma/client.js';

describe('Porsche Dealership API Endpoints', () => {
    let adminToken = '';
    let createdContactId = '';

    // Mock removed because emailService falls back to demo mode safely without real credentials

    beforeAll(async () => {
        // Ensure connection to DB
        await prisma.$connect();
        // Clear any existing test data if necessary
    });

    afterAll(async () => {
        // Clean up test contact
        if (createdContactId) {
            try {
                await prisma.contact.delete({ where: { id: createdContactId } });
            } catch (e) {
                // Ignore if already deleted
            }
        }
        await prisma.$disconnect();
    });

    describe('Contact API', () => {
        it('should return healthy on /api/contact/health', async () => {
            const res = await request(app).get('/api/contact/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('healthy');
        });

        it('should reject contact form submission with invalid email', async () => {
            const res = await request(app)
                .post('/api/contact/submit')
                .send({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'invalid-email',
                    phone: '+1234567890',
                    inquiryType: 'Sales',
                    message: 'This is a test message.'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
        });

        it('should submit a valid contact form successfully', async () => {
            const res = await request(app)
                .post('/api/contact/submit')
                .send({
                    firstName: 'Automated',
                    lastName: 'Tester',
                    email: 'test@example.com',
                    phone: '+15555555555',
                    inquiryType: 'Sales',
                    message: 'This is an automated test message for the contact form.',
                    modelInterest: '911'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            createdContactId = res.body.data.id;
        });
    });

    describe('Admin API', () => {
        it('should authenticate admin and return token', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({
                    email: process.env.ADMIN_EMAIL || 'admin@porsche-dealer.com',
                    password: process.env.ADMIN_PASSWORD || 'admin123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            adminToken = res.body.token;
        });

        it('should reject admin route without token', async () => {
            const res = await request(app).get('/api/admin/contacts');
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should fetch contacts with valid admin token', async () => {
            const res = await request(app)
                .get('/api/admin/contacts')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should update contact status', async () => {
            if (!createdContactId) return; // Skip if contact wasn't created

            const res = await request(app)
                .put(`/api/admin/contacts/${createdContactId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'contacted' });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('contacted');
        });

        it('should fetch analytics data', async () => {
            const res = await request(app)
                .get('/api/admin/analytics')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('conversions');
            expect(res.body.data).toHaveProperty('popularModels');
        });
    });
});
