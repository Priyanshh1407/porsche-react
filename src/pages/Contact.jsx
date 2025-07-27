import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carThemes } from '../data/carThemes';

const Contact = () => {
    const selectedTheme = carThemes.home;

    const handleSendMessage = () => {
        alert('Message sent! We will contact you soon.');
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar theme={selectedTheme} />
            
            <div className="relative h-96 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=600&fit=crop&q=80"
                    alt="Porsche Showroom"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-8">
                        <h1 className="text-6xl font-light mb-4 animate-fade-in">Contact Us</h1>
                        <p className="text-xl text-gray-300 animate-fade-in-delay">Ready to begin your Porsche journey?</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-light">Get in Touch</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Phone className="w-6 h-6 text-red-500" />
                                <div>
                                    <div className="font-medium">Sales Hotline</div>
                                    <div className="text-gray-400">+1 (800) PORSCHE</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-red-500" />
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-gray-400">info@porsche-usa.com</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="w-6 h-6 text-red-500" />
                                <div>
                                    <div className="font-medium">Visit Our Showroom</div>
                                    <div className="text-gray-400">Find your nearest Porsche Center</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <h3 className="text-2xl font-light mb-6">Schedule a Test Drive</h3>
                            <p className="text-gray-300 mb-6">
                                Experience the thrill of Porsche performance firsthand. Book your personalized test drive today.
                            </p>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-colors">
                                Book Test Drive
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-8">
                        <h3 className="text-2xl font-light mb-6">Send us a Message</h3>
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                            />
                            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors">
                                <option>Interested Model</option>
                                <option>911</option>
                                <option>Cayenne</option>
                                <option>Macan</option>
                                <option>Panamera</option>
                                <option>Taycan</option>
                                <option>718</option>
                            </select>
                            <textarea
                                placeholder="Your Message"
                                rows="4"
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                
                .animate-fade-in-delay {
                    animation: fade-in 1s ease-out 0.3s both;
                }
            `}</style>

            <Footer theme={selectedTheme} />
        </div>
    );
};

export default Contact;