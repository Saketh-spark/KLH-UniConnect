import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Plus, Edit2, Trash2, Eye, Users, Clock, AlertCircle,
  CheckCircle2, BarChart3, Search as SearchIcon, Copy, X, ChevronRight,
  FileText, BookOpen, Settings, List, Award, Calendar, Sparkles, Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const statusColor = (s) => ({
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  RESULTS_PUBLISHED: 'bg-purple-100 text-purple-700'
}[s] || 'bg-gray-100 text-gray-700');

const diffColor = (d) => ({
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HARD: 'bg-red-100 text-red-700'
}[d] || 'bg-gray-100 text-gray-700');

const Spinner = () => (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
  </div>
);

const Empty = ({ text }) => (
  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
    <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
    <p className="text-slate-500">{text}</p>
  </div>
);

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
const FacultyTestExam = ({ email = '', onBack = () => {} }) => {
  // Navigation: list | detail | create | questions
  const [view, setView] = useState('list');
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Detail view state
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [detailTab, setDetailTab] = useState('questions'); // questions | attempts | settings
  const [detailLoading, setDetailLoading] = useState(false);

  // Modals
  const [scheduleModal, setScheduleModal] = useState(null);
  const [addQuestionsModal, setAddQuestionsModal] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [showInlineQuestionForm, setShowInlineQuestionForm] = useState(false);

  // Schedule form
  const [assignMode, setAssignMode] = useState('all'); // 'all' | 'select'
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Exam form
  const emptyExamForm = {
    title: '', subject: '', description: '', instructions: '',
    durationMinutes: 60, totalMarks: 100,
    autoSubmitOnTimeout: true, negativeMark: false, negativeMarkPercent: 25,
    shuffleQuestions: false, shuffleOptions: false
  };
  const [formData, setFormData] = useState({ ...emptyExamForm });
  const [editingExam, setEditingExam] = useState(false);

  // Question form
  const emptyQForm = {
    questionText: '', questionType: 'MCQ', subject: '', unit: '',
    difficulty: 'MEDIUM', marks: 1, options: ['', '', '', ''],
    correctAnswer: 'A', explanation: ''
  };
  const [qForm, setQForm] = useState({ ...emptyQForm });

  // AI Question Generation
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    syllabus: '', count: 10, questionType: 'MCQ', difficulty: 'MIXED', marksPerQuestion: 1
  });
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState([]);
  const [generateStep, setGenerateStep] = useState('form'); // form | preview

  // AI Generation during exam creation
  const [showCreateAI, setShowCreateAI] = useState(false);
  const [createAIQuestions, setCreateAIQuestions] = useState([]);
  const [createAIGenerating, setCreateAIGenerating] = useState(false);
  const [createAIForm, setCreateAIForm] = useState({
    syllabus: '', count: 10, questionType: 'MCQ', difficulty: 'MIXED', marksPerQuestion: 1
  });

  /* ─── DATA FETCHING ─────────────────────────────────────── */
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/api/exams/faculty`, { headers: { 'X-Faculty-Id': email } });
      if (r.ok) setExams(await r.json());
    } catch (e) { console.error('fetchExams:', e); }
    finally { setLoading(false); }
  }, [email]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API_BASE}/api/exams/questions/faculty`, { headers: { 'X-Faculty-Id': email } });
      if (r.ok) setQuestions(await r.json());
    } catch (e) { console.error('fetchQuestions:', e); }
    finally { setLoading(false); }
  }, [email]);

  const fetchExamDetail = useCallback(async (examId) => {
    try {
      setDetailLoading(true);
      const [examR, questionsR, attemptsR] = await Promise.all([
        fetch(`${API_BASE}/api/exams/${examId}`, { headers: { 'X-Faculty-Id': email } }),
        fetch(`${API_BASE}/api/exams/${examId}/questions`, { headers: { 'X-Faculty-Id': email } }),
        fetch(`${API_BASE}/api/exams/${examId}/attempts`, { headers: { 'X-Faculty-Id': email } })
      ]);
      if (examR.ok) setSelectedExam(await examR.json());
      if (questionsR.ok) setExamQuestions(await questionsR.json());
      if (attemptsR.ok) setExamAttempts(await attemptsR.json());
    } catch (e) { console.error('fetchExamDetail:', e); }
    finally { setDetailLoading(false); }
  }, [email]);

  useEffect(() => {
    if (view === 'list') fetchExams();
    if (view === 'questions') { fetchExams(); fetchQuestions(); }
  }, [view, fetchExams, fetchQuestions]);

  useEffect(() => {
    if (selectedExamId) fetchExamDetail(selectedExamId);
  }, [selectedExamId, fetchExamDetail]);

  const openDetail = (exam) => {
    setSelectedExamId(exam.id);
    setSelectedExam(exam);
    setDetailTab('questions');
    setView('detail');
  };

  /* ─── ACTIONS ───────────────────────────────────────────── */
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API_BASE}/api/exams/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify({ ...formData })
      });
      if (!r.ok) throw new Error('Failed');
      const newExam = await r.json();

      // If AI questions were generated, add them to the new exam
      if (createAIQuestions.length > 0 && newExam?.id) {
        const qIds = createAIQuestions.map(q => q.id);
        await fetch(`${API_BASE}/api/exams/${newExam.id}/add-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
          body: JSON.stringify(qIds)
        });
        alert(`Exam created with ${createAIQuestions.length} AI-generated questions!`);
      } else {
        alert('Exam created successfully!');
      }
      setFormData({ ...emptyExamForm });
      setCreateAIQuestions([]);
      setCreateAIForm({ syllabus: '', count: 10, questionType: 'MCQ', difficulty: 'MIXED', marksPerQuestion: 1 });
      setShowCreateAI(false);
      setView('list');
    } catch (err) { alert('Failed to create exam: ' + err.message); }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API_BASE}/api/exams/${selectedExamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify(formData)
      });
      if (!r.ok) throw new Error('Failed');
      alert('Exam updated!');
      setEditingExam(false);
      fetchExamDetail(selectedExamId);
      fetchExams();
    } catch (err) { alert('Failed to update: ' + err.message); }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Delete this exam? This cannot be undone.')) return;
    try {
      const r = await fetch(`${API_BASE}/api/exams/${examId}`, {
        method: 'DELETE', headers: { 'X-Faculty-Id': email }
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message || 'Failed'); }
      alert('Exam deleted.');
      setView('list');
      fetchExams();
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  const handleDuplicateExam = async (examId) => {
    try {
      const r = await fetch(`${API_BASE}/api/exams/${examId}/duplicate`, {
        method: 'POST', headers: { 'X-Faculty-Id': email }
      });
      if (!r.ok) throw new Error('Failed');
      alert('Exam duplicated!');
      fetchExams();
      if (view === 'detail') setView('list');
    } catch (err) { alert('Duplicate failed: ' + err.message); }
  };

  const handleSchedule = async () => {
    if (!scheduleStartTime) { alert('Please select a start date and time'); return; }
    if (assignMode === 'select' && !selectedStudents.length) {
      alert('Please select at least one student'); return;
    }
    try {
      const startDt = new Date(scheduleStartTime);
      let endDt;
      if (scheduleEndTime) {
        endDt = new Date(scheduleEndTime);
      } else {
        const exam = exams.find(e => e.id === scheduleModal) || selectedExam;
        const duration = exam?.durationMinutes || 60;
        endDt = new Date(startDt.getTime() + duration * 60000);
      }
      if (endDt <= startDt) { alert('End time must be after start time'); return; }
      if (startDt < new Date()) { alert('Start time must be in the future'); return; }

      const body = {
        startTime: startDt.toISOString(),
        endTime: endDt.toISOString()
      };
      if (assignMode === 'all') {
        body.assignAll = true;
      } else {
        body.studentEmails = selectedStudents.map(s => s.email);
      }

      const r = await fetch(`${API_BASE}/api/exams/${scheduleModal}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Failed');
      const count = assignMode === 'all' ? allStudents.length : selectedStudents.length;
      alert(`Exam scheduled for ${count} student(s)! Starts at ${startDt.toLocaleString()}`);
      setScheduleModal(null);
      setScheduleStartTime('');
      setScheduleEndTime('');
      setSelectedStudents([]);
      setStudentSearch('');
      setAssignMode('all');
      fetchExams();
      if (selectedExamId) fetchExamDetail(selectedExamId);
    } catch (err) { alert('Schedule failed: ' + err.message); }
  };

  // Fetch all students from DB for scheduling
  const fetchAllStudents = async () => {
    setLoadingStudents(true);
    try {
      const r = await fetch(`${API_BASE}/api/exams/students/all`);
      if (r.ok) {
        const data = await r.json();
        setAllStudents(data);
        setSearchResults(data);
      }
    } catch (e) { console.error('fetchAllStudents:', e); }
    finally { setLoadingStudents(false); }
  };

  // Search students from DB
  const handleStudentSearch = async (query) => {
    setStudentSearch(query);
    if (!query.trim()) {
      setSearchResults(allStudents);
      return;
    }
    try {
      const r = await fetch(`${API_BASE}/api/exams/students/search?q=${encodeURIComponent(query.trim())}`);
      if (r.ok) setSearchResults(await r.json());
    } catch (e) { console.error('searchStudents:', e); }
  };

  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const exists = prev.find(s => s.email === student.email);
      if (exists) return prev.filter(s => s.email !== student.email);
      return [...prev, student];
    });
  };

  const isStudentSelected = (student) => selectedStudents.some(s => s.email === student.email);

  // Load students when schedule modal opens
  useEffect(() => {
    if (scheduleModal) fetchAllStudents();
  }, [scheduleModal]);

  const handlePublishResults = async (examId) => {
    if (!window.confirm('Publish results? Students will see their scores.')) return;
    try {
      const r = await fetch(`${API_BASE}/api/exams/${examId}/publish-results`, {
        method: 'POST', headers: { 'X-Faculty-Id': email }
      });
      if (!r.ok) throw new Error('Failed');
      alert('Results published!');
      fetchExams();
      if (selectedExamId === examId) fetchExamDetail(examId);
    } catch (err) { alert('Publish failed: ' + err.message); }
  };

  // Questions management
  const handleCreateQuestion = async (e, forExam = false) => {
    e.preventDefault();
    try {
      const r = await fetch(`${API_BASE}/api/exams/questions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify(qForm)
      });
      if (!r.ok) throw new Error('Failed');
      const newQ = await r.json();
      alert('Question created!');
      setQForm({ ...emptyQForm });

      // If creating from exam detail, also add to exam
      if (forExam && selectedExamId && newQ.id) {
        await fetch(`${API_BASE}/api/exams/${selectedExamId}/add-questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
          body: JSON.stringify([newQ.id])
        });
        fetchExamDetail(selectedExamId);
        setShowInlineQuestionForm(false);
      }
      fetchQuestions();
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const handleAddQuestionsToExam = async () => {
    if (!selectedQuestionIds.size) { alert('Select at least one question'); return; }
    try {
      const r = await fetch(`${API_BASE}/api/exams/${selectedExamId}/add-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify([...selectedQuestionIds])
      });
      if (!r.ok) throw new Error('Failed');
      alert(`${selectedQuestionIds.size} question(s) added to exam!`);
      setAddQuestionsModal(false);
      setSelectedQuestionIds(new Set());
      fetchExamDetail(selectedExamId);
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const handleRemoveQuestionFromExam = async (qId) => {
    if (!window.confirm('Remove this question from the exam?')) return;
    try {
      const r = await fetch(`${API_BASE}/api/exams/${selectedExamId}/remove-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify([qId])
      });
      if (!r.ok) throw new Error('Failed');
      fetchExamDetail(selectedExamId);
    } catch (err) { alert('Failed: ' + err.message); }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      const r = await fetch(`${API_BASE}/api/exams/questions/${qId}`, {
        method: 'DELETE', headers: { 'X-Faculty-Id': email }
      });
      if (!r.ok) throw new Error('Failed');
      fetchQuestions();
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  /* ─── AI QUESTION GENERATION ─────────────────────────── */
  const handleGenerateQuestions = async () => {
    if (!generateForm.syllabus.trim()) { alert('Please enter a syllabus or topic description.'); return; }
    setGenerating(true);
    try {
      const ex = selectedExam;
      const body = {
        syllabus: generateForm.syllabus,
        subject: ex?.subject || '',
        questionType: generateForm.questionType,
        count: generateForm.count,
        difficulty: generateForm.difficulty,
        marksPerQuestion: generateForm.marksPerQuestion
      };
      const r = await fetch(`${API_BASE}/api/exams/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error('Generation failed');
      const data = await r.json();
      if (data.success && data.questions?.length) {
        setGeneratedPreview(data.questions);
        setGenerateStep('preview');
      } else {
        alert(data.message || 'No questions generated. Try a more detailed syllabus.');
      }
    } catch (err) { alert('Generation failed: ' + err.message); }
    finally { setGenerating(false); }
  };

  const handleAddGeneratedToExam = async () => {
    if (!generatedPreview.length || !selectedExamId) return;
    try {
      const qIds = generatedPreview.map(q => q.id);
      const r = await fetch(`${API_BASE}/api/exams/${selectedExamId}/add-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
        body: JSON.stringify(qIds)
      });
      if (!r.ok) throw new Error('Failed to add questions');
      setShowGenerateModal(false);
      setGenerateStep('form');
      setGeneratedPreview([]);
      setGenerateForm({ syllabus: '', count: 10, questionType: 'MCQ', difficulty: 'MIXED', marksPerQuestion: 1 });
      fetchExamDetail(selectedExamId);
    } catch (err) { alert('Failed to add: ' + err.message); }
  };

  const toggleQuestionSelect = (qId) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  // Open edit form for exam
  const openEditExam = () => {
    if (!selectedExam) return;
    setFormData({
      title: selectedExam.title || '',
      subject: selectedExam.subject || '',
      description: selectedExam.description || '',
      instructions: selectedExam.instructions || '',
      durationMinutes: selectedExam.durationMinutes || 60,
      totalMarks: selectedExam.totalMarks || 100,
      autoSubmitOnTimeout: selectedExam.autoSubmitOnTimeout ?? true,
      negativeMark: selectedExam.negativeMark ?? false,
      negativeMarkPercent: selectedExam.negativeMarkPercent ?? 25,
      shuffleQuestions: selectedExam.shuffleQuestions ?? false,
      shuffleOptions: selectedExam.shuffleOptions ?? false
    });
    setEditingExam(true);
  };

  /* ─── TAB BAR ───────────────────────────────────────────── */
  const tabs = [
    { key: 'list', label: 'My Exams', icon: FileText },
    { key: 'questions', label: 'Question Bank', icon: BookOpen },
    { key: 'create', label: 'Create Exam', icon: Plus }
  ];

  const renderTabBar = () => (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => { setView(t.key); setEditingExam(false); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition
            ${view === t.key || (view === 'detail' && t.key === 'list')
              ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <t.icon className="h-4 w-4" />
          {t.label}
        </button>
      ))}
    </div>
  );

  /* ─── STATS CARDS ───────────────────────────────────────── */
  const stats = [
    { label: 'Total', value: exams.length, color: 'bg-blue-50 text-blue-700' },
    { label: 'Draft', value: exams.filter(e => e.status === 'DRAFT').length, color: 'bg-gray-50 text-gray-700' },
    { label: 'Scheduled', value: exams.filter(e => e.status === 'SCHEDULED').length, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Ongoing', value: exams.filter(e => e.status === 'ONGOING').length, color: 'bg-orange-50 text-orange-700' },
    { label: 'Completed', value: exams.filter(e => ['COMPLETED', 'RESULTS_PUBLISHED'].includes(e.status)).length, color: 'bg-green-50 text-green-700' }
  ];

  /* ─── SCHEDULE MODAL (reusable) ───────────────────────────── */
  const renderScheduleModal = () => {
    if (!scheduleModal) return null;
    const closeModal = () => {
      setScheduleModal(null);
      setScheduleStartTime('');
      setScheduleEndTime('');
      setSelectedStudents([]);
      setStudentSearch('');
      setAssignMode('all');
    };
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Schedule Exam</h2>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Date/time fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date & Time *</label>
                <input type="datetime-local" value={scheduleStartTime} onChange={e => setScheduleStartTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">End Date & Time <span className="text-slate-400 font-normal">(optional)</span></label>
                <input type="datetime-local" value={scheduleEndTime} onChange={e => setScheduleEndTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            {scheduleStartTime && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Starts:</strong> {new Date(scheduleStartTime).toLocaleString()}
                  {scheduleEndTime
                    ? <> &nbsp;|&nbsp; <strong>Ends:</strong> {new Date(scheduleEndTime).toLocaleString()}</>
                    : <> &nbsp;|&nbsp; <strong>Ends:</strong> Auto ({(() => { const ex = exams.find(e => e.id === scheduleModal) || selectedExam; return ex?.durationMinutes || 60; })()} min after start)</>}
                </p>
              </div>
            )}

            {/* Assign Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Assign To</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setAssignMode('all')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition
                    ${assignMode === 'all'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                  <Users className="h-4 w-4" />
                  All Students
                  {allStudents.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{allStudents.length}</span>}
                </button>
                <button type="button" onClick={() => setAssignMode('select')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 text-sm font-semibold transition
                    ${assignMode === 'select'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                  <SearchIcon className="h-4 w-4" />
                  Select Students
                  {selectedStudents.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{selectedStudents.length}</span>}
                </button>
              </div>
            </div>

            {/* All Students Mode */}
            {assignMode === 'all' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">All students will be assigned</span>
                </div>
                <p className="text-xs text-green-700">
                  {loadingStudents ? 'Loading students from database...' :
                    `${allStudents.length} student(s) found in the database will be enrolled in this exam.`}
                </p>
                {!loadingStudents && allStudents.length > 0 && (
                  <div className="mt-3 max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-1.5">
                      {allStudents.slice(0, 20).map(s => (
                        <span key={s.email} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-green-200 rounded-md text-xs text-green-800">
                          {s.name || s.rollNumber}
                        </span>
                      ))}
                      {allStudents.length > 20 && (
                        <span className="px-2 py-1 text-xs text-green-600 font-semibold">+{allStudents.length - 20} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Select Students Mode */}
            {assignMode === 'select' && (
              <div className="space-y-3">
                {/* Selected students chips */}
                {selectedStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {selectedStudents.map(s => (
                      <span key={s.email}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-300 rounded-full text-xs text-blue-800 font-medium">
                        {s.name || s.rollNumber}
                        <button type="button" onClick={() => toggleStudentSelection(s)}
                          className="text-blue-400 hover:text-red-500 ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <span className="text-xs text-blue-600 font-semibold self-center ml-1">
                      {selectedStudents.length} selected
                    </span>
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" value={studentSearch}
                    onChange={e => handleStudentSearch(e.target.value)}
                    placeholder="Search by name, roll number, email, branch..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {/* Student list */}
                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  {loadingStudents ? (
                    <div className="p-6 text-center text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin inline mr-2" />Loading students...</div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">No students found</div>
                  ) : (
                    searchResults.map(s => {
                      const selected = isStudentSelected(s);
                      return (
                        <button key={s.email} type="button"
                          onClick={() => toggleStudentSelection(s)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm border-b border-slate-100 last:border-b-0 transition
                            ${selected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition
                            ${selected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                            {selected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-slate-900">{s.name || s.email}</span>
                            <span className="text-slate-500 ml-2">{s.rollNumber}</span>
                          </div>
                          <div className="text-xs text-slate-400 flex-shrink-0">
                            {[s.branch, s.year, s.section].filter(Boolean).join(' · ')}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-200">
            <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); handleSchedule(); }}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" /> Schedule Exam{assignMode === 'all' ? ` for All (${allStudents.length})` : ` for ${selectedStudents.length} Student(s)`}
            </button>
            <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); closeModal(); }}
              className="flex-1 bg-slate-200 text-slate-900 py-2.5 rounded-lg hover:bg-slate-300 font-semibold">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ─── QUESTION FORM (reusable) ──────────────────────────── */
  const renderQuestionForm = (onSubmit, submitLabel = 'Add Question') => (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Type</label>
          <select value={qForm.questionType} onChange={e => setQForm({...qForm, questionType: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option>MCQ</option><option>DESCRIPTIVE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Subject</label>
          <input value={qForm.subject} onChange={e => setQForm({...qForm, subject: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. DSA" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Question Text</label>
        <textarea value={qForm.questionText} onChange={e => setQForm({...qForm, questionText: e.target.value})}
          required className="w-full px-3 py-2 border border-slate-300 rounded-lg h-20 text-sm" placeholder="Enter question..." />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Difficulty</label>
          <select value={qForm.difficulty} onChange={e => setQForm({...qForm, difficulty: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option>EASY</option><option>MEDIUM</option><option>HARD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Marks</label>
          <input type="number" value={qForm.marks} onChange={e => setQForm({...qForm, marks: parseInt(e.target.value) || 1})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Unit</label>
          <input value={qForm.unit} onChange={e => setQForm({...qForm, unit: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Unit 1" />
        </div>
      </div>
      {qForm.questionType === 'MCQ' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {qForm.options.map((opt, i) => (
              <div key={i}>
                <label className="block text-sm font-semibold mb-1">Option {String.fromCharCode(65 + i)}</label>
                <input value={opt} onChange={e => {
                  const opts = [...qForm.options]; opts[i] = e.target.value;
                  setQForm({...qForm, options: opts});
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Correct Answer</label>
            <select value={qForm.correctAnswer} onChange={e => setQForm({...qForm, correctAnswer: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              {['A','B','C','D'].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-semibold mb-1">Explanation (optional)</label>
        <textarea value={qForm.explanation} onChange={e => setQForm({...qForm, explanation: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg h-16 text-sm" placeholder="Why is this the answer?" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">
        {submitLabel}
      </button>
    </form>
  );

  /* ─── EXAM FORM (reusable for create & edit) ────────────── */
  const renderExamForm = (onSubmit, submitLabel = 'Create Exam', onCancel) => (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Exam Title</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              required className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g., Midterm Exam" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Subject</label>
              <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                required className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g., Data Structures" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Total Marks</label>
              <input type="number" value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Duration (min)</label>
              <input type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                required className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Description</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Short description..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1">Instructions</label>
            <textarea value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg h-20" placeholder="Enter exam instructions..." />
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Settings</h2>
        <div className="space-y-3">
          {[
            { key: 'autoSubmitOnTimeout', label: 'Auto-submit on timeout' },
            { key: 'negativeMark', label: 'Enable negative marking' },
            { key: 'shuffleQuestions', label: 'Shuffle questions' },
            { key: 'shuffleOptions', label: 'Shuffle options' }
          ].map(s => (
            <label key={s.key} className="flex items-center gap-3">
              <input type="checkbox" checked={formData[s.key]} onChange={e => setFormData({...formData, [s.key]: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-slate-900 font-medium">{s.label}</span>
            </label>
          ))}
          {formData.negativeMark && (
            <div className="ml-7">
              <label className="block text-sm font-semibold mb-1">Negative Mark %</label>
              <input type="number" value={formData.negativeMarkPercent}
                onChange={e => setFormData({...formData, negativeMarkPercent: parseInt(e.target.value)})}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          )}
        </div>
      </div>
      {/* AI Question Generation Section (Create mode) */}
      {submitLabel === 'Create Exam' && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button type="button" onClick={() => setShowCreateAI(!showCreateAI)}
            className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-900 text-sm">AI Question Generator</span>
                <p className="text-xs text-slate-500">Auto-generate questions from syllabus while creating the exam</p>
              </div>
            </div>
            <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${showCreateAI ? 'rotate-90' : ''}`} />
          </button>

          {showCreateAI && (
            <div className="p-5 space-y-4 bg-white border-t border-slate-200">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Syllabus / Topic Description *</label>
                <textarea value={createAIForm.syllabus}
                  onChange={e => setCreateAIForm(f => ({...f, syllabus: e.target.value}))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  rows="4" placeholder={"Enter topics, syllabus content, or a description...\n\nExample:\n- Data Structures: Arrays, Linked Lists, Trees\n- Sorting Algorithms: Bubble Sort, Quick Sort"} />
                <p className="text-xs text-slate-400 mt-1">Include specific topics and keywords for better question quality.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Questions</label>
                  <select value={createAIForm.count}
                    onChange={e => setCreateAIForm(f => ({...f, count: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={createAIForm.questionType}
                    onChange={e => setCreateAIForm(f => ({...f, questionType: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500">
                    <option value="MCQ">MCQ</option>
                    <option value="DESCRIPTIVE">Descriptive</option>
                    <option value="MIXED">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Difficulty</label>
                  <select value={createAIForm.difficulty}
                    onChange={e => setCreateAIForm(f => ({...f, difficulty: e.target.value}))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="MIXED">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Marks Each</label>
                  <input type="number" min="1" max="20" value={createAIForm.marksPerQuestion}
                    onChange={e => setCreateAIForm(f => ({...f, marksPerQuestion: parseInt(e.target.value) || 1}))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500" />
                </div>
              </div>

              <button type="button" disabled={createAIGenerating || !createAIForm.syllabus.trim()}
                onClick={async () => {
                  setCreateAIGenerating(true);
                  try {
                    const body = {
                      syllabus: createAIForm.syllabus,
                      subject: formData.subject || '',
                      questionType: createAIForm.questionType,
                      count: createAIForm.count,
                      difficulty: createAIForm.difficulty,
                      marksPerQuestion: createAIForm.marksPerQuestion
                    };
                    const r = await fetch(`${API_BASE}/api/exams/generate-questions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': email },
                      body: JSON.stringify(body)
                    });
                    if (!r.ok) throw new Error('Generation failed');
                    const data = await r.json();
                    if (data.success && data.questions?.length) {
                      setCreateAIQuestions(data.questions);
                    } else {
                      alert(data.message || 'No questions generated. Try a more detailed syllabus.');
                    }
                  } catch (err) { alert('Generation failed: ' + err.message); }
                  finally { setCreateAIGenerating(false); }
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-violet-700 hover:to-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                {createAIGenerating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating Questions...</> : <><Sparkles className="h-4 w-4" /> Generate {createAIForm.count} Questions</>}
              </button>

              {/* Preview of generated questions */}
              {createAIQuestions.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> {createAIQuestions.length} questions generated
                    </p>
                    <button type="button" onClick={() => setCreateAIQuestions([])}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold">Clear All</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {createAIQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                        <div className="flex gap-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{q.questionText}</p>
                            {q.questionType === 'MCQ' && q.options && (
                              <div className="mt-1 space-y-0.5">
                                {q.options.map((opt, oi) => {
                                  const letter = String.fromCharCode(65 + oi);
                                  const isCorrect = q.correctAnswer === letter;
                                  return (
                                    <p key={oi} className={`text-xs px-2 py-0.5 rounded ${isCorrect ? 'bg-green-50 text-green-700 font-semibold' : 'text-slate-500'}`}>
                                      {letter}. {opt} {isCorrect && '✓'}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                            <div className="flex gap-2 mt-1 text-xs text-slate-400">
                              <span className={`px-1.5 py-0.5 rounded font-semibold ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                              <span>{q.questionType}</span>
                              <span>{q.marks}m</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 italic">These questions will be automatically added when you create the exam.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
          {submitLabel} {createAIQuestions.length > 0 && submitLabel === 'Create Exam' && `(+ ${createAIQuestions.length} AI Questions)`}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg hover:bg-slate-300 font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );

  /* ═══════════════════════════════════════════════════════════
     VIEW: EXAM DETAIL
     ═══════════════════════════════════════════════════════════ */
  if (view === 'detail' && selectedExam) {
    const ex = selectedExam;
    const isDraft = ex.status === 'DRAFT';
    const isCompleted = ex.status === 'COMPLETED';

    // Editing mode
    if (editingExam && isDraft) {
      return (
        <div className="min-h-screen bg-slate-50">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <button onClick={() => setEditingExam(false)} className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <ArrowLeft className="h-4 w-4" /> Back to Exam Details
              </button>
              <h1 className="text-2xl font-black text-slate-900">Edit Exam: {ex.title}</h1>
            </div>
          </header>
          <main className="mx-auto max-w-4xl px-6 py-8">
            {renderExamForm(handleUpdateExam, 'Save Changes', () => setEditingExam(false))}
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <button onClick={() => { setView('list'); setSelectedExamId(null); setSelectedExam(null); }}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Exams
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900">{ex.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor(ex.status)}`}>{ex.status}</span>
                </div>
                <p className="text-slate-500 mt-1">{ex.subject}{ex.description ? ` — ${ex.description}` : ''}</p>
              </div>
              {renderTabBar()}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-6">
          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Questions', value: examQuestions.length, icon: FileText },
              { label: 'Duration', value: `${ex.durationMinutes} min`, icon: Clock },
              { label: 'Total Marks', value: ex.totalMarks, icon: Award },
              { label: 'Attempts', value: ex.totalAttempts || examAttempts.length, icon: Users },
              { label: 'Enrolled', value: ex.enrolledStudentsIds?.length || 0, icon: Users }
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                <s.icon className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {isDraft && (
              <>
                <button onClick={openEditExam}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-semibold flex items-center gap-2">
                  <Edit2 className="h-4 w-4" /> Edit Exam
                </button>
                <button onClick={() => setScheduleModal(ex.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Schedule
                </button>
                <button onClick={() => handleDeleteExam(ex.id)}
                  className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-semibold flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </>
            )}
            <button onClick={() => handleDuplicateExam(ex.id)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-semibold flex items-center gap-2">
              <Copy className="h-4 w-4" /> Duplicate
            </button>
            {isCompleted && !ex.resultsPublished && (
              <button onClick={() => handlePublishResults(ex.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Publish Results
              </button>
            )}
          </div>

          {/* Detail Tabs */}
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
            {[
              { key: 'questions', label: 'Questions', icon: List },
              { key: 'attempts', label: 'Student Attempts', icon: Users },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(t => (
              <button key={t.key} onClick={() => setDetailTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition
                  ${detailTab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {detailLoading ? <Spinner /> : (
            <>
              {/* Questions Tab */}
              {detailTab === 'questions' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Exam Questions ({examQuestions.length})</h2>
                    {isDraft && (
                      <div className="flex gap-2">
                        <button onClick={() => { fetchQuestions(); setSelectedQuestionIds(new Set()); setAddQuestionsModal(true); }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Add from Bank
                        </button>
                        <button onClick={() => { setQForm({...emptyQForm, subject: ex.subject}); setShowInlineQuestionForm(!showInlineQuestionForm); }}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold flex items-center gap-2">
                          <Plus className="h-4 w-4" /> Create New
                        </button>
                        <button onClick={() => { setGenerateForm(f => ({...f, syllabus: '', count: 10, questionType: 'MCQ', difficulty: 'MIXED', marksPerQuestion: 1})); setGenerateStep('form'); setGeneratedPreview([]); setShowGenerateModal(true); }}
                          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 text-sm font-semibold flex items-center gap-2 shadow-md">
                          <Sparkles className="h-4 w-4" /> AI Generate
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inline Question Creator */}
                  {showInlineQuestionForm && isDraft && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-slate-700">Create & Add Question to Exam</h3>
                        <button onClick={() => setShowInlineQuestionForm(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      {renderQuestionForm((e) => handleCreateQuestion(e, true), 'Create & Add to Exam')}
                    </div>
                  )}

                  {examQuestions.length === 0 ? (
                    <Empty text="No questions added yet. Add from the question bank or create new ones." />
                  ) : (
                    <div className="space-y-3">
                      {examQuestions.map((q, idx) => (
                        <div key={q.id} className="bg-white rounded-lg border border-slate-200 p-5">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 flex-1">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 mb-2">{q.questionText}</p>
                                {q.questionType === 'MCQ' && q.options && (
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    {q.options.map((opt, oi) => (
                                      <div key={oi} className={`px-3 py-1.5 rounded text-sm
                                        ${String.fromCharCode(65 + oi) === q.correctAnswer
                                          ? 'bg-green-50 text-green-800 border border-green-200 font-semibold'
                                          : 'bg-slate-50 text-slate-700 border border-slate-200'}`}>
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-3 text-xs text-slate-500">
                                  <span className={`px-2 py-0.5 rounded font-semibold ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                                  <span>{q.questionType}</span>
                                  <span>{q.marks} marks</span>
                                  {q.explanation && <span className="text-blue-600">Has explanation</span>}
                                </div>
                              </div>
                            </div>
                            {isDraft && (
                              <button onClick={() => handleRemoveQuestionFromExam(q.id)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Remove from exam">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Attempts Tab */}
              {detailTab === 'attempts' && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Student Attempts ({examAttempts.length})</h2>
                  {examAttempts.length === 0 ? (
                    <Empty text="No attempts yet." />
                  ) : (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left px-4 py-3 font-semibold text-slate-700">#</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Student ID</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Score</th>
                            <th className="text-left px-4 py-3 font-semibold text-slate-700">Submitted</th>
                          </tr>
                        </thead>
                        <tbody>
                          {examAttempts.map((a, i) => (
                            <tr key={a.id || i} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3">{i + 1}</td>
                              <td className="px-4 py-3 font-mono text-xs">{a.studentId}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold
                                  ${a.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' :
                                    a.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'}`}>
                                  {a.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold">
                                {a.totalScore != null ? `${a.totalScore}/${ex.totalMarks}` : '—'}
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Score summary */}
                      {examAttempts.some(a => a.totalScore != null) && (
                        <div className="p-4 bg-blue-50 border-t border-blue-100">
                          <div className="flex gap-8 text-sm">
                            <span><strong>Average:</strong> {(examAttempts.reduce((s, a) => s + (a.totalScore || 0), 0) / examAttempts.filter(a => a.totalScore != null).length).toFixed(1)}</span>
                            <span><strong>Highest:</strong> {Math.max(...examAttempts.filter(a => a.totalScore != null).map(a => a.totalScore))}</span>
                            <span><strong>Lowest:</strong> {Math.min(...examAttempts.filter(a => a.totalScore != null).map(a => a.totalScore))}</span>
                            <span><strong>Submitted:</strong> {examAttempts.filter(a => a.status === 'SUBMITTED').length}/{examAttempts.length}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {detailTab === 'settings' && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Exam Configuration</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div><p className="text-xs text-slate-500 uppercase mb-1">Start Time</p>
                        <p className="font-semibold">{ex.startTime ? new Date(ex.startTime).toLocaleString() : 'Not set'}</p></div>
                      <div><p className="text-xs text-slate-500 uppercase mb-1">End Time</p>
                        <p className="font-semibold">{ex.endTime ? new Date(ex.endTime).toLocaleString() : 'Not set'}</p></div>
                      <div><p className="text-xs text-slate-500 uppercase mb-1">Duration</p>
                        <p className="font-semibold">{ex.durationMinutes} minutes</p></div>
                      <div><p className="text-xs text-slate-500 uppercase mb-1">Total Marks</p>
                        <p className="font-semibold">{ex.totalMarks}</p></div>
                    </div>
                    <div className="space-y-3">
                      {[
                        ['Auto-submit on timeout', ex.autoSubmitOnTimeout],
                        ['Negative marking', ex.negativeMark],
                        ['Shuffle questions', ex.shuffleQuestions],
                        ['Shuffle options', ex.shuffleOptions]
                      ].map(([label, val], i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <span className="text-sm text-slate-700">{label}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {val ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      ))}
                      {ex.negativeMark && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-slate-700">Negative mark %</span>
                          <span className="font-semibold">{ex.negativeMarkPercent}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {ex.instructions && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 uppercase mb-1">Instructions</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{ex.instructions}</p>
                    </div>
                  )}
                  {ex.enrolledStudentsIds?.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs text-slate-500 uppercase mb-2">Enrolled Students ({ex.enrolledStudentsIds.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {ex.enrolledStudentsIds.map((sid, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono">{sid}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* Add Questions Modal */}
        {addQuestionsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Add Questions from Bank</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedQuestionIds.size} selected</p>
                </div>
                <button onClick={() => setAddQuestionsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {questions.length === 0 ? (
                  <Empty text="No questions in your bank. Create some first in the Question Bank tab." />
                ) : (
                  <div className="space-y-3">
                    {questions.map(q => {
                      const alreadyAdded = examQuestions.some(eq => eq.id === q.id);
                      const isSelected = selectedQuestionIds.has(q.id);
                      return (
                        <div key={q.id}
                          onClick={() => !alreadyAdded && toggleQuestionSelect(q.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition
                            ${alreadyAdded ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' :
                              isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                          <div className="flex items-start gap-3">
                            <input type="checkbox" checked={isSelected || alreadyAdded} disabled={alreadyAdded}
                              onChange={() => {}} className="mt-1 h-4 w-4 rounded text-blue-600" />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 text-sm">{q.questionText}</p>
                              <div className="flex gap-3 mt-2 text-xs text-slate-500">
                                <span className={`px-2 py-0.5 rounded font-semibold ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                                <span>{q.questionType}</span>
                                <span>{q.marks} marks</span>
                                {q.subject && <span>{q.subject}</span>}
                                {alreadyAdded && <span className="text-blue-600 font-semibold">Already in exam</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-200 flex gap-3">
                <button onClick={handleAddQuestionsToExam} disabled={!selectedQuestionIds.size}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  Add {selectedQuestionIds.size} Question(s)
                </button>
                <button onClick={() => setAddQuestionsModal(false)}
                  className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg hover:bg-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Generate Questions Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Question Generator</h2>
                    <p className="text-sm text-slate-500">{generateStep === 'form' ? 'Enter syllabus & preferences' : `${generatedPreview.length} questions generated`}</p>
                  </div>
                </div>
                <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {generateStep === 'form' ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Syllabus / Topic Description *</label>
                    <textarea value={generateForm.syllabus}
                      onChange={e => setGenerateForm(f => ({...f, syllabus: e.target.value}))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      rows="5" placeholder="Enter topics, syllabus content, or a description of what the exam should cover...\n\nExample:\n- Data Structures: Arrays, Linked Lists, Trees, Graphs\n- Sorting Algorithms: Bubble Sort, Merge Sort, Quick Sort\n- Time Complexity Analysis" />
                    <p className="text-xs text-slate-400 mt-1">Tip: Include specific topics, concepts, and keywords for better question relevance.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Number of Questions</label>
                      <select value={generateForm.count}
                        onChange={e => setGenerateForm(f => ({...f, count: parseInt(e.target.value)}))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500">
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                        <option value={20}>20 Questions</option>
                        <option value={50}>50 Questions</option>
                        <option value={100}>100 Questions</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Question Type</label>
                      <select value={generateForm.questionType}
                        onChange={e => setGenerateForm(f => ({...f, questionType: e.target.value}))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500">
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="DESCRIPTIVE">Descriptive</option>
                        <option value="MIXED">Mixed (MCQ + Descriptive)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
                      <select value={generateForm.difficulty}
                        onChange={e => setGenerateForm(f => ({...f, difficulty: e.target.value}))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500">
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                        <option value="MIXED">Mixed (All Levels)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Marks per Question</label>
                      <input type="number" min="1" max="20" value={generateForm.marksPerQuestion}
                        onChange={e => setGenerateForm(f => ({...f, marksPerQuestion: parseInt(e.target.value) || 1}))}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500" />
                    </div>
                  </div>

                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                    <p className="text-sm text-violet-800 font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> How it works
                    </p>
                    <p className="text-xs text-violet-600 mt-1">
                      The AI analyzes your syllabus to extract key topics and concepts, then generates relevant questions
                      with appropriate options and correct answers. You can review and edit questions before adding them to your exam.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600 font-medium">Review generated questions before adding to exam</p>
                    <button onClick={() => setGenerateStep('form')} className="text-sm text-violet-600 hover:text-violet-800 font-semibold">
                      ← Back to Settings
                    </button>
                  </div>
                  <div className="space-y-3">
                    {generatedPreview.map((q, idx) => (
                      <div key={q.id || idx} className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 text-sm mb-2">{q.questionText}</p>
                            {q.questionType === 'MCQ' && q.options && (
                              <div className="space-y-1 mb-2">
                                {q.options.map((opt, oi) => {
                                  const letter = String.fromCharCode(65 + oi);
                                  const isCorrect = q.correctAnswer === letter;
                                  return (
                                    <div key={oi} className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${
                                      isCorrect ? 'bg-green-50 text-green-800 font-semibold border border-green-200' : 'bg-slate-50 text-slate-700'
                                    }`}>
                                      <span className="font-bold">{letter}.</span> {opt}
                                      {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-green-600" />}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            <div className="flex gap-3 text-xs text-slate-500">
                              <span className={`px-2 py-0.5 rounded font-semibold ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                              <span>{q.questionType}</span>
                              <span>{q.marks} marks</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 border-t border-slate-200 flex gap-3">
                {generateStep === 'form' ? (
                  <button onClick={handleGenerateQuestions} disabled={generating || !generateForm.syllabus.trim()}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-violet-700 hover:to-indigo-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Questions</>}
                  </button>
                ) : (
                  <button onClick={handleAddGeneratedToExam}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-lg hover:from-violet-700 hover:to-indigo-700 font-semibold flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add {generatedPreview.length} Question(s) to Exam
                  </button>
                )}
                <button onClick={() => setShowGenerateModal(false)}
                  className="flex-1 bg-slate-200 text-slate-900 py-2.5 rounded-lg hover:bg-slate-300 font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {renderScheduleModal()}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW: CREATE EXAM
     ═══════════════════════════════════════════════════════════ */
  if (view === 'create') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <div>
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <ArrowLeft className="h-4 w-4" /> Back to Exams
              </button>
              <h1 className="text-2xl font-black text-slate-900">Create New Exam</h1>
            </div>
            {renderTabBar()}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">
          {renderExamForm(handleCreateExam, 'Create Exam', () => setView('list'))}
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW: QUESTION BANK
     ═══════════════════════════════════════════════════════════ */
  if (view === 'questions') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <div>
              <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <ArrowLeft className="h-4 w-4" /> Back to Exams
              </button>
              <h1 className="text-2xl font-black text-slate-900">Question Bank ({questions.length})</h1>
            </div>
            {renderTabBar()}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Question Creation Form */}
            <div>
              <div className="sticky top-32">
                <h2 className="text-lg font-bold text-slate-900 mb-3">New Question</h2>
                {renderQuestionForm((e) => handleCreateQuestion(e, false), 'Add to Bank')}
              </div>
            </div>

            {/* Question List */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search questions..." className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              {loading ? <Spinner /> : questions.length === 0 ? (
                <Empty text="No questions in your bank yet." />
              ) : (
                <div className="space-y-3">
                  {questions
                    .filter(q => !search || q.questionText.toLowerCase().includes(search.toLowerCase()) ||
                      (q.subject && q.subject.toLowerCase().includes(search.toLowerCase())))
                    .map(q => (
                    <div key={q.id} className="bg-white rounded-lg p-5 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 mb-2">{q.questionText}</p>
                          {q.questionType === 'MCQ' && q.options && (
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className={`px-3 py-1 rounded text-sm
                                  ${String.fromCharCode(65 + oi) === q.correctAnswer
                                    ? 'bg-green-50 text-green-800 border border-green-200 font-semibold'
                                    : 'bg-slate-50 text-slate-600'}`}>
                                  <span className="font-bold mr-1">{String.fromCharCode(65 + oi)}.</span>{opt}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-3 text-xs text-slate-500">
                            <span className={`px-2 py-0.5 rounded font-semibold ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                            <span>{q.questionType}</span>
                            <span>{q.marks} marks</span>
                            {q.subject && <span>{q.subject}</span>}
                            <span>Used {q.usageCount || 0}×</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded ml-3" title="Delete question">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     VIEW: EXAM LIST (default)
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-2xl font-black text-slate-900">Exams Management</h1>
          </div>
          {renderTabBar()}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {stats.map((s, i) => (
            <div key={i} className={`rounded-lg p-4 text-center ${s.color}`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-semibold opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search exams..." className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>

        {loading ? <Spinner /> : exams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No exams created yet</p>
            <button onClick={() => setView('create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Your First Exam
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {exams
              .filter(e => !search || e.title.toLowerCase().includes(search.toLowerCase()) ||
                (e.subject && e.subject.toLowerCase().includes(search.toLowerCase())))
              .map(exam => (
              <div key={exam.id} className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => openDetail(exam)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColor(exam.status)}`}>{exam.status}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{exam.subject}{exam.description ? ` — ${exam.description}` : ''}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                </div>

                <div className="flex gap-6 py-3 border-y border-slate-100 mb-3 text-sm">
                  <span className="text-slate-600"><strong>{exam.questionCount}</strong> Questions</span>
                  <span className="text-slate-600"><strong>{exam.durationMinutes}</strong> min</span>
                  <span className="text-slate-600"><strong>{exam.totalMarks}</strong> marks</span>
                  <span className="text-slate-600"><strong>{exam.totalAttempts}</strong> attempts</span>
                  {exam.startTime && (
                    <span className="text-slate-500">{new Date(exam.startTime).toLocaleDateString()}</span>
                  )}
                </div>

                {exam.status === 'COMPLETED' && exam.resultsPublished && (
                  <div className="mb-3 px-3 py-2 bg-green-50 rounded-lg text-xs text-green-800">
                    <strong>Avg:</strong> {exam.averageScore?.toFixed(1) || '—'} | <strong>High:</strong> {exam.highestScore?.toFixed(1) || '—'} | <strong>Low:</strong> {exam.lowestScore?.toFixed(1) || '—'}
                  </div>
                )}

                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  {exam.status === 'DRAFT' && (
                    <>
                      <button onClick={() => setScheduleModal(exam.id)}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
                        Schedule
                      </button>
                      <button onClick={() => handleDeleteExam(exam.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-semibold">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {exam.status === 'COMPLETED' && !exam.resultsPublished && (
                    <button onClick={() => handlePublishResults(exam.id)}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold">
                      Publish Results
                    </button>
                  )}
                  <button onClick={() => handleDuplicateExam(exam.id)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-semibold flex items-center gap-1">
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      {renderScheduleModal()}
    </div>
  );
};

export default FacultyTestExam;
