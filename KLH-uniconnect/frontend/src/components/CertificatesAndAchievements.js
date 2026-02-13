import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Award, Upload, CheckCircle, Clock, XCircle, Download, Share2, Eye,
  Search, Filter, Trophy, Star, Medal, BookOpen, FileText, BarChart3, Users,
  Globe, Shield, Plus, X, ChevronDown, ExternalLink, Copy, Trash2, TrendingUp,
  Calendar, MapPin, Briefcase, GraduationCap, Zap, Target, AlertCircle, Link
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const CERT_CATEGORIES = ['All', 'Internship', 'Workshop', 'Hackathon', 'Course', 'Sports', 'Research', 'Patent', 'Academic', 'Professional', 'Other'];
const ACHIEVEMENT_CATEGORIES = ['Academic Rank', 'Hackathon Win', 'Sports Medal', 'Research Paper', 'Patent', 'Cultural', 'Community Service', 'Other'];
const ACHIEVEMENT_LEVELS = ['University', 'State', 'National', 'International'];

const CertificatesAndAchievements = ({ studentId, onBack }) => {
  const [activeSection, setActiveSection] = useState('certificates');
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, achievements: 0 });
  const [achievementStats, setAchievementStats] = useState({ total: 0, verified: 0, totalPoints: 0, byCategory: {} });
  const [universityCerts, setUniversityCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const headers = { 'X-Student-Id': studentId || 'anonymous' };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [certsRes, statsRes, achieveRes, achieveStatsRes, uniRes] = await Promise.all([
        axios.get(`${API_BASE}/api/certificates`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/certificates/stats`, { headers }).catch(() => ({ data: { total: 0, verified: 0, pending: 0, achievements: 0 } })),
        axios.get(`${API_BASE}/api/certificates/achievements`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/certificates/achievements/stats`, { headers }).catch(() => ({ data: { total: 0, verified: 0, totalPoints: 0, byCategory: {} } })),
        axios.get(`${API_BASE}/api/certificates/university`, { headers }).catch(() => ({ data: [] }))
      ]);
      setCertificates(certsRes.data || []);
      setStats(statsRes.data || {});
      setAchievements(achieveRes.data || []);
      setAchievementStats(achieveStatsRes.data || {});
      setUniversityCerts(uniRes.data || []);
    } catch (err) { console.error('Fetch error:', err); }
    setLoading(false);
  }, [studentId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDownload = (cert) => {
    if (cert.fileUrl) window.open(cert.fileUrl.startsWith('http') ? cert.fileUrl : `${API_BASE}${cert.fileUrl}`, '_blank');
  };

  const handleShare = async (cert) => {
    try {
      const res = await axios.post(`${API_BASE}/api/certificates/${cert.id}/share`);
      setSelectedCert({ ...cert, shareLink: res.data.shareLink, fullUrl: res.data.fullUrl });
      setShowShareModal(true);
    } catch (err) { console.error('Share error:', err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await axios.delete(`${API_BASE}/api/certificates/${id}`, { headers });
      fetchAll();
    } catch (err) { console.error('Delete error:', err); }
  };

  const handleDeleteAchievement = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await axios.delete(`${API_BASE}/api/certificates/achievements/${id}`, { headers });
      fetchAll();
    } catch (err) { console.error('Delete error:', err); }
  };

  const filteredCerts = certificates.filter(c => {
    const matchSearch = !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.issuer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'All' || c.category === filterCategory;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const sections = [
    { id: 'certificates', label: 'My Certificates', icon: <FileText size={18} /> },
    { id: 'verification', label: 'Verification Status', icon: <Shield size={18} /> },
    { id: 'university', label: 'University Certificates', icon: <GraduationCap size={18} /> },
    { id: 'achievements', label: 'Achievements & Awards', icon: <Trophy size={18} /> },
    { id: 'analytics', label: 'Analytics & Portfolio', icon: <BarChart3 size={18} /> },
  ];

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

  // ============ UPLOAD MODAL ============
  const UploadModal = () => {
    const [form, setForm] = useState({ title: '', issuer: '', category: 'Professional', issueDate: '', description: '', credentialId: '', credentialUrl: '' });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileRef = React.useRef(null);

    const handleUpload = async () => {
      if (!form.title || !form.issuer || !file) { setUploadMsg('Title, issuer, and file are required'); return; }
      setUploading(true);
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('issuer', form.issuer);
      fd.append('category', form.category);
      fd.append('issueDate', form.issueDate);
      fd.append('description', form.description);
      fd.append('credentialId', form.credentialId);
      fd.append('credentialUrl', form.credentialUrl);
      fd.append('file', file);
      try {
        await axios.post(`${API_BASE}/api/certificates/upload`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        setShowUploadModal(false);
        setUploadMsg('');
        fetchAll();
      } catch (err) { setUploadMsg('Upload failed: ' + (err.response?.data?.error || err.message)); }
      setUploading(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Upload Certificate</h3>
            <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          {uploadMsg && <p className="mb-3 text-sm text-red-600">{uploadMsg}</p>}
          <div className="space-y-3">
            <input placeholder="Certificate Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input placeholder="Issuing Organization *" value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
              {CERT_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" rows={2} />
            <input placeholder="Credential ID (optional)" value={form.credentialId} onChange={e => setForm({...form, credentialId: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input placeholder="Credential URL (optional)" value={form.credentialUrl} onChange={e => setForm({...form, credentialUrl: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-400 transition">
              <Upload className="mx-auto mb-2 text-slate-400" size={28} />
              <p className="text-sm text-slate-600">{file ? file.name : 'Click to upload certificate file (PDF, JPG, PNG)'}</p>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => setFile(e.target.files?.[0])} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => setShowUploadModal(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleUpload} disabled={uploading} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload Certificate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ ACHIEVEMENT MODAL ============
  const AchievementModal = () => {
    const [form, setForm] = useState({ title: '', category: 'Academic Rank', description: '', date: '', level: 'University', position: '' });
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const fileRef = React.useRef(null);

    const handleSave = async () => {
      if (!form.title) return;
      setSaving(true);
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('date', form.date);
      fd.append('level', form.level);
      fd.append('position', form.position);
      if (file) fd.append('file', file);
      try {
        await axios.post(`${API_BASE}/api/certificates/achievements`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
        setShowAchievementModal(false);
        fetchAll();
      } catch (err) { console.error(err); }
      setSaving(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Add Achievement</h3>
            <button onClick={() => setShowAchievementModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="space-y-3">
            <input placeholder="Achievement Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {ACHIEVEMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {ACHIEVEMENT_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input placeholder="Position (e.g. 1st, Winner, Runner-up)" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={2} />
            <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-lg border-2 border-dashed border-slate-300 p-4 text-center hover:border-blue-400 transition">
              <Upload className="mx-auto mb-1 text-slate-400" size={22} />
              <p className="text-xs text-slate-600">{file ? file.name : 'Upload proof (optional)'}</p>
              <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0])} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => setShowAchievementModal(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Add Achievement'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============ SHARE MODAL ============
  const ShareModal = () => {
    if (!selectedCert) return null;
    const url = selectedCert.fullUrl || `${window.location.origin}/certificate/${selectedCert.shareLink}`;
    const copyLink = () => { navigator.clipboard.writeText(url); };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Share Certificate</h3>
            <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <p className="mb-2 text-sm font-semibold text-slate-700">{selectedCert.title}</p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input readOnly value={url} className="flex-1 bg-transparent text-xs text-slate-600 outline-none" />
            <button onClick={copyLink} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"><Copy size={14} /></button>
          </div>
          <div className="mt-4 flex gap-2">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-blue-700 py-2 text-center text-xs font-semibold text-white hover:bg-blue-800">LinkedIn</a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Check out my certificate: ' + selectedCert.title)}`} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-sky-500 py-2 text-center text-xs font-semibold text-white hover:bg-sky-600">Twitter</a>
          </div>
        </div>
      </div>
    );
  };

  // ============ SECTION 1: MY CERTIFICATES ============
  const renderCertificates = () => (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search certificates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {CERT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
          <Upload size={16} />Upload Certificate
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>
      ) : filteredCerts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <FileText className="mx-auto mb-3 text-slate-300" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No certificates yet</h3>
          <p className="mt-1 text-sm text-slate-500">Upload your first certificate to get started</p>
          <button onClick={() => setShowUploadModal(true)} className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700">Upload Certificate</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCerts.map(cert => (
            <div key={cert.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                    <Award size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{cert.title}</h4>
                    <p className="text-sm text-slate-600">{cert.issuer}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {cert.category && <span className="rounded-full bg-slate-100 px-2 py-0.5">{cert.category}</span>}
                      {cert.issueDate && <span>{cert.issueDate}</span>}
                      {statusBadge(cert.status)}
                    </div>
                    {cert.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{cert.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {cert.fileUrl && <button onClick={() => handleDownload(cert)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600" title="Download"><Download size={16} /></button>}
                  <button onClick={() => handleShare(cert)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600" title="Share"><Share2 size={16} /></button>
                  <button onClick={() => handleDelete(cert.id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ SECTION 2: VERIFICATION STATUS ============
  const renderVerification = () => {
    const pending = certificates.filter(c => c.status === 'pending');
    const approved = certificates.filter(c => c.status === 'approved' || c.status === 'verified');
    const rejected = certificates.filter(c => c.status === 'rejected');
    return (
      <div>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-3"><Clock className="text-yellow-600" size={24} /><div><p className="text-2xl font-black text-yellow-700">{pending.length}</p><p className="text-xs text-yellow-600">Pending Review</p></div></div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3"><CheckCircle className="text-emerald-600" size={24} /><div><p className="text-2xl font-black text-emerald-700">{approved.length}</p><p className="text-xs text-emerald-600">Approved / Verified</p></div></div>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3"><XCircle className="text-red-600" size={24} /><div><p className="text-2xl font-black text-red-700">{rejected.length}</p><p className="text-xs text-red-600">Rejected</p></div></div>
          </div>
        </div>
        {pending.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900"><Clock size={20} className="text-yellow-600" />Pending Verification</h3>
            <div className="space-y-2">{pending.map(cert => (
              <div key={cert.id} className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50/50 p-4">
                <div><h4 className="font-semibold text-slate-900">{cert.title}</h4><p className="text-xs text-slate-600">{cert.issuer} &middot; Submitted {cert.uploadDate}</p></div>
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Awaiting Review</span>
              </div>
            ))}</div>
          </div>
        )}
        {rejected.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900"><XCircle size={20} className="text-red-600" />Rejected</h3>
            <div className="space-y-2">{rejected.map(cert => (
              <div key={cert.id} className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                <div className="flex items-center justify-between"><h4 className="font-semibold text-slate-900">{cert.title}</h4><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Rejected</span></div>
                {cert.rejectionReason && <p className="mt-1 text-sm text-red-600">Reason: {cert.rejectionReason}</p>}
                {cert.reviewedBy && <p className="mt-0.5 text-xs text-slate-500">Reviewed by: {cert.reviewedBy}</p>}
              </div>
            ))}</div>
          </div>
        )}
        {approved.length > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900"><CheckCircle size={20} className="text-emerald-600" />Approved & Verified</h3>
            <div className="space-y-2">{approved.map(cert => (
              <div key={cert.id} className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="text-emerald-600" size={20} />
                  <div><h4 className="font-semibold text-slate-900">{cert.title}</h4><p className="text-xs text-slate-600">{cert.issuer} &middot; {cert.approvedDate || cert.uploadDate}</p></div>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"><CheckCircle size={12} />University Verified</span>
              </div>
            ))}</div>
          </div>
        )}
      </div>
    );
  };

  // ============ SECTION 3: UNIVERSITY CERTIFICATES ============
  const renderUniversityCerts = () => (
    <div>
      <div className="mb-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="flex items-center gap-3"><GraduationCap size={28} className="text-purple-600" /><div><h3 className="text-lg font-bold text-slate-900">University-Issued Certificates</h3><p className="text-sm text-slate-600">Official certificates generated by KL University for courses, workshops, and events</p></div></div>
      </div>
      {universityCerts.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <GraduationCap className="mx-auto mb-3 text-slate-300" size={48} />
          <h3 className="text-lg font-bold text-slate-700">No university certificates yet</h3>
          <p className="mt-1 text-sm text-slate-500">University certificates will appear here when issued by faculty</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {universityCerts.map(cert => (
            <div key={cert.id} className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                  <Award size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{cert.title}</h4>
                  <p className="text-sm text-slate-600">{cert.eventName || 'KL University'}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700"><Shield size={10} />Official</span>
                    {cert.issueDate && <span className="text-xs text-slate-500">{cert.issueDate}</span>}
                  </div>
                  {cert.signature && <p className="mt-1 text-xs text-slate-500">Signed by: {cert.signature}</p>}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {cert.fileUrl && <button onClick={() => handleDownload(cert)} className="flex items-center gap-1 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100"><Download size={14} />Download</button>}
                <button onClick={() => handleShare(cert)} className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"><Share2 size={14} />Share</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ SECTION 4: ACHIEVEMENTS & AWARDS ============
  const renderAchievements = () => {
    const levelIcon = (level) => {
      const map = { International: <Globe size={16} className="text-blue-600" />, National: <MapPin size={16} className="text-emerald-600" />, State: <Star size={16} className="text-yellow-600" />, University: <GraduationCap size={16} className="text-purple-600" /> };
      return map[level] || <Star size={16} className="text-slate-400" />;
    };
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Achievements & Awards</h3>
            <p className="text-sm text-slate-600">Track your academic, sports, hackathon wins, research papers, and more</p>
          </div>
          <button onClick={() => setShowAchievementModal(true)} className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"><Plus size={16} />Add Achievement</button>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-900">{achievementStats.total || 0}</p><p className="text-xs text-slate-600">Total</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-emerald-600">{achievementStats.verified || 0}</p><p className="text-xs text-slate-600">Verified</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-purple-600">{achievementStats.totalPoints || 0}</p><p className="text-xs text-slate-600">Total Points</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{Object.keys(achievementStats.byCategory || {}).length}</p><p className="text-xs text-slate-600">Categories</p>
          </div>
        </div>
        {achievements.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Trophy className="mx-auto mb-3 text-slate-300" size={48} />
            <h3 className="text-lg font-bold text-slate-700">No achievements recorded</h3>
            <p className="mt-1 text-sm text-slate-500">Add your first achievement to build your portfolio</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map(a => (
              <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-100 to-orange-100">
                      <Trophy size={20} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{a.title}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{a.category}</span>
                        <span className="flex items-center gap-1">{levelIcon(a.level)}{a.level}</span>
                        {a.position && <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-700">{a.position}</span>}
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">{a.points} pts</span>
                        {statusBadge(a.status)}
                      </div>
                      {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAchievement(a.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============ SECTION 5: ANALYTICS & PORTFOLIO ============
  const renderAnalytics = () => {
    const totalCerts = stats.total || 0;
    const verifiedCerts = stats.verified || 0;
    const verifiedPct = totalCerts > 0 ? Math.round((verifiedCerts / totalCerts) * 100) : 0;
    const categoryBreakdown = {};
    certificates.forEach(c => { if (c.category) categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1; });
    const maxCat = Math.max(...Object.values(categoryBreakdown), 1);

    return (
      <div>
        <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">Analytics Dashboard</h3>
          <p className="text-sm text-slate-600">Your certification and achievement overview</p>
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <TrendingUp className="mx-auto mb-2 text-blue-600" size={28} />
            <p className="text-3xl font-black text-slate-900">{totalCerts}</p>
            <p className="text-xs text-slate-600">Total Certificates</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <CheckCircle className="mx-auto mb-2 text-emerald-600" size={28} />
            <p className="text-3xl font-black text-emerald-600">{verifiedPct}%</p>
            <p className="text-xs text-slate-600">Verification Rate</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <Trophy className="mx-auto mb-2 text-purple-600" size={28} />
            <p className="text-3xl font-black text-purple-600">{achievementStats.totalPoints || 0}</p>
            <p className="text-xs text-slate-600">Achievement Points</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
            <Target className="mx-auto mb-2 text-orange-600" size={28} />
            <p className="text-3xl font-black text-orange-600">{verifiedCerts >= 5 ? 'Ready' : 'Building'}</p>
            <p className="text-xs text-slate-600">Placement Readiness</p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-bold text-slate-900">Category Breakdown</h4>
            {Object.keys(categoryBreakdown).length === 0 ? (
              <p className="text-sm text-slate-500">No data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm"><span className="text-slate-700">{cat}</span><span className="font-bold text-slate-900">{count}</span></div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700" style={{ width: `${(count / maxCat) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-bold text-slate-900">Achievement Categories</h4>
            {Object.keys(achievementStats.byCategory || {}).length === 0 ? (
              <p className="text-sm text-slate-500">No data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(achievementStats.byCategory || {}).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-700">{cat}</span>
                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
          <Globe className="mx-auto mb-3 text-blue-600" size={32} />
          <h4 className="text-lg font-bold text-slate-900">Public Portfolio</h4>
          <p className="mt-1 text-sm text-slate-600">Share your verified certificates and achievements with recruiters</p>
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/portfolio/${studentId}`); }} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Link size={16} />Copy Portfolio Link
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button onClick={onBack} className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"><ArrowLeft size={18} />Back to Dashboard</button>
          <h1 className="text-3xl font-black text-slate-900">Certificates & Achievements</h1>
          <p className="mt-1 text-slate-600">Upload, track, and showcase your credentials</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats Row */}
        <div className={`mb-6 grid gap-4 md:grid-cols-4 transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: 'Total Certificates', value: stats.total || 0, icon: <FileText size={22} className="text-blue-600" />, bg: 'from-blue-50 to-blue-100' },
            { label: 'Verified', value: stats.verified || 0, icon: <CheckCircle size={22} className="text-emerald-600" />, bg: 'from-emerald-50 to-emerald-100' },
            { label: 'Pending', value: stats.pending || 0, icon: <Clock size={22} className="text-yellow-600" />, bg: 'from-yellow-50 to-yellow-100' },
            { label: 'Achievements', value: stats.achievements || 0, icon: <Trophy size={22} className="text-purple-600" />, bg: 'from-purple-50 to-purple-100' }
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border border-slate-200 bg-gradient-to-br ${s.bg} p-4`}>
              <div className="flex items-center gap-3">{s.icon}<div><p className="text-2xl font-black text-slate-900">{s.value}</p><p className="text-xs text-slate-600">{s.label}</p></div></div>
            </div>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeSection === s.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}>{s.icon}{s.label}</button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {activeSection === 'certificates' && renderCertificates()}
          {activeSection === 'verification' && renderVerification()}
          {activeSection === 'university' && renderUniversityCerts()}
          {activeSection === 'achievements' && renderAchievements()}
          {activeSection === 'analytics' && renderAnalytics()}
        </div>
      </main>

      {showUploadModal && <UploadModal />}
      {showAchievementModal && <AchievementModal />}
      {showShareModal && <ShareModal />}
    </div>
  );
};

export default CertificatesAndAchievements;
