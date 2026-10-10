// Phase 4: the Configurator used to show "Successfully subscribed!" while sending the email
// address nowhere. It must not pretend to collect emails until that feature exists.
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Configurator from './Configurator';

test('offers the working contact form instead of a fake email signup', () => {
    render(<MemoryRouter><Configurator /></MemoryRouter>);
    expect(screen.queryByPlaceholderText(/email address/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/successfully subscribed/i)).not.toBeInTheDocument();
    expect(screen.getByText(/email launch alerts are coming soon/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact Us' })).toHaveAttribute('href', '/contact');
});
