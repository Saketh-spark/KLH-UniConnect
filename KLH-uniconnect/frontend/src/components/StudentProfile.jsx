import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, User, GraduationCap, FileText, Trophy, Settings, Edit3, Save, X,
  Camera, Mail, Phone, MapPin, Calendar, Heart, Droplets, Book,
  Upload, Download, Shield, Plus, Trash2, Briefcase, Star, Award, Code,
  Globe, Moon, Sun, Bell, Lock, CheckCircle2, TrendingUp, Zap,
  ExternalLink, Sparkles, ChevronRight, Clock, Percent
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ══════════ Stable sub-components (outside to keep identity across renders) ══════════ */

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/60 bg-white/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)] backdrop-blur-sm transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,.06),0_12px_32px_rgba(0,0,0,.06)] ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, color = 'indigo', action }) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${color}-100`}>
        <Icon size={18} className={`text-${color}-600`} />
      </div>
      <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon: Ic, title, sub }) => (
  <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 py-10 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
      <Ic size={24} className="text-slate-300" />
    </div>
    <p className="text-sm font-semibold text-slate-500">{title}</p>
    {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
  </div>
);

/* ══════════ Main Component ══════════ */

export default function StudentProfile({ email, onBack, defaultTab }) {
  const [tab, setTab]         = useState(defaultTab || 'personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [edit, setEdit]       = useState(false);
  const [form, setForm]       = useState({});
  const [toast, setToast]     = useState('');
  const [uploading, setUploading] = useState(false);
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const { language: globalLanguage, setLanguage: setGlobalLanguage, t } = useLanguage();

  const tabs = [
    { id: 'personal',  label: 'Personal',  icon: User },
    { id: 'academic',  label: 'Academics',  icon: GraduationCap },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'portfolio', label: 'Portfolio', icon: Trophy },
    { id: 'settings',  label: 'Settings',  icon: Settings },
  ];

  /* ─── data ─── */
  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/students/profile`, { params: { email } });
      setProfile(data);
      // Normalize theme to lowercase for consistency with context
      const normalized = structuredClone(data);
      if (normalized.theme === 'Light' || normalized.theme === 'Dark') {
        normalized.theme = normalized.theme.toLowerCase();
      }
      if (!normalized.theme) normalized.theme = globalTheme;
      if (!normalized.language) normalized.language = globalLanguage;
      setForm(normalized);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [email, globalTheme, globalLanguage]);

  useEffect(() => { fetch_(); }, [fetch_]);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/api/students/profile`, { ...form, email });
      setProfile(data); setForm(structuredClone(data)); setEdit(false);
      notify('Profile updated successfully');
    } catch { notify('Save failed – please retry'); }
    setSaving(false);
  };

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  /* ─── uploads ─── */
  const upload = async (e, field) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) { notify('File too large (max 10 MB)'); return; }
    setUploading(true);
    const fd = new FormData(); fd.append('file', f);
    try {
      const { data } = await axios.post(`${API}/api/students/profile/upload-certificate`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      set(field, data.url);
      // Auto-save to database immediately so it persists
      await axios.put(`${API}/api/students/profile`, { email, [field]: data.url });
      setProfile(p => p ? { ...p, [field]: data.url } : p);
      notify('Uploaded & saved!');
    } catch (err) { console.error('Upload error:', err); notify('Upload failed – ' + (err.response?.data?.error || 'try again')); }
    setUploading(false);
  };

  const uploadDoc = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) { notify('File too large (max 10 MB)'); return; }
    setUploading(true);
    const fd = new FormData(); fd.append('file', f); fd.append('email', email);
    try {
      const { data } = await axios.post(`${API}/api/students/profile/upload-document`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      // Sync both form + profile with the returned documents list
      const newDocs = data.documents || [];
      set('documents', newDocs);
      setProfile(p => p ? { ...p, documents: newDocs } : p);
      notify('Document uploaded & saved!');
    } catch (err) { console.error('Document upload error:', err); notify('Upload failed – ' + (err.response?.data?.error || 'try again')); }
    setUploading(false);
    // Reset file input so same file can be uploaded again
    if (e.target) e.target.value = '';
  };

  const uploadResume = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) { notify('File too large (max 10 MB)'); return; }
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext)) { notify('Only PDF, DOC, DOCX files allowed'); return; }
    setUploading(true);
    const fd = new FormData(); fd.append('file', f); fd.append('email', email);
    try {
      const { data } = await axios.post(`${API}/api/students/profile/upload-resume`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      set('resume', data.resume);
      setProfile(p => p ? { ...p, resume: data.resume } : p);
      notify('Resume uploaded & saved!');
    } catch (err) { console.error('Resume upload error:', err); notify('Upload failed – ' + (err.response?.data?.error || 'try again')); }
    setUploading(false);
    if (e.target) e.target.value = '';
  };

  const deleteDocument = async (index) => {
    try {
      await axios.delete(`${API}/api/students/profile/document`, { params: { email, index } });
      const newDocs = (form.documents || []).filter((_, i) => i !== index);
      set('documents', newDocs);
      setProfile(p => p ? { ...p, documents: newDocs } : p);
      notify('Document deleted');
    } catch (err) { console.error('Delete error:', err); notify('Delete failed'); }
  };

  const deleteResume = async () => {
    try {
      await axios.delete(`${API}/api/students/profile/resume`, { params: { email } });
      set('resume', null);
      setProfile(p => p ? { ...p, resume: null } : p);
      notify('Resume deleted');
    } catch (err) { console.error('Delete error:', err); notify('Delete failed'); }
  };

  /* ─── form helpers ─── */
  const set   = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const patch = (fld, i, p) => setForm(prev => {
    const a = [...(prev[fld] || [])]; a[i] = { ...a[i], ...p }; return { ...prev, [fld]: a };
  });
  const push  = (fld, item) => set(fld, [...(form[fld] || []), item]);
  const rm    = (fld, i) => set(fld, form[fld].filter((_, x) => x !== i));

  const d = edit ? form : (profile || {});

  /* ─── completion ─── */
  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks = [profile.name, profile.phone, profile.rollNumber, profile.branch,
      profile.bio, profile.avatarUrl, profile.gender, profile.dateOfBirth,
      profile.cgpa, profile.course, (profile.skills || []).length,
      (profile.projects || []).length, (profile.certificates || []).length];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  /* ─── loading ─── */
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading your profile…</p>
      </div>
    </div>
  );

  /* ═══ Inline helpers — plain functions returning JSX (not components) ═══ */

  const field = (label, Ic, val, fk, type = 'text', disabled = false, span2 = false) => (
    <div className={span2 ? 'sm:col-span-2' : ''}>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {Ic && <Ic size={12} />}{label}
      </label>
      {edit && !disabled ? (
        <input type={type} value={form[fk] ?? ''}
          onChange={e => set(fk, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" />
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">{val || <span className="text-slate-300">—</span>}</p>
      )}
    </div>
  );

  const sel = (label, Ic, val, fk, options) => (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {Ic && <Ic size={12} />}{label}
      </label>
      {edit ? (
        <select value={form[fk] || ''} onChange={e => set(fk, e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10">
          <option value="">Select…</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">{val || <span className="text-slate-300">—</span>}</p>
      )}
    </div>
  );

  const addBtn = (onClick, label, color = 'indigo') => edit ? (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl bg-${color}-50 px-3.5 py-1.5 text-xs font-semibold text-${color}-600 transition hover:bg-${color}-100`}>
      <Plus size={14} />{label}
    </button>
  ) : null;

  const removeBtn = (onClick) => edit ? (
    <button onClick={onClick} className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500">
      <Trash2 size={14} />
    </button>
  ) : null;

  /* ═══════════ SECTION: Personal ═══════════ */
  const renderPersonal = () => (
    <div className="space-y-5">
      <Card>
        <SectionTitle icon={Mail} title="Contact Information" color="blue" />
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Full Name', User, d.name, 'name')}
          {field('Roll Number', GraduationCap, d.rollNumber, 'rollNumber')}
          {field('Email', Mail, email, 'email', 'text', true)}
          {field('Phone', Phone, d.phone, 'phone')}
          {sel('Gender', User, d.gender, 'gender', ['Male', 'Female', 'Other'])}
          {field('Date of Birth', Calendar, d.dateOfBirth, 'dateOfBirth', 'date')}
          {field('Address', MapPin, d.address, 'address', 'text', false, true)}
          {sel('Blood Group', Droplets, d.bloodGroup, 'bloodGroup', ['A+','A-','B+','B-','AB+','AB-','O+','O-'])}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Heart} title="Parent / Guardian" color="pink" />
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Name', User, d.parentName, 'parentName')}
          {field('Phone', Phone, d.parentPhone, 'parentPhone')}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Sparkles} title="About Me" color="violet" />
        {edit ? (
          <textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={4}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10" placeholder="Tell us about yourself…" />
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">{d.bio || 'No bio added yet.'}</p>
        )}
      </Card>
    </div>
  );

  /* ═══════════ SECTION: Academic ═══════════ */
  const renderAcademic = () => (
    <div className="space-y-5">
      <Card>
        <SectionTitle icon={Book} title="Academic Information" color="emerald" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {field('Branch', GraduationCap, d.branch, 'branch')}
          {field('Course', Book, d.course, 'course')}
          {field('Year', Calendar, d.year, 'year')}
          {field('Semester', Calendar, d.semester, 'semester')}
          {field('Section', User, d.section, 'section')}
          {field('Admission Date', Calendar, d.admissionDate, 'admissionDate', 'date')}
        </div>
      </Card>

      {/* Performance dashboard */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* CGPA */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-500/20">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 text-indigo-200">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Current CGPA</span>
            </div>
            {edit ? (
              <input type="number" step="0.01" min="0" max="10" value={form.cgpa ?? ''}
                onChange={e => set('cgpa', parseFloat(e.target.value) || 0)}
                className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-3xl font-black text-white placeholder:text-white/40 outline-none backdrop-blur-sm" />
            ) : (
              <p className="mt-2 text-4xl font-black tracking-tight">{d.cgpa != null ? Number(d.cgpa).toFixed(2) : '—'}</p>
            )}
            {!edit && d.cgpa != null && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(d.cgpa / 10) * 100}%` }} />
              </div>
            )}
            <p className="mt-2 text-xs text-indigo-200">out of 10.0</p>
          </div>
        </div>

        {/* Attendance */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 text-white shadow-lg shadow-emerald-500/20">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-200">
              <Percent size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">Attendance</span>
            </div>
            {edit ? (
              <input value={form.attendanceSummary || ''} onChange={e => set('attendanceSummary', e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-3xl font-black text-white placeholder:text-white/40 outline-none backdrop-blur-sm" placeholder="e.g. 85%" />
            ) : (
              <p className="mt-2 text-4xl font-black tracking-tight">{d.attendanceSummary || '—'}</p>
            )}
            <p className="mt-3 text-xs text-emerald-200">overall attendance</p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════ SECTION: Documents ═══════════ */
  const renderDocuments = () => {
    const docs = d.documents || [];
    const exts = { PDF: 'bg-red-100 text-red-600', DOCX: 'bg-blue-100 text-blue-600', PNG: 'bg-amber-100 text-amber-600', JPG: 'bg-amber-100 text-amber-600', DOC: 'bg-blue-100 text-blue-600', TXT: 'bg-slate-100 text-slate-600', XLSX: 'bg-green-100 text-green-600', PPTX: 'bg-orange-100 text-orange-600' };
    return (
      <div className="space-y-5">
        <Card>
          <SectionTitle icon={FileText} title="My Documents" color="orange"
            action={edit
              ? <label className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${uploading ? 'bg-slate-400 cursor-wait' : 'bg-indigo-600 shadow-indigo-600/20 hover:bg-indigo-700'}`}>
                  {uploading ? (
                    <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Uploading…</>
                  ) : (
                    <><Upload size={14} /> Upload File<input type="file" className="hidden" onChange={uploadDoc} disabled={uploading} /></>
                  )}
                </label>
              : null} />

          {docs.length === 0
            ? <EmptyState icon={FileText} title="No documents yet" sub="Upload ID proofs, mark-sheets or certificates" />
            : <div className="space-y-2.5">
                {docs.map((doc, i) => (
                  <div key={i} className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${exts[doc.type] || 'bg-slate-100 text-slate-500'}`}>{doc.type || 'DOC'}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{doc.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={11} />{doc.uploadDate}
                        {doc.verified && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 size={11} /> Verified</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {doc.fileUrl && <a href={`${API}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"><Download size={15} /></a>}
                      {edit && <button onClick={() => deleteDocument(i)} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>}
                    </div>
                  </div>
                ))}
              </div>}
        </Card>

        {/* Resume */}
        <Card>
          <SectionTitle icon={Briefcase} title="Resume" color="purple" />
          {d.resume ? (
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100"><FileText size={18} className="text-purple-600" /></div>
                <div><p className="text-sm font-semibold text-purple-900">Resume uploaded</p><p className="text-xs text-purple-400">Ready to share</p></div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`${API}${d.resume}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-purple-600/20 transition hover:bg-purple-700">
                  <Download size={14} /> Download
                </a>
                {edit && (
                  <button onClick={deleteResume} className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-200">
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-10 transition ${uploading ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-wait' : 'border-purple-200 text-purple-500 hover:border-purple-400 hover:bg-purple-50/50'}`}>
              {uploading ? (
                <><svg className="h-6 w-6 animate-spin text-purple-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span className="text-sm font-semibold">Uploading…</span></>
              ) : (
                <><Upload size={24} /><span className="text-sm font-semibold">Upload Resume</span><span className="text-xs text-purple-400">PDF, DOC up to 10 MB</span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={uploadResume} disabled={uploading} /></>
              )}
            </label>
          )}
        </Card>
      </div>
    );
  };

  /* ═══════════ SECTION: Portfolio ═══════════ */
  const renderPortfolio = () => {
    const skills = d.skills || [], projects = d.projects || [], internships = d.internships || [];
    const awards = d.awards || [], certs = d.certificates || [];
    const levelColor = { Expert: 'bg-violet-100 text-violet-700', Advanced: 'bg-indigo-100 text-indigo-700', Intermediate: 'bg-blue-100 text-blue-700', Beginner: 'bg-slate-100 text-slate-600' };
    const levelWidth = { Expert: '95%', Advanced: '75%', Intermediate: '55%', Beginner: '30%' };
    return (
      <div className="space-y-5">
        {/* Skills */}
        <Card>
          <SectionTitle icon={Zap} title="Skills" color="blue"
            action={addBtn(() => push('skills', { name: '', level: 'Beginner', progress: 30 }), 'Add Skill')} />
          {skills.length === 0
            ? <EmptyState icon={Code} title="No skills added" sub="Showcase your technical abilities" />
            : <div className="grid gap-3 sm:grid-cols-2">
                {skills.map((sk, i) => (
                  <div key={i} className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4 transition hover:border-indigo-100 hover:shadow-sm">
                    {edit ? (
                      <div className="space-y-2">
                        <input value={sk.name} onChange={e => patch('skills', i, { name: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400" placeholder="Skill name" />
                        <select value={sk.level} onChange={e => patch('skills', i, { level: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400">
                          <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                        </select>
                        <button onClick={() => rm('skills', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">{sk.name || 'Untitled'}</span>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelColor[sk.level] || levelColor.Beginner}`}>{sk.level}</span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: sk.progress ? `${sk.progress}%` : levelWidth[sk.level] || '30%' }} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Projects */}
        <Card>
          <SectionTitle icon={Globe} title="Projects" color="emerald"
            action={addBtn(() => push('projects', { name: '', description: '', tags: [], href: '' }), 'Add Project', 'emerald')} />
          {projects.length === 0
            ? <EmptyState icon={Globe} title="No projects yet" sub="Share what you've built" />
            : <div className="space-y-3">
                {projects.map((p, i) => (
                  <div key={i} className="group rounded-xl border border-slate-100 p-4 transition hover:border-emerald-100 hover:bg-emerald-50/30">
                    {edit ? (
                      <div className="space-y-2">
                        <input value={p.name} onChange={e => patch('projects', i, { name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Project name" />
                        <textarea value={p.description} onChange={e => patch('projects', i, { description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" rows={2} placeholder="Description" />
                        <input value={p.href || ''} onChange={e => patch('projects', i, { href: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400" placeholder="Link (optional)" />
                        <button onClick={() => rm('projects', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800">{p.name}</h4>
                          {p.description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{p.description}</p>}
                          {p.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{p.tags.map((t, j) => <span key={j} className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">{t}</span>)}</div>}
                        </div>
                        {p.href && <a href={p.href} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"><ExternalLink size={15} /></a>}
                      </div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Internships */}
        <Card>
          <SectionTitle icon={Briefcase} title="Internships" color="purple"
            action={addBtn(() => push('internships', { company: '', role: '', duration: '', description: '' }), 'Add', 'purple')} />
          {internships.length === 0
            ? <EmptyState icon={Briefcase} title="No internships yet" sub="Add your work experience" />
            : <div className="space-y-3">
                {internships.map((it, i) => (
                  <div key={i} className="flex gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-purple-100 hover:bg-purple-50/20">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-sm font-bold text-purple-600">{(it.company || '?').charAt(0)}</div>
                    {edit ? (
                      <div className="flex-1 space-y-2">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input value={it.company} onChange={e => patch('internships', i, { company: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Company" />
                          <input value={it.role} onChange={e => patch('internships', i, { role: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Role" />
                        </div>
                        <input value={it.duration} onChange={e => patch('internships', i, { duration: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Duration" />
                        <button onClick={() => rm('internships', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{it.role} <span className="font-normal text-slate-400">at</span> {it.company}</h4>
                        <p className="mt-0.5 text-xs text-slate-400">{it.duration}</p>
                        {it.description && <p className="mt-1.5 text-xs text-slate-500">{it.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Achievements */}
        <Card>
          <SectionTitle icon={Award} title="Achievements" color="amber"
            action={addBtn(() => push('awards', { title: '', description: '', date: '' }), 'Add', 'amber')} />
          {awards.length === 0
            ? <EmptyState icon={Award} title="No achievements yet" sub="Highlight your accomplishments" />
            : <div className="space-y-3">
                {awards.map((a, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-amber-100 hover:bg-amber-50/30">
                    <Star size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    {edit ? (
                      <div className="flex-1 space-y-2">
                        <input value={a.title} onChange={e => patch('awards', i, { title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="Title" />
                        <input value={a.description} onChange={e => patch('awards', i, { description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="Description" />
                        <button onClick={() => rm('awards', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div><h4 className="text-sm font-semibold text-slate-800">{a.title}</h4>{a.description && <p className="mt-0.5 text-xs text-slate-500">{a.description}</p>}</div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Certifications */}
        <Card>
          <SectionTitle icon={Shield} title="Certifications" color="indigo"
            action={addBtn(() => push('certificates', { name: '', issuer: '', issued: '', expires: '' }), 'Add')} />
          {certs.length === 0
            ? <EmptyState icon={Shield} title="No certifications yet" sub="Add professional certifications" />
            : <div className="grid gap-3 sm:grid-cols-2">
                {certs.map((c, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-gradient-to-br from-indigo-50/40 to-white p-4 transition hover:border-indigo-100 hover:shadow-sm">
                    {edit ? (
                      <div className="space-y-2">
                        <input value={c.name} onChange={e => patch('certificates', i, { name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" placeholder="Certificate name" />
                        <input value={c.issuer} onChange={e => patch('certificates', i, { issuer: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" placeholder="Issuer" />
                        <button onClick={() => rm('certificates', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100"><Shield size={14} className="text-indigo-600" /></div>
                        <div><h4 className="text-sm font-semibold text-slate-800">{c.name}</h4><p className="text-xs text-slate-400">{c.issuer}{c.issued && ` • ${c.issued}`}</p></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>
      </div>
    );
  };

  /* ═══════════ SECTION: Settings ═══════════ */
  const renderSettings = () => (
    <div className="space-y-5">
      <Card>
        <SectionTitle icon={Camera} title={t('settings.profilePhoto')} color="blue" />
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold text-white shadow-md shadow-indigo-500/20">
              {d.avatarUrl ? <img src={d.avatarUrl.startsWith('http') ? d.avatarUrl : `${API}${d.avatarUrl}`} alt="" className="h-full w-full object-cover" /> : (d.name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700">
              <Camera size={14} /> {t('settings.changePhoto')}<input type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'avatarUrl')} />
            </label>
            <p className="mt-2 text-[11px] text-slate-400">{t('settings.photoHint')}</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Moon} title={t('settings.appearance')} color="violet" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('settings.theme')}</label>
            <div className="flex gap-3">
              {[{ v: 'light', Icon: Sun }, { v: 'dark', Icon: Moon }].map(({ v, Icon }) => (
                <button key={v} onClick={() => { set('theme', v); setGlobalTheme(v); }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${(form.theme || 'light') === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-500/10' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  <Icon size={16} />{t(`settings.${v}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('settings.language')}</label>
            <select value={form.language || 'English'} onChange={e => { set('language', e.target.value); setGlobalLanguage(e.target.value); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10">
              <option>English</option><option>Hindi</option><option>Telugu</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Bell} title={t('settings.notifications')} color="amber" />
        <div className="space-y-3">
          {[{ v: 'all', l: t('settings.allNotifications'), ds: t('settings.allNotificationsDesc') },
            { v: 'important', l: t('settings.importantOnly'), ds: t('settings.importantOnlyDesc') },
            { v: 'none', l: t('settings.noneNotifications'), ds: t('settings.noneNotificationsDesc') }].map(opt => (
            <button key={opt.v} onClick={() => set('notificationPrefs', opt.v)}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${(form.notificationPrefs || 'all') === opt.v ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${(form.notificationPrefs || 'all') === opt.v ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                {(form.notificationPrefs || 'all') === opt.v && <CheckCircle2 size={12} className="text-white" />}
              </div>
              <div><p className="text-sm font-semibold text-slate-800">{opt.l}</p><p className="text-xs text-slate-400">{opt.ds}</p></div>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Lock} title={t('settings.privacy')} color="red" />
        <div className="space-y-3">
          {[{ v: 'public', l: t('settings.public'), ds: t('settings.publicDesc'), ic: Globe },
            { v: 'university', l: t('settings.universityOnly'), ds: t('settings.universityOnlyDesc'), ic: GraduationCap },
            { v: 'private', l: t('settings.private'), ds: t('settings.privateDesc'), ic: Lock }].map(opt => (
            <button key={opt.v} onClick={() => set('privacySettings', opt.v)}
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${(form.privacySettings || 'public') === opt.v ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${(form.privacySettings || 'public') === opt.v ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}><opt.ic size={16} /></div>
              <div><p className="text-sm font-semibold text-slate-800">{opt.l}</p><p className="text-xs text-slate-400">{opt.ds}</p></div>
            </button>
          ))}
        </div>
      </Card>

      <button onClick={save} disabled={saving}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50">
        {saving ? t('common.saving') : t('settings.saveSettings')}
      </button>
    </div>
  );

  /* ═══════════ MAIN LAYOUT ═══════════ */
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600">
            <ArrowLeft size={18} /> Dashboard
          </button>
          <div className="flex items-center gap-3">
            {toast && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm ${toast.includes('success') || toast.includes('updated') || toast.includes('Uploaded') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {toast.includes('success') || toast.includes('updated') || toast.includes('Uploaded') ? <CheckCircle2 size={14} /> : <X size={14} />}{toast}
              </div>
            )}
            {tab !== 'settings' && (edit ? (
              <div className="flex gap-2">
                <button onClick={() => { setEdit(false); setForm(structuredClone(profile || {})); }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"><X size={14} className="mr-1.5 inline" />Cancel</button>
                <button onClick={save} disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50">
                  <Save size={14} className="mr-1.5 inline" />{saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <button onClick={() => { setForm(structuredClone(profile || {})); setEdit(true); }}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700">
                <Edit3 size={14} className="mr-1.5 inline" />Edit Profile
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative">
        <div className="relative h-44 overflow-hidden sm:h-52" style={{ background: 'linear-gradient(to right, #4f46e5, #7c3aed, #7e22ce)' }}>
          {d.coverUrl ? (
            <img src={d.coverUrl.startsWith('http') ? d.coverUrl : `${API}${d.coverUrl}`} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJWMGgydjM0em0tNCAwSDI4VjBoNHYzNHptLTggMEgyMFYwaDR2MzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-60" />
          )}
          {edit && (
            <label className="absolute right-4 top-4 z-10 flex cursor-pointer items-center gap-2 rounded-xl bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-black/40">
              <Camera size={14} /> Change Cover<input type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'coverUrl')} />
            </label>
          )}
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="-mt-16 flex flex-col items-start gap-5 sm:flex-row sm:items-end">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-violet-600 text-4xl font-bold text-white shadow-xl shadow-indigo-500/20">
                {d.avatarUrl ? <img src={d.avatarUrl.startsWith('http') ? d.avatarUrl : `${API}${d.avatarUrl}`} alt="" className="h-full w-full object-cover" /> : (d.name || email || '?').charAt(0).toUpperCase()}
              </div>
              {edit && (
                <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700">
                  <Camera size={14} /><input type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'avatarUrl')} />
                </label>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-slate-900">{d.name || 'Student Name'}</h1>
              <p className="text-sm text-slate-500">{d.rollNumber || 'Roll Number'} · {d.branch || 'Branch'} · {email}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="h-12 w-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="url(#grad)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${completion * 1.26} 126`} />
                  <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
                </svg>
                <span className="absolute text-xs font-bold text-indigo-600">{completion}%</span>
              </div>
              <div><p className="text-xs font-semibold text-slate-800">Profile Complete</p><p className="text-[10px] text-slate-400">Fill all sections to reach 100%</p></div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Skills', value: (d.skills || []).length, icon: Zap, color: 'indigo' },
              { label: 'Projects', value: (d.projects || []).length, icon: Globe, color: 'emerald' },
              { label: 'Certifications', value: (d.certificates || []).length, icon: Shield, color: 'violet' },
              { label: 'Achievements', value: (d.awards || []).length, icon: Award, color: 'amber' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${s.color}-100`}><s.icon size={16} className={`text-${s.color}-600`} /></div>
                <div><p className="text-lg font-bold text-slate-900">{s.value}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SIDEBAR NAV + CONTENT ── */}
      <div className="mx-auto mt-6 max-w-7xl gap-6 px-6 pb-10 lg:flex">
        <aside className="mb-6 shrink-0 lg:mb-0 lg:w-56">
          <nav className="sticky top-20 space-y-1 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm lg:p-3">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === t.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <t.icon size={17} /><span className="hidden lg:inline">{t.label}</span>
                {tab === t.id && <ChevronRight size={14} className="ml-auto hidden text-indigo-400 lg:block" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === 'personal'  && renderPersonal()}
          {tab === 'academic'  && renderAcademic()}
          {tab === 'documents' && renderDocuments()}
          {tab === 'portfolio' && renderPortfolio()}
          {tab === 'settings'  && renderSettings()}
        </main>
      </div>
    </div>
  );
}
