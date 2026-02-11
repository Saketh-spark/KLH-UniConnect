import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, AlertCircle } from 'lucide-react';

const FacultyPlacementAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState('readiness');

  // Placement Readiness Distribution
  const readinessData = [
    { name: 'Excellent (90+)', value: 45, color: '#10b981' },
    { name: 'Good (75-89)', value: 78, color: '#3b82f6' },
    { name: 'Average (60-74)', value: 52, color: '#f59e0b' },
    { name: 'Below Average (<60)', value: 25, color: '#ef4444' }
  ];

  // Mock vs Real Interview Performance
  const performanceData = [
    { name: 'Coding', mock: 7.8, real: 7.2 },
    { name: 'Communication', mock: 8.2, real: 7.9 },
    { name: 'Technical Depth', mock: 7.5, real: 7.0 },
    { name: 'Problem Solving', mock: 8.1, real: 7.8 },
    { name: 'Confidence', mock: 7.9, real: 7.4 }
  ];

  // Resume Score vs Selection Rate
  const scoreVsSelectionData = [
    { resumeScore: 8, selectionRate: 85 },
    { resumeScore: 7.5, selectionRate: 72 },
    { resumeScore: 7, selectionRate: 58 },
    { resumeScore: 6.5, selectionRate: 42 },
    { resumeScore: 6, selectionRate: 28 },
    { resumeScore: 5.5, selectionRate: 15 }
  ];

  // Company-wise Placements
  const companyPlacementsData = [
    { name: 'Google', placements: 12, salary: '18 LPA' },
    { name: 'Microsoft', placements: 10, salary: '16 LPA' },
    { name: 'Amazon', placements: 9, salary: '15 LPA' },
    { name: 'TCS', placements: 15, salary: '8 LPA' },
    { name: 'Infosys', placements: 8, salary: '7 LPA' }
  ];

  // Student Readiness Trend
  const readinessTrendData = [
    { month: 'Aug', readiness: 45, students: 180 },
    { month: 'Sep', readiness: 52, students: 185 },
    { month: 'Oct', readiness: 61, students: 188 },
    { month: 'Nov', readiness: 68, students: 190 },
    { month: 'Dec', readiness: 72.5, students: 192 }
  ];

  // Branch-wise Statistics
  const branchStatsData = [
    { branch: 'CSE', placed: 140, total: 180, percentage: 77.8 },
    { branch: 'ECE', placed: 56, total: 84, percentage: 66.7 },
    { branch: 'Mechanical', placed: 44, total: 76, percentage: 57.9 },
    { branch: 'Civil', placed: 30, total: 70, percentage: 42.9 }
  ];

  const handleDownloadReport = () => {
    alert('Report download functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-600">Avg Readiness Score</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">72.5%</p>
          <p className="mt-1 text-xs text-green-600">↑ +5.2% from last month</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-600">Placement Rate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">45</p>
          <p className="mt-1 text-xs text-slate-600">Students Placed</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-600">Avg Salary</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">11.2</p>
          <p className="mt-1 text-xs text-slate-600">LPA (across offers)</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-600">Mock Success Rate</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">82%</p>
          <p className="mt-1 text-xs text-slate-600">Score > 7/10</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Placement Readiness Distribution */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">Placement Readiness Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={readinessData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {readinessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} students`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {readinessData.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.name}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock vs Real Interview Performance */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">Mock vs Real Interview Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="mock" fill="#3b82f6" name="Mock Avg" radius={[8, 8, 0, 0]} />
              <Bar dataKey="real" fill="#ef4444" name="Real Avg" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 rounded-lg bg-orange-50 border border-orange-200 p-3">
            <p className="text-xs font-semibold text-orange-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Students perform 5-7% better in mock interviews. Extra practice recommended.
            </p>
          </div>
        </div>

        {/* Resume Score vs Selection Rate */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">Resume Score vs Selection Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreVsSelectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="resumeScore" label={{ value: 'Resume Score', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Selection Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Line type="monotone" dataKey="selectionRate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs font-semibold text-blue-900">
              Strong correlation: Each 0.5 point increase in resume score = ~15% higher selection rate
            </p>
          </div>
        </div>

        {/* Student Readiness Trend */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-slate-900">Student Readiness Trend (5 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readinessTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Readiness (%)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Students', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="readiness" stroke="#3b82f6" strokeWidth={2} name="Avg Readiness" />
              <Line yAxisId="right" type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} name="Total Students" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch-wise Analytics */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-slate-900">Branch-wise Placement Statistics</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Branch</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Placed</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Total</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Placement Rate</th>
              </tr>
            </thead>
            <tbody>
              {branchStatsData.map((branch, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{branch.branch}</td>
                  <td className="px-4 py-3 text-slate-700">{branch.placed}</td>
                  <td className="px-4 py-3 text-slate-700">{branch.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${branch.percentage}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900">{branch.percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company-wise Placements */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-slate-900">Company-wise Placements</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={companyPlacementsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="placements" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Company</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Placements</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Avg Salary</th>
              </tr>
            </thead>
            <tbody>
              {companyPlacementsData.map((company, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{company.name}</td>
                  <td className="px-4 py-3 text-slate-700">{company.placements}</td>
                  <td className="px-4 py-3 text-slate-700">{company.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Report */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">Generate Full Analytics Report</h4>
          <p className="text-sm text-slate-600 mt-1">Export detailed placement analytics with all metrics and trends</p>
        </div>
        <button
          onClick={handleDownloadReport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700 whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>
    </div>
  );
};

export default FacultyPlacementAnalytics;
