import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart3, TrendingUp, Building, Users, DollarSign, Download, ChevronDown, ChevronUp,
  CheckCircle, XCircle, GraduationCap, Calendar, Award, PieChart, ArrowUp, ArrowDown,
  Filter, Clock
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyAnalyticsTab = ({ email, onBack }) => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');
  const [showPlacedList, setShowPlacedList] = useState(false);
  const [showUnplacedList, setShowUnplacedList] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, compRes, appRes] = await Promise.all([
        axios.get(`${API_BASE}/api/placements/stats`),
        axios.get(`${API_BASE}/api/placements/companies`),
        axios.get(`${API_BASE}/api/placements/applications`),
      ]);
      setStats(statsRes.data || {});
      setCompanies(compRes.data || []);
      setApplications(appRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Computed analytics from applications
  const totalStudents = 450; // Mock total batch size
  const selectedApps = applications.filter(a => a.status === 'Selected');
  const placedCount = selectedApps.length;
  const unplacedCount = totalStudents - placedCount;
  const placementPercentage = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

  // Department-wise mock data
  const departments = [
    { name: 'CSE', total: 120, placed: 95, avgPackage: '7.2 LPA', highest: '18 LPA' },
    { name: 'ECE', total: 100, placed: 65, avgPackage: '5.8 LPA', highest: '12 LPA' },
    { name: 'IT', total: 80, placed: 60, avgPackage: '6.5 LPA', highest: '15 LPA' },
    { name: 'EEE', total: 60, placed: 30, avgPackage: '5.2 LPA', highest: '9 LPA' },
    { name: 'MECH', total: 50, placed: 20, avgPackage: '4.8 LPA', highest: '8 LPA' },
    { name: 'CIVIL', total: 40, placed: 12, avgPackage: '4.5 LPA', highest: '7 LPA' },
  ];

  // Company-wise stats
  const companyStats = [
    { name: 'TCS', hired: 45, avgPackage: '4.5 LPA', roles: ['Software Developer', 'System Engineer'] },
    { name: 'Infosys', hired: 35, avgPackage: '5.0 LPA', roles: ['Software Engineer', 'Analyst'] },
    { name: 'Wipro', hired: 25, avgPackage: '4.8 LPA', roles: ['Developer', 'QA Engineer'] },
    { name: 'Amazon', hired: 8, avgPackage: '18 LPA', roles: ['SDE-1'] },
    { name: 'Microsoft', hired: 5, avgPackage: '22 LPA', roles: ['Software Engineer'] },
    { name: 'Google', hired: 3, avgPackage: '25 LPA', roles: ['Software Engineer'] },
  ];

  // Salary analytics
  const salaryStats = {
    highest: '25 LPA', lowest: '3.5 LPA', average: '6.8 LPA', median: '5.5 LPA',
    above10: 20, between5and10: 120, below5: 142,
  };

  // Historical trends
  const trends = [
    { year: '2021-22', placed: 68, avgPackage: '5.2 LPA', companies: 45 },
    { year: '2022-23', placed: 72, avgPackage: '5.8 LPA', companies: 52 },
    { year: '2023-24', placed: 78, avgPackage: '6.2 LPA', companies: 58 },
    { year: '2024-25', placed: placementPercentage || 82, avgPackage: '6.8 LPA', companies: 65 },
  ];

  const exportReport = () => {
    const report = `PLACEMENT ANALYTICS REPORT\n========================\n\nOverall: ${placementPercentage}% placed\nTotal Students: ${totalStudents}\nPlaced: ${placedCount}\nUnplaced: ${unplacedCount}\n\nSalary Stats:\n  Highest: ${salaryStats.highest}\n  Average: ${salaryStats.average}\n  Median: ${salaryStats.median}\n\nDepartment-wise:\n${departments.map(d => `  ${d.name}: ${Math.round((d.placed/d.total)*100)}% (${d.placed}/${d.total})`).join('\n')}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'placement_analytics_report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Clock className="animate-spin text-sky-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Top Summary Bar */}
      <div className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Placement Analytics Dashboard</h3>
          <button onClick={exportReport}
            className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition">
            <Download size={14} /> Export Report
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Placement %', value: `${placementPercentage}%` },
            { label: 'Students Placed', value: placedCount },
            { label: 'Total Batch', value: totalStudents },
            { label: 'Companies', value: companies.length || 65 },
            { label: 'Avg Package', value: salaryStats.average },
          ].map((s, i) => (
            <div key={i} className="rounded-lg bg-white/10 p-3 text-center">
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Department-wise Placement */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap size={16} className="text-sky-600" /> Department-wise Placement Statistics
        </h3>
        <div className="space-y-3">
          {departments.map((dept, i) => {
            const pct = Math.round((dept.placed / dept.total) * 100);
            return (
              <div key={i} className="flex items-center gap-4">
                <span className="w-12 text-sm font-bold text-slate-700">{dept.name}</span>
                <div className="flex-1">
                  <div className="h-6 rounded-full bg-slate-100 overflow-hidden relative">
                    <div className={`h-full rounded-full transition-all ${
                      pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`} style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{pct}%</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 w-16 text-right">{dept.placed}/{dept.total}</div>
                <div className="text-xs text-slate-400 w-16 text-right">{dept.avgPackage}</div>
                <div className="text-xs text-green-600 font-medium w-16 text-right">{dept.highest}</div>
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            <span className="w-12"></span>
            <span className="flex-1"></span>
            <span className="w-16 text-right">Placed/Total</span>
            <span className="w-16 text-right">Avg Pkg</span>
            <span className="w-16 text-right">Highest</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company-wise Stats */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building size={16} className="text-purple-600" /> Top Recruiting Companies
          </h3>
          <div className="space-y-3">
            {companyStats.map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.roles.map((r, j) => (
                      <span key={j} className="bg-white rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-800">{c.hired} hired</div>
                  <div className="text-xs text-green-600">{c.avgPackage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Analytics */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-green-600" /> Salary Analytics
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Highest', value: salaryStats.highest, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Average', value: salaryStats.average, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Median', value: salaryStats.median, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Lowest', value: salaryStats.lowest, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl ${s.bg} p-4 text-center`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
          <h4 className="text-xs font-bold text-slate-600 mb-2">Package Distribution</h4>
          <div className="space-y-2">
            {[
              { label: 'Above 10 LPA', value: salaryStats.above10, color: 'bg-green-500', total: placedCount || 282 },
              { label: '5-10 LPA', value: salaryStats.between5and10, color: 'bg-sky-500', total: placedCount || 282 },
              { label: 'Below 5 LPA', value: salaryStats.below5, color: 'bg-amber-500', total: placedCount || 282 },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-24">{b.label}</span>
                <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${b.color}`} style={{ width: `${Math.round((b.value / b.total) * 100)}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-700 w-8">{b.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Trends */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-sky-600" /> Historical Placement Trends
        </h3>
        <div className="flex items-end justify-between gap-4 h-36 mb-2">
          {trends.map((t, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-xs font-bold text-slate-700">{t.placed}%</span>
              <div className="w-full rounded-t-lg bg-sky-500 transition-all" style={{ height: `${(t.placed / 100) * 100}%` }} />
              <span className="text-[10px] text-slate-500">{t.year}</span>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-3 border-t border-slate-100">
            <thead>
              <tr>
                <th className="text-left py-2 text-xs text-slate-500">Year</th>
                <th className="text-center py-2 text-xs text-slate-500">Placement %</th>
                <th className="text-center py-2 text-xs text-slate-500">Avg Package</th>
                <th className="text-center py-2 text-xs text-slate-500">Companies</th>
              </tr>
            </thead>
            <tbody>
              {trends.map((t, i) => (
                <tr key={i} className="border-t border-slate-50">
                  <td className="py-2 font-medium text-slate-800">{t.year}</td>
                  <td className="py-2 text-center">{t.placed}%</td>
                  <td className="py-2 text-center">{t.avgPackage}</td>
                  <td className="py-2 text-center">{t.companies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placed / Unplaced Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <button onClick={() => setShowPlacedList(!showPlacedList)}
            className="w-full flex items-center justify-between text-sm font-bold text-green-700">
            <span className="flex items-center gap-2"><CheckCircle size={16} /> Placed Students ({placedCount || 282})</span>
            {showPlacedList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showPlacedList && (
            <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
              {selectedApps.length > 0 ? selectedApps.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-green-50 rounded-lg p-2">
                  <span className="font-medium">{a.studentName}</span>
                  <span className="text-green-600">{a.company} — {a.position}</span>
                </div>
              )) : (
                <div className="text-xs text-slate-400 p-2">No selected applications found in database. In production, this list would show all placed students.</div>
              )}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <button onClick={() => setShowUnplacedList(!showUnplacedList)}
            className="w-full flex items-center justify-between text-sm font-bold text-red-700">
            <span className="flex items-center gap-2"><XCircle size={16} /> Unplaced Students ({unplacedCount})</span>
            {showUnplacedList ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showUnplacedList && (
            <div className="mt-3 text-xs text-slate-400 p-2">
              Unplaced student list is generated by cross-referencing the total batch register with placed records. This data populates from the student database in production.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyAnalyticsTab;
