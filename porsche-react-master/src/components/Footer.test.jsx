// Phase 4: footer items either go to a real page or are plain text, never dead href="#" links.
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import { carThemes } from '../data/carThemes';

const theme = carThemes.home;

describe('Footer', () => {
    test('support items link to pages that cover them', () => {
        render(<MemoryRouter><Footer theme={theme} /></MemoryRouter>);
        expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
        expect(screen.getByRole('link', { name: 'Technical Support' })).toHaveAttribute('href', '/contact');
        for (const name of ['Service Centers', 'Warranty', 'Parts & Accessories']) {
            expect(screen.getByRole('link', { name })).toHaveAttribute('href', '/services');
        }
    });

    test('items without a page are text, not links', () => {
        render(<MemoryRouter><Footer theme={theme} /></MemoryRouter>);
        for (const name of ['Privacy Policy', 'Terms of Service', 'Cookies', 'Documentation']) {
            expect(screen.getByText(name)).toBeInTheDocument();
            expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
        }
    });
});

test('the navbar menu button has an accessible name that reflects its state', () => {
    render(<MemoryRouter><Navbar theme={theme} /></MemoryRouter>);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
});
