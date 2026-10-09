import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ARCH-01: guards admin pages. Logged-out (or expired) visitors go to the login page, which
// sends them back here afterwards. The API enforces auth too; this is about not showing a
// broken dashboard.
export default function RequireAdmin({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
    return children;
}
