// ARCH-01: one auth source, a route guard, expiry and server-side 401 both log the admin out.
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppRoutes } from './App';
import { AuthProvider } from './context/AuthContext';
import { fakeJwt } from './testUtils/fakeJwt';
import { getTokenExpiry, isTokenExpired } from './lib/jwt';

// Signs in through the login form by its labels and button, as a user would.
const signIn = (email, password) => {
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
};

const LocationProbe = () => <div data-testid="location">{useLocation().pathname}</div>;
const currentPath = () => screen.getByTestId('location').textContent;

const renderApp = (url) => render(
    <AuthProvider>
        <MemoryRouter initialEntries={[url]}>
            <AppRoutes />
            <LocationProbe />
        </MemoryRouter>
    </AuthProvider>
);

const json = (body, status = 200) => Promise.resolve({ ok: status < 400, status, json: async () => body });
const dashboardApi = (contactsStatus = 200) => jest.fn((url) => {
    if (url.startsWith('/api/admin/contacts')) {
        return contactsStatus === 401 ? json({ message: 'Invalid token.' }, 401) : json({ data: [], pagination: { current: 1, pages: 1, total: 0, limit: 20 } });
    }
    if (url === '/api/admin/stats') return json({ data: { overview: {} } });
    return json({ data: { trends: [], popularModels: [], conversions: {}, peakHours: [] } });
});

beforeEach(() => localStorage.clear());
afterEach(() => jest.restoreAllMocks());

describe('jwt helpers', () => {
    test('reads exp and treats missing/malformed/expired tokens as expired', () => {
        const token = fakeJwt(60);
        expect(getTokenExpiry(token)).toBeGreaterThan(Date.now());
        expect(isTokenExpired(token)).toBe(false);
        expect(isTokenExpired(fakeJwt(-60))).toBe(true);
        expect(isTokenExpired('not-a-jwt')).toBe(true);
        expect(isTokenExpired(null)).toBe(true);
    });
});

describe('<RequireAdmin> on /admin/dashboard', () => {
    test('logged out -> redirected to the login page (no second login form)', () => {
        renderApp('/admin/dashboard');
        expect(currentPath()).toBe('/admin/login');
    });

    test('an expired stored token is discarded and redirects to login', () => {
        localStorage.setItem('adminToken', fakeJwt(-60));
        localStorage.setItem('adminEmail', 'admin@test.local');
        renderApp('/admin/dashboard');
        expect(currentPath()).toBe('/admin/login');
        expect(localStorage.getItem('adminToken')).toBeNull();
        expect(localStorage.getItem('adminEmail')).toBeNull();
    });

    test('a valid token renders the dashboard', async () => {
        global.fetch = dashboardApi();
        localStorage.setItem('adminToken', fakeJwt());
        renderApp('/admin/dashboard');
        expect(currentPath()).toBe('/admin/dashboard');
        expect(await screen.findByRole('button', { name: /Logout/i })).toBeInTheDocument();
    });
});

describe('session ends correctly', () => {
    test('a 401 from the API logs out and returns to the login page', async () => {
        global.fetch = dashboardApi(401);
        localStorage.setItem('adminToken', fakeJwt());
        renderApp('/admin/dashboard');
        await waitFor(() => expect(currentPath()).toBe('/admin/login'));
        expect(localStorage.getItem('adminToken')).toBeNull();
    });

    test('logout clears token AND email, so the login page no longer thinks you are logged in', async () => {
        global.fetch = dashboardApi();
        localStorage.setItem('adminToken', fakeJwt());
        localStorage.setItem('adminEmail', 'admin@test.local');
        renderApp('/admin/dashboard');
        fireEvent.click(await screen.findByRole('button', { name: /Logout/i }));
        await waitFor(() => expect(currentPath()).toBe('/admin/login'));
        expect(localStorage.getItem('adminToken')).toBeNull();
        expect(localStorage.getItem('adminEmail')).toBeNull();
    });

    test('the session ends by itself when the token expires', async () => {
        jest.useFakeTimers();
        global.fetch = dashboardApi();
        localStorage.setItem('adminToken', fakeJwt(2));
        renderApp('/admin/dashboard');
        expect(currentPath()).toBe('/admin/dashboard');
        await act(async () => { jest.advanceTimersByTime(2500); });
        expect(currentPath()).toBe('/admin/login');
        jest.useRealTimers();
    });
});

describe('login page', () => {
    test("shows the API's message (e.g. rate limited) instead of a generic one", async () => {
        global.fetch = jest.fn(() => json({ success: false, message: 'Too many failed login attempts. Please try again in 15 minutes.' }, 429));
        renderApp('/admin/login');
        signIn('admin@test.local', 'wrong');
        expect(await screen.findByText(/Too many failed login attempts/)).toBeInTheDocument();
    });

    test('after login, returns to the page the guard redirected from', async () => {
        global.fetch = jest.fn((url) => (url === '/api/admin/login'
            ? json({ success: true, token: fakeJwt() })
            : dashboardApi()(url)));
        renderApp('/admin/dashboard');
        expect(currentPath()).toBe('/admin/login');
        signIn('admin@test.local', 'right');
        await waitFor(() => expect(currentPath()).toBe('/admin/dashboard'));
    });
});
