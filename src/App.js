import './App.css';
import { BrowserRouter,Route,Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import AllModels from './pages/AllModels';
import ModelRouter from './data/ModelRouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />}/>
      <Route path='/models' element={<AllModels />}/>
      <Route path="/models/:modelName" element={<ModelRouter />} />
    </Routes>
   </BrowserRouter>
  );
}

export default App;
