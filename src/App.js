import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AllModels from './pages/AllModels';
import ModelRouter from './data/ModelRouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Services from './pages/Services';
import Experience from './pages/Experience';
import Configurator from './pages/Configurator';

function App() {
  return (
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
