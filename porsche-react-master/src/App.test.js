import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
    it('renders without crashing', () => {
        render(<App />);
        // The navbar should be present in the routes, or at least the home component
        // Since we are rendering the whole app, it defaults to the '/' route (Home)
        expect(screen.getByRole('navigation')).toBeTruthy();
    });
});
