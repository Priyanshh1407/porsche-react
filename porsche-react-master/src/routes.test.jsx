// BUG-03: every model link resolves to a real page, and every old URL still works.
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppRoutes } from './App';
import { MODELS, modelPath, navbarModelGroups, pathForName } from './data/models';
import { MODEL_PAGES } from './data/modelPages';

const LocationProbe = () => <div data-testid="location">{useLocation().pathname}</div>;

const renderAt = (url) => render(
    <MemoryRouter initialEntries={[url]}>
        <AppRoutes />
        <LocationProbe />
    </MemoryRouter>
);

const expectNoModel404 = () => expect(screen.queryByText('Model Not Found')).not.toBeInTheDocument();
const currentPath = () => screen.getByTestId('location').textContent;

describe('model registry', () => {
    test('every registry entry has a page component', () => {
        for (const m of MODELS) expect(MODEL_PAGES[m.slug]?.Page).toBeDefined();
    });

    test('the navbar lists exactly the 11 models that have pages', () => {
        const navNames = navbarModelGroups().flatMap((g) => g.models.map((m) => m.name)).sort();
        expect(navNames).toEqual(MODELS.map((m) => m.name).sort());
        expect(navNames).toHaveLength(11);
    });

    test('every model name used on Home and All Models resolves to a URL', () => {
        const allModelsNames = ['911 GT3 RS', '918 Spyder', '911 Turbo S', 'Carrera GT', 'Taycan', 'Cayenne',
            'Panamera', '718 Cayman GT4', '911 GT2 RS', 'Macan GTS', '718 Boxster S'];
        for (const name of allModelsNames) expect(() => pathForName(name)).not.toThrow();
    });
});

describe('navbar links render real pages', () => {
    const routes = navbarModelGroups().flatMap((g) => g.models.map((m) => m.route));
    test.each(routes)('%s', (route) => {
        renderAt(route);
        expectNoModel404();
        expect(currentPath()).toBe(route);
    });
});

describe('old URLs redirect to the canonical slug', () => {
    test.each([
        ['/models/911 GT3 RS', '/models/911-gt3-rs'],
        ['/models/911%20GT3%20RS', '/models/911-gt3-rs'],
        ['/models/Taycan', '/models/taycan'],
        ['/models/Cayenne', '/models/cayenne'],
        ['/models/911 Turbo S', '/models/911-turbo-s'],
        ['/models/918 Spyder', '/models/918-spyder'],
        ['/models/718 Cayman GT4', '/models/718-cayman-gt4-rs'],
        ['/models/Macan GTS', '/models/macan-gts'],
        ['/models/macan', '/models/macan-gts'],
        ['/models/718-boxster', '/models/718-boxster-s'],
        ['/3d-experience', '/models/911-gt3-rs'],
    ])('%s -> %s', (from, to) => {
        renderAt(from);
        expect(currentPath()).toBe(to);
        expectNoModel404();
    });
});

describe('details links inside the (protected) 3D showrooms keep working', () => {
    test.each([
        ['/models/gt3rs/details', '/models/911-gt3-rs/details'],
        ['/models/918%20spyder/details', '/models/918-spyder/details'],
        ['/models/911 turbo s/details', '/models/911-turbo-s/details'],
        ['/models/cayenne/details', '/models/cayenne/details'],
        ['/models/taycan/details', '/models/taycan/details'],
    ])('%s -> %s', (from, to) => {
        renderAt(from);
        expect(currentPath()).toBe(to);
        expectNoModel404();
    });
});

describe('URLs with no page still show the 404', () => {
    test.each(['/models/911', '/models/911-gt3', '/models/taycan-cross-turismo', '/models/panamera/details'])('%s', (url) => {
        renderAt(url);
        expect(screen.getByText('Model Not Found')).toBeInTheDocument();
    });
});

test('canonical model paths are what the registry says', () => {
    expect(modelPath('911-gt3-rs')).toBe('/models/911-gt3-rs');
});
