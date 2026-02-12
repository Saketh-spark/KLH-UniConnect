import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, User, Briefcase, FileText, FlaskConical, Settings, Edit3, Save, X,
  Camera, Mail, Phone, MapPin, Calendar, Book, Upload, Download,
  Shield, Plus, Trash2, Star, Globe, Moon, Sun, Bell, Lock,
  CheckCircle2, TrendingUp, ExternalLink, Sparkles, ChevronRight, Clock,
  Target, GraduationCap, Building2, BookOpen, Microscope, Trophy, Hash, Lightbulb
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══ helpers ═══ */
const str2list = s => (s || '').split(',').map(x => x.trim()).filter(Boolean);
const list2str = a => (a || []).join(', ');

/* ══════════ Stable sub-components (outside to keep identity across renders) ══════════ */

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-white/60 bg-white/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.04)] backdrop-blur-sm transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,.06),0_12px_32px_rgba(0,0,0,.06)] ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, color = 'teal', action }) => (
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

export default function FacultyProfile({ email, onBack, defaultTab }) {
  const [tab, setTab]         = useState(defaultTab || 'personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [edit, setEdit]       = useState(false);
  const [form, setForm]       = useState({});
  const [toast, setToast]     = useState('');
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const { language: globalLanguage, setLanguage: setGlobalLanguage, t } = useLanguage();

  const tabs = [
    { id: 'personal',     label: 'Personal',    icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'documents',    label: 'Documents',   icon: FileText },
    { id: 'research',     label: 'Research',    icon: FlaskConical },
    { id: 'settings',     label: 'Settings',    icon: Settings },
  ];

  /* ─── data ─── */
  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/faculty/profile`, { params: { email } });
      setProfile(data);
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
      const { id, ...payload } = form;
      // Strip extra fields from documents
      if (payload.documents) {
        payload.documents = payload.documents.map(({ name, type, fileUrl, uploadDate }) => ({ name, type, fileUrl, uploadDate }));
      }
      const { data } = await axios.put(`${API}/api/faculty/profile`, { ...payload, email });
      setProfile(data); setForm(structuredClone(data)); setEdit(false);
      notify('Profile updated successfully');
    } catch { notify('Save failed – please retry'); }
    setSaving(false);
  };

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  /* ─── uploads ─── */
  const upload = async (e, fld) => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    try {
      const { data } = await axios.post(`${API}/api/faculty/profile/upload`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      set(fld, data.url); notify('Uploaded!');
    } catch { notify('Upload failed'); }
  };

  const uploadDoc = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f);
    try {
      const { data } = await axios.post(`${API}/api/faculty/profile/upload`, fd,
        { headers: { 'Content-Type': 'multipart/form-data' } });
      set('documents', [...(form.documents || []),
        { name: f.name, type: f.name.split('.').pop().toUpperCase(), fileUrl: data.url,
          uploadDate: new Date().toISOString().slice(0, 10), verified: false }]);
      notify('Document uploaded!');
    } catch { notify('Upload failed'); }
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
    const checks = [profile.name, profile.phone, profile.employeeId, profile.department,
      profile.bio, profile.avatarUrl, profile.designation, profile.qualification,
      profile.specialization, profile.experienceYears,
      (profile.publications || []).length, (profile.subjectsHandled || []).length,
      profile.researchInterests];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  /* ─── loading ─── */
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-teal-600" />
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
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/10" />
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">{val || <span className="text-slate-300">—</span>}</p>
      )}
    </div>
  );

  const listField = (label, Ic, fk) => (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{Ic && <Ic size={12} />}{label}</label>
      {edit ? (
        <input value={list2str(form[fk])} onChange={e => set(fk, str2list(e.target.value))}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Comma-separated" />
      ) : (
        <div className="flex flex-wrap gap-2">{(d[fk] || []).length ? d[fk].map((v, i) => <span key={i} className="rounded-lg bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{v}</span>) : <span className="text-sm text-slate-300">—</span>}</div>
      )}
    </div>
  );

  const addBtn = (onClick, label, color = 'teal') => edit ? (
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
          {field('Employee ID', Hash, d.employeeId, 'employeeId')}
          {field('Email', Mail, email, 'email', 'text', true)}
          {field('Phone', Phone, d.phone, 'phone')}
          {field('Office Location', MapPin, d.officeLocation, 'officeLocation')}
          {field('Joining Date', Calendar, d.joiningDate, 'joiningDate', 'date')}
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Sparkles} title="About Me" color="violet" />
        {edit ? (
          <textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-500/10" placeholder="Tell us about yourself…" />
        ) : (
          <p className="text-sm leading-relaxed text-slate-600">{d.bio || '—'}</p>
        )}
      </Card>
    </div>
  );

  /* ═══════════ SECTION: Professional ═══════════ */
  const renderProfessional = () => (
    <div className="space-y-5">
      <Card>
        <SectionTitle icon={Building2} title="Department & Designation" color="emerald" />
        <div className="grid gap-4 sm:grid-cols-2">
          {field('Department', Building2, d.department, 'department')}
          {field('Designation', Briefcase, d.designation, 'designation')}
          {field('Qualification', GraduationCap, d.qualification, 'qualification')}
          {field('Specialization', Target, d.specialization, 'specialization')}
        </div>
      </Card>

      {/* Experience card */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(to bottom right, #14b8a6, #0d9488, #047857)' }}>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2 text-teal-200">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Years of Experience</span>
          </div>
          {edit ? (
            <input type="number" min="0" value={form.experienceYears ?? ''}
              onChange={e => set('experienceYears', parseInt(e.target.value) || 0)}
              className="mt-2 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-3xl font-black text-white outline-none backdrop-blur-sm" />
          ) : (
            <p className="mt-2 text-4xl font-black tracking-tight">{d.experienceYears ?? '—'} <span className="text-base font-semibold text-teal-200">years</span></p>
          )}
        </div>
      </div>

      <Card>
        <SectionTitle icon={BookOpen} title="Subjects Handled" color="blue" />
        {listField('Subjects', Book, 'subjectsHandled')}
      </Card>

      <Card>
        <SectionTitle icon={Microscope} title="Research Interests" color="purple" />
        {field('Interests', Lightbulb, d.researchInterests, 'researchInterests', 'text', false, true)}
      </Card>
    </div>
  );

  /* ═══════════ SECTION: Documents ═══════════ */
  const renderDocuments = () => {
    const docs = d.documents || [];
    const exts = { PDF: 'bg-red-100 text-red-600', DOCX: 'bg-blue-100 text-blue-600', PNG: 'bg-amber-100 text-amber-600', JPG: 'bg-amber-100 text-amber-600', DOC: 'bg-blue-100 text-blue-600' };
    return (
      <div className="space-y-5">
        <Card>
          <SectionTitle icon={FileText} title="My Documents" color="orange"
            action={edit
              ? <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700">
                  <Upload size={14} /> Upload File<input type="file" className="hidden" onChange={uploadDoc} />
                </label>
              : null} />
          {docs.length === 0
            ? <EmptyState icon={FileText} title="No documents yet" sub="Upload qualifications, certifications or research papers" />
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
                      {doc.fileUrl && <a href={`${API}${doc.fileUrl}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-slate-400 transition hover:bg-teal-50 hover:text-teal-600"><Download size={15} /></a>}
                      {removeBtn(() => rm('documents', i))}
                    </div>
                  </div>
                ))}
              </div>}
        </Card>
      </div>
    );
  };

  /* ═══════════ SECTION: Research & Awards ═══════════ */
  const renderResearch = () => {
    const pubs = d.publications || [], awards = d.awards || [], patents = d.patents || [];
    const workshops = d.workshopsConducted || [], projects = d.researchProjects || [];
    return (
      <div className="space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Publications', value: pubs.length, icon: BookOpen, color: 'teal' },
            { label: 'Patents', value: patents.length, icon: Shield, color: 'violet' },
            { label: 'Awards', value: awards.length, icon: Trophy, color: 'amber' },
            { label: 'Workshops', value: workshops.length, icon: Lightbulb, color: 'blue' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-${s.color}-100`}><s.icon size={16} className={`text-${s.color}-600`} /></div>
              <div><p className="text-lg font-bold text-slate-900">{s.value}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Publications */}
        <Card>
          <SectionTitle icon={BookOpen} title="Publications" color="teal"
            action={addBtn(() => push('publications', { title: '', journal: '', year: '', doi: '' }), 'Add Publication')} />
          {pubs.length === 0
            ? <EmptyState icon={BookOpen} title="No publications yet" sub="Add your journal papers & conference publications" />
            : <div className="space-y-3">
                {pubs.map((p, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-100 hover:bg-teal-50/20">
                    {edit ? (
                      <div className="space-y-2">
                        <input value={p.title} onChange={e => patch('publications', i, { title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" placeholder="Paper title" />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <input value={p.journal} onChange={e => patch('publications', i, { journal: e.target.value })} className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" placeholder="Journal / Conference" />
                          <input value={p.year} onChange={e => patch('publications', i, { year: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" placeholder="Year" />
                        </div>
                        <input value={p.doi || ''} onChange={e => patch('publications', i, { doi: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" placeholder="DOI (optional)" />
                        <button onClick={() => rm('publications', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">{p.title}</h4>
                        <p className="mt-1 text-xs text-slate-400">{p.journal}{p.year && ` · ${p.year}`}</p>
                        {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"><ExternalLink size={11} /> DOI</a>}
                      </div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Research Projects */}
        <Card>
          <SectionTitle icon={Microscope} title="Research Projects" color="purple"
            action={addBtn(() => push('researchProjects', { title: '', funding: '', description: '', status: '' }), 'Add Project', 'purple')} />
          {projects.length === 0
            ? <EmptyState icon={Microscope} title="No research projects yet" sub="Add funded or ongoing research" />
            : <div className="space-y-3">
                {projects.map((p, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-4 transition hover:border-purple-100 hover:bg-purple-50/20">
                    {edit ? (
                      <div className="space-y-2">
                        <input value={p.title} onChange={e => patch('researchProjects', i, { title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Project title" />
                        <div className="grid gap-2 sm:grid-cols-3">
                          <input value={p.funding || ''} onChange={e => patch('researchProjects', i, { funding: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Funding source" />
                          <input value={p.description || ''} onChange={e => patch('researchProjects', i, { description: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Description" />
                          <input value={p.status || ''} onChange={e => patch('researchProjects', i, { status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="Status" />
                        </div>
                        <button onClick={() => rm('researchProjects', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800">{p.title}</h4>
                          <p className="mt-1 text-xs text-slate-400">{p.funding}{p.description && ` · ${p.description}`}</p>
                        </div>
                        {p.status && <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${p.status.toLowerCase() === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : p.status.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{p.status}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Patents */}
        <Card>
          <SectionTitle icon={Shield} title="Patents" color="violet"
            action={addBtn(() => set('patents', [...(form.patents || []), '']), 'Add Patent', 'violet')} />
          {patents.length === 0
            ? <EmptyState icon={Shield} title="No patents yet" sub="Add your registered patents" />
            : <div className="space-y-2">
                {patents.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-violet-100 hover:bg-violet-50/20">
                    <Shield size={16} className="shrink-0 text-violet-400" />
                    {edit ? (
                      <input value={p} onChange={e => { const a = [...form.patents]; a[i] = e.target.value; set('patents', a); }}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-400" placeholder="Patent title / number" />
                    ) : (
                      <p className="flex-1 text-sm font-medium text-slate-700">{p}</p>
                    )}
                    {removeBtn(() => set('patents', form.patents.filter((_, x) => x !== i)))}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Awards */}
        <Card>
          <SectionTitle icon={Trophy} title="Awards & Recognitions" color="amber"
            action={addBtn(() => push('awards', { title: '', description: '', date: '' }), 'Add Award', 'amber')} />
          {awards.length === 0
            ? <EmptyState icon={Trophy} title="No awards yet" sub="Highlight your recognitions" />
            : <div className="space-y-3">
                {awards.map((a, i) => (
                  <div key={i} className="flex gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-amber-100 hover:bg-amber-50/30">
                    <Star size={16} className="mt-0.5 shrink-0 text-amber-400" />
                    {edit ? (
                      <div className="flex-1 space-y-2">
                        <input value={a.title} onChange={e => patch('awards', i, { title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="Award title" />
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input value={a.description || ''} onChange={e => patch('awards', i, { description: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="Description" />
                          <input value={a.date || ''} onChange={e => patch('awards', i, { date: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-400" placeholder="Date (YYYY-MM-DD)" />
                        </div>
                        <button onClick={() => rm('awards', i)} className="text-xs font-medium text-red-400 hover:text-red-600">Remove</button>
                      </div>
                    ) : (
                      <div><h4 className="text-sm font-semibold text-slate-800">{a.title}</h4><p className="text-xs text-slate-400">{a.description}{a.date && ` · ${a.date}`}</p></div>
                    )}
                  </div>
                ))}
              </div>}
        </Card>

        {/* Workshops */}
        <Card>
          <SectionTitle icon={Lightbulb} title="Workshops Conducted" color="blue"
            action={addBtn(() => set('workshopsConducted', [...(form.workshopsConducted || []), '']), 'Add', 'blue')} />
          {workshops.length === 0
            ? <EmptyState icon={Lightbulb} title="No workshops yet" sub="Add workshops & FDPs conducted" />
            : <div className="space-y-2">
                {workshops.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-100 hover:bg-blue-50/20">
                    <Lightbulb size={16} className="shrink-0 text-blue-400" />
                    {edit ? (
                      <input value={w} onChange={e => { const a = [...form.workshopsConducted]; a[i] = e.target.value; set('workshopsConducted', a); }}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Workshop title" />
                    ) : (
                      <p className="flex-1 text-sm font-medium text-slate-700">{w}</p>
                    )}
                    {removeBtn(() => set('workshopsConducted', form.workshopsConducted.filter((_, x) => x !== i)))}
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
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl text-2xl font-bold text-white shadow-md" style={{ background: 'linear-gradient(to bottom right, #14b8a6, #059669)' }}>
              {d.avatarUrl ? <img src={d.avatarUrl.startsWith('http') ? d.avatarUrl : `${API}${d.avatarUrl}`} alt="" className="h-full w-full object-cover" /> : (d.name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700">
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
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition ${(form.theme || 'light') === v ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm shadow-teal-500/10' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  <Icon size={16} />{t(`settings.${v}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('settings.language')}</label>
            <select value={form.language || 'English'} onChange={e => { set('language', e.target.value); setGlobalLanguage(e.target.value); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10">
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
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${(form.notificationPrefs || 'all') === opt.v ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${(form.notificationPrefs || 'all') === opt.v ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
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
              className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition ${(form.privacySettings || 'public') === opt.v ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${(form.privacySettings || 'public') === opt.v ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}><opt.ic size={16} /></div>
              <div><p className="text-sm font-semibold text-slate-800">{opt.l}</p><p className="text-xs text-slate-400">{opt.ds}</p></div>
            </button>
          ))}
        </div>
      </Card>

      <button onClick={save} disabled={saving}
        className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50">
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
          <button onClick={onBack} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-teal-600">
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
                  className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-teal-500/20 transition hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50">
                  <Save size={14} className="mr-1.5 inline" />{saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            ) : (
              <button onClick={() => { setForm(structuredClone(profile || {})); setEdit(true); }}
                className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-teal-500/20 transition hover:from-teal-700 hover:to-emerald-700">
                <Edit3 size={14} className="mr-1.5 inline" />Edit Profile
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="relative">
        <div className="relative h-44 overflow-hidden sm:h-52" style={{ background: 'linear-gradient(to right, #0d9488, #059669, #0e7490)' }}>
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
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white text-4xl font-bold text-white shadow-xl" style={{ background: 'linear-gradient(to bottom right, #14b8a6, #059669)' }}>
                {d.avatarUrl ? <img src={d.avatarUrl.startsWith('http') ? d.avatarUrl : `${API}${d.avatarUrl}`} alt="" className="h-full w-full object-cover" /> : (d.name || email || '?').charAt(0).toUpperCase()}
              </div>
              {edit && (
                <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg transition hover:bg-teal-700">
                  <Camera size={14} /><input type="file" accept="image/*" className="hidden" onChange={e => upload(e, 'avatarUrl')} />
                </label>
              )}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-slate-900">{d.name || 'Faculty Name'}</h1>
              <p className="text-sm text-slate-500">{d.designation || 'Designation'} · {d.department || 'Department'} · {email}</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="h-12 w-12 -rotate-90">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="url(#fgrad)" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${completion * 1.26} 126`} />
                  <defs><linearGradient id="fgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0d9488" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
                </svg>
                <span className="absolute text-xs font-bold text-teal-600">{completion}%</span>
              </div>
              <div><p className="text-xs font-semibold text-slate-800">Profile Complete</p><p className="text-[10px] text-slate-400">Fill all sections to reach 100%</p></div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Experience', value: `${d.experienceYears || 0} yrs`, icon: Briefcase, color: 'teal' },
              { label: 'Publications', value: (d.publications || []).length, icon: BookOpen, color: 'blue' },
              { label: 'Awards', value: (d.awards || []).length, icon: Trophy, color: 'amber' },
              { label: 'Subjects', value: (d.subjectsHandled || []).length, icon: Book, color: 'violet' },
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === t.id ? 'bg-teal-50 text-teal-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <t.icon size={17} /><span className="hidden lg:inline">{t.label}</span>
                {tab === t.id && <ChevronRight size={14} className="ml-auto hidden text-teal-400 lg:block" />}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {tab === 'personal'     && renderPersonal()}
          {tab === 'professional' && renderProfessional()}
          {tab === 'documents'    && renderDocuments()}
          {tab === 'research'     && renderResearch()}
          {tab === 'settings'     && renderSettings()}
        </main>
      </div>
    </div>
  );
}
