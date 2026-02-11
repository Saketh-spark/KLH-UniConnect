import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FileText, Download, Edit2, Plus, Trash2, Sparkles, Eye, Save,
  User, Mail, Phone, MapPin, Linkedin, Github, Globe, Award, Code, Briefcase, GraduationCap, Loader2, CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentResumeTab = ({ studentId, email, onOpenResumeBuilder }) => {
  const [activeSection, setActiveSection] = useState('builder');
  const [resumeData, setResumeData] = useState({
    fullName: '', email: email || '', phone: '', location: '',
    linkedIn: '', github: '', portfolio: '', targetRole: '',
    summary: '',
    education: [{ degree: '', institution: '', year: '', gpa: '' }],
    experience: [{ title: '', company: '', duration: '', description: '' }],
    projects: [{ name: '', description: '', technologies: '', link: '' }],
    skills: { technical: '', tools: '', soft: '' },
    certifications: [{ name: '', issuer: '', date: '' }],
    achievements: [''],
    internships: [{ title: '', company: '', duration: '', description: '' }],
  });
  const [showPreview, setShowPreview] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const resumePreviewRef = useRef(null);

  // Load saved resume data on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/placements/resume/${studentId}`);
        if (res.data.resumeData && Object.keys(res.data.resumeData).length > 0) {
          setResumeData(prev => ({ ...prev, ...res.data.resumeData }));
        }
      } catch (e) { console.error('Failed to load resume:', e); }
      finally { setLoadingData(false); }
    };
    if (studentId) loadResume();
    else setLoadingData(false);
  }, [studentId]);

  // Save resume data to backend
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await axios.post(`${API_BASE}/api/placements/resume/save`, {
        studentId,
        resumeData
      });
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (e) {
      console.error(e);
      setSaveMsg('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF using print
  const handleDownloadPDF = () => {
    const el = resumePreviewRef.current;
    if (!el) return;

    const printWindow = window.open('', '_blank', 'width=800,height=1100');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>${resumeData.fullName || 'Resume'} - Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', 'Times New Roman', serif; color: #1e293b; padding: 40px 50px; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
        .contact-row { font-size: 11px; color: #475569; }
        .contact-row a { color: #0284c7; text-decoration: none; }
        .section { margin-bottom: 14px; }
        .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1.5px solid #334155; padding-bottom: 3px; margin-bottom: 8px; color: #0f172a; }
        .item { margin-bottom: 8px; }
        .item-header { display: flex; justify-content: space-between; align-items: baseline; }
        .item-title { font-size: 13px; font-weight: bold; }
        .item-sub { font-size: 12px; color: #475569; }
        .item-date { font-size: 11px; color: #64748b; }
        .item-desc { font-size: 12px; color: #334155; margin-top: 2px; }
        .skills-row { font-size: 12px; margin-bottom: 3px; }
        .skills-row strong { color: #0f172a; }
        .cert-item { font-size: 12px; margin-bottom: 2px; }
        @media print { body { padding: 30px 40px; } @page { margin: 0.5in; } }
      </style></head><body>
      <div class="header">
        <h1>${resumeData.fullName || 'Your Name'}</h1>
        <div class="contact-row">
          ${[resumeData.email, resumeData.phone, resumeData.location].filter(Boolean).join(' &nbsp;|&nbsp; ')}
        </div>
        <div class="contact-row">
          ${[
            resumeData.linkedIn ? `<a href="${resumeData.linkedIn}">${resumeData.linkedIn}</a>` : '',
            resumeData.github ? `<a href="${resumeData.github}">${resumeData.github}</a>` : '',
            resumeData.portfolio ? `<a href="${resumeData.portfolio}">${resumeData.portfolio}</a>` : ''
          ].filter(Boolean).join(' &nbsp;|&nbsp; ')}
        </div>
      </div>

      ${resumeData.summary ? `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="item-desc">${resumeData.summary}</div>
      </div>` : ''}

      ${resumeData.education?.some(e => e.degree) ? `
      <div class="section">
        <div class="section-title">Education</div>
        ${resumeData.education.filter(e => e.degree).map(edu => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${edu.degree}</span>
              <span class="item-date">${edu.year || ''}</span>
            </div>
            <div class="item-sub">${edu.institution || ''}${edu.gpa ? ' — GPA: ' + edu.gpa : ''}</div>
          </div>
        `).join('')}
      </div>` : ''}

      ${(resumeData.skills?.technical || resumeData.skills?.tools || resumeData.skills?.soft) ? `
      <div class="section">
        <div class="section-title">Skills</div>
        ${resumeData.skills.technical ? `<div class="skills-row"><strong>Technical:</strong> ${resumeData.skills.technical}</div>` : ''}
        ${resumeData.skills.tools ? `<div class="skills-row"><strong>Tools & Technologies:</strong> ${resumeData.skills.tools}</div>` : ''}
        ${resumeData.skills.soft ? `<div class="skills-row"><strong>Soft Skills:</strong> ${resumeData.skills.soft}</div>` : ''}
      </div>` : ''}

      ${resumeData.projects?.some(p => p.name) ? `
      <div class="section">
        <div class="section-title">Projects</div>
        ${resumeData.projects.filter(p => p.name).map(proj => `
          <div class="item">
            <div class="item-title">${proj.name}${proj.technologies ? ' <span class="item-sub">| ' + proj.technologies + '</span>' : ''}</div>
            <div class="item-desc">${proj.description || ''}</div>
          </div>
        `).join('')}
      </div>` : ''}

      ${resumeData.internships?.some(r => r.title) ? `
      <div class="section">
        <div class="section-title">Internships</div>
        ${resumeData.internships.filter(r => r.title).map(exp => `
          <div class="item">
            <div class="item-header">
              <span class="item-title">${exp.title}</span>
              <span class="item-date">${exp.duration || ''}</span>
            </div>
            <div class="item-sub">${exp.company || ''}</div>
            <div class="item-desc">${exp.description || ''}</div>
          </div>
        `).join('')}
      </div>` : ''}

      ${resumeData.certifications?.some(c => c.name) ? `
      <div class="section">
        <div class="section-title">Certifications</div>
        ${resumeData.certifications.filter(c => c.name).map(cert =>
          `<div class="cert-item"><strong>${cert.name}</strong> — ${cert.issuer || ''}${cert.date ? ' (' + cert.date + ')' : ''}</div>`
        ).join('')}
      </div>` : ''}

      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const sections = [
    { id: 'builder', label: 'Resume Builder', icon: Edit2 },
    { id: 'preview', label: 'Preview & Download', icon: Eye },
    { id: 'profile', label: 'Career Profile', icon: User },
    { id: 'ai', label: 'AI Suggestions', icon: Sparkles },
  ];

  const updateResumeField = (path, value) => {
    setResumeData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let target = newData;
      keys.slice(0, -1).forEach(k => {
        if (Array.isArray(target[k])) target = target[k];
        else target = target[k] = { ...target[k] };
      });
      target[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addItem = (field) => {
    setResumeData(prev => {
      const templates = {
        education: { degree: '', institution: '', year: '', gpa: '' },
        experience: { title: '', company: '', duration: '', description: '' },
        projects: { name: '', description: '', technologies: '', link: '' },
        certifications: { name: '', issuer: '', date: '' },
        internships: { title: '', company: '', duration: '', description: '' },
        achievements: '',
      };
      return { ...prev, [field]: [...prev[field], templates[field]] };
    });
  };

  const removeItem = (field, index) => {
    setResumeData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const generateAISuggestions = () => {
    setGenerating(true);
    setTimeout(() => {
      setAiSuggestions([
        { type: 'improvement', text: 'Add quantifiable metrics to your experience section (e.g., "Improved API response time by 40%")' },
        { type: 'missing', text: 'Consider adding a professional summary highlighting your key strengths' },
        { type: 'keyword', text: 'Include industry keywords like "Agile", "CI/CD", "REST APIs" based on your target role' },
        { type: 'format', text: 'Keep your resume to 1 page for entry-level positions' },
        { type: 'improvement', text: 'List projects with impact statements: "Developed X using Y, resulting in Z"' },
        { type: 'missing', text: 'Add links to your GitHub profile and portfolio for technical roles' },
      ]);
      setGenerating(false);
    }, 1500);
  };

  const renderBuilder = () => (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saveMsg && (
          <span className={`flex items-center gap-1 text-sm font-medium ${saveMsg === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
            {saveMsg === 'Saved!' && <CheckCircle size={14} />} {saveMsg}
          </span>
        )}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700 transition disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : 'Save Resume'}
        </button>
      </div>

      {/* Personal Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4"><User size={16} /> Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Full Name', key: 'fullName', icon: User, placeholder: 'John Doe' },
            { label: 'Email', key: 'email', icon: Mail, placeholder: 'john@email.com' },
            { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+91 9876543210' },
            { label: 'Location', key: 'location', icon: MapPin, placeholder: 'Hyderabad, India' },
            { label: 'LinkedIn', key: 'linkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/johndoe' },
            { label: 'GitHub', key: 'github', icon: Github, placeholder: 'github.com/johndoe' },
            { label: 'Portfolio', key: 'portfolio', icon: Globe, placeholder: 'johndoe.dev' },
            { label: 'Target Role', key: 'targetRole', icon: Briefcase, placeholder: 'Software Engineer' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">{f.label}</label>
              <input type="text" value={resumeData[f.key]} onChange={e => updateResumeField(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Professional Summary</label>
          <textarea rows={3} value={resumeData.summary} onChange={e => updateResumeField('summary', e.target.value)}
            placeholder="A brief professional summary..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
        </div>
      </div>

      {/* Education */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><GraduationCap size={16} /> Education</h3>
          <button onClick={() => addItem('education')} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
        </div>
        {resumeData.education.map((edu, i) => (
          <div key={i} className="mb-3 p-3 rounded-lg bg-slate-50 relative">
            {i > 0 && <button onClick={() => removeItem('education', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input placeholder="Degree" value={edu.degree} onChange={e => { const arr = [...resumeData.education]; arr[i] = { ...arr[i], degree: e.target.value }; updateResumeField('education', arr); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input placeholder="Institution" value={edu.institution} onChange={e => { const arr = [...resumeData.education]; arr[i] = { ...arr[i], institution: e.target.value }; updateResumeField('education', arr); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input placeholder="Year" value={edu.year} onChange={e => { const arr = [...resumeData.education]; arr[i] = { ...arr[i], year: e.target.value }; updateResumeField('education', arr); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input placeholder="GPA" value={edu.gpa} onChange={e => { const arr = [...resumeData.education]; arr[i] = { ...arr[i], gpa: e.target.value }; updateResumeField('education', arr); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4"><Code size={16} /> Skills</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Technical Skills</label>
            <input type="text" value={resumeData.skills.technical} onChange={e => updateResumeField('skills.technical', e.target.value)}
              placeholder="Java, Python, React, SQL, Spring Boot..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Tools & Technologies</label>
            <input type="text" value={resumeData.skills.tools} onChange={e => updateResumeField('skills.tools', e.target.value)}
              placeholder="Git, Docker, AWS, VS Code, Jira..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Soft Skills</label>
            <input type="text" value={resumeData.skills.soft} onChange={e => updateResumeField('skills.soft', e.target.value)}
              placeholder="Communication, Teamwork, Leadership..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500" />
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Code size={16} /> Projects</h3>
          <button onClick={() => addItem('projects')} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
        </div>
        {resumeData.projects.map((proj, i) => (
          <div key={i} className="mb-3 p-3 rounded-lg bg-slate-50 relative">
            {i > 0 && <button onClick={() => removeItem('projects', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input placeholder="Project Name" value={proj.name} onChange={e => { const arr = [...resumeData.projects]; arr[i] = { ...arr[i], name: e.target.value }; setResumeData(p => ({ ...p, projects: arr })); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input placeholder="Technologies" value={proj.technologies} onChange={e => { const arr = [...resumeData.projects]; arr[i] = { ...arr[i], technologies: e.target.value }; setResumeData(p => ({ ...p, projects: arr })); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
            </div>
            <textarea placeholder="Description" value={proj.description} onChange={e => { const arr = [...resumeData.projects]; arr[i] = { ...arr[i], description: e.target.value }; setResumeData(p => ({ ...p, projects: arr })); }}
              rows={2} className="mt-2 w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
        ))}
      </div>

      {/* Internships */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Briefcase size={16} /> Internships</h3>
          <button onClick={() => addItem('internships')} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
        </div>
        {resumeData.internships.map((intern, i) => (
          <div key={i} className="mb-3 p-3 rounded-lg bg-slate-50 relative">
            {i > 0 && <button onClick={() => removeItem('internships', i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input placeholder="Title" value={intern.title} onChange={e => { const arr = [...resumeData.internships]; arr[i] = { ...arr[i], title: e.target.value }; setResumeData(p => ({ ...p, internships: arr })); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input placeholder="Company" value={intern.company} onChange={e => { const arr = [...resumeData.internships]; arr[i] = { ...arr[i], company: e.target.value }; setResumeData(p => ({ ...p, internships: arr })); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
              <input placeholder="Duration" value={intern.duration} onChange={e => { const arr = [...resumeData.internships]; arr[i] = { ...arr[i], duration: e.target.value }; setResumeData(p => ({ ...p, internships: arr })); }}
                className="rounded border border-slate-200 px-2 py-1.5 text-sm" />
            </div>
            <textarea placeholder="Description" value={intern.description} onChange={e => { const arr = [...resumeData.internships]; arr[i] = { ...arr[i], description: e.target.value }; setResumeData(p => ({ ...p, internships: arr })); }}
              rows={2} className="mt-2 w-full rounded border border-slate-200 px-2 py-1.5 text-sm" />
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Award size={16} /> Certifications</h3>
          <button onClick={() => addItem('certifications')} className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
        </div>
        {resumeData.certifications.map((cert, i) => (
          <div key={i} className="mb-2 flex items-center gap-2">
            <input placeholder="Certification Name" value={cert.name} onChange={e => { const arr = [...resumeData.certifications]; arr[i] = { ...arr[i], name: e.target.value }; setResumeData(p => ({ ...p, certifications: arr })); }}
              className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm" />
            <input placeholder="Issuer" value={cert.issuer} onChange={e => { const arr = [...resumeData.certifications]; arr[i] = { ...arr[i], issuer: e.target.value }; setResumeData(p => ({ ...p, certifications: arr })); }}
              className="flex-1 rounded border border-slate-200 px-2 py-1.5 text-sm" />
            <input placeholder="Date" value={cert.date} onChange={e => { const arr = [...resumeData.certifications]; arr[i] = { ...arr[i], date: e.target.value }; setResumeData(p => ({ ...p, certifications: arr })); }}
              className="w-28 rounded border border-slate-200 px-2 py-1.5 text-sm" />
            {i > 0 && <button onClick={() => removeItem('certifications', i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Resume Preview</h3>
        <button onClick={handleDownloadPDF}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-bold text-white hover:bg-sky-700 transition">
          <Download size={16} /> Download as PDF
        </button>
      </div>
      <div ref={resumePreviewRef} className="rounded-xl border border-slate-200 bg-white p-8 max-w-[800px] mx-auto shadow-sm" style={{ fontFamily: 'Georgia, serif' }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{resumeData.fullName || 'Your Name'}</h1>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600 mt-1">
            {resumeData.email && <span>{resumeData.email}</span>}
            {resumeData.phone && <span>• {resumeData.phone}</span>}
            {resumeData.location && <span>• {resumeData.location}</span>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-sky-600 mt-1">
            {resumeData.linkedIn && <span>{resumeData.linkedIn}</span>}
            {resumeData.github && <span>• {resumeData.github}</span>}
            {resumeData.portfolio && <span>• {resumeData.portfolio}</span>}
          </div>
        </div>

        {resumeData.summary && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Professional Summary</h2>
            <p className="text-sm text-slate-700">{resumeData.summary}</p>
          </div>
        )}

        {resumeData.education.some(e => e.degree) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Education</h2>
            {resumeData.education.filter(e => e.degree).map((edu, i) => (
              <div key={i} className="mb-1 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold">{edu.degree}</span>
                  <span className="text-slate-500">{edu.year}</span>
                </div>
                <div className="text-slate-600">{edu.institution} {edu.gpa && `— GPA: ${edu.gpa}`}</div>
              </div>
            ))}
          </div>
        )}

        {(resumeData.skills.technical || resumeData.skills.tools) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Skills</h2>
            <div className="text-sm text-slate-700 space-y-1">
              {resumeData.skills.technical && <div><strong>Technical:</strong> {resumeData.skills.technical}</div>}
              {resumeData.skills.tools && <div><strong>Tools:</strong> {resumeData.skills.tools}</div>}
              {resumeData.skills.soft && <div><strong>Soft Skills:</strong> {resumeData.skills.soft}</div>}
            </div>
          </div>
        )}

        {resumeData.projects.some(p => p.name) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Projects</h2>
            {resumeData.projects.filter(p => p.name).map((proj, i) => (
              <div key={i} className="mb-2 text-sm">
                <div className="font-semibold">{proj.name} {proj.technologies && <span className="font-normal text-slate-500">| {proj.technologies}</span>}</div>
                <div className="text-slate-600">{proj.description}</div>
              </div>
            ))}
          </div>
        )}

        {resumeData.internships.some(r => r.title) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Internships</h2>
            {resumeData.internships.filter(r => r.title).map((exp, i) => (
              <div key={i} className="mb-2 text-sm">
                <div className="flex justify-between"><span className="font-semibold">{exp.title}</span><span className="text-slate-500">{exp.duration}</span></div>
                <div className="text-slate-600">{exp.company}</div>
                <div className="text-slate-600">{exp.description}</div>
              </div>
            ))}
          </div>
        )}

        {resumeData.certifications.some(c => c.name) && (
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">Certifications</h2>
            {resumeData.certifications.filter(c => c.name).map((cert, i) => (
              <div key={i} className="text-sm"><strong>{cert.name}</strong> — {cert.issuer} {cert.date && `(${cert.date})`}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center mb-4">
          <User size={36} className="text-sky-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{resumeData.fullName || 'Your Name'}</h3>
        <p className="text-slate-500">{resumeData.targetRole || 'Student'}</p>
        <p className="text-sm text-slate-400 mt-1">{resumeData.location}</p>
        <div className="flex justify-center gap-4 mt-4">
          {resumeData.linkedIn && <a href="#" className="text-sky-600 hover:text-sky-700"><Linkedin size={20} /></a>}
          {resumeData.github && <a href="#" className="text-slate-600 hover:text-slate-800"><Github size={20} /></a>}
          {resumeData.portfolio && <a href="#" className="text-green-600 hover:text-green-700"><Globe size={20} /></a>}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h4 className="font-bold text-slate-800 mb-2">About</h4>
        <p className="text-sm text-slate-600">{resumeData.summary || 'No summary added yet. Go to the Resume Builder to add your professional summary.'}</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h4 className="font-bold text-slate-800 mb-2">Skills</h4>
        <div className="flex flex-wrap gap-2">
          {(resumeData.skills.technical || '').split(',').filter(Boolean).map((s, i) => (
            <span key={i} className="rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs font-medium">{s.trim()}</span>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-slate-400">This is your public career profile visible to recruiters.</p>
    </div>
  );

  const renderAI = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
        <Sparkles size={40} className="mx-auto mb-3 text-amber-500" />
        <h3 className="text-lg font-bold text-slate-800">AI Resume Improvement Suggestions</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">Get personalized suggestions to make your resume stand out</p>
        <button onClick={generateAISuggestions} disabled={generating}
          className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition disabled:opacity-50">
          {generating ? <><Loader2 size={14} className="inline animate-spin mr-2" />Analyzing...</> : 'Analyze My Resume'}
        </button>
      </div>
      {aiSuggestions.length > 0 && (
        <div className="space-y-3">
          {aiSuggestions.map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${
              s.type === 'improvement' ? 'border-blue-200 bg-blue-50' :
              s.type === 'missing' ? 'border-amber-200 bg-amber-50' :
              s.type === 'keyword' ? 'border-green-200 bg-green-50' :
              'border-purple-200 bg-purple-50'}`}>
              <div className="flex items-start gap-3">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  s.type === 'improvement' ? 'bg-blue-200 text-blue-800' :
                  s.type === 'missing' ? 'bg-amber-200 text-amber-800' :
                  s.type === 'keyword' ? 'bg-green-200 text-green-800' :
                  'bg-purple-200 text-purple-800'}`}>{s.type}</span>
                <p className="text-sm text-slate-700">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {loadingData ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <span className="ml-3 text-slate-600">Loading resume data...</span>
        </div>
      ) : (
      <>
      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                activeSection === s.id ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Icon size={16} /> {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'builder' && renderBuilder()}
      {activeSection === 'preview' && renderPreview()}
      {activeSection === 'profile' && renderProfile()}
      {activeSection === 'ai' && renderAI()}
      </>
      )}
    </div>
  );
};

export default StudentResumeTab;
