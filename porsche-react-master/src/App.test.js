// App shell (TEST-01). Feature behaviour has focused tests elsewhere (routes.test.jsx,
// Contact.test.jsx, AdminDashboard.test.jsx, adminAuth.test.jsx, ErrorBoundaries.test.jsx);
// this file only checks the shell that wires them together.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App, { AppRoutes } from './App';

const renderAt = (url) => render(<MemoryRouter initialEntries={[url]}><AppRoutes /></MemoryRouter>);

test('the full app mounts (providers + router) and the home page shows the navbar', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
});

describe('unknown URLs (BUG-08)', () => {
    test.each(['/this-page-does-not-exist', '/admin/nope', '/contact/extra'])('%s shows a not-found page instead of a blank screen', (url) => {
        renderAt(url);
        expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
    });

    test('model URLs keep their own model-specific 404', () => {
        renderAt('/models/taycan-cross-turismo');
        expect(screen.getByText('Model Not Found')).toBeInTheDocument();
    });
});
