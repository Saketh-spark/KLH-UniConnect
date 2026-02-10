import React, { useState, useEffect } from 'react';
import { Users, Filter, Search, Eye, MessageSquare, Flag, Download, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyStudentApplications = ({ searchTerm }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState('');

  const statuses = ['all', 'applied', 'under_review', 'interview', 'accepted', 'rejected'];

  // Fetch applications from backend
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'under_review' })
      });
      if (response.ok) {
        setApplications(applications.map(app =>
          app.id === id ? { ...app, status: 'under_review' } : app
        ));
      }
    } catch (err) {
      console.error('Error updating application:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (response.ok) {
        setApplications(applications.map(app =>
          app.id === id ? { ...app, status: 'rejected' } : app
        ));
      }
    } catch (err) {
      console.error('Error updating application:', err);
    }
  };

  const handleAccept = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' })
      });
      if (response.ok) {
        setApplications(applications.map(app =>
          app.id === id ? { ...app, status: 'accepted' } : app
        ));
      }
    } catch (err) {
      console.error('Error updating application:', err);
    }
  };

  const filteredApplications = applications
    .filter(app => selectedStatus === 'all' || app.status === selectedStatus)
    .filter(app => 
      (app.studentName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (app.company || '').toLowerCase().includes((searchTerm || '').toLowerCase())
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review':
        return 'bg-blue-100 text-blue-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700';
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'applied':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApplications.length > 0 ? (
          filteredApplications.map(app => (
            <div key={app.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-bold text-blue-600">{app.studentName.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{app.studentName}</h4>
                      <p className="text-xs text-slate-600">{app.studentId} • {app.branch} • CGPA: {app.cgpa}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {app.company} • {app.position}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(app.status)}`}>
                      {app.status === 'Shortlisted' && <CheckCircle className="h-3 w-3" />}
                      {app.status === 'Rejected' && <AlertCircle className="h-3 w-3" />}
                      {app.status === 'Interviewed' && <Clock className="h-3 w-3" />}
                      {app.status}
                    </span>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      Resume Score: {app.resumeScore}/10
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Applied: {app.appliedDate}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {app.skills.map((skill, idx) => (
                      <span key={idx} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                    title="View Resume"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setShowFeedbackModal(true);
                    }}
                    className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                    title="Add Feedback"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  {app.status === 'Applied' && (
                    <button
                      onClick={() => handleShortlist(app.id)}
                      className="rounded-lg bg-green-100 p-2 text-green-600 transition hover:bg-green-200"
                      title="Shortlist"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(app.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                    title="Reject"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No applications found.</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Add Feedback for {selectedApp.studentName}</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback..."
              className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows="4"
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                  setSelectedApp(null);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                  setSelectedApp(null);
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

export default FacultyStudentApplications;
