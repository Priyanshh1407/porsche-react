import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AllModels from './pages/AllModels';
import ModelRouter, { ModelDetailsRouter } from './data/ModelRouter';
import Services from './pages/Services';
import Experience from './pages/Experience';
import Configurator from './pages/Configurator';
import AdminLogin from './pages/AdminLogin';
import { AuthProvider } from './context/AuthContext';
import { modelPath } from './data/models';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import RequireAdmin from './components/RequireAdmin';
import NotFound from './pages/NotFound';
import Credits from './pages/Credits';
import ConciergeLauncher from './components/concierge/ConciergeLauncher';

// PERF-02: the dashboard's charting library (recharts) is only downloaded by admins, not every visitor.
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Exported separately so tests can render the real route table inside a MemoryRouter.
export function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/models' element={<AllModels />} />
      <Route path='/services' element={<Services />} />
      <Route path='/experience' element={<Experience />} />
      <Route path='/configurator' element={<Configurator />} />
      <Route path='/credits' element={<Credits />} />
      {/* Every model page and its old URLs resolve through the registry in data/models.js. */}
      <Route path="/models/:modelSlug" element={<ModelRouter />} />
      <Route path="/models/:modelSlug/details" element={<ModelDetailsRouter />} />
      <Route path="/3d-experience" element={<Navigate to={modelPath('911-gt3-rs')} replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={(
          <RequireAdmin>
            <Suspense fallback={<div className="min-h-screen bg-gray-50" role="status" aria-label="Loading dashboard" />}>
              <AdminDashboard />
            </Suspense>
          </RequireAdmin>
        )}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
        <BrowserRouter>
          <RouteErrorBoundary>
            <AppRoutes />
            {/* Phase 11: AI concierge (only on some pages; never on / or the 3D showrooms). */}
            <ConciergeLauncher />
          </RouteErrorBoundary>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
