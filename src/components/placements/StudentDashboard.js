import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Building2, Calendar, Bell, TrendingUp, 
  Users, Briefcase, AlertCircle, Award, Target, ChevronRight, Loader2,
  FileText, Star
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentDashboard = ({ studentId, email }) => {
  const [loading, setLoading] = useState(true);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [upcomingDrives, setUpcomingDrives] = useState([]);
  const [appliedCompanies, setAppliedCompanies] = useState([]);
  const [applicationStatuses, setApplicationStatuses] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    profileCompletion: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, [studentId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, drivesRes, applicationsRes, offersRes] = await Promise.all([
        fetch(`${API_BASE}/api/placements/stats/student/${studentId}`).catch(() => null),
        fetch(`${API_BASE}/api/placements/drives/upcoming`).catch(() => null),
        fetch(`${API_BASE}/api/placements/applications/student/${studentId}`).catch(() => null),
        fetch(`${API_BASE}/api/placements/offers/student/${studentId}`).catch(() => null)
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        setStats(data);
        setEligibilityStatus(data.isEligible !== false);
      }
      if (drivesRes?.ok) setUpcomingDrives(await drivesRes.json());
      if (applicationsRes?.ok) {
        const apps = await applicationsRes.json();
        setAppliedCompanies(apps);
        setApplicationStatuses(apps.map(a => ({
          company: a.company,
          status: a.status,
          round: a.currentRound || 'Applied'
        })));
      }
      if (offersRes?.ok) setActiveOffers(await offersRes.json());

      // Mock notifications for now
      setNotifications([
        { id: 1, message: 'Google placement drive starting in 2 days', type: 'info', time: '2h ago' },
        { id: 2, message: 'Your application for Microsoft is under review', type: 'success', time: '5h ago' },
        { id: 3, message: 'Complete your profile to apply for Amazon', type: 'warning', time: '1d ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate countdown
  const getCountdown = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Today';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'selected': case 'accepted': return 'text-green-600 bg-green-100';
      case 'shortlisted': case 'interview': return 'text-blue-600 bg-blue-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': case 'applied': return 'text-amber-600 bg-amber-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Eligibility Status Banner */}
      <div className={`rounded-xl p-6 ${eligibilityStatus ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'}`}>
        <div className="flex items-center gap-4">
          {eligibilityStatus ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          <div>
            <h2 className={`text-2xl font-bold ${eligibilityStatus ? 'text-green-800' : 'text-red-800'}`}>
              {eligibilityStatus ? 'You are Eligible for Placements!' : 'Not Eligible for Placements'}
            </h2>
            <p className={`mt-1 ${eligibilityStatus ? 'text-green-600' : 'text-red-600'}`}>
              {eligibilityStatus 
                ? 'Your profile meets all eligibility criteria. Start applying!' 
                : 'Please check your profile and eligibility requirements'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stats.profileCompletion || 85}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${stats.profileCompletion || 85}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Applied</p>
              <p className="mt-1 text-2xl font-bold text-purple-600">{stats.totalApplications || appliedCompanies.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Shortlisted</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">{stats.shortlisted || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Interviews</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{stats.interviews || 0}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <Users className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Offers</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{stats.offers || activeOffers.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Drives */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Drives
            </h3>
            <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3">
            {upcomingDrives.length > 0 ? upcomingDrives.slice(0, 5).map((drive, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{drive.company}</p>
                    <p className="text-sm text-slate-500">{drive.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    {getCountdown(drive.date)}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No upcoming drives scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* Application Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Application Status
            </h3>
            <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3">
            {applicationStatuses.length > 0 ? applicationStatuses.slice(0, 5).map((app, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{app.company}</p>
                    <p className="text-sm text-slate-500">{app.round}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-6 text-slate-500">
                <Briefcase className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No applications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Offers & Notifications */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Offers */}
        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
          <h3 className="text-lg font-bold text-green-900 flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-green-600" />
            Active Offers
          </h3>
          {activeOffers.length > 0 ? (
            <div className="space-y-3">
              {activeOffers.map((offer, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white border border-green-200 shadow-sm">
                  <div>
                    <p className="font-bold text-slate-900">{offer.company}</p>
                    <p className="text-sm text-slate-600">{offer.role} • {offer.ctc}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">
                      Accept
                    </button>
                    <button className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-100 transition">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-green-700">
              <Award className="h-12 w-12 mx-auto mb-2 text-green-300" />
              <p>No active offers yet. Keep applying!</p>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-amber-600" />
            Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                notif.type === 'warning' ? 'bg-amber-50' : notif.type === 'success' ? 'bg-green-50' : 'bg-blue-50'
              }`}>
                <AlertCircle className={`h-5 w-5 mt-0.5 ${
                  notif.type === 'warning' ? 'text-amber-500' : notif.type === 'success' ? 'text-green-500' : 'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{notif.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
