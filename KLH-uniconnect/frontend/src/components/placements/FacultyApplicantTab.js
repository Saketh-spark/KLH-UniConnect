import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, Search, Filter, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  Calendar, Star, Award, MessageCircle, UserCheck, UserX, Mail, Download,
  Briefcase, GraduationCap, BarChart3, FileText
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyApplicantTab = ({ email, onBack }) => {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedApp, setExpandedApp] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingFor, setSchedulingFor] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    round: 'Technical', date: '', time: '', meetingLink: ''
  });

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds 
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, jobsRes, intRes] = await Promise.all([
        axios.get(`${API_BASE}/api/placements/applications`),
        axios.get(`${API_BASE}/api/placements/jobs`),
        axios.get(`${API_BASE}/api/placements/interviews`),
      ]);
      setApplications(appsRes.data || []);
      setJobs(jobsRes.data || []);
      setInterviews(intRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/placements/applications/${appId}/status`, { status: newStatus });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!schedulingFor) return;
    try {
      await axios.post(`${API_BASE}/api/placements/interviews`, {
        studentId: schedulingFor.studentId,
        studentName: schedulingFor.studentName,
        company: schedulingFor.company,
        ...scheduleForm,
        status: 'Scheduled',
      });
      setShowScheduleModal(false);
      setSchedulingFor(null);
      setScheduleForm({ round: 'Technical', date: '', time: '', meetingLink: '' });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const statusCounts = {
    all: applications.length,
    Applied: applications.filter(a => a.status === 'Applied').length,
    Shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    Selected: applications.filter(a => a.status === 'Selected').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  const filtered = applications.filter(a => {
    const matchJob = selectedJob === 'all' || a.jobId === selectedJob;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch = !searchTerm || a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.company?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchJob && matchStatus && matchSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-700';
      case 'Shortlisted': return 'bg-amber-100 text-amber-700';
      case 'Interview': return 'bg-purple-100 text-purple-700';
      case 'Selected': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Clock className="animate-spin text-sky-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Search by student name, email, or company..." />
        </div>
        <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.position} - {j.company}</option>)}
        </select>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button key={status} onClick={() => setStatusFilter(status)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
              statusFilter === status ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {status === 'all' ? 'All' : status}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              statusFilter === status ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: statusCounts.all, icon: Users, color: 'text-slate-600' },
          { label: 'Shortlisted', value: statusCounts.Shortlisted, icon: UserCheck, color: 'text-amber-600' },
          { label: 'In Interview', value: statusCounts.Interview, icon: MessageCircle, color: 'text-purple-600' },
          { label: 'Selected', value: statusCounts.Selected, icon: Award, color: 'text-green-600' },
          { label: 'Rejected', value: statusCounts.Rejected, icon: UserX, color: 'text-red-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <Icon size={16} className={`mx-auto mb-1 ${s.color}`} />
              <div className="text-lg font-black text-slate-800">{s.value}</div>
              <div className="text-[10px] text-slate-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Applicant List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Users size={48} className="mx-auto mb-3 opacity-40" />
          <p>No applicants found for the selected filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const appInterviews = interviews.filter(iv => iv.studentId === app.studentId && iv.company === app.company);
            return (
              <div key={app.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                      {app.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{app.studentName}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{app.studentEmail}</span>
                        <span className="flex items-center gap-1"><Briefcase size={10} /> {app.position} at {app.company}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusColor(app.status)}`}>{app.status}</span>
                    {expandedApp === app.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {expandedApp === app.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                      <div><span className="text-xs text-slate-400">Applied On</span><div className="font-medium">{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</div></div>
                      <div><span className="text-xs text-slate-400">Student ID</span><div className="font-medium">{app.studentId || 'N/A'}</div></div>
                      <div><span className="text-xs text-slate-400">Position</span><div className="font-medium">{app.position}</div></div>
                      <div><span className="text-xs text-slate-400">Company</span><div className="font-medium">{app.company}</div></div>
                    </div>

                    {/* Interview History */}
                    {appInterviews.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-xs font-bold text-slate-600 mb-2">Interview History</h5>
                        <div className="space-y-2">
                          {appInterviews.map((iv, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-white border border-slate-100 p-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-purple-500" />
                                <span className="font-medium">{iv.round}</span>
                                <span className="text-slate-400">{iv.date} {iv.time}</span>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 font-bold ${
                                iv.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                iv.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-100 text-slate-700'
                              }`}>{iv.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Student Documents */}
                    {(app.resumeUrl || app.certificatesUrl || app.idProofUrl) && (
                      <div className="mb-4">
                        <h5 className="text-xs font-bold text-slate-600 mb-2">Student Documents</h5>
                        <div className="flex flex-wrap gap-2">
                          {app.resumeUrl && (
                            <a href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `${API_BASE}${app.resumeUrl}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition">
                              <FileText size={14} /> Resume
                              <Download size={12} />
                            </a>
                          )}
                          {app.certificatesUrl && (
                            <a href={app.certificatesUrl?.startsWith('http') ? app.certificatesUrl : `${API_BASE}${app.certificatesUrl}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition">
                              <Award size={14} /> Certificates
                              <Download size={12} />
                            </a>
                          )}
                          {app.idProofUrl && (
                            <a href={app.idProofUrl?.startsWith('http') ? app.idProofUrl : `${API_BASE}${app.idProofUrl}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 transition">
                              <GraduationCap size={14} /> ID Proof
                              <Download size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {app.status === 'Applied' && (
                        <>
                          <button onClick={() => updateStatus(app.id, 'Shortlisted')}
                            className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
                            <UserCheck size={12} /> Shortlist
                          </button>
                          <button onClick={() => updateStatus(app.id, 'Rejected')}
                            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                            <UserX size={12} /> Reject
                          </button>
                        </>
                      )}
                      {(app.status === 'Shortlisted' || app.status === 'Interview') && (
                        <>
                          <button onClick={() => { setSchedulingFor(app); setShowScheduleModal(true); }}
                            className="flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100">
                            <Calendar size={12} /> Schedule Interview
                          </button>
                          <button onClick={() => updateStatus(app.id, 'Selected')}
                            className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
                            <Award size={12} /> Select
                          </button>
                          <button onClick={() => updateStatus(app.id, 'Rejected')}
                            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                            <UserX size={12} /> Reject
                          </button>
                        </>
                      )}
                      <button onClick={() => window.open(`mailto:${app.studentEmail}?subject=Regarding Your Application for ${app.jobTitle} at ${app.company}&body=Dear ${app.studentName},`, '_blank')}
                        className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                        <Mail size={12} /> Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Schedule Interview</h3>
            <p className="text-sm text-slate-500 mb-4">{schedulingFor?.studentName} — {schedulingFor?.company}</p>
            <form onSubmit={handleScheduleInterview} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Round *</label>
                <select value={scheduleForm.round} onChange={e => setScheduleForm({ ...scheduleForm, round: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  {['Aptitude Test', 'Coding Test', 'Technical', 'Group Discussion', 'HR', 'Final'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                  <input type="date" required value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Time *</label>
                  <input type="time" required value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Meeting Link</label>
                <input value={scheduleForm.meetingLink} onChange={e => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="https://meet.google.com/..." />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
                <button type="submit" className="rounded-lg bg-purple-600 text-white px-6 py-2 text-sm font-medium hover:bg-purple-700">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyApplicantTab;
