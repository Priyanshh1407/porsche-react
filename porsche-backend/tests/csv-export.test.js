// SEC-04: CSV export must be injection-safe and well-formed.
import { csvCell, toCsv } from '../utils/exportService.js';

// Minimal RFC 4180 parser used only to prove the output round-trips.
function parseCsv(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') inQuotes = false;
            else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (c !== '\r') field += c;
    }
    row.push(field); rows.push(row);
    return rows;
}

const contact = (overrides = {}) => ({
    id: 'c1', firstName: 'Anna', lastName: 'Schmidt', email: 'anna@example.com', phone: '5550123',
    inquiryType: 'Sales', modelInterest: 'GT3RS', message: 'Hi', status: 'new',
    preferredContactMethod: 'Email', preferredContactTime: 'Morning',
    createdAt: new Date('2026-10-09T10:00:00Z'), updatedAt: new Date('2026-10-09T10:00:00Z'), notes: null,
    ...overrides,
});

describe('csvCell', () => {
    test.each(['=HYPERLINK("http://evil","x")', '+cmd', '-2+3', '@SUM(A1)', '\tx', '\rx'])(
        'neutralises a cell starting with a formula character: %j', (value) => {
            expect(csvCell(value)).toBe(`"'${value.replace(/"/g, '""')}"`);
        }
    );

    test('quotes every cell and doubles embedded quotes', () => {
        expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    });

    test('renders null/undefined as an empty quoted cell', () => {
        expect(csvCell(null)).toBe('""');
        expect(csvCell(undefined)).toBe('""');
    });
});

describe('toCsv', () => {
    test('notes and messages with commas, quotes and newlines round-trip through a CSV parser', () => {
        const tricky = 'Called twice, no answer.\nSays "call after 5", maybe';
        const rows = parseCsv(toCsv([contact({ notes: tricky, message: 'Line 1,\nLine 2' })]));

        expect(rows).toHaveLength(2); // header + 1 contact, no row split by the newlines
        const header = rows[0];
        const record = Object.fromEntries(header.map((h, i) => [h, rows[1][i]]));
        expect(record.Notes).toBe(tricky);
        expect(record.Message).toBe('Line 1,\nLine 2');
        expect(record.Email).toBe('anna@example.com');
    });

    test('a formula in the message is exported as inert text', () => {
        const rows = parseCsv(toCsv([contact({ message: '=HYPERLINK("http://evil","Click")' })]));
        const messageIndex = rows[0].indexOf('Message');
        expect(rows[1][messageIndex]).toBe('\'=HYPERLINK("http://evil","Click")');
    });
});
