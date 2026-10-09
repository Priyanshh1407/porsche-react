import { Link } from 'react-router-dom';

// BUG-08: any URL without a route used to render a completely blank page.
export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gradient-to-br from-[#1F1C2C] via-[#928DAB] to-[#2C5364] text-white text-center">
            <p className="text-6xl font-extrabold">404</p>
            <h1 className="text-2xl font-light">Page not found</h1>
            <div className="flex gap-3 mt-2">
                <Link to="/" className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors">Back to Home</Link>
                <Link to="/models" className="px-6 py-2 rounded-full border border-white/40 hover:bg-white/10 transition-colors">All Models</Link>
            </div>
        </div>
    );
}
