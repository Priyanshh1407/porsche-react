import { useState, useEffect } from 'react';
import { 
  Car, Users, BarChart, Shield, ArrowRight, Search, Filter, 
  Mail, Phone, Calendar, MapPin, Eye, Edit, Trash2, Download,
  Settings, Bell, User, TrendingUp, TrendingDown, Plus, 
  CheckCircle, Clock, AlertCircle, XCircle, ArrowLeft
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import adminBg from '../assets/home/adminBG.jpg';

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#0284c7', '#7c3aed', '#db2777'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ totalContacts: 0, newContacts: 0, contactedLeads: 0, qualifiedLeads: 0, closedLeads: 0 });
  const [analytics, setAnalytics] = useState({ trends: [], popularModels: [], conversions: { total: 0, conversions: {}, conversionRate: '0', contactedRate: '0' }, peakHours: [] });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoRefresh: true,
    emailTemplate: 'Thank you for your interest in Porsche. We will contact you within 24 hours.'
  });
  const [showContactDetails, setShowContactDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [animateElements, setAnimateElements] = useState(false);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateElements(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Verify existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [contactsRes, statsRes, analyticsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/contacts', { headers }),
        fetch('http://localhost:5000/api/admin/stats', { headers }),
        fetch('http://localhost:5000/api/admin/analytics', { headers })
      ]);
      
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(data.data);
      } else if (contactsRes.status === 401) {
        handleLogout();
      }
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          totalContacts: data.data.overview?.total || 0,
          newContacts: data.data.overview?.newContacts || 0,
          contactedLeads: data.data.overview?.contactedLeads || 0,
          qualifiedLeads: data.data.overview?.qualifiedLeads || 0,
          closedLeads: data.data.overview?.closedLeads || 0
        });
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to fetch dashboard data');
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        setActiveTab('dashboard');
        showToast('Successfully logged into Porsche Admin Dashboard');
        fetchData();
      } else {
        showToast(data.message || 'Invalid credentials');
      }
    } catch (err) {
      showToast('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    showToast('Successfully logged out');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || 'new';
    const configs = {
      new: { bg: 'bg-gray-100 text-gray-800', icon: <Clock className="h-3 w-3" />, text: 'New' },
      contacted: { bg: 'bg-blue-100 text-blue-800', icon: <Mail className="h-3 w-3" />, text: 'Contacted' },
      qualified: { bg: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" />, text: 'Qualified' },
      closed: { bg: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" />, text: 'Closed' }
    };
    const config = configs[s] || configs.new;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`http://localhost:5000/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
        showToast('Status updated successfully');
      }
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  const deleteContact = async (contactId) => {
    if(!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== contactId));
        showToast('Contact deleted');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to delete contact');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `porsche-contacts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Export successful');
      }
    } catch (err) {
      showToast('Export failed');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
        return (
      <div className="min-h-screen bg-gray-50">
        <button 
          onClick={handleBackToHome}
          className="absolute top-6 left-6 z-20 flex items-center space-x-2 px-4 py-2 text-white hover:text-gray-200 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>

        <div 
          className="relative h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: `url(${adminBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60" />
          
          <div className="relative z-10 max-w-md mx-auto px-4">
            <div className={`text-center mb-8 animate-float-up ${animateElements ? 'animate' : ''}`}>
              <div className="flex items-center justify-center mb-4">
                <Car className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-white">Porsche Admin</h1>
              <p className="text-gray-200 mt-2">Dashboard Login</p>
            </div>

            <div className={`bg-white bg-opacity-10 backdrop-blur-md rounded-lg border border-white border-opacity-20 p-6 animate-login-form ${animateElements ? 'animate' : ''}`}>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className={`space-y-2 animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}>
                  <label className="block text-sm font-medium text-white">Email</label>
                  <input
                    type="email"
                    placeholder="admin@porsche.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div className={`space-y-2 animate-float-up-delay-2 ${animateElements ? 'animate' : ''}`}>
                  <label className="block text-sm font-medium text-white">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                
                <button
                  type="submit"
                  className={`w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 rounded-md hover:from-red-700 hover:to-orange-700 transition duration-200 animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}
                >
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Contact Details Modal */}
      {showContactDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contact Details</h3>
              <button 
                onClick={() => setShowContactDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{showContactDetails.firstName} {showContactDetails.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{showContactDetails.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{showContactDetails.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model Interest</label>
                <p className="text-sm text-gray-900">{showContactDetails.modelInterest}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{showContactDetails.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 animate-float-up ${animateElements ? 'animate' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToHome}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <Car className="h-8 w-8 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900">Porsche Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleLogout} className="flex items-center space-x-2 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                <User className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`mb-8 animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart },
                { id: 'contacts', label: 'Contacts', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`bg-white rounded-lg shadow p-6 animate-card-stagger ${animateElements ? 'animate' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
                  </div>
                  <Users className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className={`bg-white rounded-lg shadow p-6 animate-card-stagger ${animateElements ? 'animate' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New Contacts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.newContacts}</p>
                  </div>
                  <Plus className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className={`bg-white rounded-lg shadow p-6 animate-card-stagger ${animateElements ? 'animate' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Contacted Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.contactedLeads}</p>
                  </div>
                  <Mail className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className={`bg-white rounded-lg shadow p-6 animate-card-stagger ${animateElements ? 'animate' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.qualifiedLeads}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`bg-white rounded-lg shadow p-6 animate-chart ${animateElements ? 'animate' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={`bg-white rounded-lg shadow p-6 animate-chart ${animateElements ? 'animate' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Popularity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.popularModels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model }) => `${model}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="model"
                    >
                      {analytics.popularModels?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow animate-float-up-delay-3 ${animateElements ? 'animate' : ''}`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Contacts</h3>
                  <button onClick={() => setActiveTab('contacts')} className="text-red-600 hover:text-red-700 text-sm font-medium">View All</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.slice(0, 5).map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.modelInterest}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contact.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => setShowContactDetails(contact)} className="text-blue-600 hover:text-blue-900 mr-2"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => updateContactStatus(contact.id, 'contacted')} className="text-green-600 hover:text-green-900"><Edit className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className={`flex flex-col sm:flex-row gap-4 animate-float-up ${animateElements ? 'animate' : ''}`}>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={handleExport} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow overflow-hidden animate-float-up-delay-1 ${animateElements ? 'animate' : ''}`}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model Interest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inquiry Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.modelInterest}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.inquiryType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contact.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => setShowContactDetails(contact)} className="text-blue-600 hover:text-blue-900 mr-2"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => updateContactStatus(contact.id, 'contacted')} className="text-green-600 hover:text-green-900 mr-2"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => deleteContact(contact.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#dc2626" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Popularity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.popularModels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ model }) => `${model}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="model"
                    >
                      {analytics.popularModels?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total Contacts</span><span className="text-sm font-medium text-gray-900">{analytics.conversions?.total || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Contacted Rate</span><span className="text-sm font-medium text-gray-900">{analytics.conversions?.contactedRate || 0}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Conversion Rate</span><span className="text-sm font-medium text-gray-900">{analytics.conversions?.conversionRate || 0}%</span></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Models</h4>
                <div className="space-y-4">
                  {analytics.popularModels?.slice(0,4).map((model, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{model.model}</span>
                      <span className="text-sm font-medium text-gray-900">{model.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive email alerts for new contacts</p>
                  </div>
                  <button onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))} className={`relative inline-flex h-6 w-11 items-center rounded-full ${settings.emailNotifications ? 'bg-red-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
