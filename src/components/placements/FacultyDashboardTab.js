import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Briefcase, Building2, Award, CheckCircle, Clock, 
  AlertCircle, BarChart3, Calendar, Bell, Loader2, Target, FileText,
  ChevronRight, XCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyDashboardTab = ({ email }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    eligibleStudents: 0,
    ineligibleStudents: 0,
    activeDrives: 0,
    shortlistingPending: 0,
    offersReleased: 0,
    placedStudents: 0,
    placementPercentage: 0,
    avgCTC: '0 LPA',
    maxCTC: '0 LPA'
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/placements/stats`).catch(() => null),
        fetch(`${API_BASE}/api/placements/activities/recent`).catch(() => null)
      ]);

      if (statsRes?.ok) {
        const data = await statsRes.json();
        setStats(prev => ({
          ...prev,
          ...data,
          placementPercentage: data.totalStudents > 0 
            ? Math.round((data.placedStudents / data.totalStudents) * 100) 
            : 0
        }));
      }
      if (activitiesRes?.ok) setRecentActivities(await activitiesRes.json());

      // Mock pending tasks
      setPendingTasks([
        { id: 1, task: 'Review 12 student profiles', priority: 'high', deadline: 'Today' },
        { id: 2, task: 'Approve 8 resumes pending', priority: 'medium', deadline: 'Tomorrow' },
        { id: 3, task: 'Schedule interviews for TCS', priority: 'high', deadline: 'Today' },
        { id: 4, task: 'Update eligibility criteria', priority: 'low', deadline: 'This week' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      default: return 'text-green-600 bg-green-100';
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
      {/* Summary Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Students</p>
              <p className="mt-1 text-3xl font-bold text-blue-900">{stats.totalStudents || 180}</p>
            </div>
            <Users className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Eligible</p>
              <p className="mt-1 text-3xl font-bold text-green-900">{stats.eligibleStudents || 156}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <p className="mt-2 text-xs text-green-600">
            {stats.ineligibleStudents || 24} ineligible
          </p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Drives</p>
              <p className="mt-1 text-3xl font-bold text-purple-900">{stats.activeDrives || 8}</p>
            </div>
            <Building2 className="h-10 w-10 text-purple-400" />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Pending Reviews</p>
              <p className="mt-1 text-3xl font-bold text-amber-900">{stats.shortlistingPending || 34}</p>
            </div>
            <Clock className="h-10 w-10 text-amber-400" />
          </div>
        </div>

        <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">Offers Released</p>
              <p className="mt-1 text-3xl font-bold text-cyan-900">{stats.offersReleased || 12}</p>
            </div>
            <Award className="h-10 w-10 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Placement Stats Banner */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="text-center">
            <p className="text-emerald-100 text-sm font-medium">Students Placed</p>
            <p className="text-4xl font-bold mt-1">{stats.placedStudents || 45}</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-100 text-sm font-medium">Placement %</p>
            <p className="text-4xl font-bold mt-1">{stats.placementPercentage || 72}%</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-100 text-sm font-medium">Avg CTC</p>
            <p className="text-4xl font-bold mt-1">{stats.avgCTC || '8.5 LPA'}</p>
          </div>
          <div className="text-center">
            <p className="text-emerald-100 text-sm font-medium">Max CTC</p>
            <p className="text-4xl font-bold mt-1">{stats.maxCTC || '24 LPA'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Tasks */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-red-500" />
            Pending Tasks
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">{task.task}</p>
                    <p className="text-xs text-slate-500">Due: {task.deadline}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Quick Actions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">New Drive</p>
                <p className="text-xs text-slate-500">Create placement drive</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Review Resumes</p>
                <p className="text-xs text-slate-500">8 pending approvals</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Shortlist Students</p>
                <p className="text-xs text-slate-500">For active drives</p>
              </div>
            </button>

            <button className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Schedule Interviews</p>
                <p className="text-xs text-slate-500">Manage interview slots</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-amber-500" />
          Recent Activities
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Student Rahul applied to Google', time: '5 min ago', type: 'application' },
            { action: 'Microsoft drive registration opened', time: '1 hour ago', type: 'drive' },
            { action: '15 students shortlisted for TCS', time: '2 hours ago', type: 'shortlist' },
            { action: 'Amazon released 3 offers', time: '3 hours ago', type: 'offer' },
            { action: '5 new resumes submitted for review', time: '4 hours ago', type: 'resume' }
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  activity.type === 'offer' ? 'bg-green-100' :
                  activity.type === 'shortlist' ? 'bg-blue-100' :
                  activity.type === 'drive' ? 'bg-purple-100' : 'bg-slate-100'
                }`}>
                  {activity.type === 'offer' ? <Award className="h-4 w-4 text-green-600" /> :
                   activity.type === 'shortlist' ? <CheckCircle className="h-4 w-4 text-blue-600" /> :
                   activity.type === 'drive' ? <Building2 className="h-4 w-4 text-purple-600" /> :
                   <FileText className="h-4 w-4 text-slate-600" />}
                </div>
                <p className="text-sm text-slate-700">{activity.action}</p>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboardTab;
