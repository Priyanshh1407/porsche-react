import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = ({ name,fullName,theme }) => {
  return (
    <footer className={`${theme.footerBg} text-white`}>
      {/* Gradient accent line */}
      <div className={`w-full h-1 bg-gradient-to-r ${theme.gradient}`}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className={`text-2xl lg:text-3xl font-light mb-4 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                {fullName}
              </h2>
              <p className={`${theme.footerText} text-sm lg:text-base leading-relaxed max-w-md`}>
                Experience the ultimate track-focused sports car. The <span className={`${theme.footerHeading} font-medium`}>{name}</span> delivers uncompromising performance with racing-inspired technology and aerodynamics.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 ${theme.footerText} ${theme.footerHover} transition-colors group`}>
                <Phone className={`w-4 h-4 flex-shrink-0 group-${theme.footerHover}`} />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className={`flex items-center space-x-3 ${theme.footerText} ${theme.footerHover} transition-colors group`}>
                <Mail className={`w-4 h-4 flex-shrink-0 group-${theme.footerHover}`} />
                <span className="text-sm">info@porsche-gt3rs.com</span>
              </div>
              <div className={`flex items-center space-x-3 ${theme.footerText} ${theme.footerHover} transition-colors group`}>
                <MapPin className={`w-4 h-4 flex-shrink-0 group-${theme.footerHover}`} />
                <span className="text-sm">Stuttgart, Germany</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-medium mb-6 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
              Vehicle Features
            </h3>
            <ul className="space-y-3">
              {[
                'Aerodynamics',
                'Engine Performance',
                'Chassis System',
                'Braking System',
                'PTV Plus',
                'Rear-axle Steering'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className={`${theme.footerText} ${theme.footerHover} text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className={`text-lg font-medium mb-6 bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
              Support
            </h3>
            <ul className="space-y-3">
              {[
                'Documentation',
                'Technical Support',
                'Service Centers',
                'Warranty',
                'Parts & Accessories',
                'Contact Us'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className={`${theme.footerText} ${theme.footerHover} text-sm transition-colors duration-300 hover:translate-x-1 transform inline-block`}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-slate-700/50">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className={`${theme.footerText} text-sm mr-2`}>Follow us:</span>
              {[
                { icon: Facebook, href: 'https://www.facebook.com/porsche' },
                { icon: Twitter, href: 'https://x.com/Porsche?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor' },
                { icon: Instagram, href: 'https://www.instagram.com/porsche' },
                { icon: Youtube, href: 'https://www.youtube.com/porsche' }
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  className={`p-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-yellow-400/10 hover:border-yellow-400/50 transition-all duration-300 group`}
                >
                  <Icon className={`w-4 h-4 ${theme.footerText} group-${theme.footerHover} transition-colors`} />
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg px-4 py-2 backdrop-blur-sm focus-within:border-yellow-400/50 transition-colors">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`bg-transparent text-white placeholder-${theme.footerText} text-sm focus:outline-none w-48`}
                />
              </div>
              <button className={`bg-gradient-to-r ${theme.gradient} hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-medium px-6 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105`}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-slate-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className={`${theme.footerText} text-xs lg:text-sm`}>
              © 2024 <span className={`${theme.footerHeading} font-medium`}>{fullName}</span>. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className={`${theme.footerText} ${theme.text} text-xs lg:text-sm transition-colors`}>
                Privacy Policy
              </a>
              <a href="#" className={`${theme.footerText} ${theme.text} text-xs lg:text-sm transition-colors`}>
                Terms of Service
              </a>
              <a href="#" className={`${theme.footerText} ${theme.text} text-xs lg:text-sm transition-colors`}>
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;