import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Upload, Calendar, Users, BookOpen, Clock, Plus, X, Save, CheckCircle,
  Video, FileText, Code, ChevronDown, ChevronUp, Edit2, Trash2,
  Play, Star, BarChart3, Award, Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyTrainingManagementTab = ({ email, onBack }) => {
  const [activeSection, setActiveSection] = useState('materials');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [scheduleMsg, setScheduleMsg] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploadForm, setUploadForm] = useState({ title: '', type: 'PDF', category: 'Aptitude', description: '' });
  const [scheduleForm, setScheduleForm] = useState({ title: '', type: 'Workshop', date: '', time: '', duration: '', speaker: '', description: '' });

  const [materials, setMaterials] = useState([]);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchMaterials();
    fetchSessions();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/placements/training/materials`);
      setMaterials(res.data || []);
    } catch (e) { console.error('Failed to load materials:', e); }
    setLoadingData(false);
  };

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/placements/training/sessions`);
      setSessions(res.data || []);
    } catch (e) { console.error('Failed to load sessions:', e); }
  };

  const participation = [
    { studentName: 'Rahul Kumar', sessions: 8, total: 10, materials: 15, mockInterviews: 2 },
    { studentName: 'Priya Sharma', sessions: 10, total: 10, materials: 20, mockInterviews: 3 },
    { studentName: 'Amit Patel', sessions: 5, total: 10, materials: 8, mockInterviews: 1 },
    { studentName: 'Sneha Reddy', sessions: 7, total: 10, materials: 12, mockInterviews: 2 },
    { studentName: 'Vikram Singh', sessions: 3, total: 10, materials: 4, mockInterviews: 0 },
  ];

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) return;
    setUploading(true);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('type', uploadForm.type);
      formData.append('category', uploadForm.category);
      formData.append('description', uploadForm.description || '');
      formData.append('uploadedBy', email || 'Faculty');
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      const res = await axios.post(`${API_BASE}/api/placements/training/materials`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg('Material uploaded successfully!');
      setShowUploadModal(false);
      setUploadForm({ title: '', type: 'PDF', category: 'Aptitude', description: '' });
      setSelectedFile(null);
      fetchMaterials();
    } catch (err) {
      console.error(err);
      setUploadMsg('Failed to upload material');
    }
    setUploading(false);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) return;
    setScheduling(true);
    setScheduleMsg('');
    try {
      await axios.post(`${API_BASE}/api/placements/training/sessions`, {
        ...scheduleForm,
        createdBy: email || 'Faculty',
        status: 'Upcoming',
        enrolled: 0,
      });
      setScheduleMsg('Session scheduled successfully!');
      setShowScheduleModal(false);
      setScheduleForm({ title: '', type: 'Workshop', date: '', time: '', duration: '', speaker: '', description: '' });
      fetchSessions();
    } catch (err) {
      console.error(err);
      setScheduleMsg('Failed to schedule session');
    }
    setScheduling(false);
  };

  const deleteMaterial = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/placements/training/materials/${id}`);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (e) { console.error(e); }
  };
  const deleteSession = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/placements/training/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (e) { console.error(e); }
  };

  const getCatIcon = (cat) => {
    switch (cat) {
      case 'Aptitude': return <BookOpen size={14} />;
      case 'Coding': return <Code size={14} />;
      case 'Soft Skills': return <Star size={14} />;
      default: return <FileText size={14} />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video': return <Video size={14} className="text-red-500" />;
      case 'PDF': return <FileText size={14} className="text-blue-500" />;
      default: return <FileText size={14} className="text-slate-500" />;
    }
  };

  const renderMaterials = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">{materials.length} Training Materials</h3>
        <button onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700">
          <Upload size={14} /> Upload Material
        </button>
      </div>
      {loadingData ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-sky-600" size={24} /> <span className="ml-2 text-sm text-slate-500">Loading materials...</span></div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><FileText size={40} className="mx-auto mb-2 opacity-40" /><p>No training materials yet. Upload one to get started!</p></div>
      ) : (
      <div className="space-y-3">
        {materials.map(mat => (
          <div key={mat.id} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                {getTypeIcon(mat.type)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{mat.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">{getCatIcon(mat.category)} {mat.category}</span>
                  <span>{mat.type}</span>
                  <span>by {mat.uploadedBy}</span>
                  <span>{mat.createdAt ? new Date(mat.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{mat.downloads} downloads</span>
              {mat.fileUrl && <a href={mat.fileUrl.startsWith('http') ? mat.fileUrl : `${API_BASE}${mat.fileUrl}`} target="_blank" rel="noreferrer" className="text-sky-500 hover:text-sky-700 text-xs font-medium">View</a>}
              <button onClick={() => deleteMaterial(mat.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800">{sessions.length} Scheduled Sessions</h3>
        <button onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-medium hover:bg-purple-700">
          <Plus size={14} /> Schedule Session
        </button>
      </div>
      <div className="space-y-3">
        {sessions.map(session => (
          <div key={session.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedItem(expandedItem === session.id ? null : session.id)}>
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  session.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                  {session.type === 'Mock Interview' ? <Play size={16} /> :
                   session.type === 'Pre-Placement Talk' ? <Award size={16} /> :
                   <Calendar size={16} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{session.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {session.date} at {session.time}</span>
                    <span><Clock size={10} className="inline mr-0.5" />{session.duration}</span>
                    <span>{session.speaker}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  session.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {session.status}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={10} /> {session.enrolled}</span>
                {expandedItem === session.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>
            {expandedItem === session.id && (
              <div className="border-t border-slate-100 p-4 bg-slate-50 flex items-center justify-between">
                <div className="text-sm text-slate-600 space-y-1">
                  <div>Speaker: <strong>{session.speaker}</strong></div>
                  <div>Enrolled: <strong>{session.enrolled} students</strong></div>
                  {session.attended && <div>Attended: <strong>{session.attended} students</strong> ({Math.round((session.attended / session.enrolled) * 100)}%)</div>}
                </div>
                <button onClick={() => deleteSession(session.id)} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderParticipation = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Student Participation Tracker</h3>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-600">Student</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-600">Sessions</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-600">Materials</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-600">Mock Interviews</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-600">Progress</th>
            </tr>
          </thead>
          <tbody>
            {participation.map((p, i) => {
              const pct = Math.round((p.sessions / p.total) * 100);
              return (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.studentName}</td>
                  <td className="text-center px-4 py-3 text-slate-600">{p.sessions}/{p.total}</td>
                  <td className="text-center px-4 py-3 text-slate-600">{p.materials}</td>
                  <td className="text-center px-4 py-3 text-slate-600">{p.mockInterviews}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-8">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'materials', label: 'Training Materials', icon: BookOpen },
          { id: 'sessions', label: 'Workshops & Sessions', icon: Calendar },
          { id: 'participation', label: 'Participation Tracker', icon: BarChart3 },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeSection === s.id ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <Icon size={16} /> {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'materials' && renderMaterials()}
      {activeSection === 'sessions' && renderSessions()}
      {activeSection === 'participation' && renderParticipation()}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Upload Training Material</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                <input required value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={uploadForm.type} onChange={e => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {['PDF', 'Video', 'Document', 'Slides', 'Code'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                  <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {['Aptitude', 'Coding', 'Soft Skills', 'Interview Prep', 'Company Specific'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                <textarea rows={2} value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center text-slate-400 text-sm cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) setSelectedFile(e.dataTransfer.files[0]); }}>
                <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if (e.target.files.length) setSelectedFile(e.target.files[0]); }} />
                <Upload size={24} className="mx-auto mb-2" />
                {selectedFile ? (
                  <div className="text-sky-700 font-medium">
                    {selectedFile.name} <span className="text-slate-400 font-normal">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : 'Click to upload or drag & drop file here'}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => { setShowUploadModal(false); setSelectedFile(null); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={uploading}
                  className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition ${uploading ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>
                  {uploading ? <><Loader2 size={14} className="inline mr-1 animate-spin" /> Uploading...</> : <><Save size={14} className="inline mr-1" /> Upload</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Schedule Session</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSchedule} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                <input required value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                <select value={scheduleForm.type} onChange={e => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  {['Workshop', 'Mock Interview', 'Pre-Placement Talk', 'Webinar', 'Coding Contest'].map(t => <option key={t}>{t}</option>)}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                  <input value={scheduleForm.duration} onChange={e => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g. 2 hours" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Speaker</label>
                  <input value={scheduleForm.speaker} onChange={e => setScheduleForm({ ...scheduleForm, speaker: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
                <button type="submit" disabled={scheduling}
                  className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition ${scheduling ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                  {scheduling ? <><Loader2 size={14} className="inline mr-1 animate-spin" /> Scheduling...</> : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyTrainingManagementTab;
