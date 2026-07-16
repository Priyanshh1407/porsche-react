import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = ({theme}) => {
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const navigate = useNavigate();

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateElements(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const porscheModels = [
    {
      category: "Sports Cars",
      models: [
        { name: "911", description: "The iconic sports car", route: "/models/911" },
        { name: "718 Boxster", description: "Convertible roadster", route: "/models/718-boxster" },
        { name: "718 Cayman", description: "Mid-engine coupe", route: "/models/718-cayman" }
      ]
    },
    {
      category: "GT Cars",
      models: [
        { name: "911 GT3", description: "Track-focused performance", route: "/models/911-gt3" },
        { name: "911 GT3 RS", description: "Ultimate track weapon", route: "/models/911-gt3-rs" },
        { name: "911 GT2 RS", description: "Most powerful 911", route: "/models/911-gt2-rs" }
      ]
    },
    {
      category: "SUVs",
      models: [
        { name: "Macan", description: "Compact luxury SUV", route: "/models/macan" },
        { name: "Cayenne", description: "Full-size luxury SUV", route: "/models/cayenne" }
      ]
    },
    {
      category: "Electric",
      models: [
        { name: "Taycan", description: "Pure electric performance", route: "/models/taycan" },
        { name: "Taycan Cross Turismo", description: "Electric versatility", route: "/models/taycan-cross-turismo" }
      ]
    },
    {
      category: "Sedans",
      models: [
        { name: "Panamera", description: "Luxury sports sedan", route: "/models/panamera" }
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsModelsOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/10 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className={`flex-shrink-0 animate-float-up ${animateElements ? 'animate' : ''}`}>
              <button 
                onClick={() => handleNavigation('/')}
                className="text-2xl font-bold text-white tracking-wider hover:text-red-400 transition-colors duration-300"
              >
                PORSCHE
              </button>
            </div>

            {/* Desktop Menu */}
            <div className={`hidden lg:flex items-center space-x-8 animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}>
              
              {/* Models Link */}
              <button 
                onClick={() => handleNavigation('/models')}
                className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}
              >
                All Models
              </button>

              {/* Other Nav Items */}
              <button 
                onClick={() => handleNavigation('/configurator')}
                className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}
              >
                Build & Price
              </button>
              <button 
                onClick={() => handleNavigation('/experience')}
                className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}
              >
                Experience
              </button>
              <button 
                onClick={() => handleNavigation('/services')}
                className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}
              >
                Services
              </button>
              <button 
                onClick={() => handleNavigation('/about')}
                className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}
              >
                About
              </button>

              {/* CTA Button */}
              <button 
                onClick={() => handleNavigation('/contact')}
                className={`px-6 py-2 bg-transparent ${theme.navActive} font-semibold ${theme.buttonHover} hover:text-black transition-all duration-300 rounded-lg`}
              >
                Contact
              </button>

              {/* Admin Button */}
              <button 
                onClick={() => handleNavigation('/admin/login')}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 rounded-lg hover:scale-105 animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className={`lg:hidden animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`text-white ${theme.navHover} transition-colors duration-300`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden bg-black/95 backdrop-blur-lg`}>
          <div className="px-6 py-4 space-y-4">
            
            {/* Mobile Models Section */}
            <div className={`animate-float-up ${animateElements ? 'animate' : ''}`}>
              <button 
                onClick={() => setIsModelsOpen(!isModelsOpen)}
                className={`flex items-center justify-between w-full text-white ${theme.navHover} transition-colors duration-300 font-medium py-2`}
              >
                <span>Models</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${
                  isModelsOpen ? 'rotate-180' : ''
                }`} />
              </button>
              
              {isModelsOpen && (
                <div className="mt-4 pl-4 space-y-4">
                  {porscheModels.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="space-y-2">
                      <h4 className={`${theme.text} font-semibold text-sm uppercase tracking-wide`}>
                        {category.category}
                      </h4>
                      {category.models.map((model, modelIndex) => (
                        <button
                          key={modelIndex}
                          onClick={() => handleNavigation(model.route)}
                          className="block text-gray-300 hover:text-white transition-colors duration-200 py-1 text-left w-full"
                        >
                          {model.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Mobile Nav Items */}
            <button 
              onClick={() => handleNavigation('/configurator')}
              className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2 text-left w-full animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}
            >
              Build & Price
            </button>
            <button 
              onClick={() => handleNavigation('/experience')}
              className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2 text-left w-full animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}
            >
              Experience
            </button>
            <button 
              onClick={() => handleNavigation('/services')}
              className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2 text-left w-full animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}
            >
              Services
            </button>
            <button 
              onClick={() => handleNavigation('/about')}
              className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2 text-left w-full`}
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('/contact')}
              className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2 text-left w-full`}
            >
              Contact
            </button>

            {/* Mobile Admin Button */}
            <button 
              onClick={() => handleNavigation('/admin/login')}
              className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-300 rounded-lg"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;