import { useState } from "react";
import { Mail, Settings, Zap, Heart } from "lucide-react";
import porscheHero from "../assets/home/configurator.jpg";

const Configurator = () => {
  const [email, setEmail] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setShowToast(true);
      setEmail("");
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const features = [
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Complete Customization",
      description: "Configure every detail of your dream Porsche with precision engineering"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Visualization",
      description: "Experience your changes instantly in photorealistic 3D rendering"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Save Configurations",
      description: "Create, save, and share multiple dream builds with enthusiasts"
    }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-15px) rotate(1deg); }
          66% { transform: translateY(-5px) rotate(-1deg); }
        }

        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 38, 38, 0.3); }
          50% { box-shadow: 0 0 40px rgba(220, 38, 38, 0.6); }
        }

        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-fade-up {
          animation: fade-up 1s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-text-shimmer {
          background: linear-gradient(90deg, #fafafa 25%, #fff 50%, #fafafa 75%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: text-shimmer 3s linear infinite;
        }

        .bg-gradient-hero {
          background: radial-gradient(ellipse at top, #1a1a1a, #0a0a0a);
        }

        .bg-gradient-card {
          background: linear-gradient(145deg, #0f0f0f, #1a1a1a);
          backdrop-filter: blur(20px);
        }

        .bg-gradient-accent {
          background: linear-gradient(135deg, #dc2626, #b91c1c, #dc2626);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .bg-gradient-text {
          background: linear-gradient(135deg, #ffffff, #e5e5e5, #ffffff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .shadow-luxury {
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .shadow-glow {
          box-shadow: 
            0 0 60px rgba(220, 38, 38, 0.4),
            0 32px 64px -12px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .shadow-card {
          box-shadow: 
            0 20px 40px -12px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(220, 38, 38, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .text-porsche-gold {
          color: #fbbf24;
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
        }

        .text-porsche-red {
          color: #dc2626;
          text-shadow: 0 0 20px rgba(220, 38, 38, 0.3);
        }

        .text-subtle {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .bg-porsche-dark {
          background-color: #0f0f0f;
        }

        .border-glow {
          border: 1px solid rgba(220, 38, 38, 0.3);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background: linear-gradient(145deg, #0f0f0f, #1a1a1a);
          color: #fafafa;
          padding: 1.25rem 1.75rem;
          border-radius: 12px;
          border: 1px solid rgba(34, 197, 94, 0.3);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.8),
            0 0 20px rgba(34, 197, 94, 0.2);
          transform: translateX(400px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          font-weight: 500;
          backdrop-filter: blur(20px);
        }

        .toast.show {
          transform: translateX(0);
          opacity: 1;
          animation: slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(220, 38, 38, 0.1);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(220, 38, 38, 0.3);
        }

        .input-glow:focus {
          box-shadow: 
            0 0 0 2px rgba(251, 191, 36, 0.3),
            0 0 20px rgba(251, 191, 36, 0.1);
        }

        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 0 40px rgba(220, 38, 38, 0.5),
            0 20px 40px -12px rgba(0, 0, 0, 0.8);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .brand-text {
          font-weight: 900;
          letter-spacing: 0.1em;
          font-size: clamp(2.5rem, 8vw, 4rem);
        }

        .hero-title {
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 0.9;
          font-size: clamp(3rem, 10vw, 7rem);
        }

        .hero-subtitle {
          font-weight: 400;
          line-height: 1.4;
          font-size: clamp(1.125rem, 3vw, 1.5rem);
        }

        .section-title {
          font-weight: 700;
          letter-spacing: -0.025em;
          font-size: clamp(1.875rem, 5vw, 3rem);
        }

        .feature-title {
          font-weight: 600;
          letter-spacing: -0.01em;
          font-size: 1.25rem;
        }

        .feature-description {
          font-weight: 400;
          line-height: 1.6;
          font-size: 0.95rem;
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-gray-900/80 to-black/90" />
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-accent rounded-full blur-2xl opacity-20 animate-float" />
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-red-600 rounded-full blur-3xl opacity-15 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '4s' }} />

        {/* Toast Notification */}
        <div className={`toast ${showToast ? 'show' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Successfully subscribed! You'll be notified when the configurator launches.
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-6 py-16">
          {/* Enhanced Header */}
          <div className="text-center mb-20 animate-fade-up">
            <div className="flex items-center justify-center mb-8">
              <div className="brand-text animate-text-shimmer">
                PORSCHE
              </div>
            </div>
            <h1 className="hero-title mb-8 text-white text-subtle">
              CONFIGURATOR
            </h1>
            <p className="hero-subtitle text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              Experience the pinnacle of automotive customization technology. 
              <br className="hidden md:block" />
              Where engineering excellence meets limitless personalization.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-card border-glow rounded-full text-sm text-gray-400 font-medium">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Coming Soon • Revolutionary Experience
            </div>
          </div>

          {/* Enhanced Hero Image */}
          <div className="mb-20 flex justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group max-w-5xl">
              <div className="absolute inset-0 bg-gradient-accent rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
              <img
                src={porscheHero}
                alt="Porsche 911 Configurator Preview"
                className="relative w-full h-auto rounded-3xl shadow-luxury group-hover:shadow-glow transition-all duration-700 border border-white/5"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-3xl"></div>
            </div>
          </div>

          {/* Enhanced Features */}
          <div className="mb-20 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="section-title text-center mb-4 text-white text-subtle">What Awaits You</h3>
            <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed">
              Discover the future of automotive personalization with cutting-edge technology 
              that brings your vision to life with unprecedented detail and precision.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card bg-gradient-card rounded-2xl p-8 text-center shadow-card hover:shadow-glow"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="text-porsche-gold mb-6 flex justify-center p-4 bg-yellow-400/10 rounded-2xl w-fit mx-auto">
                    {feature.icon}
                  </div>
                  <h4 className="feature-title mb-4 text-white">{feature.title}</h4>
                  <p className="feature-description text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Email Signup */}
          <div className="bg-gradient-card border-glow rounded-3xl p-10 max-w-lg mx-auto shadow-card animate-fade-up" style={{ animationDelay: '0.8s' }}>
            <div className="text-center mb-8">
              <div className="bg-red-600/10 rounded-2xl p-4 w-fit mx-auto mb-6">
                <Mail className="w-12 h-12 text-porsche-red" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-white text-subtle">Stay Connected</h3>
              <p className="text-gray-400 leading-relaxed">Be among the first to experience the revolutionary Porsche configurator when it launches</p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-black/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none input-glow transition-all duration-300 font-medium backdrop-blur-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit(e)}
                />
              </div>
              <button
                onClick={handleEmailSubmit}
                className="btn-primary w-full h-14 px-8 text-lg bg-gradient-accent text-white rounded-xl shadow-luxury font-semibold"
              >
                Notify Me First
              </button>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-20 animate-fade-up" style={{ animationDelay: '1s' }}>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>
            <p className="text-gray-500 font-medium">
              © 2024 Porsche Configurator • Engineering Excellence Redefined
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Configurator;