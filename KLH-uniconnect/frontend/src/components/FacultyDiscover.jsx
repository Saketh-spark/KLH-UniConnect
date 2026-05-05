import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Search, Users, Briefcase, BookOpen, Code2, Compass,
  MapPin, Clock, Heart, MessageCircle, Bookmark, BookmarkCheck,
  Filter, X, Eye, Send, GraduationCap, Trophy,
  Zap, TrendingUp, Lightbulb, Microscope,
  Building2, ExternalLink, Share2, Award,
  UserPlus, FolderGit2, Rocket, BarChart3,
  PlusCircle, FlaskConical,
  AlertCircle, CheckCircle2,
  Pin, Bell,
  UserCheck, Loader2, XCircle
} from 'lucide-react';
import ProfileModal from './ProfileModal.jsx';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══════════ Stable helpers ═══════════ */
const tabs = [
  { id: 'discover-people',        label: 'Find Talent',        icon: Users,       color: '#0d9488' },
  { id: 'discover-opportunities', label: 'Post Opportunities',  icon: Rocket,      color: '#6366f1' },
  { id: 'discover-feed',          label: 'Inspire & Share',     icon: BookOpen,    color: '#f59e0b' },
  { id: 'discover-projects',      label: 'Student Projects',    icon: Code2,       color: '#8b5cf6' },
  { id: 'discover-insights',      label: 'Analytics',           icon: BarChart3,   color: '#ec4899' },
];

const PEOPLE_FILTERS = ['All', 'Top Performers', 'Research-Oriented', 'Seeking Mentorship', 'Project Leaders'];
const DEPT_OPTIONS   = ['All', 'CSE', 'ECE', 'Mechanical', 'Civil', 'IT', 'AI/ML', 'Electronics'];
const OPP_TYPES      = ['All', 'Internship', 'Research', 'Full-time', 'Part-time', 'Teaching Assist', 'Mentorship', 'Workshop', 'Collaboration'];
const FEED_TOPICS    = ['All', 'General', 'Research', 'Placements', 'Hackathons', 'Project Showcases', 'Career Tips', 'Guidance', 'Events'];

const avatar = (url, name, size = 'h-12 w-12') =>
  url
    ? <img src={`${API}${url}`} alt="" className={`${size} rounded-xl object-cover`} />
    : <div className={`${size} flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-lg font-bold text-white`}>{(name || '?').charAt(0).toUpperCase()}</div>;

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

/* ══════════════════════════════════════════════════════════════════ */

export default function FacultyDiscover({ email, onBack, onChat }) {
  /* ─── core state ─── */
  const [tab, setTab]           = useState('discover-people');
  const [search, setSearch]     = useState('');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty]   = useState([]);
  const [opps, setOpps]         = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(false);
  const [facultyName, setFacultyName] = useState('');

  /* ─── filters ─── */
  const [peopleFilter, setPeopleFilter] = useState('All');
  const [deptFilter, setDeptFilter]     = useState('All');
  const [oppType, setOppType]           = useState('All');
  const [feedTopic, setFeedTopic]       = useState('All');
  const [showFilters, setShowFilters]   = useState(false);
  const [cgpaMin, setCgpaMin]           = useState('');
  const [cgpaMax, setCgpaMax]           = useState('');
  const [projectsFilter, setProjectsFilter]   = useState(false);
  const [researchFilterOn, setResearchFilterOn] = useState(false);

  /* ─── follow & profile modal ─── */
  const [followStatuses, setFollowStatuses] = useState({});
  const [profileModal, setProfileModal]     = useState(null);
  const [followRequests, setFollowRequests] = useState([]);
  const [requestCount, setRequestCount]     = useState(0);

  /* ─── Feed ─── */
  const [feedPosts, setFeedPosts]     = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);

  /* ─── Projects ─── */
  const [projects, setProjects]       = useState([]);
  const [projLoading, setProjLoading] = useState(false);

  /* ─── Modals ─── */
  const [createOppModal, setCreateOppModal]       = useState(false);
  const [oppDetailModal, setOppDetailModal]       = useState(null);
  const [createPostModal, setCreatePostModal]     = useState(false);
  const [commentModal, setCommentModal]           = useState(null);
  const [projectDetailModal, setProjectDetailModal] = useState(null);

  /* ─── Create Opportunity form ─── */
  const [oppForm, setOppForm] = useState({ position: '', company: 'KLH University', type: 'Internship', salary: '', description: '', location: '', deadline: '', experience: 'Fresher' });
  const [oppSubmitting, setOppSubmitting] = useState(false);

  /* ─── Create Post form ─── */
  const [postForm, setPostForm] = useState({ title: '', content: '', topic: 'General', type: 'General' });
  const [postSubmitting, setPostSubmitting] = useState(false);

  /* ─── Comments ─── */
  const [commentText, setCommentText]       = useState('');
  const [comments, setComments]             = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);

  /* ─── Applications ─── */
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading]   = useState(false);

  /* ═══════════ DATA FETCHING ═══════════ */

  useEffect(() => {
    if (!email) return;
    axios.get(`${API}/api/discover/profile/faculty`, { params: { email } })
      .then(r => setFacultyName(r.data?.name || '')).catch(() => {});
  }, [email]);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        axios.get(`${API}/api/discover/students`, { params: { q: search, department: deptFilter === 'All' ? '' : deptFilter, skill: '', excludeEmail: email } }),
        axios.get(`${API}/api/discover/faculty`,  { params: { q: search, department: deptFilter === 'All' ? '' : deptFilter, excludeEmail: email } }),
      ]);
      let sList = sRes.data;
      if (cgpaMin) sList = sList.filter(s => s.cgpa >= parseFloat(cgpaMin));
      if (cgpaMax) sList = sList.filter(s => s.cgpa <= parseFloat(cgpaMax));
      if (projectsFilter) sList = sList.filter(s => (s.projects || 0) > 0);
      if (researchFilterOn) sList = sList.filter(s => s.researchInterest);
      setStudents(sList);
      setFaculty(fRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, deptFilter, cgpaMin, cgpaMax, projectsFilter, researchFilterOn, email]);

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/discover/opportunities`, { params: { q: search, type: oppType === 'All' ? '' : oppType } });
      setOpps(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, oppType]);

  const fetchFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/feed/posts`, { params: { topic: feedTopic === 'All' ? '' : feedTopic, email } });
      setFeedPosts(data);
    } catch (e) { console.error(e); }
    setFeedLoading(false);
  }, [feedTopic, email]);

  const fetchProjects = useCallback(async () => {
    setProjLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/projects`, { params: { email } });
      setProjects(data);
    } catch (e) { console.error(e); }
    setProjLoading(false);
  }, [email]);

  const fetchStats = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/api/discover/stats`); setStats(data); } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === 'discover-people') fetchPeople(); }, [tab, fetchPeople]);
  useEffect(() => { if (tab === 'discover-opportunities') fetchOpps(); }, [tab, fetchOpps]);
  useEffect(() => { if (tab === 'discover-feed') fetchFeed(); }, [tab, fetchFeed]);
  useEffect(() => { if (tab === 'discover-projects') fetchProjects(); }, [tab, fetchProjects]);

  /* ─── Bulk follow status ─── */
  useEffect(() => {
    if (!email) return;
    const allEmails = [...students, ...faculty].map(p => p.email).filter(Boolean);
    if (allEmails.length === 0) return;
    axios.post(`${API}/api/follow/status/bulk`, { email, targets: allEmails })
      .then(r => setFollowStatuses(r.data || {})).catch(() => {});
  }, [students, faculty, email]);

  const fetchFollowRequests = useCallback(() => {
    if (!email) return;
    axios.get(`${API}/api/follow/requests/received`, { params: { email } })
      .then(r => { setFollowRequests(r.data || []); setRequestCount(r.data?.length || 0); }).catch(() => {});
  }, [email]);
  useEffect(() => { fetchFollowRequests(); }, [fetchFollowRequests]);

  /* ═══════════ ACTION HANDLERS ═══════════ */

  const handleFollowAction = async (targetEmail, targetName, targetAvatarUrl, targetType, action) => {
    try {
      if (action === 'follow') {
        await axios.post(`${API}/api/follow/request`, {
          fromEmail: email, toEmail: targetEmail,
          fromName: facultyName, fromAvatarUrl: '', fromRole: 'FACULTY',
          toName: targetName, toAvatarUrl: targetAvatarUrl, toRole: targetType?.toUpperCase() || 'STUDENT'
        });
        setFollowStatuses(prev => ({ ...prev, [targetEmail]: 'PENDING_SENT' }));
      } else if (action === 'unfollow') {
        await axios.delete(`${API}/api/follow/request`, { data: { fromEmail: email, toEmail: targetEmail } });
        setFollowStatuses(prev => ({ ...prev, [targetEmail]: 'NONE' }));
      } else if (action === 'accept' || action === 'reject') {
        const req = followRequests.find(r => r.fromEmail === targetEmail);
        const bulkEntry = followStatuses[targetEmail];
        const requestId = req?.id || (typeof bulkEntry === 'object' ? bulkEntry.id : null);
        if (requestId) {
          await axios.put(`${API}/api/follow/request/${requestId}`, { action });
          setFollowStatuses(prev => ({ ...prev, [targetEmail]: action === 'accept' ? 'ACCEPTED' : 'NONE' }));
          fetchFollowRequests();
          const allEmails = [...students, ...faculty].map(p => p.email).filter(Boolean);
          if (allEmails.length > 0) {
            axios.post(`${API}/api/follow/status/bulk`, { email, targets: allEmails })
              .then(r => setFollowStatuses(r.data || {})).catch(() => {});
          }
        }
      }
    } catch (e) { console.error('Follow action failed', e); }
  };

  const getFollowStatus = (personEmail) => {
    const entry = followStatuses[personEmail];
    if (!entry) return 'NONE';
    if (typeof entry === 'object') {
      const { status, direction } = entry;
      if (status === 'ACCEPTED') return 'ACCEPTED';
      if (status === 'PENDING' && direction === 'sent') return 'PENDING_SENT';
      if (status === 'PENDING' && direction === 'received') return 'PENDING_RECEIVED';
      return 'NONE';
    }
    return entry; // direct string
  };

  /* ─── Feed Actions ─── */
  const handleLike = async (postId) => {
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${postId}/like`, { email });
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: data.isLiked, likes: data.likes } : p));
    } catch (e) { console.error(e); }
  };

  const handleSave = async (postId) => {
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${postId}/save`, { email });
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: data.isSaved } : p));
    } catch (e) { console.error(e); }
  };

  const handleShare = async (postId) => {
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${postId}/share`);
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, shareCount: data.shareCount } : p));
      navigator.clipboard?.writeText(`${window.location.origin}/feed/${postId}`).catch(() => {});
    } catch (e) { console.error(e); }
  };

  const openComments = async (postId) => {
    setCommentModal(postId);
    setCommentLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/feed/posts/${postId}/comments`);
      setComments(data);
    } catch (e) { console.error(e); }
    setCommentLoading(false);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !commentModal) return;
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${commentModal}/comments`, { email, name: facultyName, text: commentText });
      setComments(prev => [...prev, { authorEmail: email, authorName: facultyName, text: commentText, createdAt: new Date().toISOString() }]);
      setFeedPosts(prev => prev.map(p => p.id === commentModal ? { ...p, comments: data.commentCount } : p));
      setCommentText('');
    } catch (e) { console.error(e); }
  };

  /* ─── Create Opportunity ─── */
  const submitOpportunity = async () => {
    if (!oppForm.position || !oppForm.description) return;
    setOppSubmitting(true);
    try {
      await axios.post(`${API}/api/discover/opportunities`, { ...oppForm, createdBy: email });
      setOppForm({ position: '', company: 'KLH University', type: 'Internship', salary: '', description: '', location: '', deadline: '', experience: 'Fresher' });
      setCreateOppModal(false);
      fetchOpps(); fetchStats();
    } catch (e) { console.error(e); }
    setOppSubmitting(false);
  };

  /* ─── Create Feed Post ─── */
  const submitPost = async () => {
    if (!postForm.title || !postForm.content) return;
    setPostSubmitting(true);
    try {
      await axios.post(`${API}/api/feed/posts`, { ...postForm, authorEmail: email, authorName: facultyName, authorRole: 'FACULTY' });
      setPostForm({ title: '', content: '', topic: 'General', type: 'General' });
      setCreatePostModal(false);
      fetchFeed();
    } catch (e) { console.error(e); }
    setPostSubmitting(false);
  };

  /* ─── View Opp Detail + Applications ─── */
  const openOppDetail = async (opp) => {
    setOppDetailModal(opp);
    setAppsLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/discover/opportunities/${opp.id}/applications`);
      setApplications(data);
    } catch (e) { console.error(e); setApplications([]); }
    setAppsLoading(false);
  };

  const shareOpp = (opp) => {
    const text = `${opp.title} - ${opp.type || ''} at ${opp.company || 'KLH University'}`;
    navigator.clipboard?.writeText(text).catch(() => {});
    alert('Opportunity details copied to clipboard!');
  };

  /* ─── Mentor a project ─── */
  const mentorProject = async (projId) => {
    try {
      await axios.post(`${API}/api/projects/${projId}/mentor`, { email, name: facultyName });
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  /* ─── Computed data ─── */
  const filteredStudents = useMemo(() => {
    let result = students;
    if (peopleFilter === 'Top Performers') result = result.filter(s => s.cgpa >= 8);
    if (peopleFilter === 'Research-Oriented') result = result.filter(s => s.researchInterest);
    if (peopleFilter === 'Seeking Mentorship') result = result.filter(s => s.seeksMentorship);
    if (peopleFilter === 'Project Leaders') result = result.filter(s => (s.projects || 0) > 0);
    return result;
  }, [students, peopleFilter]);

  const trendingResearch = ['Federated Learning', 'Quantum Computing', 'Edge AI', 'Large Language Models', 'Computer Vision', 'Blockchain Applications'];
  const trendingSkills = ['Machine Learning', 'Cloud Architecture', 'Full-Stack Development', 'Data Science', 'DevOps', 'System Design'];

  /* ═══════════ RENDER: Find Talent ═══════════ */
  const renderFindTalent = () => {
    const getTitle = (s) => {
      const parts = [];
      if (s.branch) parts.push(s.branch);
      if (s.year) parts.push(`Year ${s.year}`);
      if (s.semester) parts.push(`Sem ${s.semester}`);
      return parts.join(' · ') || 'Student';
    };
    const getInterests = (s) => {
      const arr = [];
      if (s.branch) arr.push(s.branch);
      if (s.cgpa >= 8) arr.push('Academic Excellence');
      if ((s.projects || 0) > 0) arr.push('Project Building');
      if ((s.certificates || 0) > 0) arr.push('Certifications');
      if ((s.internships || 0) > 0) arr.push('Industry Experience');
      return arr;
    };

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-teal-900">Smart Talent Discovery</h3>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700">
              <Filter size={14} /> Advanced Filters
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {PEOPLE_FILTERS.map(f => (
              <button key={f} onClick={() => setPeopleFilter(f)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition duration-300 ${peopleFilter === f ? 'bg-teal-600 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-teal-100'}`}>{f}</button>
            ))}
          </div>
          {showFilters && (
            <div className="mt-5 grid gap-4 rounded-2xl border border-teal-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-teal-600">Department</label>
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                  className="w-full rounded-lg border border-teal-200 px-3 py-2 text-sm outline-none focus:border-teal-400">{DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}</select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-teal-600">Min CGPA</label>
                <input type="number" step="0.1" min="0" max="10" value={cgpaMin} onChange={e => setCgpaMin(e.target.value)} placeholder="0.0"
                  className="w-full rounded-lg border border-teal-200 px-3 py-2 text-sm outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-teal-600">Max CGPA</label>
                <input type="number" step="0.1" min="0" max="10" value={cgpaMax} onChange={e => setCgpaMax(e.target.value)} placeholder="10.0"
                  className="w-full rounded-lg border border-teal-200 px-3 py-2 text-sm outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-teal-600">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={projectsFilter} onChange={e => setProjectsFilter(e.target.checked)} className="rounded" /><span className="text-xs text-slate-600">Has Projects</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={researchFilterOn} onChange={e => setResearchFilterOn(e.target.checked)} className="rounded" /><span className="text-xs text-slate-600">Research Int.</span></label>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? <LoadingSkeleton count={3} /> : filteredStudents.length === 0
          ? <EmptyBox icon={Users} title="No students matched" sub="Adjust filters to discover more talent" />
          : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((s, idx) => {
                const skills = s.skills || [];
                const interests = getInterests(s);
                const fStatus = getFollowStatus(s.email);

                const renderBtn = () => {
                  if (fStatus === 'ACCEPTED') return (
                    <button onClick={e => { e.stopPropagation(); onChat?.(s.email); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95">
                      <MessageCircle size={16} /> Chat
                    </button>);
                  if (fStatus === 'PENDING_SENT') return (
                    <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
                      <Clock size={16} /> Requested
                    </button>);
                  if (fStatus === 'PENDING_RECEIVED') return (
                    <div className="flex w-full gap-2">
                      <button onClick={e => { e.stopPropagation(); handleFollowAction(s.email, s.name, s.avatarUrl, 'student', 'accept'); }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95"><CheckCircle2 size={16} /> Accept</button>
                      <button onClick={e => { e.stopPropagation(); handleFollowAction(s.email, s.name, s.avatarUrl, 'student', 'reject'); }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-red-500 shadow-sm transition hover:bg-red-50 active:scale-95"><XCircle size={16} /> Decline</button>
                    </div>);
                  return (
                    <button onClick={e => { e.stopPropagation(); handleFollowAction(s.email, s.name, s.avatarUrl, 'student', 'follow'); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700 active:scale-95">
                      <UserPlus size={16} /> Follow
                    </button>);
                };

                return (
                  <div key={s.id} onClick={() => setProfileModal({ email: s.email, type: 'student' })}
                    className="group cursor-pointer rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 overflow-hidden">
                    <div className="flex flex-col items-center px-6 pt-7 pb-2 text-center">
                      {s.avatarUrl
                        ? <img src={`${API}${s.avatarUrl}`} alt={s.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-teal-50 shadow-md" />
                        : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-2xl font-bold text-white ring-4 ring-teal-50 shadow-md">{(s.name || '?').charAt(0).toUpperCase()}</div>}
                      <h4 className="mt-4 text-lg font-extrabold text-slate-900">{s.name || 'Unknown'}</h4>
                      <p className="mt-0.5 text-sm font-medium text-teal-600">{getTitle(s)}</p>
                      {s.bio && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{s.bio}</p>}
                      <div className="mt-4 flex items-center justify-center w-full border-t border-slate-100 pt-4">
                        {fStatus === 'ACCEPTED' && <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><UserCheck size={14} /> Connected</span>}
                        {fStatus === 'PENDING_SENT' && <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><Clock size={14} /> Pending</span>}
                        {fStatus === 'PENDING_RECEIVED' && <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-600"><Bell size={14} /> Wants to connect</span>}
                        {(fStatus === 'NONE' || !fStatus) && <span className="text-xs text-slate-400">Click to view profile</span>}
                      </div>
                    </div>
                    {skills.length > 0 && (
                      <div className="px-6 pt-4">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, 2).map((sk, i) => <span key={i} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">{sk}</span>)}
                          {skills.length > 2 && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-400">+{skills.length - 2} more</span>}
                        </div>
                      </div>)}
                    {interests.length > 0 && (
                      <div className="px-6 pt-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {interests.slice(0, 3).map((int_, i) => <span key={i} className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">{int_}</span>)}
                        </div>
                      </div>)}
                    <div className="px-6 pt-5 pb-6">{renderBtn()}</div>
                  </div>
                );
              })}
            </div>}
      </div>
    );
  };

  /* ═══════════ RENDER: Post Opportunities ═══════════ */
  const renderPostOpportunities = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-3xl border-2 border-dashed border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
        <div>
          <h4 className="text-sm font-bold text-indigo-900">Create New Opportunity</h4>
          <p className="text-xs text-indigo-700">Share internships, research positions, workshops or collaboration offers</p>
        </div>
        <button onClick={() => setCreateOppModal(true)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-indigo-700 active:scale-95">
          <PlusCircle size={16} /> Post Now
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPP_TYPES.map(t => (
          <button key={t} onClick={() => setOppType(t)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition duration-300 ${oppType === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-indigo-100 border border-slate-200'}`}>{t}</button>
        ))}
      </div>

      {loading ? <LoadingSkeleton count={4} /> : opps.length === 0
        ? <EmptyBox icon={Briefcase} title="No opportunities posted yet" sub="Create an opportunity to attract talented students" />
        : <div className="grid gap-4 sm:grid-cols-2">
            {opps.map((o, idx) => (
              <div key={o.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:border-indigo-300 hover:shadow-xl" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${o.type === 'Research' ? 'bg-violet-100 text-violet-700' : o.type === 'Internship' ? 'bg-blue-100 text-blue-700' : o.type === 'Full-time' ? 'bg-green-100 text-green-700' : o.type === 'Mentorship' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{o.type}</span>
                      {o.status && <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${o.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{o.status}</span>}
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-slate-900">{o.title}</h4>
                    {o.company && <p className="text-xs text-slate-500 mt-0.5">{o.company}</p>}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 mb-3 line-clamp-2">{o.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {o.location && <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700"><MapPin size={10} />{o.location}</span>}
                  {o.salary && <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"><Zap size={10} />{o.salary}</span>}
                  {o.deadline && <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700"><Clock size={10} />{o.deadline}</span>}
                </div>
                {o.applicants !== undefined && (
                  <div className="rounded-lg bg-slate-50 px-3 py-2 mb-3 text-[10px] font-semibold text-slate-600">{o.applicants} applicant{o.applicants !== 1 ? 's' : ''}</div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openOppDetail(o)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95"><Eye size={13} /> View Details</button>
                  <button onClick={() => shareOpp(o)} className="flex items-center justify-center rounded-xl border-2 border-slate-200 px-3 py-2 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 active:scale-95"><Share2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );

  /* ═══════════ RENDER: Inspire & Share ═══════════ */
  const renderInspireShare = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-3xl border-2 border-dashed border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <div>
          <h4 className="text-sm font-bold text-amber-900">Share Your Insights</h4>
          <p className="text-xs text-amber-700">Post research updates, student achievements, or teaching innovations</p>
        </div>
        <button onClick={() => setCreatePostModal(true)} className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-amber-600 active:scale-95">
          <PlusCircle size={16} /> Create Post
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FEED_TOPICS.map(t => (
          <button key={t} onClick={() => setFeedTopic(t)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition duration-300 ${feedTopic === t ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-amber-100 border border-slate-200'}`}>{t}</button>
        ))}
      </div>

      {feedLoading ? <LoadingSkeleton count={3} /> : feedPosts.length === 0
        ? <EmptyBox icon={BookOpen} title="No posts yet" sub="Be the first to share an update" />
        : <div className="space-y-4">
            {feedPosts.map((f, idx) => (
              <div key={f.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:shadow-xl hover:border-amber-200" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">{f.authorAvatar || (f.authorName || '?').charAt(0)}</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{f.authorName}</h4>
                      <p className="text-[10px] text-slate-500">{timeAgo(f.createdAt)} · <span className="font-semibold text-amber-600">{f.topic}</span></p>
                    </div>
                  </div>
                  {f.isPinned && <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700"><Pin size={11} /> Pinned</span>}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 mb-4">{f.content}</p>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
                  <button onClick={() => handleLike(f.id)} className={`flex items-center gap-1.5 text-xs font-semibold transition ${f.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-400'}`}>
                    <Heart size={14} fill={f.isLiked ? 'currentColor' : 'none'} /> {f.likes || 0}
                  </button>
                  <button onClick={() => openComments(f.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition">
                    <MessageCircle size={14} /> {f.comments || 0}
                  </button>
                  <button onClick={() => handleSave(f.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-500 transition">
                    {f.isSaved ? <BookmarkCheck size={14} className="text-amber-500" /> : <Bookmark size={14} />}
                  </button>
                  <button onClick={() => handleShare(f.id)} className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition">
                    <Share2 size={14} /> {f.shareCount || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );

  /* ═══════════ RENDER: Student Projects ═══════════ */
  const renderStudentProjects = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Discover Student Projects</h3>
          <p className="text-xs text-slate-500 mt-1">Find projects seeking mentorship and collaboration</p>
        </div>
        <button onClick={() => setCreateOppModal(true)} className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 active:scale-95 flex items-center gap-2">
          <FlaskConical size={14} /> Post Research Opp
        </button>
      </div>

      {projLoading ? <LoadingSkeleton count={4} /> : projects.length === 0
        ? <EmptyBox icon={Code2} title="No student projects yet" sub="Students haven't posted any projects" />
        : <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p, idx) => (
              <div key={p.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:border-violet-300 hover:shadow-xl" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{p.ownerName || p.ownerEmail}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {!p.mentorEmail && (
                      <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 flex items-center gap-1"><AlertCircle size={10} /> Needs Mentor</span>
                    )}
                    {p.mentorEmail && (
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 flex items-center gap-1"><CheckCircle2 size={10} /> Mentored</span>
                    )}
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{p.status}</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600 mb-3 line-clamp-2">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(p.techStack || []).map((t, i) => <span key={i} className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">{t}</span>)}
                </div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 mb-3 text-[10px] font-semibold text-slate-600">
                  {p.memberCount || p.members?.length || 0}/{p.maxMembers || '?'} members · {p.domain}
                  {p.mentorName && <span className="ml-2 text-emerald-600">· Mentor: {p.mentorName}</span>}
                </div>
                {p.rolesNeeded?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Roles needed:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.rolesNeeded.map((r, i) => <span key={i} className="rounded-md bg-pink-50 px-2 py-0.5 text-[10px] font-semibold text-pink-700">{r}</span>)}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {!p.mentorEmail && (
                    <button onClick={() => mentorProject(p.id)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2 text-xs font-bold text-white transition hover:bg-teal-700 active:scale-95">
                      <Microscope size={13} /> Mentor
                    </button>
                  )}
                  {p.mentorEmail === email && (
                    <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-100 py-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} /> You're Mentoring</span>
                  )}
                  <button onClick={() => setProjectDetailModal(p)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-violet-200 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50 active:scale-95">
                    <Eye size={13} /> Details
                  </button>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );

  /* ═══════════ RENDER: Analytics ═══════════ */
  const renderAnalytics = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Students', value: stats.totalStudents || 0, icon: GraduationCap, color: 'emerald' },
          { label: 'Faculty', value: stats.totalFaculty || 0, icon: Building2, color: 'teal' },
          { label: 'Opportunities', value: stats.totalOpportunities || 0, icon: Briefcase, color: 'indigo' },
          { label: 'Projects', value: projects.length, icon: FolderGit2, color: 'violet' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border border-${s.color}-100 bg-gradient-to-br from-${s.color}-50 to-white p-5 shadow-sm hover:shadow-md transition`}>
            <div className={`flex items-center gap-2 text-${s.color}-700 mb-2`}><s.icon size={18} /><span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span></div>
            <p className={`text-3xl font-black text-${s.color}-700`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100"><Trophy size={16} className="text-amber-600" /></div><h3 className="text-sm font-bold text-slate-900">Top Performing Students (CGPA ≥ 8.0)</h3></div>
        {students.length === 0 ? <p className="text-xs text-slate-500">No student data available yet</p> : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {students.filter(s => s.cgpa >= 8).sort((a, b) => b.cgpa - a.cgpa).slice(0, 6).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-amber-50 cursor-pointer" onClick={() => setProfileModal({ email: s.email, type: 'student' })}>
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                {avatar(s.avatarUrl, s.name, 'h-9 w-9')}
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{s.name}</p><p className="truncate text-[10px] text-slate-500">{s.branch} · Year {s.year}</p></div>
                <div className="text-right"><p className="text-xs font-bold text-emerald-600">{s.cgpa}</p><p className="text-[10px] text-slate-500">CGPA</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100"><TrendingUp size={16} className="text-violet-600" /></div><h3 className="text-sm font-bold text-slate-900">Trending Research Topics</h3></div>
          <div className="flex flex-wrap gap-2">
            {trendingResearch.map((t, i) => <span key={i} className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 px-3.5 py-2 text-xs font-semibold text-violet-700 shadow-sm">{t}</span>)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100"><Zap size={16} className="text-emerald-600" /></div><h3 className="text-sm font-bold text-slate-900">In-Demand Skills</h3></div>
          <div className="flex flex-wrap gap-2">
            {trendingSkills.map((s, i) => <span key={i} className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-sm">{s}</span>)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100"><Lightbulb size={16} className="text-pink-600" /></div><h3 className="text-sm font-bold text-slate-900">Projects Seeking Mentorship</h3></div>
        {projects.filter(p => !p.mentorEmail).length === 0 ? <p className="text-xs text-slate-500">No pending mentorship requests</p> : (
          <div className="space-y-2">
            {projects.filter(p => !p.mentorEmail).slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50"><FolderGit2 size={16} className="text-violet-600" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-800">{p.name}</p><p className="truncate text-[10px] text-slate-500">{p.ownerName || p.ownerEmail} · {p.memberCount || 0} members</p></div>
                <button onClick={() => mentorProject(p.id)} className="rounded-lg bg-teal-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-teal-700 active:scale-95">Mentor</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════ MAIN LAYOUT ═══════════ */
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Back to Dashboard */}
      <div className="mx-auto max-w-7xl px-6 pt-4 pb-1">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden py-8 mx-6 mt-2 rounded-2xl bg-gradient-to-r from-teal-100 via-emerald-50 to-cyan-100">
        <div className="relative mx-auto max-w-7xl px-8 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600/10 border border-teal-200">
            <Compass size={28} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Discover</h1>
            <p className="mt-1 text-sm text-slate-500">Find people, opportunities, and inspiring content</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {tabs.map(t => {
              const counts = {
                'discover-people': (students.length + faculty.length) || 0,
                'discover-opportunities': opps.length || 0,
                'discover-feed': feedPosts.length || 0,
                'discover-projects': projects.length || 0,
                'discover-insights': 0,
              };
              const count = counts[t.id] ?? 0;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    active ? 'text-teal-700 bg-teal-50 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}>
                  <t.icon size={16} /> {t.label}
                  {count > 0 && <span className={`ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    active ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Universal Search Bar */}
      <div className="mx-auto max-w-7xl px-6 pt-5">
        <div className="flex items-center gap-3 rounded-xl border-2 border-teal-400 bg-white px-4 py-3 shadow-sm focus-within:border-teal-500 focus-within:shadow-md transition">
          <Search size={20} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search students, projects, opportunities..."
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          {search && <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {requestCount > 0 && tab === 'discover-people' && (
          <div className="mb-6 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100"><Bell size={18} className="text-teal-600" /></div>
              <div><h3 className="text-sm font-bold text-teal-900">Follow Requests</h3><p className="text-xs text-teal-600/70">{requestCount} pending</p></div>
            </div>
            <div className="space-y-3">
              {followRequests.slice(0, 5).map(req => (
                <div key={req.id} className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm">
                  {req.fromAvatarUrl
                    ? <img src={`${API}${req.fromAvatarUrl}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                    : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-sm font-bold text-white">{(req.fromName || '?').charAt(0).toUpperCase()}</div>}
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-800 truncate">{req.fromName || req.fromEmail}</p><p className="text-[10px] text-slate-500">{req.fromRole?.toLowerCase()}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleFollowAction(req.fromEmail, req.fromName, req.fromAvatarUrl, req.fromRole, 'accept')} className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-700 active:scale-95">Accept</button>
                    <button onClick={() => handleFollowAction(req.fromEmail, req.fromName, req.fromAvatarUrl, req.fromRole, 'reject')} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600 active:scale-95">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'discover-people'        && renderFindTalent()}
        {tab === 'discover-opportunities' && renderPostOpportunities()}
        {tab === 'discover-feed'          && renderInspireShare()}
        {tab === 'discover-projects'      && renderStudentProjects()}
        {tab === 'discover-insights'      && renderAnalytics()}
      </div>

      {/* ═══════════ MODALS ═══════════ */}

      {/* Create Opportunity Modal */}
      {createOppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setCreateOppModal(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Post New Opportunity</h3>
              <button onClick={() => setCreateOppModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Position / Title *</label>
                <input value={oppForm.position} onChange={e => setOppForm(p => ({ ...p, position: e.target.value }))} placeholder="e.g. Research Assistant"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company / Org</label>
                  <input value={oppForm.company} onChange={e => setOppForm(p => ({ ...p, company: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select value={oppForm.type} onChange={e => setOppForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                    {['Internship', 'Research', 'Full-time', 'Part-time', 'Teaching Assist', 'Mentorship', 'Workshop', 'Collaboration'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salary / Stipend</label>
                  <input value={oppForm.salary} onChange={e => setOppForm(p => ({ ...p, salary: e.target.value }))} placeholder="₹15,000/month"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                  <input value={oppForm.location} onChange={e => setOppForm(p => ({ ...p, location: e.target.value }))} placeholder="Hyderabad"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
                  <input type="date" value={oppForm.deadline} onChange={e => setOppForm(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience</label>
                  <select value={oppForm.experience} onChange={e => setOppForm(p => ({ ...p, experience: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                    {['Fresher', '1-2 years', '2-3 years', '3+ years'].map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea value={oppForm.description} onChange={e => setOppForm(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Describe the opportunity..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <button onClick={submitOpportunity} disabled={oppSubmitting || !oppForm.position || !oppForm.description}
                className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {oppSubmitting ? <><Loader2 size={16} className="animate-spin" /> Posting...</> : <><Rocket size={16} /> Post Opportunity</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunity Detail + Applications Modal */}
      {oppDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setOppDetailModal(null); setApplications([]); }}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Opportunity Details</h3>
              <button onClick={() => { setOppDetailModal(null); setApplications([]); }} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${oppDetailModal.type === 'Research' ? 'bg-violet-100 text-violet-700' : oppDetailModal.type === 'Internship' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{oppDetailModal.type}</span>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${oppDetailModal.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{oppDetailModal.status}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">{oppDetailModal.title}</h4>
              {oppDetailModal.company && <p className="text-sm text-slate-600 flex items-center gap-1.5"><Building2 size={14} /> {oppDetailModal.company}</p>}
              <p className="text-sm leading-relaxed text-slate-600">{oppDetailModal.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {oppDetailModal.location && <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"><MapPin size={13} /> {oppDetailModal.location}</div>}
                {oppDetailModal.salary && <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><Zap size={13} /> {oppDetailModal.salary}</div>}
                {oppDetailModal.deadline && <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"><Clock size={13} /> {oppDetailModal.deadline}</div>}
                {oppDetailModal.experience && <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"><Award size={13} /> {oppDetailModal.experience}</div>}
              </div>
              {oppDetailModal.skillsRequired?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">Skills Required</p>
                  <div className="flex flex-wrap gap-1.5">{oppDetailModal.skillsRequired.map((sk, i) => <span key={i} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{sk}</span>)}</div>
                </div>
              )}

              {/* Applications */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Users size={16} className="text-indigo-600" /> Student Applications ({applications.length})</h4>
                {appsLoading ? <div className="flex items-center justify-center py-6"><Loader2 size={20} className="animate-spin text-indigo-500" /></div>
                  : applications.length === 0 ? <p className="text-xs text-slate-500 py-4 text-center">No applications yet</p>
                  : <div className="space-y-2 max-h-60 overflow-y-auto">
                      {applications.map((app, i) => (
                        <div key={app.id || i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 transition">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">{(app.applicantName || '?').charAt(0).toUpperCase()}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{app.applicantName || app.applicantEmail}</p>
                            <p className="text-[10px] text-slate-500">{app.applicantEmail}</p>
                            {app.coverNote && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{app.coverNote}</p>}
                          </div>
                          <div className="text-right">
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{app.status || 'PENDING'}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(app.appliedAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {createPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setCreatePostModal(false)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Create New Post</h3>
              <button onClick={() => setCreatePostModal(false)} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title *</label>
                <input value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} placeholder="What do you want to share?"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <select value={postForm.topic} onChange={e => setPostForm(p => ({ ...p, topic: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400">
                    {['General', 'Research', 'Placements', 'Hackathons', 'Project Showcases', 'Career Tips', 'Guidance', 'Events', 'Announcements'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select value={postForm.type} onChange={e => setPostForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400">
                    {['General', 'Research Publications', 'Student Achievements', 'Career Tips', 'Project Showcases', 'Collaborations'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content *</label>
                <textarea value={postForm.content} onChange={e => setPostForm(p => ({ ...p, content: e.target.value }))} rows={5} placeholder="Share your thoughts..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none resize-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20" />
              </div>
              <button onClick={submitPost} disabled={postSubmitting || !postForm.title || !postForm.content}
                className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {postSubmitting ? <><Loader2 size={16} className="animate-spin" /> Posting...</> : <><Send size={16} /> Publish Post</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setCommentModal(null); setComments([]); setCommentText(''); }}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Comments</h3>
              <button onClick={() => { setCommentModal(null); setComments([]); setCommentText(''); }} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
              {commentLoading ? <div className="flex items-center justify-center py-6"><Loader2 size={20} className="animate-spin text-amber-500" /></div>
                : comments.length === 0 ? <p className="text-xs text-slate-500 text-center py-6">No comments yet. Be the first!</p>
                : comments.map((c, i) => (
                  <div key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-white shrink-0">{(c.authorName || '?').charAt(0).toUpperCase()}</div>
                    <div className="min-w-0"><p className="text-xs font-bold text-slate-800">{c.authorName || c.authorEmail}</p><p className="text-xs text-slate-600 mt-0.5">{c.text}</p><p className="text-[10px] text-slate-400 mt-1">{timeAgo(c.createdAt)}</p></div>
                  </div>
                ))}
            </div>
            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} placeholder="Write a comment..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400" />
              <button onClick={submitComment} disabled={!commentText.trim()} className="rounded-xl bg-amber-500 px-4 py-2.5 text-white transition hover:bg-amber-600 disabled:opacity-50"><Send size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {projectDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setProjectDetailModal(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Project Details</h3>
              <button onClick={() => setProjectDetailModal(null)} className="rounded-lg p-1.5 hover:bg-slate-100 transition"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${projectDetailModal.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : projectDetailModal.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>{projectDetailModal.status}</span>
                <span className="rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">{projectDetailModal.domain}</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">{projectDetailModal.name}</h4>
              <p className="text-sm text-slate-600 flex items-center gap-1.5"><Users size={14} /> Owner: {projectDetailModal.ownerName || projectDetailModal.ownerEmail}</p>
              <p className="text-sm leading-relaxed text-slate-600">{projectDetailModal.description}</p>
              {projectDetailModal.techStack?.length > 0 && (
                <div><p className="text-xs font-bold text-slate-700 mb-2">Tech Stack</p><div className="flex flex-wrap gap-1.5">{projectDetailModal.techStack.map((t, i) => <span key={i} className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{t}</span>)}</div></div>
              )}
              {projectDetailModal.rolesNeeded?.length > 0 && (
                <div><p className="text-xs font-bold text-slate-700 mb-2">Roles Needed</p><div className="flex flex-wrap gap-1.5">{projectDetailModal.rolesNeeded.map((r, i) => <span key={i} className="rounded-lg bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">{r}</span>)}</div></div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Team Members ({projectDetailModal.members?.length || projectDetailModal.memberCount || 0}/{projectDetailModal.maxMembers})</p>
                <div className="space-y-2">
                  {(projectDetailModal.members || []).map((m, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-xs font-bold text-white">{(m.name || '?').charAt(0).toUpperCase()}</div>
                      <div className="flex-1"><p className="text-xs font-bold text-slate-800">{m.name || m.email}</p><p className="text-[10px] text-slate-500">{m.role}{m.rollNumber ? ` · ${m.rollNumber}` : ''}{m.branch ? ` · ${m.branch}` : ''}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              {projectDetailModal.mentorEmail ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5"><Microscope size={14} /> Mentor</p>
                  <p className="text-sm text-emerald-700 mt-1">{projectDetailModal.mentorName || projectDetailModal.mentorEmail}</p>
                </div>
              ) : (
                <button onClick={() => { mentorProject(projectDetailModal.id); setProjectDetailModal(null); }}
                  className="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 flex items-center justify-center gap-2"><Microscope size={16} /> Volunteer as Mentor</button>
              )}
              {projectDetailModal.repoUrl && (
                <a href={projectDetailModal.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"><ExternalLink size={14} /> View Repository</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModal && (
        <ProfileModal personEmail={profileModal.email} personType={profileModal.type} currentEmail={email}
          followStatus={getFollowStatus(profileModal.email)} onClose={() => setProfileModal(null)}
          onChat={() => { setProfileModal(null); onChat?.(profileModal.email); }}
          onFollowAction={async (action) => { await handleFollowAction(profileModal.email, '', '', profileModal.type, action); }} />
      )}
    </div>
  );
}

/* ═══════════ Shared Sub-components ═══════════ */
function EmptyBox({ icon: Ic, title, sub }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 py-14 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100"><Ic size={24} className="text-slate-300" /></div>
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-3"><div className="h-12 w-12 rounded-xl bg-slate-200" /><div className="flex-1 space-y-2 py-1"><div className="h-3 w-3/4 rounded bg-slate-200" /><div className="h-2 w-1/2 rounded bg-slate-200" /></div></div>
          <div className="mt-4 space-y-2"><div className="h-2 rounded bg-slate-200" /><div className="h-2 w-5/6 rounded bg-slate-200" /></div>
        </div>
      ))}
    </div>
  );
}
