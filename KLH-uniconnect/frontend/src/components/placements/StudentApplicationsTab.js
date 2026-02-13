import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, CheckCircle, Clock, AlertCircle, XCircle, Building2, FileText,
  Upload, ChevronDown, ChevronRight, Loader2, Calendar, Bell, Download, Eye
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentApplicationsTab = ({ studentId, email }) => {
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRef = useRef(null);
  const [currentUpload, setCurrentUpload] = useState({ appId: null, docType: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, intRes] = await Promise.all([
        fetch(`${API_BASE}/api/placements/applications`),
        fetch(`${API_BASE}/api/placements/interviews/student/${studentId}`)
      ]);
      if (appsRes.ok) {
        const allApps = await appsRes.json();
        setApplications(allApps.filter(a => a.studentId === studentId));
      }
      if (intRes.ok) setInterviews(await intRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const statusFlow = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];
  const statusConfig = {
    applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: ClipboardList },
    shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700', icon: CheckCircle },
    interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700', icon: Calendar },
    selected: { label: 'Selected', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    accepted: { label: 'Selected', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  };

  const filters = [
    { id: 'all', label: 'All Applications', count: applications.length },
    { id: 'applied', label: 'Applied', count: applications.filter(a => a.status === 'applied').length },
    { id: 'shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
    { id: 'interview', label: 'Interview', count: applications.filter(a => a.status === 'interview').length },
    { id: 'selected', label: 'Selected', count: applications.filter(a => ['selected', 'accepted'].includes(a.status)).length },
    { id: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
  ];

  const filtered = activeFilter === 'all' ? applications :
    applications.filter(a => activeFilter === 'selected' ? ['selected', 'accepted'].includes(a.status) : a.status === activeFilter);

  const getInterviewForApp = (app) => interviews.find(i => i.company === app.company);

  const handleDocUploadClick = (appId, docType) => {
    setCurrentUpload({ appId, docType });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUpload.appId) return;

    const { appId, docType } = currentUpload;
    setUploadingDoc(`${appId}-${docType}`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);

      await axios.post(`${API_BASE}/api/placements/applications/${appId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Refresh data to show updated URLs
      fetchData();
      alert(`${docType} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${docType}: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploadingDoc(null);
      setCurrentUpload({ appId: null, docType: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        <span className="ml-3 text-slate-600">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden file input for document uploads */}
      <input type="file" ref={fileInputRef} className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={handleFileSelected} />

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(f => (
          <button key={f.id} onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
              activeFilter === f.id ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeFilter === f.id ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Upcoming Interviews / Tests Notification */}
      {interviews.filter(i => i.status === 'Scheduled').length > 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-3">
            <Bell size={16} /> Upcoming Interviews & Tests
          </h3>
          <div className="space-y-2">
            {interviews.filter(i => i.status === 'Scheduled').map(intr => (
              <div key={intr.id} className="flex items-center justify-between rounded-lg bg-white p-3 text-sm">
                <div>
                  <span className="font-semibold text-slate-800">{intr.company}</span>
                  <span className="text-slate-500 ml-2">— {intr.round || 'Interview'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {intr.date}</span>
                  {intr.time && <span>{intr.time}</span>}
                  {intr.meetingLink && (
                    <a href={intr.meetingLink} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-700 font-medium">Join</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <ClipboardList size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-700">No applications found</h3>
          <p className="text-sm text-slate-500 mt-1">Apply to jobs from the Opportunities tab to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const cfg = statusConfig[app.status] || statusConfig.applied;
            const StatusIcon = cfg.icon;
            const interview = getInterviewForApp(app);
            const isExpanded = expandedApp === app.id;

            return (
              <div key={app.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-sm transition">
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedApp(isExpanded ? null : app.id)}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Building2 size={20} className="text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{app.position}</h4>
                      <p className="text-sm text-slate-500">{app.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${cfg.color}`}>
                      <StatusIcon size={12} /> {cfg.label}
                    </span>
                    {isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    {/* Status Tracker */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Application Progress</h5>
                      <div className="flex items-center gap-1">
                        {['Applied', 'Shortlisted', 'Interview', 'Selected'].map((step, i) => {
                          const stepKey = step.toLowerCase();
                          const currentIdx = statusFlow.indexOf(app.status === 'accepted' ? 'selected' : app.status);
                          const isActive = i <= currentIdx && app.status !== 'rejected';
                          const isRejected = app.status === 'rejected';
                          return (
                            <React.Fragment key={step}>
                              <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                                isRejected ? 'bg-red-50 text-red-400' : isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {isActive && !isRejected ? <CheckCircle size={12} /> : <Clock size={12} />}
                                {step}
                              </div>
                              {i < 3 && <div className={`h-0.5 w-8 ${isActive && i < currentIdx ? 'bg-sky-400' : 'bg-slate-200'}`} />}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interview Details */}
                    {interview && (
                      <div className="rounded-lg bg-purple-50 p-3">
                        <h5 className="text-xs font-bold text-purple-700 mb-2">Interview Details</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div><span className="text-slate-400">Round:</span> <span className="text-slate-700 font-medium">{interview.round || 'TBD'}</span></div>
                          <div><span className="text-slate-400">Date:</span> <span className="text-slate-700 font-medium">{interview.date || 'TBD'}</span></div>
                          <div><span className="text-slate-400">Time:</span> <span className="text-slate-700 font-medium">{interview.time || 'TBD'}</span></div>
                          <div><span className="text-slate-400">Status:</span> <span className="text-slate-700 font-medium">{interview.status}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Application Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-400">Applied On:</span> <span className="text-slate-700 font-medium ml-1">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</span></div>
                      <div><span className="text-slate-400">Offer Status:</span> <span className="text-slate-700 font-medium ml-1">{app.status === 'accepted' || app.status === 'selected' ? '✅ Offer Received' : 'Pending'}</span></div>
                    </div>

                    {/* Document Upload */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Upload Documents</h5>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Resume', key: 'Resume', urlField: 'resumeUrl' },
                          { label: 'Certificates', key: 'Certificates', urlField: 'certificatesUrl' },
                          { label: 'ID Proof', key: 'IDProof', urlField: 'idProofUrl' }
                        ].map(doc => {
                          const isUploading = uploadingDoc === `${app.id}-${doc.key}`;
                          const hasFile = app[doc.urlField];
                          return (
                            <div key={doc.key} className="flex items-center gap-1">
                              <button
                                onClick={() => handleDocUploadClick(app.id, doc.key)}
                                disabled={isUploading}
                                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                                  hasFile
                                    ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'border-dashed border-slate-300 text-slate-500 hover:border-sky-400 hover:text-sky-600'
                                }`}>
                                {isUploading ? <Loader2 size={14} className="animate-spin" /> : hasFile ? <CheckCircle size={14} /> : <Upload size={14} />}
                                {doc.label}
                              </button>
                              {hasFile && (
                                <a href={app[doc.urlField]?.startsWith('http') ? app[doc.urlField] : `${API_BASE}${app[doc.urlField]}`} target="_blank" rel="noreferrer"
                                  className="text-sky-600 hover:text-sky-700">
                                  <Eye size={14} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsTab;
