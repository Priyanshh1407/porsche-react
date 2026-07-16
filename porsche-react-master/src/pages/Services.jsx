import React, { useState, useEffect } from 'react';
import { Menu, User, ArrowRight } from 'lucide-react';
import { carThemes } from '../data/carThemes';

const Services = () => {
  const [activeSection, setActiveSection] = useState('philosophy');
  const selectedTheme = carThemes.home;

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 120; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['philosophy', 'offering', 'documents'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-transparent absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Menu className="w-6 h-6" />
            <span className="text-sm font-medium">Menu</span>
          </div>
          <div className="text-white text-2xl font-bold tracking-wider">
            PORSCHE
          </div>
          <div className="text-white">
            <User className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('https://picsum.photos/1200/800?random=1')`
          }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-1/2 pl-16">
              <h1 className="text-white text-6xl font-light mb-4">
                Porsche Service
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Fixed Navigation Tabs */}
      <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button 
              onClick={() => scrollToSection('philosophy')}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'philosophy' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              Our philosophy
            </button>
            <button 
              onClick={() => scrollToSection('offering')}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'offering' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              Service offering
            </button>
            <button 
              onClick={() => scrollToSection('documents')}
              className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'documents' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              Documents
            </button>
          </div>
        </div>
      </nav>

      {/* Philosophy Content */}
      <section id="philosophy" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-5xl font-light text-center mb-16 text-black">
          Our philosophy
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="rounded-lg overflow-hidden">
            <img 
              src="https://picsum.photos/600/400?random=2"
              alt="Porsche Service Center"
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-3xl font-light mb-6 text-black">
              Committed to the crest.
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              The Porsche crest stands for outstanding technical expertise, sports 
              car performance, pride and commitment. For the pride of those who 
              develop and construct Porsche vehicles. For the commitment of our 
              service and maintenance technicians.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h3 className="text-3xl font-light mb-6 text-black">
              The driving force behind our actions.
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              We can look back on a long history in sports car development. We use 
              highly specialised tools and technology from Porsche. We continuously 
              train our employees in the latest knowledge to ensure we maintain 
              your vehicle in accordance with our standards and your expectations.
            </p>
          </div>
          <div className="order-1 lg:order-2 rounded-lg overflow-hidden">
            <img 
              src="https://picsum.photos/600/400?random=3"
              alt="Porsche Technician"
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Service Offering Content */}
      <section id="offering" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-5xl font-light text-center mb-16 text-black">
            Service offering
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Service & Maintenance */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 bg-gray-200 mb-6 rounded-lg overflow-hidden">
                <img 
                  src="https://picsum.photos/400/300?random=4"
                  alt="Service & Maintenance"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-light mb-4 text-black">Service & Maintenance</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  From servicing and maintenance to expert repair, we take complete care of your 
                  Porsche. And through consultation with your Service Advisor in the Direct Dialogue Bay, 
                  we take care of your concerns too.
                </p>
                <button className="flex items-center text-black hover:text-gray-600 transition-colors">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  <span className="font-medium">Read more</span>
                </button>
              </div>
            </div>

            {/* Genuine Parts */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 bg-gray-200 mb-6 rounded-lg overflow-hidden">
                <img 
                  src="https://picsum.photos/400/300?random=5"
                  alt="Genuine Parts, Tyres & Oil"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-light mb-4 text-black">Genuine Parts, Tyres & Oil</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  The perfect collaboration of all components, along with the warranty and vehicle information, 
                  ensures a unique and safe driving experience in a high-performance sports car. 
                  With Porsche Genuine Parts, tyres from selected partners, and the right oil, your vehicle 
                  will perform better for longer, ad maintain its value.
                </p>
                <button className="flex items-center text-black hover:text-gray-600 transition-colors">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  <span className="font-medium">Read more</span>
                </button>
              </div>
            </div>

            {/* Warranty & Vehicle Information */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-64 bg-gray-200 mb-6 rounded-lg overflow-hidden">
                <img 
                  src="https://picsum.photos/400/300?random=6"
                  alt="Warranty & Vehicle Information"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-light mb-4 text-black">Warranty & Vehicle Information</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Every new and Approved Porsche comes with a warranty that you can extend to up to 
                  15 years of peace of mind. Porsche Assistance provides worldwide breakdown 
                  cover (Europe-only for Porsche Approved)
                </p>
                <button className="flex items-center text-black hover:text-gray-600 transition-colors">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  <span className="font-medium">Read more</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Content */}
      <section id="documents" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-5xl font-light text-center mb-16 text-black">
          Documents & historical records
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="rounded-lg overflow-hidden">
            <img 
              src="https://picsum.photos/600/400?random=7"
              alt="Vehicle Documents"
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-3xl font-light mb-6 text-black">
              Vehicle and registration documents
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Using the downloads available here, you can apply for various registration-relevant documents and vehicle documentation and download 
              technical vehicle information.
            </p>
            <button className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-medium">
              To the documents
            </button>
          </div>
        </div>

        {/* Further Information Section */}
        <div className="mb-24">
          <h3 className="text-4xl font-light text-center mb-16 text-black">
            Further information
          </h3>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="rounded-lg overflow-hidden">
              <img 
                src="https://picsum.photos/600/400?random=8"
                alt="Porsche Cars"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
            <div>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Whatever you need to know about your Porsche, we make it easy.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                For example, you can find out more about how our vehicles' exhaust 
                emissions are tested according to the EU WLTP test procedure. We are 
                committed to sustainable efficiency, and we provide full information 
                about Porsche end-of-life vehicle return. Our workshops adhere to the 
                Registration, Evaluation, Authorisation and Restriction of Chemicals 
                (REACH) regulation, and you can find out how it affects any individual 
                Porsche car part. We also provide online Technical Service Information 
                for independent workshops.
              </p>
              <button className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-medium">
                Read more
              </button>
            </div>
          </div>
        </div>

        {/* My Porsche Section */}
        <div className="rounded-lg overflow-hidden bg-black text-white">
          <div className="grid lg:grid-cols-2">
            <div className="h-96 bg-gray-300">
              <img 
                src="https://picsum.photos/600/400?random=9"
                alt="My Porsche App"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-12 flex flex-col justify-center">
              <h3 className="text-4xl font-light mb-6">
                Welcome to My Porsche
              </h3>
              <p className="text-gray-300 mb-4">
                The world of Porsche is your world, and My Porsche is your digital gateway.
              </p>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Wherever you are, you can subscribe, configure and manage 
                your Porsche Connect services, manage your personal data, 
                organize service appointments, and stay up-to-date, informed and in touch. With My Porsche, you can receive service reminders, safety updates – even notifications of 
                Porsche events in your area. My Porsche is also the easy way 
                to stay in contact with your Porsche Centre, anywhere, any 
                time. Accessible via your smartphone, My Porsche makes it 
                even easier to own and enjoy your Porsche.
              </p>
              <button className="bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition-colors font-medium self-start">
                To My Porsche
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="text-2xl font-bold tracking-wider mb-8">
              PORSCHE
            </div>
            <p className="text-gray-400">
              © 2025 Porsche AG. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;