// Phase 11: the concierge's catalogue is generated from the frontend's model data
// (scripts/build-catalogue.mjs). If the site's models or specs change, this fails until the
// catalogue is regenerated, so the assistant never quotes stale numbers.
import fs from 'fs';
import { buildCatalogue, serialise, CATALOGUE_FILE } from '../scripts/build-catalogue.mjs';
import { MODEL_VALUES } from '../config/contactOptions.js';

test('data/catalogue.json matches the frontend model data', () => {
    const committed = fs.readFileSync(CATALOGUE_FILE, 'utf8').replace(/\r\n/g, '\n');
    expect(committed).toBe(serialise(buildCatalogue()));
});

test('every model can be booked with a value the contact form accepts', () => {
    for (const model of buildCatalogue()) expect(MODEL_VALUES).toContain(model.contactValue);
});

test('a data file that describes a different car does not lend it its specs (718 Boxster S)', () => {
    const boxster = buildCatalogue().find((m) => m.slug === '718-boxster-s');
    // Its model page data is a copy of the GT3 RS (518 HP); the /models card has the Boxster's own.
    expect(boxster.fullName).toBe('Porsche 718 Boxster S');
    expect(boxster.specs).toEqual(expect.objectContaining({ power: '350 HP' }));
});

test('list prices come from the /models page, only for exact name matches', () => {
    const catalogue = buildCatalogue();
    expect(catalogue.find((m) => m.slug === '911-gt3-rs').listPrice).toBe('$223,800');
    expect(catalogue.find((m) => m.slug === '718-cayman-gt4-rs').listPrice).toBeNull(); // card is the plain GT4
});
