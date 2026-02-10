import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  BookOpen,
  AlertCircle,
  FileText,
  Phone,
  ChevronDown,
  ChevronUp,
  Search as SearchIcon,
  Copy,
  X,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Mail,
  Heart,
  CheckCircle,
  Loader,
  Send
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/safety';

const StudentSafety = ({ onBack = () => {}, studentId = '' }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // API Data States
  const [resources, setResources] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [guides, setGuides] = useState([]);
  const [tips, setTips] = useState([]);

  // Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showGuidesModal, setShowGuidesModal] = useState(false);
  const [readingGuide, setReadingGuide] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    location: '',
    isAnonymous: false,
    type: 'General'
  });

  const [counselingForm, setCounselingForm] = useState({
    sessionType: 'Individual',
    description: '',
    preferredTime: '',
    contactNumber: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all data from API
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Real-time sync every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [resRes, conRes, altRes, guiRes, tipRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/resources`),
        axios.get(`${API_BASE_URL}/emergency-contacts`),
        axios.get(`${API_BASE_URL}/alerts`),
        axios.get(`${API_BASE_URL}/guides`),
        axios.get(`${API_BASE_URL}/tips`)
      ]);

      // Filter only published/visible items for students
      setResources(resRes.data.resources?.filter(r => r.isActive && r.visibleToStudents) || []);
      setContacts(conRes.data.contacts?.filter(c => c.isActive) || []);
      setAlerts(altRes.data.alerts?.filter(a => a.isActive && !isExpired(a.expiryTime)) || []);
      setGuides(guiRes.data.guides?.filter(g => g.isPublished) || []);
      setTips(tipRes.data.tips || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching safety data:', error);
      setLoading(false);
    }
  };

  const isExpired = (expiryTime) => {
    if (!expiryTime) return false;
    return new Date(expiryTime) < new Date();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'Warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/incident-reports`, {
        ...reportForm,
        reportedBy: studentId || 'Anonymous Student'
      });
      setShowReportModal(false);
      setReportForm({ title: '', description: '', location: '', isAnonymous: false, type: 'General' });
      alert('✅ Report submitted successfully! We will review and take action.');
      fetchAllData();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
    setSubmitting(false);
  };

  const handleBookCounseling = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/counseling-sessions`, {
        ...counselingForm,
        studentName: studentId || 'Student',
        bookingStatus: 'Pending'
      });
      setShowBookingModal(false);
      setCounselingForm({ sessionType: 'Individual', description: '', preferredTime: '', contactNumber: '' });
      alert('✅ Counseling request submitted! Faculty will contact you soon to confirm.');
      fetchAllData();
    } catch (error) {
      console.error('Error booking counseling:', error);
      alert('Failed to book counseling session. Please try again.');
    }
    setSubmitting(false);
  };

  const copyToClipboard = (text, label = '') => {
    navigator.clipboard.writeText(text);
    alert(`📋 ${label || 'Text'} copied to clipboard!`);
  };

  const callNumber = (number) => {
    window.location.href = `tel:${number}`;
  };

  const stats = [
    { label: 'Resources', value: resources.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Contacts', value: contacts.length, icon: Phone, color: 'bg-red-100 text-red-600' },
    { label: 'Alerts', value: alerts.length, icon: AlertCircle, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Guides', value: guides.length, icon: BookOpen, color: 'bg-purple-100 text-purple-600' },
    { label: 'Tips', value: tips.length, icon: Heart, color: 'bg-pink-100 text-pink-600' }
  ];

  // Modal Components
  const ReportModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-2xl font-bold">Report an Incident</h2>
          <button onClick={() => setShowReportModal(false)} className="hover:bg-red-700 rounded-lg p-1">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Report Type</label>
            <select 
              value={reportForm.type} 
              onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            >
              <option>General</option>
              <option>Safety Concern</option>
              <option>Accident</option>
              <option>Harassment</option>
              <option>Vandalism</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Incident Title *</label>
            <input 
              type="text" 
              required
              value={reportForm.title}
              onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
              placeholder="Brief title of the incident"
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Description *</label>
            <textarea 
              required
              value={reportForm.description}
              onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
              placeholder="Detailed description of what happened"
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
            <input 
              type="text" 
              value={reportForm.location}
              onChange={(e) => setReportForm({...reportForm, location: e.target.value})}
              placeholder="Where did this happen?"
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-[8px] border border-blue-200">
            <input 
              type="checkbox" 
              id="anonymous"
              checked={reportForm.isAnonymous}
              onChange={(e) => setReportForm({...reportForm, isAnonymous: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm font-semibold text-slate-900">
              Submit this report anonymously
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[8px] bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button 
              type="button"
              onClick={() => setShowReportModal(false)}
              className="flex-1 rounded-[8px] border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const BookingModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-2xl font-bold">Book Counseling Session</h2>
          <button onClick={() => setShowBookingModal(false)} className="hover:bg-purple-700 rounded-lg p-1">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleBookCounseling} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Session Type</label>
            <select 
              value={counselingForm.sessionType}
              onChange={(e) => setCounselingForm({...counselingForm, sessionType: e.target.value})}
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            >
              <option>Individual</option>
              <option>Group</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">What's on your mind? *</label>
            <textarea 
              required
              value={counselingForm.description}
              onChange={(e) => setCounselingForm({...counselingForm, description: e.target.value})}
              placeholder="Describe what you'd like to discuss or what's concerning you"
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Contact Number</label>
            <input 
              type="tel"
              value={counselingForm.contactNumber}
              onChange={(e) => setCounselingForm({...counselingForm, contactNumber: e.target.value})}
              placeholder="Your phone number (optional)"
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Preferred Time</label>
            <input 
              type="datetime-local"
              value={counselingForm.preferredTime}
              onChange={(e) => setCounselingForm({...counselingForm, preferredTime: e.target.value})}
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-[8px] border border-purple-200">
            <p className="text-sm text-slate-600">
              ✅ Your session is completely confidential and free. Counseling is available 24/7 for all students.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-[8px] bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Request Session'}
            </button>
            <button 
              type="button"
              onClick={() => setShowBookingModal(false)}
              className="flex-1 rounded-[8px] border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const GuidesModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-2xl font-bold">Safety Guides</h2>
          <button onClick={() => setShowGuidesModal(false)} className="hover:bg-blue-700 rounded-lg p-1">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {guides.length === 0 ? (
            <p className="text-slate-600">No guides available yet.</p>
          ) : (
            <div className="grid gap-4">
              {guides.map((guide) => (
                <div key={guide.id} className="rounded-[12px] border border-slate-200 bg-white p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-lg">{guide.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                      {guide.category || 'Safety'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{guide.content?.substring(0, 150)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {guide.readTimeMinutes || 5} min read
                    </span>
                    <button 
                      onClick={() => {
                        setReadingGuide(guide);
                        setShowGuidesModal(false);
                      }}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Read Full Guide
                      <ChevronDown size={16} className="rotate-[-90deg]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const GuideReaderModal = ({ guide }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-[20px]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{guide.title}</h2>
              <p className="text-blue-100 text-sm flex items-center gap-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {guide.readTimeMinutes || 5} min read</span>
                <span>•</span>
                <span>{guide.category || 'Safety Guide'}</span>
              </p>
            </div>
            <button onClick={() => setReadingGuide(null)} className="text-white hover:text-blue-100">
              <X size={28} />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="prose max-w-none text-slate-700 leading-relaxed">
            {guide.content}
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-[12px] border border-blue-200">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle size={20} className="text-blue-600" />
              Need More Help?
            </h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => {
                  setReadingGuide(null);
                  setShowReportModal(true);
                }}
                className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Report Issue
              </button>
              <button 
                onClick={() => {
                  setReadingGuide(null);
                  setShowBookingModal(true);
                }}
                className="rounded-full bg-purple-600 px-6 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Book Counseling
              </button>
              <button 
                onClick={() => setReadingGuide(null)}
                className="rounded-full bg-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showReportModal && <ReportModal />}
      {showBookingModal && <BookingModal />}
      {showGuidesModal && <GuidesModal />}
      {readingGuide && <GuideReaderModal guide={readingGuide} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-4 transform transition ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className={`flex items-center gap-4 transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-blue-200 text-blue-600">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Safety Center</h1>
              <p className="mt-1 text-lg text-slate-600">Resources, guides, and support from faculty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-4 md:grid-cols-5">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`${stat.color} rounded-[16px] border border-slate-200 p-6 shadow-sm hover:shadow-md transition transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${100 + idx * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon size={32} className="opacity-20" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'alerts', label: '🚨 Active Alerts' },
              { id: 'contacts', label: '📞 Emergency Contacts' },
              { id: 'resources', label: '📚 Resources' },
              { id: 'guides', label: '📖 Guides' },
              { id: 'tips', label: '💡 Safety Tips' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 rounded-[12px] bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
          >
            <AlertTriangle size={18} />
            Report Incident
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 rounded-[12px] bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700"
          >
            <Phone size={18} />
            Book Counseling
          </button>
          <button
            onClick={() => setShowGuidesModal(true)}
            className="flex items-center gap-2 rounded-[12px] bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <BookOpen size={18} />
            View All Guides
          </button>
        </div>

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Active Safety Alerts</h2>
            {alerts.length === 0 ? (
              <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
                <CheckCircle size={40} className="mx-auto mb-4 text-green-600" />
                <p className="text-slate-600 font-semibold">No active alerts</p>
                <p className="text-sm text-slate-500 mt-2">You're all caught up! Stay safe.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-[16px] border-2 p-6 shadow-sm hover:shadow-md transition ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>
                      <p className="mt-2 text-sm text-slate-700">{alert.description}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                        {alert.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {alert.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="inline-block rounded-full px-4 py-2 text-xs font-bold bg-white">
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Emergency Contacts</h2>
            {contacts.length === 0 ? (
              <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
                <Phone size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 font-semibold">No contacts available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => (
                  <div key={contact.id} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-slate-900 text-lg">{contact.name}</h3>
                      {contact.isPrimary && <span className="text-2xl">🚨</span>}
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{contact.category || 'Support'}</p>
                    <div className="space-y-2">
                      {contact.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-mono text-slate-700">{contact.phone}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => callNumber(contact.phone)}
                              className="rounded-full bg-green-600 p-2 text-white hover:bg-green-700"
                            >
                              <Phone size={16} />
                            </button>
                            <button
                              onClick={() => copyToClipboard(contact.phone, 'Phone')}
                              className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">{contact.email}</span>
                          <button
                            onClick={() => copyToClipboard(contact.email, 'Email')}
                            className="rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Safety Resources</h2>
            {resources.length === 0 ? (
              <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
                <FileText size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 font-semibold">No resources available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {resources.map((resource) => (
                  <div key={resource.id} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{resource.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{resource.description}</p>
                    <div className="space-y-3 text-sm">
                      {resource.phone && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-700 font-mono">{resource.phone}</span>
                          <button
                            onClick={() => callNumber(resource.phone)}
                            className="text-green-600 hover:text-green-700 font-semibold"
                          >
                            Call
                          </button>
                        </div>
                      )}
                      {resource.email && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-slate-700">{resource.email}</span>
                          <button
                            onClick={() => copyToClipboard(resource.email, 'Email')}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                      {resource.availability && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-slate-700"><strong>Hours:</strong> {resource.availability}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Guides Tab */}
        {activeTab === 'guides' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Safety Guides</h2>
            {guides.length === 0 ? (
              <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
                <BookOpen size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 font-semibold">No guides available yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {guides.map((guide) => (
                  <div key={guide.id} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{guide.title}</h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{guide.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {guide.readTimeMinutes || 5} min read
                      </span>
                      <button
                        onClick={() => setReadingGuide(guide)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Safety Tips</h2>
            {tips.length === 0 ? (
              <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
                <Heart size={40} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600 font-semibold">No tips available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tips.slice(0, 10).map((tip) => (
                  <div key={tip.id} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-900">{tip.title}</h3>
                      {tip.isFeatured && <span className="text-2xl">⭐</span>}
                    </div>
                    <p className="text-sm text-slate-600">{tip.content}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{tip.category}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        tip.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        tip.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {tip.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentSafety;
