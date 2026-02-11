import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, Edit2, Trash2, Eye, Users, Calendar, Clock, 
  CheckCircle, XCircle, Loader2, Video, Search, Filter, Play, Pause,
  Send, FileText, AlertCircle, Star, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyAssessments = ({ email, searchTerm }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showScheduleInterviewModal, setShowScheduleInterviewModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [testForm, setTestForm] = useState({
    company: '',
    type: 'Aptitude Test',
    date: '',
    time: '',
    duration: 60,
    platform: 'HackerRank',
    cutoffScore: 60,
    instructions: ''
  });

  const [interviewForm, setInterviewForm] = useState({
    company: '',
    studentId: '',
    studentName: '',
    type: 'Technical Interview',
    round: 'Round 1',
    date: '',
    time: '',
    interviewerName: '',
    meetingLink: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, interviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/placements/tests`).catch(() => null),
        fetch(`${API_BASE}/api/placements/interviews`).catch(() => null)
      ]);

      if (testsRes?.ok) setTests(await testsRes.json());
      if (interviewsRes?.ok) setInterviews(await interviewsRes.json());

      // Mock data
      if (!testsRes?.ok) {
        setTests([
          { id: '1', company: 'Google', type: 'Aptitude Test', date: '2026-01-25', time: '10:00 AM', duration: 90, registered: 145, completed: 0, status: 'scheduled', cutoff: 70 },
          { id: '2', company: 'Microsoft', type: 'Coding Test', date: '2026-01-28', time: '2:00 PM', duration: 120, registered: 89, completed: 0, status: 'scheduled', cutoff: 60 },
          { id: '3', company: 'TCS', type: 'Aptitude Test', date: '2026-01-15', time: '11:00 AM', duration: 60, registered: 234, completed: 220, status: 'completed', passed: 156, failed: 64, cutoff: 50 }
        ]);
      }
      if (!interviewsRes?.ok) {
        setInterviews([
          { id: '1', company: 'Amazon', studentName: 'Rahul Kumar', type: 'Technical', round: 'Round 1', date: '2026-01-30', time: '3:00 PM', status: 'scheduled', interviewer: 'John Doe' },
          { id: '2', company: 'Amazon', studentName: 'Priya Singh', type: 'Technical', round: 'Round 1', date: '2026-01-30', time: '4:00 PM', status: 'scheduled', interviewer: 'John Doe' },
          { id: '3', company: 'TCS', studentName: 'Amit Patel', type: 'HR', round: 'Final', date: '2026-01-22', time: '11:00 AM', status: 'completed', feedback: 'Selected' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testForm, createdBy: email })
      });
      if (response.ok) {
        const newTest = await response.json();
        setTests([newTest, ...tests]);
        setShowCreateTestModal(false);
      }
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...interviewForm, scheduledBy: email })
      });
      if (response.ok) {
        const newInterview = await response.json();
        setInterviews([newInterview, ...interviews]);
        setShowScheduleInterviewModal(false);
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
    }
  };

  const handleEvaluate = async (testId) => {
    try {
      await fetch(`${API_BASE}/api/placements/tests/${testId}/evaluate`, { method: 'POST' });
      fetchData();
    } catch (error) {
      console.error('Error evaluating:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-amber-600 bg-amber-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const stats = {
    totalTests: tests.length,
    upcomingTests: tests.filter(t => t.status === 'scheduled').length,
    totalInterviews: interviews.length,
    pendingInterviews: interviews.filter(i => i.status === 'scheduled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading assessments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Tests</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalTests}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-600">Upcoming Tests</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{stats.upcomingTests}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Total Interviews</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{stats.totalInterviews}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Pending Interviews</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{stats.pendingInterviews}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateTestModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Test
        </button>
        <button
          onClick={() => setShowScheduleInterviewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
        >
          <Calendar className="h-5 w-5" />
          Schedule Interview
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'tests', label: 'Tests', icon: ClipboardList },
          { id: 'interviews', label: 'Interviews', icon: Video },
          { id: 'shortlist', label: 'Shortlist', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Company / Test</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Candidates</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Cut-off</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map(test => (
                <tr key={test.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{test.company}</p>
                    <p className="text-sm text-slate-500">{test.type}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {test.date} at {test.time}
                    <p className="text-xs text-slate-400">{test.duration} mins</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{test.registered}</p>
                    {test.status === 'completed' && (
                      <p className="text-xs text-slate-500">
                        <span className="text-green-600">{test.passed} passed</span> / 
                        <span className="text-red-600"> {test.failed} failed</span>
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{test.cutoff}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100" title="View">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      {test.status === 'completed' && (
                        <button 
                          onClick={() => handleEvaluate(test.id)}
                          className="p-2 rounded-lg hover:bg-green-100" 
                          title="Evaluate & Shortlist"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Type / Round</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Schedule</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Interviewer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interviews.map(interview => (
                <tr key={interview.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{interview.studentName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{interview.company}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {interview.type}
                    <p className="text-xs text-slate-400">{interview.round}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {interview.date} at {interview.time}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{interview.interviewer}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {interview.status === 'completed' && (
                        <button className="p-2 rounded-lg hover:bg-slate-100" title="Add Feedback">
                          <FileText className="h-4 w-4 text-slate-600" />
                        </button>
                      )}
                      <button className="p-2 rounded-lg hover:bg-slate-100" title="Reschedule">
                        <Calendar className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shortlist Tab */}
      {activeTab === 'shortlist' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p className="font-medium">Shortlist Management</p>
            <p className="text-sm mt-1">Select students from completed tests to create shortlists</p>
          </div>
        </div>
      )}

      {/* Create Test Modal */}
      {showCreateTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Create Test</h3>
                <button onClick={() => setShowCreateTestModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Company</label>
                <input
                  type="text"
                  value={testForm.company}
                  onChange={(e) => setTestForm(prev => ({ ...prev, company: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Test Type</label>
                  <select
                    value={testForm.type}
                    onChange={(e) => setTestForm(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option>Aptitude Test</option>
                    <option>Coding Test</option>
                    <option>Technical MCQ</option>
                    <option>Essay Writing</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Platform</label>
                  <select
                    value={testForm.platform}
                    onChange={(e) => setTestForm(prev => ({ ...prev, platform: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option>HackerRank</option>
                    <option>HackerEarth</option>
                    <option>Codility</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Date</label>
                  <input
                    type="date"
                    value={testForm.date}
                    onChange={(e) => setTestForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Time</label>
                  <input
                    type="time"
                    value={testForm.time}
                    onChange={(e) => setTestForm(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Duration (mins)</label>
                  <input
                    type="number"
                    value={testForm.duration}
                    onChange={(e) => setTestForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Cut-off Score (%)</label>
                  <input
                    type="number"
                    value={testForm.cutoffScore}
                    onChange={(e) => setTestForm(prev => ({ ...prev, cutoffScore: parseInt(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowCreateTestModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600">
                Cancel
              </button>
              <button onClick={handleCreateTest} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold">
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Schedule Interview</h3>
                <button onClick={() => setShowScheduleInterviewModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <input
                    type="text"
                    value={interviewForm.company}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, company: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Student Name</label>
                  <input
                    type="text"
                    value={interviewForm.studentName}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, studentName: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Interview Type</label>
                  <select
                    value={interviewForm.type}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option>Technical Interview</option>
                    <option>HR Interview</option>
                    <option>Managerial Round</option>
                    <option>Group Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Round</label>
                  <select
                    value={interviewForm.round}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, round: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option>Round 1</option>
                    <option>Round 2</option>
                    <option>Round 3</option>
                    <option>Final</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Date</label>
                  <input
                    type="date"
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Time</label>
                  <input
                    type="time"
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Meeting Link</label>
                <input
                  type="url"
                  value={interviewForm.meetingLink}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setShowScheduleInterviewModal(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600">
                Cancel
              </button>
              <button onClick={handleScheduleInterview} className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold">
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssessments;
