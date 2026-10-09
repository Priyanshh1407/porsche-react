import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getTokenExpiry, isTokenExpired } from '../lib/jwt';

// ARCH-01: the single source of truth for admin auth. The dashboard used to keep its own
// isAuthenticated state and its own login form; logging out there left this context logged in.

const AuthContext = createContext();

// Fired by apiFetch when the API rejects the token (expired, revoked, secret rotated...).
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

const TOKEN_KEY = 'adminToken';
const EMAIL_KEY = 'adminEmail';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Read synchronously on first render, so a guarded page never flashes a redirect for a user who
// is in fact logged in. A stored token that is expired or malformed is discarded right away.
const readStoredSession = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || isTokenExpired(token)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        return { token: null, email: '' };
    }
    return { token, email: localStorage.getItem(EMAIL_KEY) || '' };
};

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(readStoredSession);

    const login = useCallback((token, email) => {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, email);
        setSession({ token, email });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        setSession({ token: null, email: '' });
    }, []);

    // Log out exactly when the token expires, not at the next failed request.
    useEffect(() => {
        if (!session.token) return undefined;
        const delay = Math.max(0, getTokenExpiry(session.token) - Date.now());
        // setTimeout overflows above 2^31-1 ms (~24.8 days) and would fire immediately; for such
        // long-lived tokens the server's 401 (UNAUTHORIZED_EVENT below) still ends the session.
        if (delay > 2147483647) return undefined;
        const timer = setTimeout(logout, delay);
        return () => clearTimeout(timer);
    }, [session.token, logout]);

    // Log out whenever the server rejects the token.
    useEffect(() => {
        window.addEventListener(UNAUTHORIZED_EVENT, logout);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
    }, [logout]);

    const value = useMemo(() => ({
        isAuthenticated: Boolean(session.token),
        adminEmail: session.email,
        // Kept for existing callers; the session is read synchronously, so it is never loading.
        isLoading: false,
        login,
        logout,
    }), [session, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
