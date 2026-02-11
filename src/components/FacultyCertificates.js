import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Award, CheckCircle, Clock, XCircle, Download, Search, Filter,
  Trophy, Star, Shield, Eye, FileText, BarChart3, Users, GraduationCap,
  Send, AlertCircle, ChevronDown, Plus, X, TrendingUp, Target, Globe, Zap, BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyCertificates = ({ email = '', onBack = () => {} }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [certsRes, achieveRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/certificates/faculty/all`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/certificates/achievements/faculty/all`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/certificates/faculty/analytics`).catch(() => ({ data: {} }))
      ]);
      setCertificates(certsRes.data || []);
      setAchievements(achieveRes.data || []);
      setAnalytics(analyticsRes.data || {});
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (id, note = '') => {
    setActionLoading(prev => ({ ...prev, [id]: 'approve' }));
    try {
      await axios.put(`${API_BASE}/api/certificates/faculty/${id}/approve`, { facultyEmail: email, note });
      setActionMsg('Certificate approved successfully');
      fetchAll();
    } catch (err) { setActionMsg('Failed to approve'); }
    setActionLoading(prev => ({ ...prev, [id]: null }));
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setActionLoading(prev => ({ ...prev, [id]: 'reject' }));
    try {
      await axios.put(`${API_BASE}/api/certificates/faculty/${id}/reject`, { facultyEmail: email, reason });
      setActionMsg('Certificate rejected');
      fetchAll();
    } catch (err) { setActionMsg('Failed to reject'); }
    setActionLoading(prev => ({ ...prev, [id]: null }));
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleVerifyAchievement = async (id) => {
    setActionLoading(prev => ({ ...prev, [`ach-${id}`]: 'verify' }));
    try {
      await axios.put(`${API_BASE}/api/certificates/achievements/faculty/${id}/verify`, { facultyEmail: email, note: 'Verified by faculty' });
      setActionMsg('Achievement verified');
      fetchAll();
    } catch (err) { setActionMsg('Failed to verify achievement'); }
    setActionLoading(prev => ({ ...prev, [`ach-${id}`]: null }));
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleRejectAchievement = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setActionLoading(prev => ({ ...prev, [`ach-${id}`]: 'reject' }));
    try {
      await axios.put(`${API_BASE}/api/certificates/achievements/faculty/${id}/reject`, { facultyEmail: email, reason });
      setActionMsg('Achievement rejected');
      fetchAll();
    } catch (err) { setActionMsg('Failed to reject achievement'); }
    setActionLoading(prev => ({ ...prev, [`ach-${id}`]: null }));
    setTimeout(() => setActionMsg(''), 3000);
  };

  const statusBadge = (status) => {
    const map = {
      approved: { bg: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={12} />, label: 'Approved' },
      verified: { bg: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle size={12} />, label: 'Verified' },
      pending: { bg: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} />, label: 'Pending' },
      rejected: { bg: 'bg-red-100 text-red-700', icon: <XCircle size={12} />, label: 'Rejected' },
    };
    const s = map[status] || map.pending;
    return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${s.bg}`}>{s.icon}{s.label}</span>;
  };

  const filteredCerts = certificates.filter(c => {
    const matchSearch = !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchCategory = filterCategory === 'All' || c.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const pendingCerts = certificates.filter(c => c.status === 'pending');
  const pendingAchievements = achievements.filter(a => a.status === 'pending');

  const tabs = [
    { id: 'pending', label: 'Pending Review', icon: <Clock size={18} />, badge: pendingCerts.length + pendingAchievements.length },
    { id: 'all', label: 'All Certificates', icon: <FileText size={18} /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy size={18} /> },
    { id: 'generate', label: 'Generate Certificate', icon: <GraduationCap size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  // ============ GENERATE UNIVERSITY CERT MODAL ============
  const GenerateModal = () => {
    const [form, setForm] = useState({ studentId: '', studentName: '', title: '', eventName: '', templateName: 'Standard', signature: '', department: '' });
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
      if (!form.studentId || !form.title) return;
      setGenerating(true);
      try {
        await axios.post(`${API_BASE}/api/certificates/faculty/generate`, { ...form, facultyEmail: email });
        setShowGenerateModal(false);
        setActionMsg('University certificate generated successfully!');
        fetchAll();
      } catch (err) { setActionMsg('Failed to generate certificate'); }
      setGenerating(false);
      setTimeout(() => setActionMsg(''), 3000);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Generate University Certificate</h3>
            <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="space-y-3">
            <input placeholder="Student ID *" value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input placeholder="Student Name" value={form.studentName} onChange={e => setForm({...form, studentName: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input placeholder="Certificate Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input placeholder="Event / Course Name" value={form.eventName} onChange={e => setForm({...form, eventName: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input placeholder="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <select value={form.templateName} onChange={e => setForm({...form, templateName: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="Standard">Standard Template</option>
              <option value="Workshop">Workshop Completion</option>
              <option value="Course">Course Completion</option>
              <option value="Achievement">Achievement Award</option>
              <option value="Participation">Participation Certificate</option>
            </select>
            <input placeholder="Signature / Signed by" value={form.signature} onChange={e => setForm({...form, signature: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => setShowGenerateModal(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleGenerate} disabled={generating} className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Certificate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ TAB: PENDING REVIEW ============
  const renderPending = () => (
    <div>
      {pendingCerts.length === 0 && pendingAchievements.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <CheckCircle className="mx-auto mb-3 text-emerald-400" size={48} />
          <h3 className="text-lg font-bold text-slate-700">All caught up!</h3>
          <p className="mt-1 text-sm text-slate-500">No pending items to review</p>
        </div>
      ) : (
        <>
          {pendingCerts.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <FileText size={20} className="text-yellow-600" />Pending Certificates ({pendingCerts.length})
              </h3>
              <div className="space-y-3">
                {pendingCerts.map(cert => (
                  <div key={cert.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{cert.title}</h4>
                        <p className="text-sm text-slate-600">{cert.issuer}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-blue-600">Student: {cert.studentId}</span>
                          {cert.category && <span className="rounded-full bg-slate-100 px-2 py-0.5">{cert.category}</span>}
                          {cert.issueDate && <span>{cert.issueDate}</span>}
                        </div>
                        {cert.description && <p className="mt-1 text-xs text-slate-500">{cert.description}</p>}
                        {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><Globe size={12} />Verify Credential</a>}
                      </div>
                      <div className="flex items-center gap-2">
                        {cert.fileUrl && <a href={`${API_BASE}${cert.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200" title="View file"><Eye size={16} /></a>}
                        <button onClick={() => handleApprove(cert.id)} disabled={actionLoading[cert.id] === 'approve'} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                          {actionLoading[cert.id] === 'approve' ? '...' : 'Approve'}
                        </button>
                        <button onClick={() => handleReject(cert.id)} disabled={actionLoading[cert.id] === 'reject'} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                          {actionLoading[cert.id] === 'reject' ? '...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pendingAchievements.length > 0 && (
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <Trophy size={20} className="text-yellow-600" />Pending Achievements ({pendingAchievements.length})
              </h3>
              <div className="space-y-3">
                {pendingAchievements.map(a => (
                  <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{a.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-blue-600">Student: {a.studentId}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{a.category}</span>
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">{a.level}</span>
                          {a.position && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">{a.position}</span>}
                        </div>
                        {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {a.proofUrl && <a href={`${API_BASE}${a.proofUrl}`} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><Eye size={16} /></a>}
                        <button onClick={() => handleVerifyAchievement(a.id)} disabled={actionLoading[`ach-${a.id}`] === 'verify'} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                          {actionLoading[`ach-${a.id}`] === 'verify' ? '...' : 'Verify'}
                        </button>
                        <button onClick={() => handleRejectAchievement(a.id)} disabled={actionLoading[`ach-${a.id}`] === 'reject'} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                          {actionLoading[`ach-${a.id}`] === 'reject' ? '...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ============ TAB: ALL CERTIFICATES ============
  const renderAllCertificates = () => (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by title or student..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="verified">Verified</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="All">All Categories</option>
          {['Internship', 'Workshop', 'Hackathon', 'Course', 'Sports', 'Research', 'Patent', 'Academic', 'Professional', 'University', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {filteredCerts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FileText className="mx-auto mb-3 text-slate-300" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No certificates found</h3>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="pb-3 pr-4">Certificate</th>
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map(cert => (
                <tr key={cert.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-900">{cert.title}</p>
                    <p className="text-xs text-slate-500">{cert.issuer}</p>
                  </td>
                  <td className="py-3 pr-4 text-sm text-slate-700">{cert.studentId}</td>
                  <td className="py-3 pr-4"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{cert.category}</span></td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{cert.issueDate || cert.uploadDate}</td>
                  <td className="py-3 pr-4">{statusBadge(cert.status)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {cert.fileUrl && <a href={`${API_BASE}${cert.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"><Eye size={14} /></a>}
                      {cert.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(cert.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600" title="Approve"><CheckCircle size={14} /></button>
                          <button onClick={() => handleReject(cert.id)} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-100 hover:text-red-600" title="Reject"><XCircle size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ============ TAB: ACHIEVEMENTS ============
  const renderAchievements = () => (
    <div>
      <h3 className="mb-4 text-lg font-bold text-slate-900">Student Achievements</h3>
      {achievements.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Trophy className="mx-auto mb-3 text-slate-300" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No achievements submitted yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map(a => (
            <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
                    <Trophy size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{a.title}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-blue-600">Student: {a.studentId}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{a.category}</span>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">{a.level}</span>
                      {a.position && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">{a.position}</span>}
                      <span className="font-semibold">{a.points} pts</span>
                      {statusBadge(a.status)}
                    </div>
                    {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.proofUrl && <a href={`${API_BASE}${a.proofUrl}`} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><Eye size={14} /></a>}
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => handleVerifyAchievement(a.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Verify</button>
                      <button onClick={() => handleRejectAchievement(a.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Reject</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ TAB: GENERATE CERTIFICATE ============
  const renderGenerate = () => (
    <div>
      <div className="mb-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="flex items-center gap-3">
          <GraduationCap size={32} className="text-purple-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Generate University Certificates</h3>
            <p className="text-sm text-slate-600">Create official KL University certificates for students who completed courses, workshops, or events</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { template: 'Course Completion', desc: 'For students who completed academic courses', icon: <BookOpen size={24} className="text-blue-600" />, bg: 'from-blue-50 to-blue-100' },
          { template: 'Workshop Participation', desc: 'For workshop and training attendees', icon: <Users size={24} className="text-emerald-600" />, bg: 'from-emerald-50 to-emerald-100' },
          { template: 'Achievement Award', desc: 'For outstanding academic or extracurricular achievements', icon: <Award size={24} className="text-purple-600" />, bg: 'from-purple-50 to-purple-100' },
          { template: 'Hackathon Certificate', desc: 'For hackathon participants and winners', icon: <Zap size={24} className="text-orange-600" />, bg: 'from-orange-50 to-orange-100' },
          { template: 'Sports Certificate', desc: 'For sports achievements and participation', icon: <Trophy size={24} className="text-yellow-600" />, bg: 'from-yellow-50 to-yellow-100' },
          { template: 'Custom Certificate', desc: 'Create a custom certificate with your own template', icon: <FileText size={24} className="text-slate-600" />, bg: 'from-slate-50 to-slate-100' },
        ].map((item, idx) => (
          <div key={idx} className={`rounded-xl border border-slate-200 bg-gradient-to-br ${item.bg} p-5 hover:shadow-md transition cursor-pointer`} onClick={() => setShowGenerateModal(true)}>
            <div className="mb-3">{item.icon}</div>
            <h4 className="font-bold text-slate-900">{item.template}</h4>
            <p className="mt-1 text-xs text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button onClick={() => setShowGenerateModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700">
          <Plus size={18} />Generate New Certificate
        </button>
      </div>
    </div>
  );

  // ============ TAB: ANALYTICS ============
  const renderAnalytics = () => {
    const { totalCertificates = 0, pending = 0, approved = 0, rejected = 0, universityIssued = 0, byCategory = {}, topStudents = [], totalAchievements = 0, verifiedAchievements = 0 } = analytics;
    const maxCat = Math.max(...Object.values(byCategory), 1);
    return (
      <div>
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          {[
            { label: 'Total', value: totalCertificates, icon: <FileText size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending', value: pending, icon: <Clock size={20} />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Approved', value: approved, icon: <CheckCircle size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Rejected', value: rejected, icon: <XCircle size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'University Issued', value: universityIssued, icon: <GraduationCap size={20} />, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border border-slate-200 ${s.bg} p-4 text-center`}>
              <div className={`mx-auto mb-1 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-bold text-slate-900">Certificates by Category</h4>
            {Object.keys(byCategory).length === 0 ? <p className="text-sm text-slate-500">No data yet</p> : (
              <div className="space-y-3">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm"><span className="text-slate-700">{cat}</span><span className="font-bold">{count}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${(count / maxCat) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-bold text-slate-900">Top Achievers</h4>
            {topStudents.length === 0 ? <p className="text-sm text-slate-500">No data yet</p> : (
              <div className="space-y-2">
                {topStudents.map((s, i) => (
                  <div key={s.studentId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-slate-300'}`}>{i + 1}</span>
                      <span className="text-sm font-semibold text-slate-700">{s.studentId}</span>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">{s.count} certs</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5">
            <h4 className="font-bold text-slate-900">Achievement Summary</h4>
            <div className="mt-3 flex items-center gap-6">
              <div><p className="text-2xl font-black text-purple-600">{totalAchievements}</p><p className="text-xs text-slate-600">Total Achievements</p></div>
              <div><p className="text-2xl font-black text-emerald-600">{verifiedAchievements}</p><p className="text-xs text-slate-600">Verified</p></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-5">
            <h4 className="font-bold text-slate-900">Verification Rate</h4>
            <p className="mt-3 text-3xl font-black text-emerald-600">{totalCertificates > 0 ? Math.round((approved / totalCertificates) * 100) : 0}%</p>
            <p className="text-xs text-slate-600">of certificates are approved</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button onClick={onBack} className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft size={18} />Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900">Certificates & Achievements Management</h1>
          <p className="mt-1 text-slate-600">Review, verify, and manage student certificates and achievements</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Action message */}
        {actionMsg && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700">{actionMsg}</div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}>
                {tab.icon}{tab.label}
                {tab.badge > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{tab.badge}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>
          ) : (
            <>
              {activeTab === 'pending' && renderPending()}
              {activeTab === 'all' && renderAllCertificates()}
              {activeTab === 'achievements' && renderAchievements()}
              {activeTab === 'generate' && renderGenerate()}
              {activeTab === 'analytics' && renderAnalytics()}
            </>
          )}
        </div>
      </main>

      {showGenerateModal && <GenerateModal />}
    </div>
  );
};

export default FacultyCertificates;
