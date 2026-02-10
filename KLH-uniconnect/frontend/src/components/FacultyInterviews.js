import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, Star, TrendingUp, AlertCircle, CheckCircle, Calendar, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyInterviews = ({ searchTerm, email }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [performanceScore, setPerformanceScore] = useState(5);
  const [saving, setSaving] = useState(false);

  const [newInterview, setNewInterview] = useState({
    studentId: '',
    company: '',
    interviewType: 'Mock Interview',
    date: '',
    time: '',
    round: 'Technical Round'
  });

  // Fetch interviews from backend
  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/interviews`);
      if (response.ok) {
        const data = await response.json();
        setInterviews(data);
      } else {
        setError('Failed to fetch interviews');
      }
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!newInterview.studentId || !newInterview.company || !newInterview.date) {
      alert('Please fill in student ID, company, and date');
      return;
    }

    setSaving(true);
    try {
      const interviewData = {
        ...newInterview,
        conductedBy: email
      };

      const response = await fetch(`${API_BASE}/api/placements/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData)
      });

      if (response.ok) {
        const savedInterview = await response.json();
        setInterviews([savedInterview, ...interviews]);
        setNewInterview({
          studentId: '',
          company: '',
          interviewType: 'Mock Interview',
          date: '',
          time: '',
          round: 'Technical Round'
        });
        setShowScheduleModal(false);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to schedule interview');
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      alert('Failed to schedule interview');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedInterview) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/interviews/${selectedInterview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performance: performanceScore,
          feedback: feedbackText,
          status: 'Completed'
        })
      });

      if (response.ok) {
        const updatedInterview = await response.json();
        setInterviews(interviews.map(int =>
          int.id === selectedInterview.id ? updatedInterview : int
        ));
        setShowFeedbackModal(false);
        setFeedbackText('');
        setPerformanceScore(5);
        setSelectedInterview(null);
      } else {
        alert('Failed to add feedback');
      }
    } catch (err) {
      console.error('Error adding feedback:', err);
      alert('Failed to add feedback');
    } finally {
      setSaving(false);
    }
  };

  const filteredInterviews = interviews.filter(int =>
    (int.studentName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (int.company || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading interviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule New Interview */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <button
          onClick={() => setShowScheduleModal(!showScheduleModal)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Schedule Interview
        </button>

        {showScheduleModal && (
          <div className="mt-4 space-y-4 rounded-lg border border-blue-300 bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Student ID"
                value={newInterview.studentId}
                onChange={(e) => setNewInterview({ ...newInterview, studentId: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={newInterview.company}
                onChange={(e) => setNewInterview({ ...newInterview, company: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <select
                value={newInterview.interviewType}
                onChange={(e) => setNewInterview({ ...newInterview, interviewType: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Mock Interview">Mock Interview</option>
                <option value="Real Interview">Real Interview</option>
              </select>
              <input
                type="date"
                value={newInterview.date}
                onChange={(e) => setNewInterview({ ...newInterview, date: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="time"
                value={newInterview.time}
                onChange={(e) => setNewInterview({ ...newInterview, time: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={newInterview.round}
              onChange={(e) => setNewInterview({ ...newInterview, round: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="Technical Round">Technical Round</option>
              <option value="HR Round">HR Round</option>
              <option value="Coding Round">Coding Round</option>
              <option value="Group Discussion">Group Discussion</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleScheduleInterview}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interviews List */}
      <div className="space-y-3">
        {filteredInterviews.length > 0 ? (
          filteredInterviews.map(interview => (
            <div key={interview.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      interview.interviewType === 'Mock Interview' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      <Calendar className={interview.interviewType === 'Mock Interview' ? 'h-5 w-5 text-purple-600' : 'h-5 w-5 text-orange-600'} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{interview.studentName}</h4>
                      <p className="text-xs text-slate-600">{interview.studentId} • {interview.company} • {interview.interviewType}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {interview.date} {interview.time}
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {interview.round}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      interview.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {interview.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                      {interview.status === 'Scheduled' && <AlertCircle className="h-3 w-3" />}
                      {interview.status}
                    </span>
                    {interview.performance && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        <Star className="h-3 w-3 inline mr-1" />
                        Score: {interview.performance}/10
                      </span>
                    )}
                  </div>

                  {interview.feedback && (
                    <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Interview Feedback</p>
                      <p className="mt-1 text-sm text-slate-700">{interview.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {interview.status === 'Scheduled' && (
                    <button
                      onClick={() => {
                        setSelectedInterview(interview);
                        setFeedbackText(interview.feedback);
                        setPerformanceScore(interview.performance || 5);
                        setShowFeedbackModal(true);
                      }}
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                      title="Add Feedback"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  )}
                  {interview.status === 'Completed' && (
                    <button
                      onClick={() => {
                        setSelectedInterview(interview);
                        setFeedbackText(interview.feedback);
                        setPerformanceScore(interview.performance);
                        setShowFeedbackModal(true);
                      }}
                      className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                      title="Edit Feedback"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No interviews found.</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Interview Feedback - {selectedInterview.studentName}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900">Performance Score (1-10)</label>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                    <button
                      key={score}
                      onClick={() => setPerformanceScore(score)}
                      className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition ${
                        performanceScore === score
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter interview feedback..."
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows="4"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddFeedback}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Save Feedback
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedInterview(null);
                  setPerformanceScore(5);
                }}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyInterviews;
