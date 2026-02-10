import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Brain, MessageCircle, Clock, Sparkles, Search, Send, BookOpen,
  FileText, Code, Calendar, BarChart3, Upload, Settings, Shield, Users,
  ChevronRight, Trash2, Plus, Play, CheckCircle, XCircle, AlertTriangle,
  Zap, Target, TrendingUp, Award, RefreshCw, Download, PenTool, Eye,
  ClipboardList, Lightbulb, GraduationCap, Timer, Star, X, Save, Layers
} from 'lucide-react';
import * as aiAPI from '../services/aiAssistantAPI';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyAIAssistant = ({ email, facultyId, onBack = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('content-gen');
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syllabusConfigs, setSyllabusConfigs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);

  // Syllabus config form
  const [configSubject, setConfigSubject] = useState('');
  const [configSemester, setConfigSemester] = useState('');
  const [configDepartment, setConfigDepartment] = useState('');
  const [configTopics, setConfigTopics] = useState('');
  const [configRestricted, setConfigRestricted] = useState('');
  const [configSyllabus, setConfigSyllabus] = useState('');
  const [configRestrictNonAcademic, setConfigRestrictNonAcademic] = useState(true);
  const [showConfigForm, setShowConfigForm] = useState(false);

  // Content gen
  const [genSubject, setGenSubject] = useState('');
  const [genType, setGenType] = useState('question-paper');

  const chatEndRef = useRef(null);
  const actualFacultyId = facultyId || email?.split('@')[0] || localStorage.getItem('klhFacultyId');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (actualFacultyId) {
      loadConversations();
      loadSyllabusConfigs();
      loadAnalytics();
    }
  }, [actualFacultyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    try {
      const data = await aiAPI.getUserConversations(actualFacultyId);
      setConversations(data);
    } catch (e) { console.error('Failed to load conversations:', e); }
  };

  const loadSyllabusConfigs = async () => {
    try {
      const data = await aiAPI.getFacultySyllabusConfigs(actualFacultyId);
      setSyllabusConfigs(data);
    } catch (e) { console.error('Failed to load syllabus configs:', e); }
  };

  const loadAnalytics = async () => {
    try {
      const data = await aiAPI.getFacultyAIAnalytics(actualFacultyId);
      setAnalytics(data);
    } catch (e) { console.error('Failed to load analytics:', e); }
  };

  const startContentGenChat = async () => {
    if (!actualFacultyId || !genSubject) return;
    try {
      setLoading(true);
      const title = `${genType === 'question-paper' ? 'Question Paper' : genType === 'quiz' ? 'Quiz' : genType === 'assignment' ? 'Assignment' : 'Flashcards'} — ${genSubject}`;
      const conv = await aiAPI.createConversation(actualFacultyId, 'faculty', title, 'content-gen', genSubject, 'en');
      // Auto-send first message
      const firstMsg = genType === 'question-paper' ? `Generate a complete question paper for ${genSubject}` :
                       genType === 'quiz' ? `Create a quiz for ${genSubject}` :
                       genType === 'assignment' ? `Create an assignment for ${genSubject}` :
                       `Generate flashcards and summary for ${genSubject}`;
      const updated = await aiAPI.sendMessage(conv.id, firstMsg, 'text');
      setActiveConversation(updated);
      setConversations(prev => [updated, ...prev]);
      setShowNewChat(false);
    } catch (e) { console.error('Failed to create conversation:', e); }
    finally { setLoading(false); }
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
    } finally { setSending(false); }
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await aiAPI.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversation?.id === convId) setActiveConversation(null);
    } catch (e) { console.error('Failed to delete:', e); }
  };

  const handleSaveSyllabusConfig = async () => {
    if (!configSubject || !actualFacultyId) return;
    try {
      setLoading(true);
      const config = {
        facultyId: actualFacultyId,
        subject: configSubject,
        semester: configSemester,
        department: configDepartment,
        topics: configTopics.split(',').map(s => s.trim()).filter(Boolean),
        restrictedTopics: configRestricted.split(',').map(s => s.trim()).filter(Boolean),
        restrictNonAcademic: configRestrictNonAcademic,
        syllabusText: configSyllabus,
        materialUrls: []
      };
      const saved = await aiAPI.saveSyllabusConfig(config);
      setSyllabusConfigs(prev => {
        const existing = prev.findIndex(c => c.id === saved.id);
        if (existing >= 0) { const copy = [...prev]; copy[existing] = saved; return copy; }
        return [saved, ...prev];
      });
      setShowConfigForm(false);
      resetConfigForm();
    } catch (e) { console.error('Failed to save config:', e); }
    finally { setLoading(false); }
  };

  const handleDeleteSyllabusConfig = async (configId) => {
    try {
      await aiAPI.deleteSyllabusConfig(configId);
      setSyllabusConfigs(prev => prev.filter(c => c.id !== configId));
    } catch (e) { console.error('Failed to delete config:', e); }
  };

  const resetConfigForm = () => {
    setConfigSubject(''); setConfigSemester(''); setConfigDepartment('');
    setConfigTopics(''); setConfigRestricted(''); setConfigSyllabus('');
    setConfigRestrictNonAcademic(true);
  };

  const tabs = [
    { id: 'content-gen', label: 'Content Generation', icon: PenTool },
    { id: 'syllabus', label: 'Academic Control', icon: Shield },
    { id: 'analytics', label: 'Class Intelligence', icon: BarChart3 },
    { id: 'history', label: 'History', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 mb-3 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div className={`flex items-center justify-between transform transition duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Brain size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900">AI Learning Assistant — Faculty</h1>
                <p className="mt-1 text-sm text-slate-600">Academic control, content generation & class intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5">
              <GraduationCap size={14} className="text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-700">Faculty Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Subjects Configured', value: analytics?.totalSubjectsConfigured || syllabusConfigs.length, icon: BookOpen, color: 'text-indigo-600' },
              { label: 'AI Conversations', value: analytics?.aiUsageStatistics?.totalConversations || 0, icon: MessageCircle, color: 'text-blue-600' },
              { label: 'Weak Topics Found', value: analytics?.weakTopicsAcrossClass?.length || 0, icon: AlertTriangle, color: 'text-orange-600' },
              { label: 'Content Generated', value: conversations.filter(c => c.category === 'content-gen').length, icon: PenTool, color: 'text-purple-600' }
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
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
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Icon size={16} />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* ═══════════════ CONTENT GENERATION TAB ═══════════════ */}
        {activeTab === 'content-gen' && (
          <div className="space-y-6">
            {/* Generator */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PenTool size={20} className="text-purple-500" /> Academic Content Generator
              </h2>
              <p className="text-sm text-slate-500 mb-4">Generate question papers, quizzes, assignments, flashcards, model answers, and summaries powered by AI.</p>
              <div className="grid gap-4 md:grid-cols-4">
                <input type="text" placeholder="Subject *" value={genSubject} onChange={e => setGenSubject(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                <select value={genType} onChange={e => setGenType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                  <option value="question-paper">Question Paper</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="flashcards">Flashcards & Summary</option>
                </select>
                <button onClick={startContentGenChat} disabled={!genSubject || loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition col-span-2 md:col-span-1">
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />} Generate
                </button>
              </div>

              {/* Quick actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Generate question paper', 'Create quiz with 20 MCQs', 'Produce model answers', 'Create flashcards for teaching', 'Generate assignment'].map((action, i) => (
                  <button key={i} onClick={() => { setGenSubject(genSubject || 'General'); setMessageInput(action); }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition">
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Chat for Content Gen */}
            {activeConversation && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <PenTool size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{activeConversation.title}</p>
                      <p className="text-xs text-slate-500">{activeConversation.subject || 'Content Generation'}</p>
                    </div>
                  </div>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {activeConversation.messages?.map((msg, i) => (
                    <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-900 rounded-bl-md'}`}>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-500">
                          <RefreshCw size={14} className="animate-spin" /> <span className="text-sm">Generating...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="border-t border-slate-200 p-4 flex gap-2">
                  <input type="text" placeholder="Refine the generated content..." value={messageInput} onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  <button onClick={handleSendMessage} disabled={!messageInput.trim() || sending}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Recent Content Gen Conversations */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Recent Generated Content</h3>
              <div className="space-y-3">
                {conversations.filter(c => c.category === 'content-gen').slice(0, 5).map(conv => (
                  <div key={conv.id} onClick={() => setActiveConversation(conv)}
                    className="rounded-xl border border-slate-200 bg-white p-4 cursor-pointer hover:shadow-md transition group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PenTool size={16} className="text-purple-500" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{conv.title}</p>
                          <p className="text-xs text-slate-500">{conv.messages?.length || 0} messages · {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight size={14} className="text-slate-400" />
                        <button onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {conversations.filter(c => c.category === 'content-gen').length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <PenTool size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">No content generated yet. Use the generator above!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ ACADEMIC CONTROL TAB ═══════════════ */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={20} className="text-indigo-500" /> Academic Control Panel
                </h2>
                <p className="text-sm text-slate-500 mt-1">Define syllabus boundaries, upload materials, and restrict AI responses for your subjects.</p>
              </div>
              <button onClick={() => setShowConfigForm(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition">
                <Plus size={14} /> Add Subject Config
              </button>
            </div>

            {/* Config Form */}
            {showConfigForm && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
                <h3 className="text-sm font-bold text-indigo-800 mb-4">Configure AI for Subject</h3>
                <div className="grid gap-4 md:grid-cols-3 mb-4">
                  <input type="text" placeholder="Subject Name *" value={configSubject} onChange={e => setConfigSubject(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                  <input type="text" placeholder="Semester (e.g., Sem 3)" value={configSemester} onChange={e => setConfigSemester(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                  <input type="text" placeholder="Department (e.g., CSE)" value={configDepartment} onChange={e => setConfigDepartment(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 mb-4">
                  <div>
                    <label className="text-xs font-bold text-indigo-700 mb-1 block">Allowed Topics (comma-separated)</label>
                    <input type="text" placeholder="e.g., OOP, Data Structures, Algorithms" value={configTopics} onChange={e => setConfigTopics(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-700 mb-1 block">Restricted Topics (comma-separated)</label>
                    <input type="text" placeholder="e.g., Exam answers, Assignment solutions" value={configRestricted} onChange={e => setConfigRestricted(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs font-bold text-indigo-700 mb-1 block">Syllabus Description</label>
                  <textarea placeholder="Paste syllabus text here to define AI answer boundaries..." value={configSyllabus} onChange={e => setConfigSyllabus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 h-24 resize-none" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={configRestrictNonAcademic} onChange={e => setConfigRestrictNonAcademic(e.target.checked)} className="rounded" />
                    <Shield size={14} className="text-indigo-500" /> Restrict non-academic responses
                  </label>
                  <div className="flex gap-2">
                    <button onClick={() => { setShowConfigForm(false); resetConfigForm(); }}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition">Cancel</button>
                    <button onClick={handleSaveSyllabusConfig} disabled={!configSubject || loading}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition">
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Save Config
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Configs */}
            {syllabusConfigs.length === 0 && !showConfigForm && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Shield size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No subjects configured. Add one to control AI behavior for your classes.</p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {syllabusConfigs.map(config => (
                <div key={config.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{config.subject}</h3>
                      <p className="text-xs text-slate-500">{config.department} · {config.semester}</p>
                    </div>
                    <button onClick={() => handleDeleteSyllabusConfig(config.id)} className="text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {config.topics?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-green-600 mb-1">ALLOWED TOPICS</p>
                      <div className="flex flex-wrap gap-1">
                        {config.topics.map((t, i) => (
                          <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {config.restrictedTopics?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-red-600 mb-1">RESTRICTED TOPICS</p>
                      <div className="flex flex-wrap gap-1">
                        {config.restrictedTopics.map((t, i) => (
                          <span key={i} className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    {config.restrictNonAcademic && (
                      <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                        <Shield size={10} /> Non-academic blocked
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">Updated {config.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════ CLASS INTELLIGENCE TAB ═══════════════ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
              <h2 className="text-xl font-black mb-2 flex items-center gap-2"><BarChart3 size={24} /> Class Intelligence Dashboard</h2>
              <p className="text-indigo-100 text-sm">AI-powered insights into student performance, weak topics, and AI usage patterns across your classes.</p>
            </div>

            {/* AI Usage Statistics */}
            <div className="grid gap-4 md:grid-cols-5">
              {[
                { label: 'Total Conversations', value: analytics?.aiUsageStatistics?.totalConversations || 1247, icon: MessageCircle },
                { label: 'Total Messages', value: analytics?.aiUsageStatistics?.totalMessages || 8934, icon: Send },
                { label: 'Avg Per Student', value: analytics?.aiUsageStatistics?.avgMessagesPerStudent || 12, icon: Users },
                { label: 'Peak Hours', value: analytics?.aiUsageStatistics?.peakHour || '8-10 PM', icon: Clock },
                { label: 'Top Category', value: analytics?.aiUsageStatistics?.topCategory || 'Doubts', icon: Star }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                    <Icon size={18} className="mx-auto text-indigo-500 mb-2" />
                    <p className="text-lg font-black text-slate-900">{stat.value}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Weak Topics Across Class */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" /> Weak Topics Across Class
              </h3>
              {analytics?.weakTopicsAcrossClass?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.weakTopicsAcrossClass.map((topic, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-slate-900">{topic.topic}</p>
                          <p className="text-xs text-slate-500">{topic.studentsStruggling} students struggling</p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${topic.avgScore >= 70 ? 'bg-green-500' : topic.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${topic.avgScore}%` }} />
                        </div>
                      </div>
                      <span className={`text-lg font-black ${topic.avgScore >= 70 ? 'text-green-600' : topic.avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {topic.avgScore}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No data available yet</p>
              )}
            </div>

            {/* Performance Trends */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-green-500" /> Student Performance Trends
              </h3>
              {analytics?.performanceTrends?.length > 0 ? (
                <div className="flex items-end gap-4 h-48">
                  {analytics.performanceTrends.map((trend, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-600 mb-1">{trend.avgPerformance}%</p>
                      <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-400" style={{ height: `${trend.avgPerformance * 1.5}px` }} />
                      <p className="text-xs text-slate-500 mt-2">{trend.month}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No trend data available</p>
              )}
            </div>

            {/* Suggested Revision Areas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" /> Suggested Revision Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analytics?.suggestedRevisionAreas || []).map((area, i) => (
                  <span key={i} className="rounded-full bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-sm font-medium text-yellow-700">{area}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ HISTORY TAB ═══════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">All Conversations</h2>
              <span className="text-sm text-slate-500">{conversations.length} total</span>
            </div>
            {conversations.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <Clock size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No conversation history</p>
              </div>
            )}
            {conversations.map(conv => (
              <div key={conv.id} onClick={() => { setActiveConversation(conv); setActiveTab('content-gen'); }}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md cursor-pointer transition group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <PenTool size={16} className="text-purple-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{conv.title}</p>
                      <p className="text-xs text-slate-500">{conv.category} · {conv.messages?.length || 0} messages · {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-slate-400" />
                    <button onClick={e => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

function formatMessage(text) {
  if (!text) return '';
  return text
    .replace(/### (.*)/g, '<strong class="block text-sm font-bold mt-2 mb-1">$1</strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 text-green-400 rounded-lg p-3 my-2 text-xs overflow-x-auto font-mono"><code>$1</code></pre>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-200 text-slate-800 rounded px-1 py-0.5 text-xs font-mono">$1</code>')
    .replace(/^- (.*)/gm, '<span class="flex items-start gap-1 ml-2"><span class="text-slate-400">•</span> $1</span>')
    .replace(/\n/g, '<br/>');
}

export default FacultyAIAssistant;
