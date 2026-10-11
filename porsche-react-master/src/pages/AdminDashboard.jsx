import { useState, useEffect } from 'react';
import {
  Car, Users, BarChart, Search, Mail, Eye, Trash2, Download,
  User, TrendingUp, Plus, CheckCircle, Clock, XCircle, ArrowLeft
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import EmailDeliveryBadge from '../components/EmailDeliveryBadge';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#0284c7', '#7c3aed', '#db2777'];

// The lead pipeline; must match the API's ContactStatus enum (VAL-01).
const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'closed', label: 'Closed' },
];
const PAGE_SIZE = 20;

// Each chart says what period it covers, and says so when there is nothing to draw (an empty
// chart used to look like a broken one).
const PeriodTag = ({ children }) => (
  <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-1">{children}</span>
);
const ChartHeader = ({ title, period, as: Tag = 'h3' }) => (
  <div className="flex items-center justify-between mb-4">
    <Tag className="text-lg font-semibold text-gray-900">{title}</Tag>
    <PeriodTag>{period}</PeriodTag>
  </div>
);
const EmptyChart = ({ children }) => (
  <div className="h-[300px] flex items-center justify-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg">{children}</div>
);
const shortDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // BUG-05: the dashboard card shows the newest 5; the Contacts tab pages through ALL contacts
  // on the server (search/filter used to run in the browser over one page of 10).
  const [recentContacts, setRecentContacts] = useState([]);
  const [contactsPage, setContactsPage] = useState({ items: [], pagination: { current: 1, pages: 1, total: 0, limit: PAGE_SIZE } });
  const [page, setPage] = useState(1);
  const [listVersion, setListVersion] = useState(0); // bump to refetch the current page
  const [stats, setStats] = useState({ totalContacts: 0, newContacts: 0, contactedLeads: 0, qualifiedLeads: 0, closedLeads: 0 });
  const [analytics, setAnalytics] = useState({ trends: [], popularModels: [], conversions: { total: 0, conversions: {}, conversionRate: '0', contactedRate: '0' }, peakHours: [] });
  // 'loading' | 'ready' | 'error': "no enquiries" is only said once the data is really there.
  const [analyticsStatus, setAnalyticsStatus] = useState('loading');
  const hasTrend = analytics.trends?.some((day) => day.count > 0);
  const hasModels = analytics.popularModels?.length > 0;
  
  // ARCH-01: auth comes from AuthContext; <RequireAdmin> only renders this page when logged in.
  const { logout } = useAuth();
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [contactsRes, statsRes, analyticsRes] = await Promise.all([
        apiFetch('/api/admin/contacts?limit=5', { auth: true }),
        apiFetch('/api/admin/stats', { auth: true }),
        apiFetch('/api/admin/analytics', { auth: true })
      ]);

      // A 401 here is handled centrally: apiFetch signals it, AuthContext logs out and
      // <RequireAdmin> redirects to the login page.
      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setRecentContacts(data.data);
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
        setAnalyticsStatus('ready');
      } else {
        setAnalyticsStatus('error');
      }
    } catch (err) {
      console.error(err);
      setAnalyticsStatus((status) => (status === 'loading' ? 'error' : status));
      showToast('Failed to fetch dashboard data');
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Clears the token AND the email (the old logout left the email behind, so AuthContext still
  // thought the admin was logged in).
  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
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

  // Contacts tab: search is debounced, and a new search or filter starts again at page 1.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    if (activeTab !== 'contacts') return;
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (debouncedSearch) params.set('q', debouncedSearch);
    (async () => {
      try {
        const res = await apiFetch(`/api/admin/contacts?${params}`, { auth: true });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Ignore a response that arrives after a newer search/page was requested.
        if (!cancelled) setContactsPage({ items: data.data, pagination: data.pagination });
      } catch (err) {
        if (!cancelled) showToast('Failed to load contacts');
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, page, statusFilter, debouncedSearch, listVersion]);

  const refreshLists = () => {
    fetchData();
    setListVersion((v) => v + 1);
  };

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const res = await apiFetch(`/api/admin/contacts/${contactId}`, {
        method: 'PUT',
        auth: true,
        json: { status: newStatus }
      });
      if (res.ok) {
        refreshLists();
        showToast('Status updated successfully');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.errors?.[0]?.message || data.message || 'Failed to update status');
      }
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  // BUG-07: every pipeline stage is reachable (both edit buttons used to set 'contacted' only,
  // so qualified/closed and the conversion rate could never move off 0).
  const StatusSelect = ({ contact }) => (
    <select
      aria-label={`Status for ${contact.firstName} ${contact.lastName}`}
      value={contact.status}
      onChange={(e) => updateContactStatus(contact.id, e.target.value)}
      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-600"
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );

  const deleteContact = async (contactId) => {
    if(!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      const res = await apiFetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
        auth: true
      });
      if (res.ok) {
        showToast('Contact deleted');
        refreshLists();
      } else {
        showToast('Failed to delete contact');
      }
    } catch (err) {
      showToast('Failed to delete contact');
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiFetch('/api/admin/export', { auth: true });
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
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                <ChartHeader title="Contact Trends" period="Last 30 days" />
                {analyticsStatus !== 'ready' ? <EmptyChart>{analyticsStatus === 'loading' ? 'Loading…' : "Couldn't load analytics"}</EmptyChart> : hasTrend ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={shortDate} formatter={(value) => [value, 'Enquiries']} />
                    <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                ) : <EmptyChart>No enquiries in the last 30 days</EmptyChart>}
              </div>

              <div className={`bg-white rounded-lg shadow p-6 animate-chart ${animateElements ? 'animate' : ''}`}>
                <ChartHeader title="Model Popularity" period="All time" />
                {analyticsStatus !== 'ready' ? <EmptyChart>{analyticsStatus === 'loading' ? 'Loading…' : "Couldn't load analytics"}</EmptyChart> : hasModels ? (
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
                ) : <EmptyChart>No enquiries with a model yet</EmptyChart>}
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
                    {recentContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.modelInterest}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(contact.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setShowContactDetails(contact)} aria-label={`View ${contact.firstName} ${contact.lastName}`} className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                            <StatusSelect contact={contact} />
                          </div>
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
                    {contactsPage.items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                          {debouncedSearch || statusFilter !== 'all' ? 'No contacts match this search.' : 'No contacts yet.'}
                        </td>
                      </tr>
                    )}
                    {contactsPage.items.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                          <div className="text-sm text-gray-500">{contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.modelInterest}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.inquiryType}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            {getStatusBadge(contact.status)}
                            <EmailDeliveryBadge emails={contact.emails} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(contact.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setShowContactDetails(contact)} aria-label={`View ${contact.firstName} ${contact.lastName}`} className="text-blue-600 hover:text-blue-900"><Eye className="h-4 w-4" /></button>
                            <StatusSelect contact={contact} />
                            <button onClick={() => deleteContact(contact.id)} aria-label={`Delete ${contact.firstName} ${contact.lastName}`} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* BUG-05: server-side pagination over every matching contact. */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
                <span>
                  {contactsPage.pagination.total} contact{contactsPage.pagination.total === 1 ? '' : 's'} · page {contactsPage.pagination.current} of {Math.max(contactsPage.pagination.pages, 1)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= contactsPage.pagination.pages}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <ChartHeader title="Contact Trends" period="Last 30 days" />
                {analyticsStatus !== 'ready' ? <EmptyChart>{analyticsStatus === 'loading' ? 'Loading…' : "Couldn't load analytics"}</EmptyChart> : hasTrend ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={analytics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={24} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={shortDate} formatter={(value) => [value, 'Enquiries']} />
                    <Bar dataKey="count" fill="#dc2626" />
                  </RechartsBarChart>
                </ResponsiveContainer>
                ) : <EmptyChart>No enquiries in the last 30 days</EmptyChart>}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <ChartHeader title="Model Popularity" period="All time" />
                {analyticsStatus !== 'ready' ? <EmptyChart>{analyticsStatus === 'loading' ? 'Loading…' : "Couldn't load analytics"}</EmptyChart> : hasModels ? (
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
                ) : <EmptyChart>No enquiries with a model yet</EmptyChart>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <ChartHeader as="h4" title="Conversion Funnel" period="All time" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total Contacts</span><span className="text-sm font-medium text-gray-900">{analytics.conversions?.total || 0}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Contacted Rate</span><span className="text-sm font-medium text-gray-900">{analytics.conversions?.contactedRate || 0}%</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Conversion Rate</span><span className="text-sm font-medium text-gray-900">{analytics.conversions?.conversionRate || 0}%</span></div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <ChartHeader as="h4" title="Top Models" period="All time" />
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

      </div>
    </div>
  );
};

export default AdminDashboard;
