import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText, Search, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
  MessageCircle, Star, Eye, AlertTriangle, ThumbsUp, ThumbsDown, User,
  GraduationCap, Briefcase, Code, Award
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyResumeReviewTab = ({ email, onBack }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [readinessFilter, setReadinessFilter] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [readinessMap, setReadinessMap] = useState({});
  const [savingFeedback, setSavingFeedback] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState({});
  const [savingReadiness, setSavingReadiness] = useState({});
  const [readinessMsg, setReadinessMsg] = useState({});

  useEffect(() => {
    fetchApplications();
    fetchReviews();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/placements/applications`);
      setApplications(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/placements/resume-reviews`);
      const reviews = res.data || [];
      const rMap = {};
      const fMap = {};
      reviews.forEach(r => {
        if (r.readinessStatus) rMap[r.studentId] = r.readinessStatus;
        if (r.feedback) fMap[r.studentId] = r.feedback;
      });
      setReadinessMap(prev => ({ ...prev, ...rMap }));
      setFeedbackMap(prev => ({ ...prev, ...fMap }));
    } catch (e) { console.error('Failed to load reviews:', e); }
  };

  const uniqueStudents = [];
  const seen = new Set();
  applications.forEach(a => {
    if (!seen.has(a.studentId)) {
      seen.add(a.studentId);
      uniqueStudents.push({
        studentId: a.studentId,
        studentName: a.studentName,
        studentEmail: a.studentEmail,
        applications: applications.filter(x => x.studentId === a.studentId),
      });
    }
  });

  const toggleReadiness = async (studentId, status, studentName, studentEmail) => {
    setSavingReadiness(prev => ({ ...prev, [studentId]: true }));
    setReadinessMsg(prev => ({ ...prev, [studentId]: '' }));
    try {
      await axios.put(`${API_BASE}/api/placements/resume-reviews/readiness`, {
        studentId,
        readinessStatus: status,
        reviewedBy: email,
        studentName,
        studentEmail,
      });
      setReadinessMap(prev => ({ ...prev, [studentId]: status }));
      setReadinessMsg(prev => ({ ...prev, [studentId]: status === 'ready' ? 'Marked as Placement Ready!' : 'Marked as Needs Improvement' }));
      setTimeout(() => setReadinessMsg(prev => ({ ...prev, [studentId]: '' })), 3000);
    } catch (e) {
      console.error(e);
      setReadinessMsg(prev => ({ ...prev, [studentId]: 'Failed to update status' }));
    }
    setSavingReadiness(prev => ({ ...prev, [studentId]: false }));
  };

  const handleFeedback = async (studentId, studentName, studentEmail) => {
    const text = feedbackMap[studentId];
    if (!text || !text.trim()) return;
    setSavingFeedback(prev => ({ ...prev, [studentId]: true }));
    setFeedbackMsg(prev => ({ ...prev, [studentId]: '' }));
    try {
      await axios.post(`${API_BASE}/api/placements/resume-reviews/feedback`, {
        studentId,
        feedback: text,
        reviewedBy: email,
        studentName,
        studentEmail,
      });
      setFeedbackMsg(prev => ({ ...prev, [studentId]: 'Feedback saved successfully!' }));
      setTimeout(() => setFeedbackMsg(prev => ({ ...prev, [studentId]: '' })), 3000);
    } catch (e) {
      console.error(e);
      setFeedbackMsg(prev => ({ ...prev, [studentId]: 'Failed to save feedback' }));
    }
    setSavingFeedback(prev => ({ ...prev, [studentId]: false }));
  };

  const filtered = uniqueStudents.filter(s => {
    const matchSearch = !searchTerm || s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchReadiness = readinessFilter === 'all' || readinessMap[s.studentId] === readinessFilter;
    return matchSearch && matchReadiness;
  });

  const readyCt = Object.values(readinessMap).filter(v => v === 'ready').length;
  const needsWorkCt = Object.values(readinessMap).filter(v => v === 'needs-work').length;
  const pendingCt = uniqueStudents.length - readyCt - needsWorkCt;

  // Mock resume data for each student
  const getMockResume = (name) => ({
    summary: `Motivated ${name?.split(' ')[0] || 'student'} with strong analytical skills and passion for technology.`,
    education: 'B.Tech in Computer Science, KLH University (CGPA: 8.2)',
    skills: ['Java', 'Python', 'SQL', 'React', 'Data Structures', 'Git'],
    projects: ['E-Commerce Platform using Spring Boot + React', 'ML-based Sentiment Analysis Tool'],
    internships: ['Software Intern at TechCorp (Summer 2024)'],
    certifications: ['AWS Cloud Practitioner', 'Google Data Analytics'],
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Clock className="animate-spin text-sky-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Search student name, email, or ID..." />
        </div>
        <select value={readinessFilter} onChange={e => setReadinessFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
          <option value="all">All Students</option>
          <option value="ready">Placement Ready</option>
          <option value="needs-work">Needs Improvement</option>
          <option value="pending">Pending Review</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: uniqueStudents.length, icon: User, color: 'text-sky-600 bg-sky-50' },
          { label: 'Placement Ready', value: readyCt, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Needs Improvement', value: needsWorkCt, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Pending Review', value: pendingCt, icon: Clock, color: 'text-slate-600 bg-slate-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}><Icon size={18} /></div>
              <div>
                <div className="text-xl font-black text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p>No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(student => {
            const resume = getMockResume(student.studentName);
            const readiness = readinessMap[student.studentId] || 'pending';
            return (
              <div key={student.studentId} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedStudent(expandedStudent === student.studentId ? null : student.studentId)}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                      {student.studentName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{student.studentName}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{student.studentEmail}</span>
                        <span>{student.applications.length} application(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      readiness === 'ready' ? 'bg-green-100 text-green-700' :
                      readiness === 'needs-work' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{readiness === 'ready' ? 'Ready' : readiness === 'needs-work' ? 'Needs Work' : 'Pending'}</span>
                    {expandedStudent === student.studentId ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {expandedStudent === student.studentId && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                    {/* Resume Preview */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h5 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-sky-600" /> Resume Preview
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-0.5">Summary</div>
                          <p className="text-slate-600">{resume.summary}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-0.5">Education</div>
                          <p className="text-slate-600 flex items-center gap-1"><GraduationCap size={12} /> {resume.education}</p>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-1">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {resume.skills.map((s, j) => (
                              <span key={j} className="rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-0.5">Projects</div>
                          {resume.projects.map((p, j) => (
                            <div key={j} className="text-slate-600 flex items-center gap-1"><Code size={12} /> {p}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-0.5">Internships</div>
                          {resume.internships.map((i, j) => (
                            <div key={j} className="text-slate-600 flex items-center gap-1"><Briefcase size={12} /> {i}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-400 mb-0.5">Certifications</div>
                          {resume.certifications.map((c, j) => (
                            <div key={j} className="text-slate-600 flex items-center gap-1"><Award size={12} /> {c}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm">
                        <MessageCircle size={14} className="text-purple-600" /> Feedback & Comments
                      </h5>
                      <textarea
                        value={feedbackMap[student.studentId] || ''}
                        onChange={e => setFeedbackMap(prev => ({ ...prev, [student.studentId]: e.target.value }))}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 mb-2"
                        placeholder="Write feedback for this student's resume and profile..." />
                      <button onClick={() => handleFeedback(student.studentId, student.studentName, student.studentEmail)}
                        disabled={savingFeedback[student.studentId] || !feedbackMap[student.studentId]?.trim()}
                        className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${savingFeedback[student.studentId] || !feedbackMap[student.studentId]?.trim() ? 'bg-purple-300 text-white cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                        {savingFeedback[student.studentId] ? 'Saving...' : 'Save Feedback'}
                      </button>
                      {feedbackMsg[student.studentId] && (
                        <span className={`ml-2 text-xs font-medium ${feedbackMsg[student.studentId].includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                          {feedbackMsg[student.studentId]}
                        </span>
                      )}
                    </div>

                    {/* Readiness Actions */}
                    <div className="flex gap-2 items-center">
                      <button onClick={() => toggleReadiness(student.studentId, 'ready', student.studentName, student.studentEmail)}
                        disabled={savingReadiness[student.studentId]}
                        className={`flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition ${
                          readiness === 'ready' ? 'bg-green-600 text-white' : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'}`}>
                        <ThumbsUp size={12} /> {savingReadiness[student.studentId] ? 'Saving...' : 'Mark Placement Ready'}
                      </button>
                      <button onClick={() => toggleReadiness(student.studentId, 'needs-work', student.studentName, student.studentEmail)}
                        disabled={savingReadiness[student.studentId]}
                        className={`flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition ${
                          readiness === 'needs-work' ? 'bg-amber-600 text-white' : 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'}`}>
                        <ThumbsDown size={12} /> {savingReadiness[student.studentId] ? 'Saving...' : 'Needs Improvement'}
                      </button>
                      {readinessMsg[student.studentId] && (
                        <span className={`text-xs font-medium ${readinessMsg[student.studentId].includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                          {readinessMsg[student.studentId]}
                        </span>
                      )}
                    </div>

                    {/* Application Summary */}
                    <div>
                      <h5 className="text-xs font-bold text-slate-600 mb-2">Applications ({student.applications.length})</h5>
                      <div className="space-y-1">
                        {student.applications.map((a, i) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-white rounded-lg border border-slate-100 p-2">
                            <span>{a.position} at {a.company}</span>
                            <span className={`rounded-full px-2 py-0.5 font-bold ${
                              a.status === 'Selected' ? 'bg-green-100 text-green-700' :
                              a.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{a.status}</span>
                          </div>
                        ))}
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

export default FacultyResumeReviewTab;
