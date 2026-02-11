import React, { useState, useEffect } from 'react';
import { AlertCircle, Edit2, Trash2, CheckCircle, Clock, Loader } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const IncidentReports = ({ facultyId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [resolutionForm, setResolutionForm] = useState({ internalNotes: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await safetyAPI.getAllIncidentReports();
      setReports(response.data.reports || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleAssign = async (reportId, assignedTo) => {
    try {
      await safetyAPI.assignIncidentReport(reportId, assignedTo, facultyId);
      fetchReports();
    } catch (error) {
      console.error('Error assigning report:', error);
    }
  };

  const handleResolve = async (reportId) => {
    try {
      await safetyAPI.resolveIncidentReport(reportId, resolutionForm.internalNotes, facultyId);
      setSelectedReport(null);
      setResolutionForm({ internalNotes: '' });
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this report?')) {
      try {
        await safetyAPI.deleteIncidentReport(id);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  const filteredReports = filterStatus === 'all' ? reports :
    reports.filter(r => r.status === filterStatus);

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-red-100 text-red-800 border-red-300';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'New': return <AlertCircle size={18} />;
      case 'Under Review': return <Clock size={18} />;
      case 'Resolved': return <CheckCircle size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Incident Reports</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Total Reports</p>
            <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
          </div>
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">New</p>
            <p className="text-3xl font-bold text-red-600">{reports.filter(r => r.status === 'New').length}</p>
          </div>
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Under Review</p>
            <p className="text-3xl font-bold text-yellow-600">{reports.filter(r => r.status === 'Under Review').length}</p>
          </div>
          <div className="rounded-[12px] bg-white border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{reports.filter(r => r.status === 'Resolved').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'New', 'Under Review', 'Resolved'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
            <AlertCircle size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No incident reports found</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="rounded-[16px] border border-slate-200 bg-white p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{report.title}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{report.description}</p>
                  <div className="grid gap-2 md:grid-cols-2 text-sm text-slate-500 mb-3">
                    <div><strong>Reported By:</strong> {report.reportedBy}</div>
                    <div><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</div>
                    {report.assignedTo && <div><strong>Assigned To:</strong> {report.assignedTo}</div>}
                    {report.location && <div><strong>Location:</strong> {report.location}</div>}
                  </div>
                  {report.isConfidential && <div className="text-xs text-red-600 font-semibold">⚠️ Confidential Report</div>}
                </div>
                <div className="flex flex-col gap-2">
                  {report.status !== 'Resolved' && (
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="rounded-[8px] bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      {report.status === 'New' ? 'Review' : 'Resolve'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(report.id)}
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

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-[20px] bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {selectedReport.status === 'New' ? 'Review' : 'Resolve'} Incident Report
            </h2>

            {/* Report Details */}
            <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-[12px]">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-600">Title</p>
                  <p className="font-semibold text-slate-900">{selectedReport.title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className={`font-semibold inline-block rounded-full px-3 py-1 text-xs ${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Reported By</p>
                  <p className="font-semibold text-slate-900">{selectedReport.reportedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Description</p>
                <p className="text-slate-900">{selectedReport.description}</p>
              </div>
            </div>

            {/* Assignment & Resolution */}
            {selectedReport.status === 'New' ? (
              <div className="space-y-4 mb-6">
                <label className="block">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Assign To:</p>
                  <select
                    onChange={(e) => handleAssign(selectedReport.id, e.target.value)}
                    className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
                  >
                    <option value="">Select Team Member</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Campus Manager">Campus Manager</option>
                    <option value="Counselor">Counselor</option>
                  </select>
                </label>
                <button
                  onClick={() => {
                    handleAssign(selectedReport.id, 'Assigned');
                    setSelectedReport({ ...selectedReport, status: 'Under Review' });
                  }}
                  className="w-full rounded-[8px] bg-yellow-600 px-4 py-2 font-semibold text-white hover:bg-yellow-700"
                >
                  Move to Under Review
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <label className="block">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Internal Notes:</p>
                  <textarea
                    placeholder="Add resolution notes, actions taken, etc."
                    value={resolutionForm.internalNotes}
                    onChange={(e) => setResolutionForm({ internalNotes: e.target.value })}
                    className="w-full rounded-[8px] border border-slate-200 px-4 py-2"
                    rows="4"
                  />
                </label>
                <button
                  onClick={() => handleResolve(selectedReport.id)}
                  className="w-full rounded-[8px] bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                >
                  Mark as Resolved
                </button>
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedReport(null)}
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

export default IncidentReports;
