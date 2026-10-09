import React from 'react';
import { useLocation } from 'react-router-dom';

// ERR-01 (second layer): any page crash shows a recovery screen instead of a blank app.
class Boundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error('Page crashed:', error);
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-black text-white text-center">
                <h1 className="text-3xl font-bold">Something went wrong on this page.</h1>
                <p className="text-gray-400">Please try again, or head back to the showroom.</p>
                <a href="/" className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors">Back to Home</a>
            </div>
        );
    }
}

// Keyed by path, so navigating to another page clears a previous error.
export default function RouteErrorBoundary({ children }) {
    const { pathname } = useLocation();
    return <Boundary key={pathname}>{children}</Boundary>;
}
