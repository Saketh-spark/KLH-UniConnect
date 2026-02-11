import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Zap,
  Download,
  Eye,
  Star,
  CheckCircle,
  AlertCircle,
  LineChart,
  Clock,
  Users,
  BookOpen,
  Loader,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/analytics';

const StudentAnalytics = ({ onBack = () => {}, studentId = 'STU001' }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Analytics Data
  const [analytics, setAnalytics] = useState(null);
  const [skills, setSkills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all analytics data
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [studentId]);

  const fetchAllData = async () => {
    try {
      const [analyticsRes, skillsRes, goalsRes, reportsRes, feedbackRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/student/${studentId}`),
        axios.get(`${API_BASE_URL}/skills/student/${studentId}`),
        axios.get(`${API_BASE_URL}/goals/student/${studentId}`),
        axios.get(`${API_BASE_URL}/reports/student/${studentId}`),
        axios.get(`${API_BASE_URL}/feedback/student/${studentId}`)
      ]);

      setAnalytics(analyticsRes.data.analytics || null);
      setSkills(skillsRes.data.skills || []);
      setGoals(goalsRes.data.goals || []);
      setReports(reportsRes.data.reports || []);
      setFeedback(feedbackRes.data.feedback || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size={40} className="animate-spin text-purple-600" />
      </div>
    );
  }

  const performanceScore = analytics?.overallPerformanceScore || 0;
  const placementReadiness = analytics?.placementReadinessScore || 0;
  const currentGPA = analytics?.currentGPA || 0;
  const gpaTarget = analytics?.gpaTarget || 4.0;

  // Chart Data
  const chartData = {
    gpa: analytics?.gpaTrend || [],
    timeInvestment: [
      { category: 'Academics', hours: analytics?.hoursSpentAcademics || 0, color: 'bg-blue-500' },
      { category: 'Skills', hours: analytics?.hoursSpentSkills || 0, color: 'bg-purple-500' },
      { category: 'Placements', hours: analytics?.hoursSpentPlacements || 0, color: 'bg-green-500' }
    ]
  };

  const totalHours = chartData.timeInvestment.reduce((sum, item) => sum + item.hours, 1);

  // Unread feedback count
  const unreadFeedbackCount = feedback.filter(f => !f.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 mb-4 transform transition ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className={`flex items-center justify-between transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600">
                <BarChart3 size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">Analytics & Progress</h1>
                <p className="mt-1 text-slate-600">Track your academic, skill, and placement journey</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Performance Cards */}
        <div className={`grid gap-4 md:grid-cols-4 mb-8 transform transition duration-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Overall Performance */}
          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">Performance Score</h3>
              <TrendingUp size={18} className="text-purple-600" />
            </div>
            <div className="mb-4">
              <p className="text-4xl font-bold text-slate-900">{Math.round(performanceScore)}</p>
              <p className="text-xs text-slate-500 mt-1">out of 100</p>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                style={{ width: `${Math.min(performanceScore, 100)}%` }}
              />
            </div>
          </div>

          {/* GPA */}
          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">Current GPA</h3>
              <Award size={18} className="text-amber-600" />
            </div>
            <div className="mb-4">
              <p className="text-4xl font-bold text-slate-900">{currentGPA.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Target: {gpaTarget}</p>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                style={{ width: `${Math.min((currentGPA / gpaTarget) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Placement Readiness */}
          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">Placement Ready</h3>
              <Zap size={18} className="text-green-600" />
            </div>
            <div className="mb-4">
              <p className="text-4xl font-bold text-slate-900">{Math.round(placementReadiness)}%</p>
              <p className="text-xs text-slate-500 mt-1">Interview ready</p>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${Math.min(placementReadiness, 100)}%` }}
              />
            </div>
          </div>

          {/* Goals & Skills */}
          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-600 text-sm mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Active Goals
                </h3>
                <p className="text-3xl font-bold text-slate-900">{goals.filter(g => g.status === 'Active').length}</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-600 text-sm mb-2 flex items-center gap-2">
                  <Zap size={16} />
                  Skills Tracked
                </h3>
                <p className="text-3xl font-bold text-slate-900">{skills.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-[16px] border-b border-slate-200 flex overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview', icon: BarChart3 },
            { id: 'skills', label: '🎯 Skills', icon: Zap },
            { id: 'goals', label: '🎪 Goals', icon: Target },
            { id: 'reports', label: '📄 Reports', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-[16px] border border-t-0 border-slate-200 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* GPA Trend Chart */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <LineChart size={24} className="text-purple-600" />
                  GPA Trend
                </h2>
                <div className="bg-gradient-to-b from-slate-50 to-white rounded-[12px] p-6 border border-slate-200">
                  {chartData.gpa && chartData.gpa.length > 0 ? (
                    <div className="flex items-end gap-3 h-48 justify-around">
                      {chartData.gpa.slice(-8).map((point, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className="w-8 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-[8px] transition-all hover:shadow-lg"
                            style={{ height: `${Math.min((point.gpa / 4) * 180, 180)}px` }}
                            title={`${point.gpa.toFixed(2)}`}
                          />
                          <p className="text-xs text-slate-500 mt-2 font-mono">{point.week}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-12">No trend data available yet</p>
                  )}
                </div>
              </div>

              {/* Time Investment */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-blue-600" />
                  Time Investment by Category
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {chartData.timeInvestment.map((item, idx) => (
                    <div key={idx} className="rounded-[12px] border border-slate-200 p-6 bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-900">{item.category}</h3>
                        <div className={`w-4 h-4 rounded-full ${item.color}`} />
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{item.hours.toFixed(1)}</p>
                      <p className="text-xs text-slate-500 mt-1">hours invested</p>
                      <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} transition-all`}
                          style={{ width: `${(item.hours / (totalHours * 1.5)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              {unreadFeedbackCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-[12px] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <AlertCircle size={20} className="text-blue-600" />
                        New Feedback from Faculty
                      </h3>
                      <p className="text-sm text-slate-600 mt-2">
                        You have {unreadFeedbackCount} new message{unreadFeedbackCount > 1 ? 's' : ''} from your faculty
                      </p>
                    </div>
                    <button className="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                      View All
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Skills</h2>
              {skills.length === 0 ? (
                <div className="text-center py-12">
                  <Zap size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 font-semibold">No skills tracked yet</p>
                  <p className="text-sm text-slate-500 mt-2">Start adding skills to track your progress</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className="rounded-[12px] border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg">{skill.skillName}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                              skill.proficiencyLevel === 'Expert' ? 'bg-green-100 text-green-700' :
                              skill.proficiencyLevel === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {skill.proficiencyLevel}
                            </span>
                            <span className="text-xs text-slate-500">{skill.category}</span>
                          </div>
                        </div>
                        {skill.proficiencyPercentage >= 80 && <Star size={24} className="text-amber-500 fill-amber-500" />}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-slate-600">Proficiency</p>
                          <p className="text-sm font-bold text-slate-900">{skill.proficiencyPercentage.toFixed(0)}%</p>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                            style={{ width: `${skill.proficiencyPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                        <span>👍 {skill.endorsementsCount} endorsements</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(skill.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Goals</h2>
              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 font-semibold">No goals set yet</p>
                  <p className="text-sm text-slate-500 mt-2">Work with your faculty to set meaningful goals</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="rounded-[12px] border border-slate-200 p-6 hover:shadow-md transition">
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
                            <p className="text-sm font-bold text-slate-900">{goal.progressPercentage.toFixed(0)}%</p>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                              style={{ width: `${goal.progressPercentage}%` }}
                            />
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
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Reports</h2>
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 font-semibold">No reports generated yet</p>
                  <p className="text-sm text-slate-500 mt-2">Reports will be generated monthly by your faculty</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <div key={report.id} className="rounded-[12px] border border-slate-200 p-6 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 text-lg">{report.reportType}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Generated on {new Date(report.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-600">
                            <Eye size={18} />
                          </button>
                          <button className="rounded-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-600">
                            <Download size={18} />
                          </button>
                        </div>
                      </div>

                      {report.performanceScore && (
                        <div className="grid gap-3 md:grid-cols-2 mb-4">
                          <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-xs text-slate-600 font-semibold">Performance Score</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{report.performanceScore.toFixed(1)}</p>
                          </div>
                          {report.improvementScore && (
                            <div className="bg-green-50 rounded-lg p-4">
                              <p className="text-xs text-slate-600 font-semibold">Improvement</p>
                              <p className="text-2xl font-bold text-green-600 mt-1">+{report.improvementScore.toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                      )}

                      {report.recommendations && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Recommendations</p>
                          <p className="text-sm text-slate-700">{report.recommendations}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentAnalytics;
