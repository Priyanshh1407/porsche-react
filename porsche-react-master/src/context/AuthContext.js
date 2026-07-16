import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [adminEmail, setAdminEmail] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('adminToken');
        const email = localStorage.getItem('adminEmail');
        
        if (token && email) {
            setIsAuthenticated(true);
            setAdminEmail(email);
        }
        
        setIsLoading(false);
    }, []);

    const login = (token, email) => {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminEmail', email);
        setIsAuthenticated(true);
        setAdminEmail(email);
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
        setIsAuthenticated(false);
        setAdminEmail('');
    };

    const value = {
        isAuthenticated,
        adminEmail,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
