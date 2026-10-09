import { ContactStatus } from '@prisma/client';

// Allowed values shared by the public contact form and the admin API (VAL-01).
export const INQUIRY_TYPES = ['Sales', 'Service', 'Test_Drive', 'Parts', 'Financing', 'General'];

// Generated from the Prisma enum, so the API and the database cannot drift apart.
export const CONTACT_STATUSES = Object.values(ContactStatus);
