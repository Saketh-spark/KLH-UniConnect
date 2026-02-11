import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertCircle, Clock, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyPlacementsOverview = ({ searchTerm }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, companyRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/api/placements/stats`),
        fetch(`${API_BASE}/api/placements/stats/trends`),
        fetch(`${API_BASE}/api/placements/stats/companies`),
        fetch(`${API_BASE}/api/placements/events/upcoming`)
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (trendsRes.ok) setTrends(await trendsRes.json());
      if (companyRes.ok) setCompanyStats(await companyRes.json());
      if (eventsRes.ok) setUpcomingEvents(await eventsRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Placement progress data
  const placementProgressData = [
    { month: 'Jan', applications: 45, interviews: 20, offers: 8, placements: 5 },
    { month: 'Feb', applications: 62, interviews: 28, offers: 12, placements: 9 },
    { month: 'Mar', applications: 85, interviews: 38, offers: 18, placements: 14 },
    { month: 'Apr', applications: 98, interviews: 45, offers: 28, placements: 22 }
  ];

  // Branch-wise placement
  const branchWiseData = [
    { name: 'CSE', placed: 35, total: 45, percentage: 77.8 },
    { name: 'ECE', placed: 28, total: 42, percentage: 66.7 },
    { name: 'Mechanical', placed: 22, total: 38, percentage: 57.9 },
    { name: 'Civil', placed: 15, total: 35, percentage: 42.9 },
  ];

  // Company application heatmap data
  const companyHeatmapData = [
    { company: 'Google', applications: 42, shortlisted: 18, interviews: 12, offers: 5 },
    { company: 'Microsoft', applications: 38, shortlisted: 15, interviews: 10, offers: 4 },
    { company: 'Amazon', applications: 35, shortlisted: 14, interviews: 9, offers: 3 },
    { company: 'TCS', applications: 52, shortlisted: 28, interviews: 15, offers: 8 },
    { company: 'Infosys', applications: 48, shortlisted: 22, interviews: 12, offers: 6 },
  ];

  // At-risk students
  const atRiskStudents = [
    { name: 'Aman Kumar', branch: 'CSE', applications: 2, readinessScore: 45, issue: 'Low readiness score' },
    { name: 'Priya Singh', branch: 'ECE', applications: 1, readinessScore: 52, issue: 'No applications' },
    { name: 'Rajesh Patel', branch: 'Mechanical', applications: 0, readinessScore: 38, issue: 'Incomplete profile' },
    { name: 'Sneha Sharma', branch: 'Civil', applications: 1, readinessScore: 48, issue: 'Low interview score' },
  ];

  // Use upcomingEvents from state (fetched from backend) or fallback to demo data
  const eventsToShow = upcomingEvents.length > 0 ? upcomingEvents : [
    { id: 1, company: 'Google', type: 'Interview', date: '2024-01-08', time: '10:00 AM', status: 'Scheduled' },
    { id: 2, company: 'Microsoft', type: 'Interview', date: '2024-01-09', time: '2:00 PM', status: 'Scheduled' },
    { id: 3, company: 'Amazon', type: 'Test', date: '2024-01-10', time: '11:00 AM', status: 'Scheduled' },
    { id: 4, company: 'TCS', type: 'Application Deadline', date: '2024-01-07', time: '5:00 PM', status: 'Closing Soon' },
  ];

  const pieData = [
    { name: 'Placed', value: 45, fill: '#10b981' },
    { name: 'In Process', value: 78, fill: '#f59e0b' },
    { name: 'Not Applied', value: 57, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {['week', 'month', 'quarter', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Placement Progress Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-slate-900">Placement Progress</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={placementProgressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="interviews" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="offers" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Placement Status Pie Chart */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-slate-900">Placement Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Branch-wise Placement Stats */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-slate-900">Branch-wise Placement</h3>
          <div className="space-y-4">
            {branchWiseData.map((branch, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{branch.name}</p>
                  <p className="text-sm font-bold text-slate-600">{branch.placed}/{branch.total} ({branch.percentage}%)</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                    style={{ width: `${branch.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Company Application Heatmap */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-bold text-slate-900">Company Application Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-900">Company</th>
                <th className="px-4 py-3 text-center font-bold text-slate-900">Applications</th>
                <th className="px-4 py-3 text-center font-bold text-slate-900">Shortlisted</th>
                <th className="px-4 py-3 text-center font-bold text-slate-900">Interviews</th>
                <th className="px-4 py-3 text-center font-bold text-slate-900">Offers</th>
                <th className="px-4 py-3 text-center font-bold text-slate-900">Conversion %</th>
              </tr>
            </thead>
            <tbody>
              {companyHeatmapData.map((item, index) => {
                const conversionRate = ((item.offers / item.applications) * 100).toFixed(1);
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border-t border-slate-200 px-4 py-3 font-semibold text-slate-900">{item.company}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-blue-600 font-bold">{item.applications}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-orange-600 font-bold">{item.shortlisted}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-purple-600 font-bold">{item.interviews}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-green-600 font-bold">{item.offers}</td>
                    <td className="border-t border-slate-200 px-4 py-3 text-center text-slate-900 font-bold">{conversionRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students at Risk */}
        <div className="rounded-lg border-2 border-red-300 bg-red-50 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-red-700">
            <AlertCircle className="h-5 w-5" />
            Students at Risk
          </h3>
          <div className="space-y-3">
            {atRiskStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-white p-3">
                <div>
                  <p className="font-semibold text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-600">{student.branch}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-red-600 uppercase">{student.issue}</p>
                  <p className="text-sm font-bold text-slate-600">Score: {student.readinessScore}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
            <Clock className="h-5 w-5" />
            Upcoming Interviews & Deadlines
          </h3>
          <div className="space-y-3">
            {eventsToShow.map(event => (
              <div key={event.id} className={`flex items-center justify-between rounded-lg border-l-4 p-3 ${
                event.status === 'Closing Soon' ? 'border-l-red-500 bg-red-50' : 'border-l-blue-500 bg-blue-50'
              }`}>
                <div>
                  <p className="font-semibold text-slate-900">{event.company}</p>
                  <p className="text-xs text-slate-600">{event.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{event.date}</p>
                  <p className="text-xs text-slate-600">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyPlacementsOverview;
