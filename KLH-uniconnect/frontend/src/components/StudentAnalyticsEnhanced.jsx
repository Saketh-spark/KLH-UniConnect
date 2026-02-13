import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts';
import {
  TrendingUp, Target, Award, BookOpen, Clock, Download, AlertCircle,
  Zap, Brain, Users, Briefcase, GraduationCap, Activity, CheckCircle,
  AlertTriangle, ArrowUp, ArrowDown, Eye, Star, Loader
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8085/api/analytics';

export default function StudentAnalyticsEnhanced({ studentId = 'STU001', onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');

  const actualStudentId = studentId || localStorage.getItem('klhStudentId') || localStorage.getItem('studentId') || 'STU001';

  // Fetch all analytics data from backend API
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000);
    return () => clearInterval(interval);
  }, [actualStudentId]);

  const fetchAllData = async () => {
    try {
      const [analyticsRes, skillsRes, goalsRes, reportsRes, feedbackRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/student/${actualStudentId}`),
        axios.get(`${API_BASE_URL}/skills/student/${actualStudentId}`),
        axios.get(`${API_BASE_URL}/goals/student/${actualStudentId}`),
        axios.get(`${API_BASE_URL}/reports/student/${actualStudentId}`),
        axios.get(`${API_BASE_URL}/feedback/student/${actualStudentId}`)
      ]);

      setAnalytics(analyticsRes.data.analytics || analyticsRes.data || null);
      setSkills(skillsRes.data.skills || skillsRes.data || []);
      setGoals(goalsRes.data.goals || goalsRes.data || []);
      setReports(reportsRes.data.reports || reportsRes.data || []);
      setFeedback(feedbackRes.data.feedback || feedbackRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set empty defaults so UI doesn't break
      if (!analytics) setAnalytics({ overallScore: 0, gpa: 0, gpaTrend: [], placementReadinessScore: 0, attendancePercentage: 0, assignmentsCompleted: 0, assignmentsPending: 0, learningHours: { academics: 0, skills: 0, placement: 0, social: 0 }, subjectAttendance: [], monthlyPerformance: [], insights: [] });
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${report.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.type}-${report.month || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Report download not available yet.`);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProficiencyColor = (proficiency) => {
    if (proficiency >= 85) return 'bg-gradient-to-r from-green-400 to-green-600';
    if (proficiency >= 70) return 'bg-gradient-to-r from-blue-400 to-blue-600';
    if (proficiency >= 50) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-r from-red-400 to-red-600';
  };

  const renderOverviewTab = () => {
    if (!analytics) return <div className="text-center py-12 text-slate-500">No analytics data available yet.</div>;
    return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">OVERALL SCORE</p>
              <p className={`text-3xl font-bold ${getScoreColor(analytics.overallScore)}`}>{analytics.overallScore}</p>
              <p className="text-xs text-slate-500 mt-1">out of 100</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">CURRENT GPA</p>
              <p className="text-3xl font-bold text-blue-700">{analytics.gpa}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp size={14} className="text-green-600" />
                <p className="text-xs text-green-600">+5% this month</p>
              </div>
            </div>
            <GraduationCap size={40} className="text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">SKILLS TRACKED</p>
              <p className="text-3xl font-bold text-purple-700">{skills.length}</p>
              <p className="text-xs text-purple-500 mt-1">2 Expert level</p>
            </div>
            <Zap size={40} className="text-purple-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">ACTIVE GOALS</p>
              <p className="text-3xl font-bold text-green-700">{goals.length}</p>
              <p className="text-xs text-green-500 mt-1">On track</p>
            </div>
            <Target size={40} className="text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-semibold">PLACEMENT READY</p>
              <p className={`text-3xl font-bold ${getScoreColor(analytics.placementReadinessScore)}`}>{analytics.placementReadinessScore}%</p>
              <p className="text-xs text-orange-500 mt-1">Excellent</p>
            </div>
            <Briefcase size={40} className="text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain size={24} className="text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">AI-Generated Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(analytics.insights || []).map((insight, idx) => (
            <div key={idx} className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'positive'
                ? 'bg-white border-l-green-500'
                : 'bg-white border-l-yellow-500'
            }`}>
              <p className="text-sm text-slate-700">
                <span className="text-xl mr-2">{insight.icon}</span>
                {insight.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* GPA Trend Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          GPA Trend (Last 5 Months)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.gpaTrend || []}>
            <defs>
              <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[7, 9]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Area
              type="monotone"
              dataKey="gpa"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorGpa)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance by Subject */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            Attendance by Subject
          </h3>
          <div className="space-y-3">
            {(analytics.subjectAttendance || []).map((subject, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{subject.subject}</span>
                  <span className={`text-sm font-bold ${subject.attendance >= subject.target ? 'text-green-600' : 'text-yellow-600'}`}>
                    {subject.attendance}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      subject.attendance >= subject.target
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                    }`}
                    style={{ width: `${subject.attendance}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Hours Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-purple-600" />
            Learning Hours Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Academics', value: analytics.learningHours?.academics || 0, fill: '#3B82F6' },
                  { name: 'Skills', value: analytics.learningHours?.skills || 0, fill: '#8B5CF6' },
                  { name: 'Placement', value: analytics.learningHours?.placement || 0, fill: '#F59E0B' },
                  { name: 'Social', value: analytics.learningHours?.social || 0, fill: '#10B981' }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}h`}
                outerRadius={80}
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#8B5CF6" />
                <Cell fill="#F59E0B" />
                <Cell fill="#10B981" />
              </Pie>
              <Tooltip formatter={(value) => `${value}h`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-indigo-600" />
          Weekly Performance vs Target
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={analytics.monthlyPerformance || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[60, 85]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Legend />
            <Bar dataKey="performance" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Feedback */}
      {feedback.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-indigo-600" />
            Recent Faculty Feedback
          </h3>
          <div className="space-y-3">
            {feedback.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border-l-4 ${
                item.type === 'positive' ? 'bg-green-50 border-l-green-500' : 'bg-blue-50 border-l-blue-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">{item.faculty}</p>
                    <p className="text-sm text-slate-700 mt-1">{item.message}</p>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  };

  const renderChartsTab = () => {
    if (!analytics) return <div className="text-center py-12 text-slate-500">No chart data available yet.</div>;
    return (
    <div className="space-y-6">
      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Performance Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={analytics.gpaTrend || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="gpa" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} name="GPA" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Skills Radar Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Skills Proficiency Radar</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={skills}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
            <Radar name="Proficiency %" dataKey="proficiency" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance Comparison */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Subject Attendance Comparison</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.subjectAttendance || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="subject" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9'
              }}
            />
            <Legend />
            <Bar dataKey="attendance" fill="#10B981" radius={[8, 8, 0, 0]} name="Your Attendance %" />
            <Bar dataKey="target" fill="#94A3B8" radius={[8, 8, 0, 0]} name="Target %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  };

  const renderSkillsTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-slate-900">{skill.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    skill.level === 'Expert' ? 'bg-purple-100 text-purple-700' :
                    skill.level === 'Advanced' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {skill.level}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {skill.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{skill.proficiency}% proficiency</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-slate-900">{skill.endorsements}</span>
                </div>
                <p className="text-xs text-slate-500">endorsements</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getProficiencyColor(skill.proficiency)}`}
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{skill.proficiency}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-6">
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No goals yet. Work with your faculty to set meaningful goals</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-slate-200 p-6 hover:shadow-md transition bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">{goal.title}</h3>
                  <p className="text-sm text-slate-600 mt-2">{goal.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      goal.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      goal.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {goal.status}
                    </span>
                    {goal.priority && <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      goal.priority === 'High' ? 'bg-red-100 text-red-700' :
                      goal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {goal.priority}
                    </span>}
                  </>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-600">Progress</p>
                    <p className="text-sm font-bold text-slate-900">{(goal.progressPercentage || 0).toFixed(0)}%</p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${goal.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">Milestones ({goal.completedMilestones}/{goal.milestones.length})</p>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {idx < goal.completedMilestones ? (
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                        <span className={`text-sm ${idx < goal.completedMilestones ? 'text-green-600 line-through' : 'text-slate-600'}`}>
                          {milestone}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {goal.feedback && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-slate-700"><strong>Faculty Feedback:</strong> {goal.feedback}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                  {goal.targetDate && <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {reports.map((report) => (
        <div key={report.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-indigo-600" />
                <h3 className="font-bold text-lg text-slate-900">{report.type}</h3>
              </div>
              <p className="text-sm text-slate-600">{report.month}</p>
            </div>
            <button
              onClick={() => handleDownloadReport(report)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition font-semibold"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 space-y-3">
            {report.gpa && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Current GPA</span>
                <span className="font-bold text-slate-900">{report.gpa}</span>
              </div>
            )}
            {report.improvementScore && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Improvement Score</span>
                <span className="font-bold text-green-600">+{report.improvementScore}%</span>
              </div>
            )}
            {report.topSkill && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Top Skill</span>
                <span className="font-bold text-slate-900">{report.topSkill}</span>
              </div>
            )}
            {report.skillsImproved && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Skills Improved</span>
                <span className="font-bold text-slate-900">{report.skillsImproved}</span>
              </div>
            )}
            {report.readinessScore && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Placement Readiness</span>
                <span className={`font-bold ${getScoreColor(report.readinessScore)}`}>{report.readinessScore}%</span>
              </div>
            )}
            <div className="border-t border-slate-300 pt-3">
              <p className="text-sm text-slate-700"><strong>Recommendations:</strong> {report.recommendations || report.recommendedActions}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-200 transition text-slate-600"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
            <TrendingUp size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Analytics & Insights</h1>
            <p className="text-slate-600 mt-1">Track your performance, progress, and achieve your goals</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', count: '6' },
          { id: 'charts', label: 'Charts', count: '4' },
          { id: 'skills', label: 'Skills', count: skills.length.toString() },
          { id: 'goals', label: 'Goals & Activity', count: goals.length.toString() },
          { id: 'reports', label: 'Reports', count: reports.length.toString() }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label} {tab.count}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'charts' && renderChartsTab()}
        {activeTab === 'skills' && renderSkillsTab()}
        {activeTab === 'goals' && renderGoalsTab()}
        {activeTab === 'reports' && renderReportsTab()}
      </div>
    </div>
  );
}
