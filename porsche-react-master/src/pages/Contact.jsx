import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { carThemes } from '../data/carThemes';
import showroom from "../assets/home/showroom..jpeg";
import { useNavigate } from 'react-router-dom';

const Contact = () => {
    const selectedTheme = carThemes.home;
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        inquiryType: '',
        modelInterest: '',
        preferredContactMethod: '',
        preferredContactTime: '',
        message: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [animateElements, setAnimateElements] = useState(false);

    // Animation effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimateElements(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleBack = () => {
        // Simply navigate to home page instead of using browser history
        navigate('/');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    //Add after handleBack function
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.inquiryType) newErrors.inquiryType = 'Please select an inquiry type';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('http://localhost:5000/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await response.json();
                setSubmitStatus('success');
                // Reset form on success
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    inquiryType: '',
                    modelInterest: '',
                    preferredContactMethod: '',
                    preferredContactTime: '',
                    message: '',
                });
                setTimeout(() => setSubmitStatus(null), 5000); // clear success message after 5 seconds
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar theme={selectedTheme} />

            <div className="relative h-96 overflow-hidden">
                <img
                    src={showroom}
                    alt="Porsche Showroom"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-8">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-white hover:text-red-500 transition-colors mb-8"
                            type="button"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span>Back</span>
                        </button>
                        <h1 className="text-6xl font-light mb-4 animate-fade-in">Contact Us</h1>
                        <p className="text-xl text-gray-300 animate-fade-in-delay">Ready to begin your Porsche journey?</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-16">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div className={`space-y-8 animate-float-up ${animateElements ? 'animate' : ''}`}>
                        <h2 className="text-4xl font-light">Get in Touch</h2>
                        <div className="space-y-6">
                            <div className={`flex items-center gap-4 animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}>
                                <Phone className="w-6 h-6 text-red-500" />
                                <div>
                                    <div className="font-medium">Sales Hotline</div>
                                    <div className="text-gray-400">+1 (800) PORSCHE</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}>
                                <Mail className="w-6 h-6 text-red-500" />
                                <div>
                                    <div className="font-medium">Email</div>
                                    <div className="text-gray-400">info@porsche-usa.com</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}>
                                <MapPin className="w-6 h-6 text-red-500" />
                                <div>
                                    <div className="font-medium">Visit Our Showroom</div>
                                    <div className="text-gray-400">Find your nearest Porsche Center</div>
                                </div>
                            </div>
                        </div>

                        <div className={`pt-8 animate-float-up-delay-4 ${animateElements ? 'animate' : ''}`}>
                            <h3 className="text-2xl font-light mb-6">Schedule a Test Drive</h3>
                            <p className="text-gray-300 mb-6">
                                Experience the thrill of Porsche performance firsthand. Book your personalized test drive today.
                            </p>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transition-colors"
                                type="button"
                            >
                                Book Test Drive
                            </button>
                        </div>
                    </div>

                    <div className={`bg-gray-900 rounded-lg p-8 animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}>
                        <h3 className="text-2xl font-light mb-6">Send us a Message</h3>

                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-lg">
                                <p className="text-green-300">Thank you! Your message has been sent successfully.</p>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg">
                                <p className="text-red-300">Oops! Something went wrong. Please try again.</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            {/* personal information */}
                            <div className={`grid md:grid-cols-2 gap-4 animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}>
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                        className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors ${errors.firstName ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                    />
                                    {errors.firstName && (
                                        <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                        className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors ${errors.lastName ? 'border-red-500' : 'border-gray-700'
                                            }`}
                                    />
                                    {errors.lastName && (
                                        <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                                    )}
                                </div>

                            </div>

                            {/* Contact Information */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"
                                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type='tel'
                                    id='phone'
                                    name='phone'
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder='Enter your phone number'
                                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                />
                                {errors.phone && (
                                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            {/* Inquiry Details */}
                            <div>
                                <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-300 mb-2">
                                    Inquiry Type *
                                </label>
                                <select
                                    id="inquiryType"
                                    name="inquiryType"
                                    value={formData.inquiryType}
                                    onChange={handleInputChange}
                                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors ${errors.inquiryType ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                >
                                    <option value="">Select Inquiry Type</option>
                                    <option value="Sales">Sales</option>
                                    <option value="Service">Service</option>
                                    <option value="Test_Drive">Test Drive</option>
                                    <option value="Parts">Parts</option>
                                    <option value="Financing">Financing</option>
                                    <option value="General">General</option>
                                </select>
                                {errors.inquiryType && (
                                    <p className="text-red-400 text-sm mt-1">{errors.inquiryType}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="modelInterest" className="block text-sm font-medium text-gray-300 mb-2">
                                    Model Interest
                                </label>
                                                                 <select
                                     id="modelInterest"
                                     name="modelInterest"
                                     value={formData.modelInterest}
                                     onChange={handleInputChange}
                                     className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                                 >
                                     <option value="">Select Model</option>
                                     <option value="911">911</option>
                                     <option value="718_Cayman">718 Cayman</option>
                                     <option value="718_Boxster">718 Boxster</option>
                                     <option value="Cayenne">Cayenne</option>
                                     <option value="Macan">Macan</option>
                                     <option value="Panamera">Panamera</option>
                                     <option value="Taycan">Taycan</option>
                                     <option value="CarreraGT">Carrera GT</option>
                                     <option value="Cayman_GT4RS">Cayman GT4 RS</option>
                                     <option value="GT2RS_911">911 GT2 RS</option>
                                     <option value="GT3RS">911 GT3 RS</option>
                                     <option value="Spyder_918">918 Spyder</option>
                                     <option value="TurboS_911">911 Turbo S</option>
                                     <option value="Other">Other</option>
                                 </select>
                            </div>

                            {/* Communication Preferences */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-300 mb-2">
                                        Preferred Contact Method
                                    </label>
                                    <select
                                        id="preferredContactMethod"
                                        name="preferredContactMethod"
                                        value={formData.preferredContactMethod}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                                    >
                                        <option value="">Select Method</option>
                                        <option value="Email">Email</option>
                                        <option value="Phone">Phone</option>
                                        <option value="Either">Either</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="preferredContactTime" className="block text-sm font-medium text-gray-300 mb-2">
                                        Preferred Contact Time
                                    </label>
                                    <select
                                        id="preferredContactTime"
                                        name="preferredContactTime"
                                        value={formData.preferredContactTime}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors"
                                    >
                                        <option value="">Select Time</option>
                                        <option value="Morning">Morning</option>
                                        <option value="Afternoon">Afternoon</option>
                                        <option value="Evening">Evening</option>
                                        <option value="Anytime">Anytime</option>
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Your Message"
                                    rows="4"
                                    className={`w-full bg-gray-800 border rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none transition-colors resize-none ${errors.message ? 'border-red-500' : 'border-gray-700'
                                        }`}
                                />
                                {errors.message && (
                                    <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-lg transition-colors ${isSubmitting
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                    } text-white`}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>



            <style>{`
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