import React, { useState, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

const Navbar = ({theme}) => {
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
        { name: "911", description: "The iconic sports car" },
        { name: "718 Boxster", description: "Convertible roadster" },
        { name: "718 Cayman", description: "Mid-engine coupe" }
      ]
    },
    {
      category: "GT Cars",
      models: [
        { name: "911 GT3", description: "Track-focused performance" },
        { name: "911 GT3 RS", description: "Ultimate track weapon" },
        { name: "911 GT2 RS", description: "Most powerful 911" }
      ]
    },
    {
      category: "SUVs",
      models: [
        { name: "Macan", description: "Compact luxury SUV" },
        { name: "Cayenne", description: "Full-size luxury SUV" }
      ]
    },
    {
      category: "Electric",
      models: [
        { name: "Taycan", description: "Pure electric performance" },
        { name: "Taycan Cross Turismo", description: "Electric versatility" }
      ]
    },
    {
      category: "Sedans",
      models: [
        { name: "Panamera", description: "Luxury sports sedan" }
      ]
    }
  ];

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/10 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="text-2xl font-bold text-white tracking-wider">
                PORSCHE
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              
              {/* Models Dropdown */}
              <a href="/models" className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}>
                All Models
              </a>

              {/* Other Nav Items */}
              <a href="/configurator" className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}>
                Build & Price
              </a>
              <a href="/experience" className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}>
                Experience
              </a>
              <a href="/services" className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}>
                Services
              </a>
              <a href="/about" className={`text-white ${theme.navHover} transition-colors duration-300 font-medium`}>
                About
              </a>

              {/* CTA Button */}
              <a 
                href="/contact" 
                className={`px-6 py-2 bg-transparent ${theme.navActive} font-semibold ${theme.buttonHover} hover:text-black transition-all duration-300 rounded-lg`}
              >
                Contact
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
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
            <div>
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
                        <a
                          key={modelIndex}
                          href={`/models/${model.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="block text-gray-300 hover:text-white transition-colors duration-200 py-1"
                        >
                          {model.name}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other Mobile Nav Items */}
            <a href="/configurator" className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2`}>
              Build & Price
            </a>
            <a href="/experience" className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2`}>
              Experience
            </a>
            <a href="/services" className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2`}>
              Services
            </a>
            <a href="/about" className={`block text-white ${theme.navHover} transition-colors duration-300 font-medium py-2`}>
              About
            </a>
            <a 
              href="/contact" 
              className={`inline-block px-6 py-2 bg-transparent ${theme.navActive} font-semibold hover:bg-yellow-400 hover:text-black transition-all duration-300 rounded-lg mt-4`}
            >
              Contact
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;