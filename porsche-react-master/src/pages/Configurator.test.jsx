// Phase 12: the configurator. (Phase 4 removed its fake email signup; it is now a working tool.)
// The 3D view itself runs in a real browser (E2E / screenshots); here: choices, URL and link.
import { act, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Configurator from './Configurator';

let location;
const Spy = () => { location = useLocation(); return null; };
const renderAt = (url) => render(
    <MemoryRouter initialEntries={[url]}>
        <Routes><Route path="/configurator" element={<><Configurator /><Spy /></>} /></Routes>
    </MemoryRouter>
);

test('opens with the build from the URL', async () => {
    renderAt('/configurator?car=918-spyder&paint=shark-blue&finish=satin');
    expect(screen.getByRole('button', { name: '918 Spyder' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Shark Blue' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Satin' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('918 Spyder in Shark Blue, satin finish')).toBeInTheDocument();
    // The 3D view is a lazy chunk; in jsdom (no WebGL) it shows the car's photo.
    expect(await screen.findByRole('img', { name: /918 Spyder photo/ }, { timeout: 5000 })).toBeInTheDocument();
});

test('each choice updates the URL, so a build can be shared', () => {
    renderAt('/configurator');
    fireEvent.click(screen.getByRole('button', { name: '911 Turbo S' }));
    fireEvent.click(screen.getByRole('button', { name: 'GT Silver' }));
    fireEvent.click(screen.getByRole('button', { name: 'Matte' }));
    expect(new URLSearchParams(location.search).toString()).toBe('car=911-turbo-s&paint=gt-silver&finish=matte');
    expect(screen.getByText('911 Turbo S in GT Silver, matte finish')).toBeInTheDocument();
});

test('"Request this spec" opens the contact form pre-filled with the build', () => {
    renderAt('/configurator?car=taycan&paint=lava-orange&finish=gloss');
    const href = screen.getByRole('link', { name: 'Request this spec' }).getAttribute('href');
    const url = new URL(href, 'http://x');
    expect(url.pathname).toBe('/contact');
    expect(url.searchParams.get('model')).toBe('Taycan');
    expect(url.searchParams.get('spec')).toBe('Taycan Turbo GT in Lava Orange, gloss finish');
    expect(screen.getByRole('link', { name: /Explore the Taycan Turbo GT showroom/ })).toHaveAttribute('href', '/models/taycan');
});

test('the GT3 RS is not offered (its paint is a livery texture), and nothing pretends to collect emails', () => {
    renderAt('/configurator');
    expect(screen.queryByRole('button', { name: /GT3 RS/ })).toBeNull();
    expect(screen.queryByPlaceholderText(/email address/i)).not.toBeInTheDocument();
});

test('quick successive choices all stick (each builds on the latest URL)', () => {
    renderAt('/configurator');
    // Same tick, no re-render in between: the second and third must not reset the first.
    const buttons = ['918 Spyder', 'Python Green', 'Matte'].map((name) => screen.getByRole('button', { name }));
    act(() => { buttons.forEach((b) => b.click()); });
    expect(new URLSearchParams(location.search).toString()).toBe('car=918-spyder&paint=python-green&finish=matte');
});
