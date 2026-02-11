import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Phone, Loader, MessageSquare, Clock } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const CounselingRequests = ({ facultyId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [assignmentData, setAssignmentData] = useState({ counselor: '', scheduledTime: '' });
  const [feedbackData, setFeedbackData] = useState({ rating: 5, notes: '' });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await safetyAPI.getAllCounselingSessions();
      setSessions(response.data.sessions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setLoading(false);
    }
  };

  const handleAssignCounselor = async (sessionId) => {
    try {
      await safetyAPI.assignCounselor(sessionId, assignmentData.counselor, assignmentData.scheduledTime, facultyId);
      setAssignmentData({ counselor: '', scheduledTime: '' });
      fetchSessions();
    } catch (error) {
      console.error('Error assigning counselor:', error);
    }
  };

  const handleClosession = async (sessionId) => {
    try {
      await safetyAPI.closeCounselingSession(sessionId, feedbackData.notes, feedbackData.rating, facultyId);
      setSelectedSession(null);
      setFeedbackData({ rating: 5, notes: '' });
      fetchSessions();
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this counseling request?')) {
      try {
        await safetyAPI.deleteCounselingSession(id);
        fetchSessions();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-red-100 text-red-800 border-red-300';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const filteredSessions = filterStatus === 'all' ? sessions :
    sessions.filter(s => s.bookingStatus === filterStatus);

  const pendingSessions = sessions.filter(s => s.bookingStatus === 'Pending');
  const scheduledSessions = sessions.filter(s => s.bookingStatus === 'Scheduled');
  const completedSessions = sessions.filter(s => s.bookingStatus === 'Completed');

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Counseling & Support Requests</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Total Requests</p>
            <p className="text-3xl font-bold text-slate-900">{sessions.length}</p>
          </div>
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Pending</p>
            <p className="text-3xl font-bold text-red-600">{pendingSessions.length}</p>
          </div>
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Scheduled</p>
            <p className="text-3xl font-bold text-blue-600">{scheduledSessions.length}</p>
          </div>
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedSessions.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'Pending', 'Scheduled', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filterStatus === status ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
            <MessageSquare size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No counseling requests found</p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="rounded-[16px] border border-slate-200 bg-white p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{session.sessionType}</h3>
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${getStatusColor(session.bookingStatus)}`}>
                      {session.bookingStatus}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{session.description}</p>
                  
                  <div className="grid gap-2 md:grid-cols-2 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span><strong>Requested By:</strong> {session.studentName}</span>
                    </div>
                    {session.contactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{session.contactNumber}</span>
                      </div>
                    )}
                    {session.preferredTime && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span><strong>Preferred:</strong> {session.preferredTime}</span>
                      </div>
                    )}
                    {session.assignedCounselor && (
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span><strong>Counselor:</strong> {session.assignedCounselor}</span>
                      </div>
                    )}
                  </div>

                  {session.sessionType && (
                    <p className="text-xs text-slate-500">
                      <strong>Type:</strong> {session.sessionType === 'Individual' ? '1:1 Session' : 'Group Session'}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {session.bookingStatus === 'Pending' && (
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="rounded-[8px] bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Assign
                    </button>
                  )}
                  {session.bookingStatus === 'Scheduled' && (
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="rounded-[8px] bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="rounded-[8px] border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment/Feedback Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-[20px] bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {selectedSession.bookingStatus === 'Pending' ? 'Assign Counselor' : 'Session Feedback'}
            </h2>

            {/* Session Details */}
            <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-[12px]">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Session Type</p>
                  <p className="font-semibold text-slate-900">{selectedSession.sessionType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Student</p>
                  <p className="font-semibold text-slate-900">{selectedSession.studentName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className={`font-semibold inline-block rounded-full px-3 py-1 text-xs ${getStatusColor(selectedSession.bookingStatus)}`}>
                    {selectedSession.bookingStatus}
                  </p>
                </div>
                {selectedSession.preferredTime && (
                  <div>
                    <p className="text-sm text-slate-600">Preferred Time</p>
                    <p className="font-semibold text-slate-900">{selectedSession.preferredTime}</p>
                  </div>
                )}
              </div>
              {selectedSession.description && (
                <div>
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-900">{selectedSession.description}</p>
                </div>
              )}
            </div>

            {/* Assignment or Feedback Form */}
            {selectedSession.bookingStatus === 'Pending' ? (
              <div className="space-y-4 mb-6">
                <label className="block">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Assign Counselor:</p>
                  <select
                    value={assignmentData.counselor}
                    onChange={(e) => setAssignmentData({ ...assignmentData, counselor: e.target.value })}
                    className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
                  >
                    <option value="">Select Counselor</option>
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                    <option value="Ms. Emily Davis">Ms. Emily Davis</option>
                    <option value="Mr. James Wilson">Mr. James Wilson</option>
                    <option value="Dr. Michael Brown">Dr. Michael Brown</option>
                  </select>
                </label>
                <label className="block">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Scheduled Date & Time:</p>
                  <input
                    type="datetime-local"
                    value={assignmentData.scheduledTime}
                    onChange={(e) => setAssignmentData({ ...assignmentData, scheduledTime: e.target.value })}
                    className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
                  />
                </label>
                <button
                  onClick={() => handleAssignCounselor(selectedSession.id)}
                  className="w-full rounded-[8px] bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                >
                  Schedule Counseling Session
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <label className="block">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Session Rating:</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setFeedbackData({ ...feedbackData, rating: num })}
                        className={`px-4 py-2 rounded-[8px] font-bold text-lg ${
                          feedbackData.rating === num
                            ? 'bg-yellow-500 text-white'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </label>
                <label className="block">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Feedback Notes:</p>
                  <textarea
                    placeholder="Add any notes about the session, recommendations, follow-up actions..."
                    value={feedbackData.notes}
                    onChange={(e) => setFeedbackData({ ...feedbackData, notes: e.target.value })}
                    className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
                    rows="4"
                  />
                </label>
                <button
                  onClick={() => handleClosession(selectedSession.id)}
                  className="w-full rounded-[8px] bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Mark Session as Completed
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedSession(null)}
              className="w-full rounded-[8px] border border-slate-200 px-4 py-2 font-semibold hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselingRequests;
