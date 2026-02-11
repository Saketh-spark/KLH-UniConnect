import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  AlertTriangle,
  Crown,
  BarChart3,
  Filter,
  Download,
  Edit,
  Flag,
  MessageSquare,
  Target,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader,
  Settings
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';
const API_BASE_URL = `${API_BASE}/api/analytics`;

const FacultyAnalytics = ({ onBack = () => {}, facultyId = 'FAC001' }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [expandedStudent, setExpandedStudent] = useState(null);

  // Analytics Data
  const [departmentAnalytics, setDepartmentAnalytics] = useState([]);
  const [flaggedStudents, setFlaggedStudents] = useState([]);
  const [comparison, setComparison] = useState(null);

  // Modal States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ content: '', category: 'General' });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all analytics data
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 20000); // Refresh every 20 seconds
    return () => clearInterval(interval);
  }, [selectedDepartment]);

  const fetchAllData = async () => {
    try {
      const [deptRes, flaggedRes] = await Promise.all([
        selectedDepartment === 'All' 
          ? axios.get(`${API_BASE_URL}/department/All`)
          : axios.get(`${API_BASE_URL}/department/${selectedDepartment}`),
        axios.get(`${API_BASE_URL}/feedback/flagged`)
      ]);

      setDepartmentAnalytics(deptRes.data.analytics || []);
      setFlaggedStudents(flaggedRes.data.flaggedStudents || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/feedback/add`, {
        studentId: selectedStudent.studentId,
        facultyId: facultyId,
        feedbackType: 'Performance Feedback',
        content: feedbackForm.content,
        category: feedbackForm.category
      });
      setShowFeedbackModal(false);
      setFeedbackForm({ content: '', category: 'General' });
      fetchAllData();
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    totalStudents: departmentAnalytics.length,
    averageGPA: departmentAnalytics.length > 0 
      ? (departmentAnalytics.reduce((sum, s) => sum + s.currentGPA, 0) / departmentAnalytics.length).toFixed(2)
      : 0,
    averagePlacementReadiness: departmentAnalytics.length > 0
      ? (departmentAnalytics.reduce((sum, s) => sum + s.placementReadinessScore, 0) / departmentAnalytics.length).toFixed(1)
      : 0,
    atRiskStudents: departmentAnalytics.filter(s => s.placementReadinessScore < 50 || s.currentGPA < 2.5).length,
    highPerformers: departmentAnalytics.filter(s => s.placementReadinessScore > 80).length
  };

  // Sort by performance
  const sortedStudents = [...departmentAnalytics].sort((a, b) => 
    b.overallPerformanceScore - a.overallPerformanceScore
  );

  const FeedbackModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] w-full max-w-2xl">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-[20px]">
          <h2 className="text-2xl font-bold">
            Add Feedback for {selectedStudent?.studentName}
          </h2>
        </div>

        <form onSubmit={handleAddFeedback} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
            <select
              value={feedbackForm.category}
              onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
            >
              <option>Academics</option>
              <option>Skills</option>
              <option>Placements</option>
              <option>General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Feedback *</label>
            <textarea
              required
              value={feedbackForm.content}
              onChange={(e) => setFeedbackForm({...feedbackForm, content: e.target.value})}
              placeholder="Provide constructive feedback..."
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
              rows="5"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-[8px] bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Send Feedback
            </button>
            <button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              className="flex-1 rounded-[8px] border border-slate-200 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showFeedbackModal && <FeedbackModal />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-4 transform transition ${
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
              <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600">
                <BarChart3 size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900">Student Analytics</h1>
                <p className="mt-1 text-slate-600">Monitor and guide student performance</p>
              </div>
            </div>
            <button className="rounded-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-600">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats Cards */}
        <div className={`grid gap-4 md:grid-cols-5 mb-8 transform transition duration-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">Students Monitored</h3>
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats.totalStudents}</p>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">Average GPA</h3>
              <TrendingUp size={18} className="text-green-600" />
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats.averageGPA}</p>
          </div>

          <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">Avg Placement Ready</h3>
              <Zap size={18} className="text-yellow-600" />
            </div>
            <p className="text-4xl font-bold text-slate-900">{stats.averagePlacementReadiness}%</p>
          </div>

          <div className="rounded-[16px] border border-red-200 bg-red-50 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">At Risk</h3>
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <p className="text-4xl font-bold text-red-600">{stats.atRiskStudents}</p>
          </div>

          <div className="rounded-[16px] border border-green-200 bg-green-50 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 text-sm">High Performers</h3>
              <Crown size={18} className="text-green-600" />
            </div>
            <p className="text-4xl font-bold text-green-600">{stats.highPerformers}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-[16px] border-b border-slate-200 flex overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'students', label: '👥 Students', badge: stats.atRiskStudents },
            { id: 'flagged', label: '🚨 Flagged', badge: flaggedStudents.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap relative ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-[16px] border border-t-0 border-slate-200 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Performance Distribution</h2>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm"
                >
                  <option>All</option>
                  <option>CSE</option>
                  <option>ECE</option>
                  <option>Mechanical</option>
                </select>
              </div>

              {/* Performance Distribution Chart */}
              <div className="grid gap-4 md:grid-cols-3">
                {['High (80+)', 'Medium (50-79)', 'Low (<50)'].map((range, idx) => {
                  const min = idx === 0 ? 80 : idx === 1 ? 50 : 0;
                  const max = idx === 0 ? 100 : idx === 1 ? 79 : 49;
                  const count = departmentAnalytics.filter(s => 
                    s.overallPerformanceScore >= min && s.overallPerformanceScore <= max
                  ).length;
                  const percentage = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;

                  return (
                    <div key={idx} className="rounded-[12px] bg-gradient-to-br from-slate-50 to-slate-100 p-6 border border-slate-200">
                      <p className="text-sm font-semibold text-slate-600 mb-3">{range}</p>
                      <p className="text-3xl font-bold text-slate-900">{count}</p>
                      <p className="text-sm text-slate-500 mt-1">{percentage.toFixed(0)}% of students</p>
                      <div className="mt-3 h-2 bg-slate-300 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Top Performers */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Crown size={24} className="text-amber-600" />
                  Top Performers
                </h3>
                <div className="space-y-3">
                  {sortedStudents.slice(0, 5).map((student, idx) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-[12px] border border-amber-200">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{student.studentName}</p>
                          <p className="text-sm text-slate-600">{student.department}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-amber-600">{student.overallPerformanceScore.toFixed(0)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Student Analytics</h2>
              {sortedStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 font-semibold">No students in this department</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`rounded-[12px] border border-slate-200 transition ${
                        expandedStudent === student.id ? 'bg-slate-50 shadow-md' : 'bg-white hover:shadow-md'
                      }`}
                    >
                      <div
                        onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                        className="p-6 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900">{student.studentName}</h3>
                          <p className="text-sm text-slate-600">{student.studentId} • {student.department} • Sem {student.semester}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-slate-600">Performance</p>
                            <p className="text-2xl font-bold text-slate-900">{student.overallPerformanceScore.toFixed(0)}</p>
                          </div>
                          <button className="text-slate-400 hover:text-slate-600">
                            {expandedStudent === student.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </button>
                        </div>
                      </div>

                      {expandedStudent === student.id && (
                        <div className="border-t border-slate-200 p-6 bg-slate-50 space-y-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-white rounded-[8px] p-4 border border-slate-200">
                              <p className="text-xs text-slate-600 font-semibold">GPA</p>
                              <p className="text-2xl font-bold text-slate-900 mt-2">{student.currentGPA.toFixed(2)}</p>
                              <p className="text-xs text-slate-500 mt-1">Target: {student.gpaTarget}</p>
                            </div>
                            <div className="bg-white rounded-[8px] p-4 border border-slate-200">
                              <p className="text-xs text-slate-600 font-semibold">Placement Ready</p>
                              <p className="text-2xl font-bold text-slate-900 mt-2">{student.placementReadinessScore.toFixed(0)}%</p>
                            </div>
                            <div className="bg-white rounded-[8px] p-4 border border-slate-200">
                              <p className="text-xs text-slate-600 font-semibold">Skills</p>
                              <p className="text-2xl font-bold text-slate-900 mt-2">{student.skillsTrackedCount}</p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowFeedbackModal(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 rounded-[8px] bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              <MessageSquare size={16} />
                              Add Feedback
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 rounded-[8px] border border-slate-200 py-2 text-sm font-semibold hover:bg-slate-50">
                              <Target size={16} />
                              Set Goals
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 rounded-[8px] border border-red-200 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                              <Flag size={16} />
                              Flag
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Flagged Students Tab */}
          {activeTab === 'flagged' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Flagged Students - Needs Attention</h2>
              {flaggedStudents.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 font-semibold">No flagged students</p>
                  <p className="text-sm text-slate-500 mt-2">All students are on track</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flaggedStudents.map((feedback) => (
                    <div key={feedback.id} className="rounded-[12px] bg-red-50 border border-red-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900">{feedback.studentName}</h3>
                          <p className="text-sm text-slate-600">{feedback.category} • {feedback.feedbackType}</p>
                        </div>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                          Needs Attention
                        </span>
                      </div>
                      <p className="text-slate-700 mb-3">{feedback.content}</p>
                      {feedback.recommendedAction && (
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <p className="text-sm font-semibold text-slate-900 mb-1">Recommended Action:</p>
                          <p className="text-sm text-slate-700">{feedback.recommendedAction}</p>
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

export default FacultyAnalytics;
