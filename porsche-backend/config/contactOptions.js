import { ContactStatus } from '@prisma/client';

// Allowed values shared by the public contact form, the admin API, emails and analytics (VAL-01).
export const INQUIRY_TYPES = ['Sales', 'Service', 'Test_Drive', 'Parts', 'Financing', 'General'];

// Generated from the Prisma enum, so the API and the database cannot drift apart.
export const CONTACT_STATUSES = Object.values(ContactStatus);

// Models a visitor can pick, with the label people should read. Stored values keep their
// original form; anything shown to a person goes through modelLabel().
export const MODEL_OPTIONS = [
    { value: '911', label: '911', category: 'Sports Cars' },
    { value: '718_Cayman', label: '718 Cayman', category: 'Sports Cars' },
    { value: '718_Boxster', label: '718 Boxster', category: 'Sports Cars' },
    { value: 'Cayenne', label: 'Cayenne', category: 'SUV' },
    { value: 'Macan', label: 'Macan', category: 'SUV' },
    { value: 'Panamera', label: 'Panamera', category: 'Sedan' },
    { value: 'Taycan', label: 'Taycan', category: 'Electric' },
    { value: 'CarreraGT', label: 'Carrera GT', category: 'Supercar' },
    { value: 'Cayman_GT4RS', label: 'Cayman GT4 RS', category: 'Sports Cars' },
    { value: 'GT2RS_911', label: '911 GT2 RS', category: 'Sports Cars' },
    { value: 'GT3RS', label: '911 GT3 RS', category: 'Sports Cars' },
    { value: 'Spyder_918', label: '918 Spyder', category: 'Supercar' },
    { value: 'TurboS_911', label: '911 Turbo S', category: 'Sports Cars' },
    { value: 'Other', label: 'Other', category: 'Other' },
];

// 'Not_specified' is the stored default when no model was chosen; it is accepted but not offered.
export const MODEL_VALUES = [...MODEL_OPTIONS.map((m) => m.value), 'Not_specified'];

const LABELS = new Map(MODEL_OPTIONS.map((m) => [m.value, m.label]));

/** Human-readable model name ("GT2RS_911" -> "911 GT2 RS"); unknown values fall back to spaces. */
export const modelLabel = (value) => LABELS.get(value) ?? String(value).replace(/_/g, ' ');
