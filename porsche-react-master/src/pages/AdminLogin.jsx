import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, Car, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [animateElements, setAnimateElements] = useState(false);

    // Animation effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimateElements(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                login(data.token, formData.email);
                navigate('/admin/dashboard');
            } else {
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            {/* Back Button */}
            <button 
                onClick={handleBackToHome}
                className={`absolute top-6 left-6 flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md animate-float-up ${animateElements ? 'animate' : ''}`}
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
            </button>

            <div className="w-full max-w-md">
                <div className={`text-center mb-8 animate-float-up ${animateElements ? 'animate' : ''}`}>
                    <div className="flex items-center justify-center mb-6">
                        <div className="h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                            <Car className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Porsche Admin</h1>
                    <p className="text-slate-600">Access your dashboard</p>
                </div>

                <Card className={`bg-white shadow-xl border-0 animate-login-form ${animateElements ? 'animate' : ''}`}>
                    <CardHeader className="space-y-1 pb-6">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl text-slate-900">Sign in</CardTitle>
                                <CardDescription className="text-slate-600">
                                    Enter your credentials to access the admin dashboard
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className={`space-y-2 animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}>
                                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@porsche.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className={`space-y-2 animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}>
                                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="pl-10 pr-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            
                            {error && (
                                <div className={`p-4 bg-red-50 border border-red-200 rounded-lg animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}
                            
                            <Button 
                                type="submit" 
                                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </form>
                        
                        <div className={`mt-8 pt-6 border-t border-slate-200 animate-float-up-delay-4 ${animateElements ? 'animate' : ''}`}>
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-xs text-center text-slate-600 mb-2 font-medium">Demo Credentials</p>
                                <div className="text-xs text-center text-slate-500 space-y-1">
                                    <p>Email: admin@porsche.com</p>
                                    <p>Password: admin123</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
