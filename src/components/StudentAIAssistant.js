import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Brain, MessageCircle, Clock, Sparkles, Search, Send, BookOpen,
  FileText, Code, Calendar, BarChart3, Upload, Mic, Image, Languages,
  ChevronRight, Trash2, Plus, Play, CheckCircle, XCircle, AlertTriangle,
  Zap, Target, TrendingUp, Award, Coffee, RefreshCw, Download,
  ClipboardList, Lightbulb, GraduationCap, Timer, Star, X, ChevronDown,
  Paperclip, File, Loader2
} from 'lucide-react';
import * as aiAPI from '../services/aiAssistantAPI';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentAIAssistant = ({ studentId, email, onBack = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [activeCategory, setActiveCategory] = useState('doubt');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [subject, setSubject] = useState('');
  const [studyPlans, setStudyPlans] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [quizSubject, setQuizSubject] = useState('');
  const [quizType, setQuizType] = useState('mcq');
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [quizCount, setQuizCount] = useState(10);
  const [planType, setPlanType] = useState('daily');
  const [planSubjects, setPlanSubjects] = useState('');
  const [error, setError] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);          // The quiz being taken
  const [quizAnswers, setQuizAnswers] = useState({});           // {questionId: selectedAnswer}
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizReview, setQuizReview] = useState(null);           // Completed quiz being reviewed
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);        // Currently uploaded file name
  const [uploading, setUploading] = useState(false);             // Upload in progress
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const actualStudentId = studentId || localStorage.getItem('studentId') || localStorage.getItem('klhStudentId');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (actualStudentId) {
      loadConversations();
      loadAnalytics();
    }
  }, [actualStudentId]);

  useEffect(() => {
    if (activeTab === 'study-plan' && actualStudentId) loadStudyPlans();
    if (activeTab === 'exam-prep' && actualStudentId) loadQuizResults();
  }, [activeTab]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    try {
      const data = await aiAPI.getUserConversations(actualStudentId);
      setConversations(data);
    } catch (e) { console.error('Failed to load conversations:', e); }
  };

  const loadStudyPlans = async () => {
    try {
      const data = await aiAPI.getStudentStudyPlans(actualStudentId);
      setStudyPlans(data);
    } catch (e) { console.error('Failed to load study plans:', e); }
  };

  const loadQuizResults = async () => {
    try {
      const data = await aiAPI.getStudentQuizResults(actualStudentId);
      setQuizResults(data);
    } catch (e) { console.error('Failed to load quiz results:', e); }
  };

  const loadAnalytics = async () => {
    try {
      const data = await aiAPI.getStudentAIAnalytics(actualStudentId);
      setAnalytics(data);
    } catch (e) { console.error('Failed to load analytics:', e); }
  };

  const startNewConversation = async () => {
    if (!actualStudentId) {
      setError('Student ID not found. Please log out and log in again.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const title = subject ? `${getCategoryLabel(activeCategory)} — ${subject}` : getCategoryLabel(activeCategory);
      const conv = await aiAPI.createConversation(actualStudentId, 'student', title, activeCategory, subject, language);
      setActiveConversation(conv);
      setConversations(prev => [conv, ...prev]);
      setShowNewChat(false);
      setSubject('');
    } catch (e) {
      console.error('Failed to create conversation:', e);
      setError(e.response?.data?.message || e.message || 'Failed to start conversation. Please make sure the backend server is running.');
    } finally { setLoading(false); }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || sending) return;
    const msg = messageInput;
    setMessageInput('');
    setSending(true);
    try {
      const updated = await aiAPI.sendMessage(activeConversation.id, msg, 'text');
      setActiveConversation(updated);
      setConversations(prev => prev.map(c => c.id === updated.id ? updated : c));
    } catch (e) {
      console.error('Failed to send message:', e);
      setMessageInput(msg);
      setError(e.response?.data?.message || e.message || 'Failed to send message.');
    } finally { setSending(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;
    // Reset input so same file can be re-selected
    e.target.value = '';
    setUploading(true);
    setError(null);
    try {
      const result = await aiAPI.uploadFile(activeConversation.id, file);
      if (result.conversation) {
        setActiveConversation(result.conversation);
        setConversations(prev => prev.map(c => c.id === result.conversation.id ? result.conversation : c));
      }
      setUploadedFile(file.name);
    } catch (err) {
      console.error('File upload failed:', err);
      setError(err.response?.data?.error || err.message || 'File upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await aiAPI.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversation?.id === convId) setActiveConversation(null);
    } catch (e) { console.error('Failed to delete:', e); }
  };

  const handleGenerateStudyPlan = async () => {
    if (!actualStudentId) return;
    try {
      setLoading(true);
      const subjects = planSubjects.split(',').map(s => s.trim()).filter(Boolean);
      const plan = await aiAPI.generateStudyPlan(actualStudentId, planType, subjects);
      setStudyPlans(prev => [plan, ...prev]);
    } catch (e) {
      console.error('Failed to generate study plan:', e);
      setError(e.response?.data?.message || e.message || 'Failed to generate study plan.');
    } finally { setLoading(false); }
  };

  const handleGenerateQuiz = async () => {
    if (!actualStudentId || !quizSubject) {
      setError('Please enter a subject to generate the quiz.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const quiz = await aiAPI.generateQuiz(actualStudentId, quizSubject, quizType, quizCount, quizDifficulty);
      setActiveQuiz(quiz);
      setQuizAnswers({});
      setCurrentQuestionIdx(0);
      setQuizReview(null);
    } catch (e) {
      console.error('Failed to generate quiz:', e);
      setError(e.response?.data?.message || e.message || 'Failed to generate quiz.');
    } finally { setLoading(false); }
  };

  const handleSelectAnswer = (questionId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setQuizSubmitting(true);
      setError(null);
      const result = await aiAPI.submitQuiz(activeQuiz.id, quizAnswers);
      setQuizReview(result);
      setActiveQuiz(null);
      setQuizResults(prev => {
        const filtered = prev.filter(q => q.id !== result.id);
        return [result, ...filtered];
      });
    } catch (e) {
      console.error('Failed to submit quiz:', e);
      setError(e.response?.data?.message || e.message || 'Failed to submit quiz.');
    } finally { setQuizSubmitting(false); }
  };

  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    setQuizReview(null);
    setQuizAnswers({});
    setCurrentQuestionIdx(0);
  };

  const getCategoryLabel = (cat) => {
    const labels = { 'doubt': 'Doubt Solving', 'notes': 'Notes & Learning', 'exam-prep': 'Exam Preparation', 'study-plan': 'Study Planner', 'coding': 'Coding Assistant' };
    return labels[cat] || 'AI Chat';
  };

  const getCategoryIcon = (cat) => {
    const icons = { 'doubt': MessageCircle, 'notes': FileText, 'exam-prep': GraduationCap, 'study-plan': Calendar, 'coding': Code };
    return icons[cat] || Brain;
  };

  const categories = [
    { id: 'doubt', label: 'Doubt Solving', icon: MessageCircle, color: 'from-blue-500 to-cyan-500', desc: 'Ask any academic question' },
    { id: 'notes', label: 'Notes & Learning', icon: FileText, color: 'from-purple-500 to-pink-500', desc: 'Summarize, flashcards, key points' },
    { id: 'exam-prep', label: 'Exam Prep', icon: GraduationCap, color: 'from-orange-500 to-red-500', desc: 'MCQs, mock tests, practice' },
    { id: 'study-plan', label: 'Study Planner', icon: Calendar, color: 'from-green-500 to-emerald-500', desc: 'Personalized study schedules' },
    { id: 'coding', label: 'Coding Helper', icon: Code, color: 'from-indigo-500 to-violet-500', desc: 'Debug, explain, optimize code' }
  ];

  const quickPrompts = {
    doubt: ['Explain this concept step by step', 'Solve this problem for me', 'What is the difference between X and Y?', 'Give me a simple analogy'],
    notes: ['Summarize this material', 'Generate flashcards', 'Extract key points', 'Predict important questions'],
    'exam-prep': ['Generate MCQ practice set', 'Start a mock test', 'Give me short answer questions', 'Show my weak topics'],
    'study-plan': ['Create a daily study timetable', 'Make a revision schedule', 'Exam countdown planner', 'Detect my weak subjects'],
    coding: ['Debug this code', 'Explain this algorithm step by step', 'Optimize this code', 'Convert to Python/Java']
  };

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'exam-prep', label: 'Practice & Tests', icon: ClipboardList },
    { id: 'study-plan', label: 'Study Plans', icon: Calendar },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'insights', label: 'Insights', icon: BarChart3 }
  ];

  const stats = [
    { label: 'Conversations', value: analytics?.totalConversations || conversations.length, icon: MessageCircle, color: 'text-blue-600' },
    { label: 'Quizzes Taken', value: analytics?.totalQuizzes || quizResults.length, icon: ClipboardList, color: 'text-purple-600' },
    { label: 'Avg Score', value: `${analytics?.averageQuizScore || 0}%`, icon: Target, color: 'text-green-600' },
    { label: 'Exam Readiness', value: `${analytics?.examReadiness || 50}%`, icon: TrendingUp, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700 mb-3 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className={`flex items-center justify-between transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Brain size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">AI Learning Assistant</h1>
                <p className="mt-1 text-sm text-slate-600">Your 24/7 personal tutor, doubt solver & exam coach</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white border border-slate-200 px-3 py-1.5">
                <Languages size={14} className="text-slate-500" />
                <select value={language} onChange={e => setLanguage(e.target.value)} className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer">
                  <option value="en">English</option>
                  <option value="te">తెలుగు</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-700">Online 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transform transition duration-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${100 + i * 50}ms` }}>
                  <Icon size={20} className={s.color} />
                  <div>
                    <p className="text-lg font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition relative ${activeTab === tab.id ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-t" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-700">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* ═══════════════ AI CHAT TAB ═══════════════ */}
        {activeTab === 'chat' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-4">
              {/* Category Selector */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setActiveConversation(null); }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition text-left ${activeCategory === cat.id ? 'bg-sky-50 border border-sky-200 text-sky-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} text-white`}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-bold">{cat.label}</p>
                          <p className="text-[10px] text-slate-400">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversations List */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700">Conversations</h3>
                  <button onClick={() => setShowNewChat(true)} className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700">
                    <Plus size={14} /> New
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {conversations.filter(c => c.category === activeCategory).map(conv => (
                    <div key={conv.id} onClick={() => setActiveConversation(conv)}
                      className={`p-2.5 rounded-xl cursor-pointer transition group ${activeConversation?.id === conv.id ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold text-slate-800 truncate flex-1">{conv.title}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{conv.messages?.length || 0} messages</p>
                    </div>
                  ))}
                  {conversations.filter(c => c.category === activeCategory).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">No conversations yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-9">
              {/* New Chat Setup */}
              {showNewChat && (
                <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <h3 className="text-sm font-bold text-sky-800 mb-3">Start a New {getCategoryLabel(activeCategory)} Chat</h3>
                  <div className="flex gap-3">
                    <input type="text" placeholder="Subject (e.g., Mathematics, Physics, Java...)" value={subject} onChange={e => setSubject(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200" />
                    <button onClick={startNewConversation} disabled={loading}
                      className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />} Start
                    </button>
                    <button onClick={() => setShowNewChat(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Active Chat */}
              {activeConversation ? (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {/* Chat Header */}
                  <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${categories.find(c => c.id === activeCategory)?.color || 'from-blue-500 to-cyan-500'} text-white`}>
                        {React.createElement(getCategoryIcon(activeCategory), { size: 18 })}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{activeConversation.title}</p>
                        <p className="text-xs text-slate-500">{activeConversation.subject ? `Subject: ${activeConversation.subject}` : getCategoryLabel(activeCategory)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${language === 'en' ? 'bg-blue-100 text-blue-700' : language === 'te' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {language === 'en' ? 'EN' : language === 'te' ? 'TE' : 'HI'}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {activeConversation.messages?.length === 0 && (
                      <div className="text-center py-12">
                        <Brain size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-sm text-slate-500">Start your conversation! Ask me anything about <strong>{activeConversation.subject || 'academics'}</strong>.</p>
                      </div>
                    )}
                    {activeConversation.messages?.map((msg, i) => (
                      <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-900 rounded-bl-md'}`}>
                          <div className="text-sm whitespace-pre-wrap leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                          <p className={`mt-1 text-[10px] ${msg.role === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            <RefreshCw size={14} className="animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div className="border-t border-slate-100 px-4 py-2">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {(quickPrompts[activeCategory] || []).map((prompt, i) => (
                        <button key={i} onClick={() => setMessageInput(prompt)}
                          className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition">
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="border-t border-slate-200 p-4">
                    {/* Uploaded file indicator */}
                    {uploadedFile && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-1.5 text-xs text-green-700">
                        <Paperclip size={12} />
                        <span className="font-medium">{uploadedFile}</span>
                        <button onClick={() => setUploadedFile(null)} className="ml-auto hover:text-green-900"><X size={12} /></button>
                      </div>
                    )}
                    {uploading && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs text-blue-700">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Uploading & processing file...</span>
                      </div>
                    )}
                    {/* Hidden file input */}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden"
                      accept=".pdf,.txt,.md,.csv,.doc,.docx,.ppt,.pptx" />
                    <div className="flex gap-2">
                      <div className="flex gap-1">
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading || !activeConversation}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition disabled:opacity-40" title="Upload Image">
                          <Image size={16} />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading || !activeConversation}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition disabled:opacity-40" title="Upload PDF/File">
                          <Upload size={16} />
                        </button>
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition" title="Voice Input">
                          <Mic size={16} />
                        </button>
                      </div>
                      <input type="text" placeholder={`Ask about ${activeConversation.subject || 'anything academic'}...`}
                        value={messageInput} onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition" />
                      <button onClick={handleSendMessage} disabled={!messageInput.trim() || sending}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 transition">
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Welcome / Category Landing */
                <div className="space-y-6">
                  <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white text-center">
                    <Brain size={48} className="mx-auto mb-4 opacity-90" />
                    <h2 className="text-2xl font-black">Welcome to AI Learning Assistant</h2>
                    <p className="mt-2 text-blue-100 max-w-lg mx-auto">
                      Your 24/7 personal tutor. Get instant help with doubts, notes, exam prep, study planning, and coding — all in one place.
                    </p>
                    <button onClick={() => setShowNewChat(true)}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-white text-blue-600 px-6 py-3 text-sm font-bold hover:bg-blue-50 transition shadow-lg">
                      <Plus size={16} /> Start New Conversation
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat, i) => {
                      const Icon = cat.icon;
                      return (
                        <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowNewChat(true); }}
                          className={`rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 transition transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                          style={{ transitionDelay: `${200 + i * 80}ms` }}>
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white mb-4`}>
                            <Icon size={20} />
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{cat.label}</h3>
                          <p className="mt-1 text-sm text-slate-500">{cat.desc}</p>
                          <p className="mt-3 text-xs font-semibold text-sky-600">Start Chat →</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ PRACTICE & TESTS TAB ═══════════════ */}
        {activeTab === 'exam-prep' && (
          <div className="space-y-6">

            {/* ─── ACTIVE QUIZ: Taking the test ─── */}
            {activeQuiz && !quizReview && (
              <div className="space-y-4">
                {/* Quiz Header */}
                <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap size={20} className="text-orange-500" />
                        {activeQuiz.subject} — {activeQuiz.quizType?.toUpperCase()} Test
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{activeQuiz.totalQuestions} questions · {activeQuiz.difficulty} difficulty</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Answered</p>
                        <p className="text-lg font-bold text-orange-600">{Object.keys(quizAnswers).length}/{activeQuiz.totalQuestions}</p>
                      </div>
                      <button onClick={handleCloseQuiz} className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-red-500 hover:border-red-200 transition" title="Exit quiz">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  {/* Question navigation dots */}
                  <div className="flex gap-1.5 mt-4 flex-wrap">
                    {activeQuiz.questions?.map((q, i) => (
                      <button key={q.id} onClick={() => setCurrentQuestionIdx(i)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                          currentQuestionIdx === i
                            ? 'bg-orange-500 text-white shadow-md'
                            : quizAnswers[q.id]
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-white text-slate-500 border border-slate-200 hover:border-orange-300'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Question */}
                {activeQuiz.questions?.[currentQuestionIdx] && (() => {
                  const q = activeQuiz.questions[currentQuestionIdx];
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-600">{currentQuestionIdx + 1}</span>
                        <span className="text-xs font-semibold text-slate-400 uppercase">{q.type || activeQuiz.quizType}</span>
                      </div>
                      <p className="text-base font-semibold text-slate-900 mb-5 leading-relaxed">{q.question}</p>

                      {/* MCQ options */}
                      {(q.type === 'mcq' || (!q.type && activeQuiz.quizType === 'mcq')) && q.options && (
                        <div className="space-y-3">
                          {q.options.map((opt, oi) => {
                            const letter = String.fromCharCode(65 + oi); // A, B, C, D
                            const isSelected = quizAnswers[q.id] === letter;
                            return (
                              <button key={oi} onClick={() => handleSelectAnswer(q.id, letter)}
                                className={`w-full text-left flex items-center gap-3 rounded-xl border-2 p-4 transition ${
                                  isSelected
                                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                                    : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50'
                                }`}>
                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                  isSelected ? 'bg-orange-500 text-white' : 'bg-white text-slate-500 border border-slate-200'
                                }`}>{letter}</span>
                                <span className={`text-sm ${isSelected ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Short / Long answer */}
                      {(q.type === 'short-answer' || q.type === 'long-answer' || (!q.type && (activeQuiz.quizType === 'short-answer' || activeQuiz.quizType === 'long-answer'))) && (
                        <textarea
                          rows={q.type === 'long-answer' || activeQuiz.quizType === 'long-answer' ? 6 : 3}
                          placeholder="Type your answer here..."
                          value={quizAnswers[q.id] || ''}
                          onChange={e => handleSelectAnswer(q.id, e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 resize-none"
                        />
                      )}

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between mt-6">
                        <button onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIdx === 0}
                          className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition">
                          <ArrowLeft size={14} /> Previous
                        </button>
                        <span className="text-xs text-slate-400">{currentQuestionIdx + 1} of {activeQuiz.totalQuestions}</span>
                        {currentQuestionIdx < activeQuiz.totalQuestions - 1 ? (
                          <button onClick={() => setCurrentQuestionIdx(prev => Math.min(activeQuiz.totalQuestions - 1, prev + 1))}
                            className="flex items-center gap-1 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition">
                            Next <ChevronRight size={14} />
                          </button>
                        ) : (
                          <button onClick={handleSubmitQuiz} disabled={quizSubmitting}
                            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50 transition shadow-md">
                            {quizSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Submit Test
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ─── QUIZ REVIEW: After submission ─── */}
            {quizReview && (
              <div className="space-y-4">
                {/* Score Card */}
                <div className={`rounded-2xl border-2 p-6 shadow-sm ${quizReview.scorePercent >= 70 ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' : quizReview.scorePercent >= 40 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50' : 'border-red-200 bg-gradient-to-r from-red-50 to-pink-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 mb-1">Test Complete!</h2>
                      <p className="text-sm text-slate-600">{quizReview.subject} — {quizReview.quizType?.toUpperCase()} · {quizReview.difficulty}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-4xl font-black ${quizReview.scorePercent >= 70 ? 'text-green-600' : quizReview.scorePercent >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {Math.round(quizReview.scorePercent)}%
                      </p>
                      <p className="text-xs text-slate-500">{quizReview.correctAnswers}/{quizReview.totalQuestions} correct</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="rounded-xl bg-white/70 p-3 text-center">
                      <p className="text-lg font-bold text-green-600">{quizReview.correctAnswers}</p>
                      <p className="text-[10px] font-semibold text-slate-500">Correct</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3 text-center">
                      <p className="text-lg font-bold text-red-600">{quizReview.wrongAnswers}</p>
                      <p className="text-[10px] font-semibold text-slate-500">Wrong</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3 text-center">
                      <p className="text-lg font-bold text-slate-400">{quizReview.skipped}</p>
                      <p className="text-[10px] font-semibold text-slate-500">Skipped</p>
                    </div>
                  </div>
                  {quizReview.weakTopics?.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-red-600">Weak Areas:</span>
                      {quizReview.weakTopics.map((t, j) => (
                        <span key={j} className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-medium text-red-700">{t}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={handleCloseQuiz} className="mt-4 flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                    <ArrowLeft size={14} /> Back to Practice Tests
                  </button>
                </div>

                {/* Question-by-question Review */}
                <h3 className="text-sm font-bold text-slate-700">Answer Review</h3>
                {quizReview.questions?.map((q, i) => {
                  const isCorrect = q.isCorrect;
                  const isMCQ = q.type === 'mcq';
                  return (
                    <div key={q.id || i} className={`rounded-2xl border p-5 ${isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                      <div className="flex items-start gap-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900 mb-2">Q{i + 1}. {q.question}</p>
                          {isMCQ && q.options && (
                            <div className="space-y-1.5 mb-3">
                              {q.options.map((opt, oi) => {
                                const letter = String.fromCharCode(65 + oi);
                                const isStudentAnswer = q.studentAnswer === letter;
                                const isRightAnswer = q.correctAnswer === letter;
                                return (
                                  <div key={oi} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs ${
                                    isRightAnswer ? 'bg-green-100 text-green-800 font-semibold' : isStudentAnswer && !isCorrect ? 'bg-red-100 text-red-800 font-semibold' : 'text-slate-600'
                                  }`}>
                                    <span className="font-bold">{letter}.</span> {opt}
                                    {isRightAnswer && <CheckCircle size={12} className="text-green-600 ml-auto" />}
                                    {isStudentAnswer && !isCorrect && <XCircle size={12} className="text-red-600 ml-auto" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {!isMCQ && (
                            <div className="mb-3 space-y-1.5">
                              <div className="text-xs"><span className="font-semibold text-slate-500">Your Answer:</span> <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>{q.studentAnswer || '(skipped)'}</span></div>
                              <div className="text-xs"><span className="font-semibold text-slate-500">Correct Answer:</span> <span className="text-green-700">{q.correctAnswer}</span></div>
                            </div>
                          )}
                          {q.explanation && (
                            <div className="rounded-lg bg-blue-50 px-3 py-2 border border-blue-100">
                              <p className="text-[11px] text-blue-700"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── DEFAULT VIEW: Generator + Past Results ─── */}
            {!activeQuiz && !quizReview && (
              <>
                {/* Quiz Generator */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <GraduationCap size={20} className="text-orange-500" /> Generate Practice Test
                  </h2>
                  <div className="grid gap-4 md:grid-cols-5">
                    <input type="text" placeholder="Subject *" value={quizSubject} onChange={e => setQuizSubject(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500" />
                    <select value={quizType} onChange={e => setQuizType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                      <option value="mcq">MCQ</option>
                      <option value="short-answer">Short Answer</option>
                      <option value="long-answer">Long Answer</option>
                      <option value="mixed">Mixed</option>
                    </select>
                    <select value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <select value={quizCount} onChange={e => setQuizCount(Number(e.target.value))} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={15}>15 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={25}>25 Questions</option>
                    </select>
                    <button onClick={handleGenerateQuiz} disabled={!quizSubject || loading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition">
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate
                    </button>
                  </div>
                </div>

                {/* Past Quiz Results */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Recent Practice Tests</h3>
                  {quizResults.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                      <ClipboardList size={40} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500">No practice tests yet. Generate one above!</p>
                    </div>
                  )}
                  {quizResults.map((quiz, i) => (
                    <div key={quiz.id || i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                      onClick={() => {
                        if (quiz.completedAt) {
                          setQuizReview(quiz);
                        } else {
                          setActiveQuiz(quiz);
                          setQuizAnswers({});
                          setCurrentQuestionIdx(0);
                        }
                      }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            !quiz.completedAt ? 'bg-orange-100 text-orange-600' :
                            quiz.scorePercent >= 70 ? 'bg-green-100 text-green-600' : quiz.scorePercent >= 40 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                            {!quiz.completedAt ? <Play size={20} /> : <Target size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{quiz.subject} — {quiz.quizType?.toUpperCase()}</p>
                            <p className="text-xs text-slate-500">
                              {quiz.totalQuestions} questions · {quiz.difficulty}
                              {quiz.completedAt ? ` · ${new Date(quiz.completedAt).toLocaleDateString()}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {quiz.completedAt ? (
                            <>
                              <p className={`text-2xl font-black ${quiz.scorePercent >= 70 ? 'text-green-600' : quiz.scorePercent >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {Math.round(quiz.scorePercent)}%
                              </p>
                              <p className="text-xs text-slate-500">{quiz.correctAnswers}/{quiz.totalQuestions} correct</p>
                            </>
                          ) : (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">Continue →</span>
                          )}
                        </div>
                      </div>
                      {quiz.completedAt && quiz.weakTopics?.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-red-600">Weak Areas:</span>
                          {quiz.weakTopics.map((t, j) => (
                            <span key={j} className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════ STUDY PLANS TAB ═══════════════ */}
        {activeTab === 'study-plan' && (
          <div className="space-y-6">
            {/* Plan Generator */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-green-500" /> Generate Study Plan
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                <select value={planType} onChange={e => setPlanType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                  <option value="daily">Daily Timetable</option>
                  <option value="revision">Revision Schedule</option>
                  <option value="exam-countdown">Exam Countdown</option>
                </select>
                <input type="text" placeholder="Subjects (comma-separated)" value={planSubjects} onChange={e => setPlanSubjects(e.target.value)}
                  className="col-span-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500" />
                <button onClick={handleGenerateStudyPlan} disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 disabled:opacity-50 transition">
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate Plan
                </button>
              </div>
            </div>

            {/* Plans List */}
            {studyPlans.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No study plans yet. Generate one above!</p>
              </div>
            )}
            {studyPlans.map((plan, i) => (
              <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{plan.title}</p>
                      <p className="text-xs text-slate-500">Created {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'recently'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-lg font-black text-orange-600">{plan.readinessScore}%</p>
                      <p className="text-[10px] text-slate-500">Readiness</p>
                    </div>
                  </div>
                </div>

                {plan.weakSubjects?.length > 0 && (
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <AlertTriangle size={14} className="text-orange-500" />
                    <span className="text-xs font-semibold text-orange-600">Weak Subjects:</span>
                    {plan.weakSubjects.map((s, j) => (
                      <span key={j} className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">{s}</span>
                    ))}
                  </div>
                )}

                {plan.schedule?.length > 0 && (
                  <div className="rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-600">Time</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-600">Subject</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-600">Activity</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-600">Duration</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-600">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.schedule.map((slot, j) => (
                          <tr key={j} className="border-t border-slate-100">
                            <td className="px-4 py-2 text-slate-700 font-medium">{slot.time}</td>
                            <td className="px-4 py-2 text-slate-900 font-semibold">{slot.subject}</td>
                            <td className="px-4 py-2 text-slate-600">{slot.activity}</td>
                            <td className="px-4 py-2 text-slate-600">{slot.duration}</td>
                            <td className="px-4 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${slot.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {slot.priority}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {plan.motivationTips?.length > 0 && (
                  <div className="mt-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                    <p className="text-xs font-bold text-purple-700 mb-2">💪 Motivation Tips</p>
                    <div className="space-y-1">
                      {plan.motivationTips.map((tip, j) => (
                        <p key={j} className="text-xs text-purple-600 flex items-start gap-1">
                          <Star size={10} className="mt-0.5 flex-shrink-0 text-purple-400" /> {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ HISTORY TAB ═══════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Conversation History</h2>
              <span className="text-sm text-slate-500">{conversations.length} total</span>
            </div>
            {conversations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Clock size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No conversation history</p>
              </div>
            )}
            {conversations.map((conv, i) => {
              const CatIcon = getCategoryIcon(conv.category);
              return (
                <div key={conv.id} onClick={() => { setActiveConversation(conv); setActiveCategory(conv.category); setActiveTab('chat'); }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer transition group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${categories.find(c => c.id === conv.category)?.color || 'from-blue-500 to-cyan-500'} text-white`}>
                        <CatIcon size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{conv.title}</p>
                        <p className="text-xs text-slate-500">{getCategoryLabel(conv.category)} · {conv.messages?.length || 0} messages · {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600" />
                      <button onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════ INSIGHTS TAB ═══════════════ */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 p-6 text-white">
              <h2 className="text-xl font-black mb-2">Your Learning Insights</h2>
              <p className="text-blue-100 text-sm">AI-powered analysis based on your activity, quizzes, and study patterns.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                <MessageCircle size={24} className="mx-auto text-blue-500 mb-2" />
                <p className="text-3xl font-black text-slate-900">{analytics?.totalConversations || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Total Conversations</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                <ClipboardList size={24} className="mx-auto text-purple-500 mb-2" />
                <p className="text-3xl font-black text-slate-900">{analytics?.totalQuizzes || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Quizzes Completed</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                <Target size={24} className="mx-auto text-green-500 mb-2" />
                <p className="text-3xl font-black text-green-600">{analytics?.averageQuizScore || 0}%</p>
                <p className="text-xs text-slate-500 mt-1">Average Score</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-center">
                <TrendingUp size={24} className="mx-auto text-orange-500 mb-2" />
                <p className="text-3xl font-black text-orange-600">{analytics?.examReadiness || 50}%</p>
                <p className="text-xs text-slate-500 mt-1">Exam Readiness</p>
              </div>
            </div>

            {analytics?.weakTopics?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" /> Weak Topics to Focus On
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analytics.weakTopics.map((t, i) => (
                    <span key={i} className="rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">{t}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" /> Recommendations
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '📚', text: 'Focus on weak topics identified from your quiz results', color: 'bg-blue-50' },
                  { icon: '⏱️', text: 'Take at least 2 practice tests per subject each week', color: 'bg-purple-50' },
                  { icon: '📅', text: 'Follow your personalized study plan consistently', color: 'bg-green-50' },
                  { icon: '💻', text: 'Use the coding assistant to practice programming daily', color: 'bg-orange-50' },
                  { icon: '🧠', text: 'Review flashcards before exams for better retention', color: 'bg-pink-50' }
                ].map((rec, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${rec.color}`}>
                    <span className="text-lg">{rec.icon}</span>
                    <p className="text-sm text-slate-700">{rec.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper: Format markdown-like text in AI responses
function formatMessage(text) {
  if (!text) return '';
  return text
    .replace(/### (.*)/g, '<strong class="block text-sm font-bold mt-2 mb-1">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 text-green-400 rounded-lg p-3 my-2 text-xs overflow-x-auto font-mono"><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-200 text-slate-800 rounded px-1 py-0.5 text-xs font-mono">$1</code>')
    .replace(/^- (.*)/gm, '<span class="flex items-start gap-1 ml-2"><span class="text-slate-400">•</span> $1</span>')
    .replace(/^\d+\. (.*)/gm, '<span class="ml-2">$&</span>')
    .replace(/\n/g, '<br/>');
}

export default StudentAIAssistant;
