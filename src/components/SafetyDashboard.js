import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Phone, FileText, Users, TrendingUp, ChevronRight, Loader, Settings } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';
import SafetyResources from './SafetyResources';
import EmergencyContacts from './EmergencyContacts';
import ActiveAlerts from './ActiveAlerts';
import SafetyGuides from './SafetyGuides';
import SafetyTips from './SafetyTips';
import IncidentReports from './IncidentReports';
import CounselingRequests from './CounselingRequests';
import SafetySettings from './SafetySettings';

const SafetyDashboard = ({ onBack, facultyId }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Sync every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await safetyAPI.getDashboard();
      setDashboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Safety Resources',
      value: dashboard?.totalResources || 0,
      active: dashboard?.activeResources || 0,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Emergency Contacts',
      value: dashboard?.emergencyContacts || 0,
      icon: Phone,
      color: 'bg-red-100 text-red-600'
    },
    {
      label: 'Active Alerts',
      value: dashboard?.activeAlerts || 0,
      icon: AlertCircle,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      label: 'Pending Reports',
      value: dashboard?.pendingReports || 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700 mb-4">
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-blue-200 text-sky-600">
              <AlertCircle size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Safety Center</h1>
              <p className="mt-1 text-lg text-slate-600">Manage campus safety resources and alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`rounded-[16px] border border-slate-200 ${stat.color} p-6 shadow-sm hover:shadow-md transition`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                      {stat.active !== undefined && (
                        <p className="mt-1 text-xs text-slate-500">{stat.active} active</p>
                      )}
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
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'resources', label: 'Resources' },
              { id: 'contacts', label: 'Contacts' },
              { id: 'alerts', label: 'Alerts' },
              { id: 'guides', label: 'Guides' },
              { id: 'tips', label: 'Tips' },
              { id: 'reports', label: 'Reports' },
              { id: 'counseling', label: 'Counseling' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-sky-600 text-sky-600'
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
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === 'overview' && (
          <div>
            {/* Quick Action Buttons */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <button className="flex items-center gap-3 rounded-[16px] border-2 border-sky-600 bg-white px-6 py-4 text-sm font-semibold text-sky-600 transition hover:bg-sky-50">
                <Plus size={20} />
                Add Resource
              </button>
              <button className="flex items-center gap-3 rounded-[16px] border-2 border-red-600 bg-white px-6 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                <Plus size={20} />
                Add Emergency Contact
              </button>
              <button className="flex items-center gap-3 rounded-[16px] border-2 border-yellow-600 bg-white px-6 py-4 text-sm font-semibold text-yellow-600 transition hover:bg-yellow-50">
                <Plus size={20} />
                Create Alert
              </button>
            </div>

            {/* Recent Activity */}
            <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Alerts</h2>
              {dashboard?.recentAlerts && dashboard.recentAlerts.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recentAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`flex items-start gap-4 rounded-lg border-l-4 p-4 bg-slate-50`}
                         style={{ borderLeftColor: alert.color === 'red' ? '#ef4444' : alert.color === 'yellow' ? '#eab308' : '#0ea5e9' }}>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{alert.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                        <p className="mt-2 text-xs text-slate-500">{alert.location || 'Campus-wide'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        alert.severity === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No recent alerts</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && <SafetyResources facultyId={facultyId} />}
        {activeTab === 'contacts' && <EmergencyContacts facultyId={facultyId} />}
        {activeTab === 'alerts' && <ActiveAlerts facultyId={facultyId} />}
        {activeTab === 'guides' && <SafetyGuides facultyId={facultyId} />}
        {activeTab === 'tips' && <SafetyTips facultyId={facultyId} />}
        {activeTab === 'reports' && <IncidentReports facultyId={facultyId} />}
        {activeTab === 'counseling' && <CounselingRequests facultyId={facultyId} />}
        {activeTab === 'settings' && <SafetySettings facultyId={facultyId} />}
      </main>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 rounded-[12px] bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default SafetyDashboard;
