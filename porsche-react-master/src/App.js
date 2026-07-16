import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AllModels from './pages/AllModels';
import ModelRouter from './data/ModelRouter';
import Services from './pages/Services';
import Experience from './pages/Experience';
import Configurator from './pages/Configurator';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import GT3RS_3D from './pages/GT3RS_3D';
import Taycan_3D from './pages/Taycan_3D';
import Cayenne_3D from './pages/Cayenne_3D';
import Turbo_3D from './pages/Turbo_3D';
import GT3RS from './pages/models/GT3RS';
import Spyder_918 from './pages/models/Spyder_918';
import Cayenne from './pages/models/Cayenne';
import Taycan from './pages/models/Taycan';
import TurboS_911 from './pages/models/TurboS_911';

function App() {
  return (
    <AuthProvider>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/models' element={<AllModels />} />
            <Route path='/services' element={<Services />} />
            <Route path='/experience' element={<Experience />} />
            <Route path='/configurator' element={<Configurator />} />
            <Route path="/models/:modelName" element={<ModelRouter />} />
            <Route path="/models/gt3rs/details" element={<GT3RS />} />
            <Route path="/models/918 spyder/details" element={<Spyder_918 />} />
            <Route path="/models/cayenne/details" element={<Cayenne />} />
            <Route path="/models/taycan/details" element={<Taycan />} />
            <Route path="/models/911 turbo s/details" element={<TurboS_911 />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/3d-experience" element={<GT3RS_3D />} />
            <Route path="/models/911 GT3 RS" element={<GT3RS_3D />} />
            <Route path="/models/Taycan" element={<Taycan_3D />} />
            <Route path="/models/Cayenne" element={<Cayenne_3D />} />
            <Route path="/models/911 Turbo S" element={<Turbo_3D />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
