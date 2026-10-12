// The "Configure" buttons on the home page and /models used to do nothing. They open the
// configurator, preset to the car on screen when the configurator offers it.
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';
import AllModels from './AllModels';
import { configuratorPathFor } from '../components/configurator/options';

let location;
const Spy = () => { location = useLocation(); return null; };
const renderAt = (path, element) => render(
    <MemoryRouter initialEntries={[path]}>
        <Routes>
            <Route path={path} element={element} />
            <Route path="/configurator" element={<Spy />} />
        </Routes>
    </MemoryRouter>
);
const where = () => location.pathname + location.search;

test.each([
    ['Taycan', '/configurator?car=taycan'],
    ['911 Turbo S', '/configurator?car=911-turbo-s'],
    ['918 Spyder', '/configurator?car=918-spyder'],
    ['Cayenne', '/configurator?car=cayenne'],
    ['911 GT3 RS', '/configurator'], // not offered (livery): the configurator's default
    ['718 Cayman GT4 RS', '/configurator'],
    [undefined, '/configurator'],
])('configuratorPathFor(%s) = %s', (name, path) => {
    expect(configuratorPathFor(name)).toBe(path);
});

test('home: "Configure" opens the configurator', () => {
    renderAt('/', <Home />);
    fireEvent.click(screen.getByRole('button', { name: 'Configure' }));
    expect(where()).toBe('/configurator'); // first hero slide is the GT3 RS (not offered)
});

test('/models: "CONFIGURE NOW" opens the configurator for the model on screen', () => {
    renderAt('/models', <AllModels />);
    fireEvent.click(screen.getByRole('button', { name: 'Electric' }));
    fireEvent.click(screen.getByRole('button', { name: /CONFIGURE NOW/ }));
    expect(where()).toBe('/configurator?car=taycan');
});
