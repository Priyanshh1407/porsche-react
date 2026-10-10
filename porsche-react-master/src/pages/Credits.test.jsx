// Phase 7: every 3D model is credited as its Creative Commons licence requires, and the site
// says it is not affiliated with Porsche AG and that the photos are for demonstration only.
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Credits from './Credits';

const renderCredits = () => render(<MemoryRouter><Credits /></MemoryRouter>);

// From each GLB's asset.extras (author, licence, source), checked in Phase 7 prep.
const MODELS = [
    ['2024 Manthey Racing Porsche 911 GT3 RS', 'HYPR:IMPS 3D', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 'https://sketchfab.com/3d-models/2024-manthey-racing-porsche-911-gt3-rs-09ccead93fb34944bde812d4b4684eff'],
    ['2022 Porsche Cayenne Turbo GT', 'Ddiaz Design', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 'https://sketchfab.com/3d-models/2022-porsche-cayenne-turbo-gt-74fbea5a4dfc4197839fdd2bf654369a'],
    ['2014 - Porsche 918 Spyder (Rigged) | Mid-Poly', 'UniBlend', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/', 'https://sketchfab.com/3d-models/2014-porsche-918-spyder-rigged-mid-poly-1d34d42ce58c48f49146346ff67e492d'],
    ['2025 Porsche Taycan Turbo GT Weissach Package', 'Ddiaz Design', 'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'https://sketchfab.com/3d-models/2025-porsche-taycan-turbo-gt-weissach-package-4e1abafe7cf5413587a421377624ba08'],
    ['Porsche 911 Turbo S', '3D Cars Studio', 'CC BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'https://sketchfab.com/3d-models/porsche-911-turbo-s-081cf9a708bb4b8b8f14d55b56ffdfe9'],
];

test.each(MODELS)('credits "%s" by %s under %s, with links to the licence and the source', (title, author, licence, licenceUrl, source) => {
    renderCredits();
    const entry = screen.getByRole('listitem', { name: title });
    expect(within(entry).getByText(author, { exact: false })).toBeInTheDocument();
    expect(within(entry).getByRole('link', { name: licence })).toHaveAttribute('href', licenceUrl);
    expect(within(entry).getByRole('link', { name: /View on Sketchfab/ })).toHaveAttribute('href', source);
});

test('the two NonCommercial models say so', () => {
    renderCredits();
    expect(screen.getAllByText(/non-commercial/i).length).toBeGreaterThanOrEqual(2);
});

test('states it is not affiliated with Porsche AG and that photos are for demonstration only', () => {
    renderCredits();
    expect(screen.getByText(/not affiliated with, endorsed by or sponsored by Porsche AG/i)).toBeInTheDocument(); // the page; the footer has a short version
    expect(screen.getByText(/demonstration purposes only/i)).toBeInTheDocument();
});
