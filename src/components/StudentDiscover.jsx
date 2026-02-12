import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Search, Users, Briefcase, BookOpen, Code2, Sparkles,
  MapPin, Clock, Star, Heart, MessageCircle, Bookmark, BookmarkCheck,
  ChevronRight, Filter, X, Eye, Send, GraduationCap, Trophy,
  Zap, Globe, Shield, TrendingUp, Lightbulb, Target, Microscope,
  Building2, Calendar, ExternalLink, Share2, ThumbsUp, Award,
  Layers, UserPlus, FolderGit2, Rocket, BarChart3, Hash,
  PlusCircle, Megaphone, FlaskConical, TrendingDown, Flame, Compass,
  Brain, Wifi, AlertCircle, CheckCircle2, MessageSquare, ArrowRight, MoreHorizontal,
  Pin, AlertTriangle, Settings, Bell, ZapOff, Users2, Bot, Badge,
  UserCheck, Loader2, XCircle
} from 'lucide-react';
import ProfileModal from './ProfileModal.jsx';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══════════ Stable helpers ═══════════ */
const tabs = [
  { id: 'discover-connect',       label: 'Connect',          icon: Users,      color: '#6366f1' },
  { id: 'discover-opportunities', label: 'Opportunities',    icon: Rocket,     color: '#0d9488' },
  { id: 'discover-feed',          label: 'Inspiring Feed',   icon: Flame,      color: '#f59e0b' },
  { id: 'discover-collaborate',   label: 'Collaborate',      icon: Code2,      color: '#8b5cf6' },
  { id: 'discover-personal',      label: 'Just For You',     icon: Sparkles,   color: '#ec4899' },
];

const PEOPLE_FILTERS = ['All', 'Seniors', 'Faculty', 'Like-minded', 'Alumni'];
const DEPT_OPTIONS = ['All', 'CSE', 'ECE', 'Mechanical', 'Civil', 'IT', 'AI/ML', 'Electronics'];
const OPP_TYPES = ['All', 'Internship', 'Job', 'Hackathon', 'Competition', 'Workshop', 'Scholarship', 'Research'];
const FEED_TOPICS = ['All', 'Success Stories', 'Project Showcases', 'Research', 'Placements', 'Hackathons', 'Career Tips'];

const avatar = (url, name, size = 'h-12 w-12') =>
  url
    ? <img src={`${API}${url}`} alt="" className={`${size} rounded-xl object-cover`} />
    : <div className={`${size} flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white`}>{(name || '?').charAt(0).toUpperCase()}</div>;

/* ═══════════ ENHANCED MOCK DATA ═══════════ */
/* Data now loaded from backend APIs — no mock data needed */

/* ══════════════════════════════════════════════════════════════════ */

export default function StudentDiscover({ email, onBack, onChat }) {
  const [tab, setTab]           = useState('discover-connect');
  const [search, setSearch]     = useState('');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty]   = useState([]);
  const [opps, setOpps]         = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(false);

  const [peopleFilter, setPeopleFilter]   = useState('All');
  const [oppType, setOppType]             = useState('All');
  const [feedTopic, setFeedTopic]         = useState('All');

  const [liked, setLiked]         = useState(new Set());
  const [saved, setSaved]         = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  /* ─── follow & profile modal state ─── */
  const [followStatuses, setFollowStatuses] = useState({});   // { email: 'NONE'|'PENDING_SENT'|'PENDING_RECEIVED'|'ACCEPTED' }
  const [profileModal, setProfileModal] = useState(null);      // { email, type }
  const [followRequests, setFollowRequests] = useState([]);
  const [requestCount, setRequestCount] = useState(0);

  /* ─── feed, projects, opportunities state ─── */
  const [feedPosts, setFeedPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [oppStatuses, setOppStatuses] = useState({});         // { oppId: { status, id } }
  const [applyModal, setApplyModal] = useState(null);          // opportunity obj
  const [commentModal, setCommentModal] = useState(null);      // post id
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [projectModal, setProjectModal] = useState(null);      // project obj (view)
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [joinModal, setJoinModal] = useState(null);            // project obj
  const [joinMessage, setJoinMessage] = useState('');
  const [joinRole, setJoinRole] = useState('');
  const [projectJoinRequests, setProjectJoinRequests] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', domain: 'Web', techStack: '', rolesNeeded: '', maxMembers: 6, repoUrl: '' });
  const [actionLoading, setActionLoading] = useState(false);

  /* ─── fetch ─── */
  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, fRes] = await Promise.all([
        axios.get(`${API}/api/discover/students`, { params: { q: search, department: deptFilter === 'All' ? '' : deptFilter, year: yearFilter, skill: skillFilter, excludeEmail: email } }),
        axios.get(`${API}/api/discover/faculty`, { params: { q: search, department: deptFilter === 'All' ? '' : deptFilter, excludeEmail: email } }),
      ]);
      setStudents(sRes.data); setFaculty(fRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, deptFilter, yearFilter, skillFilter, email]);

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/discover/opportunities`, { params: { q: search, type: oppType === 'All' ? '' : oppType } });
      setOpps(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, oppType]);

  const fetchStats = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/api/discover/stats`); setStats(data); } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === 'discover-connect') fetchPeople(); }, [tab, fetchPeople]);
  useEffect(() => { if (tab === 'discover-opportunities') fetchOpps(); }, [tab, fetchOpps]);

  /* ─── Feed posts from backend ─── */
  const fetchFeed = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/feed/posts`, { params: { topic: feedTopic === 'All' ? '' : feedTopic, email } });
      setFeedPosts(data);
    } catch { }
  }, [feedTopic, email]);
  useEffect(() => { if (tab === 'discover-feed') fetchFeed(); }, [tab, fetchFeed]);

  /* ─── Projects from backend ─── */
  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/projects`, { params: { email } });
      setProjects(data);
    } catch { }
  }, [email]);
  useEffect(() => { if (tab === 'discover-collaborate') fetchProjects(); }, [tab, fetchProjects]);

  /* ─── Opportunity application statuses ─── */
  useEffect(() => {
    if (!email || tab !== 'discover-opportunities') return;
    const oppIds = opps.map(o => String(o.id));
    if (oppIds.length === 0) return;
    axios.post(`${API}/api/opportunities/status/bulk`, { email, opportunityIds: oppIds })
      .then(r => setOppStatuses(r.data || {})).catch(() => {});
  }, [opps, email, tab]);

  /* ─── Bulk follow status fetch ─── */
  useEffect(() => {
    if (!email) return;
    const allEmails = [...students, ...faculty].map(p => p.email).filter(Boolean);
    if (allEmails.length === 0) return;
    axios.post(`${API}/api/follow/status/bulk`, { email, targets: allEmails })
      .then(r => setFollowStatuses(r.data || {}))
      .catch(() => {});
  }, [students, faculty, email]);

  /* ─── Follow request count + list ─── */
  const fetchFollowRequests = useCallback(() => {
    if (!email) return;
    axios.get(`${API}/api/follow/requests/received`, { params: { email } })
      .then(r => { setFollowRequests(r.data || []); setRequestCount(r.data?.length || 0); })
      .catch(() => {});
  }, [email]);

  useEffect(() => { fetchFollowRequests(); }, [fetchFollowRequests]);

  /* ─── Follow action handler ─── */
  const handleFollowAction = async (targetEmail, targetName, targetAvatarUrl, targetType, action) => {
    try {
      if (action === 'follow') {
        await axios.post(`${API}/api/follow/request`, {
          fromEmail: email, toEmail: targetEmail,
          fromName: '', fromAvatarUrl: '', fromRole: 'STUDENT',
          toName: targetName, toAvatarUrl: targetAvatarUrl, toRole: targetType?.toUpperCase() || 'STUDENT'
        });
        setFollowStatuses(prev => ({ ...prev, [targetEmail]: 'PENDING_SENT' }));
      } else if (action === 'unfollow') {
        await axios.delete(`${API}/api/follow/request`, { data: { fromEmail: email, toEmail: targetEmail } });
        setFollowStatuses(prev => ({ ...prev, [targetEmail]: 'NONE' }));
      } else if (action === 'accept' || action === 'reject') {
        // Try to get request ID from followRequests list first, then from bulk status
        const req = followRequests.find(r => r.fromEmail === targetEmail);
        const bulkEntry = followStatuses[targetEmail];
        const requestId = req?.id || (typeof bulkEntry === 'object' ? bulkEntry.id : null);
        if (requestId) {
          await axios.put(`${API}/api/follow/request/${requestId}`, { action });
          setFollowStatuses(prev => ({ ...prev, [targetEmail]: action === 'accept' ? 'ACCEPTED' : 'NONE' }));
          fetchFollowRequests();
          // Re-fetch bulk statuses to sync
          const allEmails = [...students, ...faculty].map(p => p.email).filter(Boolean);
          if (allEmails.length > 0) {
            axios.post(`${API}/api/follow/status/bulk`, { email, targets: allEmails })
              .then(r => setFollowStatuses(r.data || {})).catch(() => {});
          }
        } else {
          console.error('No request ID found for', targetEmail);
        }
      }
    } catch (e) { console.error('Follow action failed', e); }
  };

  const getFollowStatus = (personEmail) => {
    const entry = followStatuses[personEmail];
    if (!entry) return 'NONE';
    // bulk API returns { status, direction, id }
    if (typeof entry === 'object') {
      const { status, direction } = entry;
      if (status === 'ACCEPTED') return 'ACCEPTED';
      if (status === 'PENDING' && direction === 'sent') return 'PENDING_SENT';
      if (status === 'PENDING' && direction === 'received') return 'PENDING_RECEIVED';
      return 'NONE';
    }
    // direct string fallback from local optimistic update
    if (entry === 'ACCEPTED') return 'ACCEPTED';
    if (entry === 'PENDING_SENT') return 'PENDING_SENT';
    if (entry === 'PENDING_RECEIVED') return 'PENDING_RECEIVED';
    return 'NONE';
  };

  const toggleLike = id => setLiked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSave = id => setSaved(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ─── filtered people ─── */
  const filteredPeople = useMemo(() => {
    let result = [...students, ...faculty];
    if (peopleFilter === 'Seniors') result = students.filter(s => s.year >= 3);
    if (peopleFilter === 'Faculty') result = faculty;
    if (peopleFilter === 'Like-minded') result = students.filter(s => s.skills?.length > 0);
    return result;
  }, [students, faculty, peopleFilter]);

  /* ─── filtered feed ─── */
  const feed = feedPosts;

  const trendingSkills = ['React', 'Python', 'Machine Learning', 'System Design', 'Spring Boot', 'Cloud', 'DevOps', 'TypeScript'];

  /* ═══════════ RENDER SECTIONS ═══════════ */

  /* ─── Connect (People Discovery) ─── */
  const renderConnect = () => {
    const getTitle = (p) => {
      if (p.type === 'student') {
        const parts = [];
        if (p.branch) parts.push(p.branch);
        if (p.year) parts.push(`Year ${p.year}`);
        if (p.semester) parts.push(`Sem ${p.semester}`);
        return parts.join(' · ') || 'Student';
      }
      const parts = [];
      if (p.designation) parts.push(p.designation);
      if (p.department) parts.push(p.department);
      return parts.join(' @ ') || 'Faculty';
    };

    const getInterests = (p) => {
      if (p.type === 'faculty') {
        const interests = [];
        if (p.researchInterests) {
          if (Array.isArray(p.researchInterests)) return p.researchInterests;
          return p.researchInterests.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (p.specialization) interests.push(p.specialization);
        return interests;
      }
      // For students, derive interests from projects/awards context
      const interests = [];
      if (p.branch) interests.push(p.branch);
      if (p.cgpa >= 8) interests.push('Academic Excellence');
      if ((p.projects || 0) > 0) interests.push('Project Building');
      if ((p.certificates || 0) > 0) interests.push('Certifications');
      return interests;
    };

    const formatCount = (n) => {
      if (!n || n === 0) return '0';
      if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
      return String(n);
    };

    return (
      <div className="space-y-5">
        {/* Filter Bar */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-indigo-900">Discover & Connect</h3>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700">
              <Filter size={14} /> Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {PEOPLE_FILTERS.map(f => (
              <button key={f} onClick={() => setPeopleFilter(f)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition duration-300 ${peopleFilter === f ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-indigo-100'}`}>
                {f}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="mt-5 grid gap-4 rounded-2xl border border-indigo-200 bg-white p-5 sm:grid-cols-3 animate-in">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-indigo-600">Department</label>
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20">
                  {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-indigo-600">Year</label>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm outline-none focus:border-indigo-400">
                  <option value="">All Years</option><option>1</option><option>2</option><option>3</option><option>4</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-indigo-600">Skill</label>
                <input value={skillFilter} onChange={e => setSkillFilter(e.target.value)} placeholder="e.g. React, ML…"
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20" />
              </div>
            </div>
          )}
        </div>

        {/* People Grid — Profile Card Design */}
        {loading ? <LoadingSkeleton count={3} /> : filteredPeople.length === 0
          ? <EmptyBox icon={Users} title="No one found matching your filters" sub="Try adjusting your search criteria" />
          : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPeople.map((p, idx) => {
                const skills = (p.skills || p.subjectsHandled || []);
                const interests = getInterests(p);
                const fStatus = getFollowStatus(p.email);

                const renderCardButton = () => {
                  if (fStatus === 'ACCEPTED') return (
                    <button onClick={e => { e.stopPropagation(); onChat && onChat(p.email); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95">
                      <MessageCircle size={16} /> Chat
                    </button>
                  );
                  if (fStatus === 'PENDING_SENT') return (
                    <button disabled className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
                      <Clock size={16} /> Requested
                    </button>
                  );
                  if (fStatus === 'PENDING_RECEIVED') return (
                    <div className="flex w-full gap-2">
                      <button onClick={e => { e.stopPropagation(); handleFollowAction(p.email, p.name, p.avatarUrl, p.type, 'accept'); }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95">
                        <CheckCircle2 size={16} /> Accept
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleFollowAction(p.email, p.name, p.avatarUrl, p.type, 'reject'); }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-red-500 shadow-sm transition hover:bg-red-50 hover:border-red-200 active:scale-95">
                        <XCircle size={16} /> Decline
                      </button>
                    </div>
                  );
                  return (
                    <button onClick={e => { e.stopPropagation(); handleFollowAction(p.email, p.name, p.avatarUrl, p.type, 'follow'); }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-95">
                      <UserPlus size={16} /> Follow
                    </button>
                  );
                };

                return (
                  <div key={p.id} onClick={() => setProfileModal({ email: p.email, type: p.type })}
                    className="group cursor-pointer rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 overflow-hidden" style={{ animationDelay: `${idx * 60}ms` }}>
                    {/* Card Content — Centered Layout */}
                    <div className="flex flex-col items-center px-6 pt-7 pb-2 text-center">
                      {/* Avatar */}
                      {p.avatarUrl
                        ? <img src={p.avatarUrl.startsWith('http') ? p.avatarUrl : `${API}${p.avatarUrl}`} alt={p.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-50 shadow-md" />
                        : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-2xl font-bold text-white ring-4 ring-indigo-50 shadow-md">
                            {(p.name || '?').charAt(0).toUpperCase()}
                          </div>
                      }

                      {/* Name & Title */}
                      <h4 className="mt-4 text-lg font-extrabold text-slate-900">{p.name || 'Unknown'}</h4>
                      <p className="mt-0.5 text-sm font-medium text-indigo-600">{getTitle(p)}</p>

                      {/* Bio */}
                      {p.bio && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{p.bio}</p>}

                      {/* Follow Status Badge */}
                      <div className="mt-4 flex items-center justify-center gap-8 w-full border-t border-slate-100 pt-4">
                        {fStatus === 'ACCEPTED' && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><UserCheck size={14} /> Connected</span>
                        )}
                        {fStatus === 'PENDING_SENT' && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><Clock size={14} /> Pending</span>
                        )}
                        {fStatus === 'PENDING_RECEIVED' && (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600"><Bell size={14} /> Wants to connect</span>
                        )}
                        {(fStatus === 'NONE' || !fStatus) && (
                          <span className="text-xs text-slate-400">Click to view profile</span>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="px-6 pt-4">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, 2).map((s, i) => (
                            <span key={i} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">{s}</span>
                          ))}
                          {skills.length > 2 && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-400">+{skills.length - 2} more</span>}
                        </div>
                      </div>
                    )}

                    {/* Interests */}
                    {interests.length > 0 && (
                      <div className="px-6 pt-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {interests.slice(0, 3).map((s, i) => (
                            <span key={i} className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow / Chat Button */}
                    <div className="px-6 pt-5 pb-6">
                      {renderCardButton()}
                    </div>
                  </div>
                );
              })}
            </div>}
      </div>
    );
  };

  /* ─── Opportunities Discovery ─── */
  const MOCK_OPPORTUNITIES = [
    { id: 'opp-1', type: 'Internship', title: 'Frontend Internship - Google Mentorship Program', company: 'Google', domain: 'Web Dev', description: 'Work on Google Cloud Console. Learn from top engineers. Competitive stipend provided.', location: 'Bangalore/Remote', duration: '3 months', deadline: 'Mar 20' },
    { id: 'opp-2', type: 'Hackathon', title: 'National Hackathon 2026', company: 'Tech Alliance', domain: 'All Domains', description: '48-hour hackathon with ₹5 Lakh prize pool. Build innovative solutions. All students welcome.', location: 'Online', duration: '2 days', deadline: 'Feb 25' },
    { id: 'opp-3', type: 'Job', title: 'Full-time SDE Position - Amazon', company: 'Amazon', domain: 'Backend', description: 'Build scalable systems for AWS. Competitive salary. Benefits package included.', location: 'India', duration: 'Permanent', deadline: 'Apr 10' },
    { id: 'opp-4', type: 'Workshop', title: 'Advanced System Design Workshop', company: 'Expert Mentors', domain: 'Core CS', description: '4-week intensive workshop covering distributed systems, database design, and scaling.', location: 'Hybrid', duration: '4 weeks', deadline: 'Mar 1' },
    { id: 'opp-5', type: 'Scholarship', title: 'Women in Tech Scholarship 2026', company: 'Tech Foundation', domain: 'All', description: 'Full scholarship for female students pursuing tech roles. Mentorship included.', location: 'N/A', duration: 'Full Duration', deadline: 'Feb 15' },
  ];

  const allOpps = opps.length > 0 ? opps : MOCK_OPPORTUNITIES;
  const filteredOpps = oppType === 'All' ? allOpps : allOpps.filter(o => o.type === oppType);

  const handleApply = async (opp) => {
    setActionLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/opportunities/apply`, { email, opportunityId: String(opp.id), name: '' });
      if (data.status === 'APPLIED' || data.status === 'ALREADY_APPLIED') {
        setOppStatuses(prev => ({ ...prev, [String(opp.id)]: { status: 'APPLIED', id: data.id } }));
        setApplyModal(null);
      }
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  const handleWithdraw = async (oppId) => {
    try {
      await axios.delete(`${API}/api/opportunities/withdraw`, { data: { email, opportunityId: String(oppId) } });
      setOppStatuses(prev => { const n = { ...prev }; delete n[String(oppId)]; return n; });
    } catch (e) { console.error(e); }
  };

  const renderOpportunitiesSection = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {OPP_TYPES.map(t => (
          <button key={t} onClick={() => setOppType(t)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition duration-300 ${oppType === t ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-teal-100 border border-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <LoadingSkeleton count={3} /> : filteredOpps.length === 0
        ? <EmptyBox icon={Briefcase} title="No opportunities yet" sub="Check back soon for new postings" />
        : <div className="grid gap-4 sm:grid-cols-2">
            {filteredOpps.map((o, idx) => {
              const appStatus = oppStatuses[String(o.id)]?.status;
              return (
                <div key={o.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:border-teal-300 hover:shadow-xl" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="mb-3">
                    <span className={`inline-block rounded-lg px-2.5 py-1 text-[10px] font-bold ${o.type === 'Internship' ? 'bg-blue-100 text-blue-700' : o.type === 'Job' ? 'bg-emerald-100 text-emerald-700' : o.type === 'Hackathon' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                      {o.type}
                    </span>
                    <h4 className="mt-2 text-sm font-bold text-slate-900">{o.title}</h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 mb-3">{o.description}</p>
                  {o.domain && <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 mb-3">{o.domain}</span>}
                  <div className="space-y-1.5 mb-4 text-[10px] font-semibold text-slate-600">
                    {o.location && <div className="flex items-center gap-2"><MapPin size={11} className="text-emerald-500" /> {o.location}</div>}
                    {o.duration && <div className="flex items-center gap-2"><Clock size={11} className="text-blue-500" /> {o.duration}</div>}
                    {o.deadline && <div className="flex items-center gap-2"><Calendar size={11} className="text-amber-500" /> Closes: {o.deadline}</div>}
                  </div>
                  <div className="flex gap-2">
                    {appStatus === 'APPLIED' ? (
                      <button onClick={() => handleWithdraw(o.id)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-red-50 hover:border-red-300 hover:text-red-600 active:scale-95">
                        <CheckCircle2 size={13} /> Applied ✓
                      </button>
                    ) : (
                      <button onClick={() => setApplyModal(o)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 active:scale-95">
                        <Send size={13} /> Apply Now
                      </button>
                    )}
                    <button onClick={() => toggleSave(`opp-${o.id}`)} className="flex items-center justify-center rounded-xl border-2 border-slate-200 px-3 py-2 text-slate-600 transition hover:border-amber-300 hover:text-amber-500 active:scale-95">
                      {saved.has(`opp-${o.id}`) ? <BookmarkCheck size={14} className="text-amber-500" /> : <Bookmark size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>}
    </div>
  );

  /* ─── Inspiring Feed ─── */
  const handleLike = async (postId) => {
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${postId}/like`, { email });
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes, isLiked: data.isLiked } : p));
    } catch { }
  };

  const handleSavePost = async (postId) => {
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${postId}/save`, { email });
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, isSaved: data.isSaved } : p));
    } catch { }
  };

  const handleShare = async (postId) => {
    try {
      const post = feedPosts.find(p => p.id === postId);
      if (navigator.share) {
        await navigator.share({ title: post?.title, text: post?.content, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${post?.title}\n${post?.content}\n${window.location.href}`);
        alert('Link copied to clipboard!');
      }
      const { data } = await axios.post(`${API}/api/feed/posts/${postId}/share`);
      setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, shareCount: data.shareCount } : p));
    } catch { }
  };

  const openComments = async (postId) => {
    setCommentModal(postId);
    setCommentText('');
    try {
      const { data } = await axios.get(`${API}/api/feed/posts/${postId}/comments`);
      setComments(data);
    } catch { setComments([]); }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !commentModal) return;
    try {
      const { data } = await axios.post(`${API}/api/feed/posts/${commentModal}/comments`, { email, name: '', text: commentText });
      setComments(prev => [...prev, { id: data.id, authorEmail: email, authorName: 'You', text: commentText, createdAt: new Date().toISOString() }]);
      setFeedPosts(prev => prev.map(p => p.id === commentModal ? { ...p, comments: data.commentCount } : p));
      setCommentText('');
    } catch { }
  };

  const timeAgo = (isoStr) => {
    if (!isoStr) return '';
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const renderInspiringFeed = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FEED_TOPICS.map(t => (
          <button key={t} onClick={() => setFeedTopic(t)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition duration-300 ${feedTopic === t ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-amber-100 border border-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {feed.length === 0
        ? <EmptyBox icon={BookOpen} title="No posts yet" sub="Follow topics to see inspiring content" />
        : <div className="space-y-4">
            {feed.map((f, idx) => (
              <div key={f.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:shadow-xl hover:border-amber-200" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg">{f.authorAvatar || f.authorName?.charAt(0) || '?'}</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{f.authorName}</h4>
                      <p className="text-[10px] text-slate-500">{timeAgo(f.createdAt)} ago · <span className="font-semibold text-amber-600">{f.topic}</span></p>
                    </div>
                  </div>
                  {f.isPinned && <span className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700"><Pin size={11} /> Pinned</span>}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 mb-4">{f.content}</p>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
                  <button onClick={() => handleLike(f.id)} className={`flex items-center gap-1.5 text-xs font-semibold transition duration-200 ${f.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-400'}`}>
                    <Heart size={14} fill={f.isLiked ? 'currentColor' : 'none'} /> {f.likes || 0}
                  </button>
                  <button onClick={() => openComments(f.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition">
                    <MessageCircle size={14} /> {f.comments || 0}
                  </button>
                  <button onClick={() => handleSavePost(f.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-500 transition">
                    {f.isSaved ? <BookmarkCheck size={14} className="text-amber-500" /> : <Bookmark size={14} />}
                  </button>
                  <button onClick={() => handleShare(f.id)} className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );

  /* ─── Collaborate (Projects) ─── */
  const handleJoinProject = async () => {
    if (!joinModal) return;
    setActionLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/projects/${joinModal.id}/join`, { email, name: '', role: joinRole, message: joinMessage });
      if (data.status === 'REQUESTED') {
        alert('Join request sent! The project owner will review your request.');
        setJoinModal(null); setJoinMessage(''); setJoinRole('');
        fetchProjects();
      } else if (data.status === 'TEAM_FULL') {
        alert('Sorry, this team has reached maximum members.');
      } else if (data.status === 'ALREADY_REQUESTED') {
        alert('You have already requested to join this project.');
        setJoinModal(null);
      } else if (data.status === 'ALREADY_MEMBER') {
        alert('You are already a member of this project.');
        setJoinModal(null);
      }
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.description) return;
    setActionLoading(true);
    try {
      const payload = {
        name: newProject.name,
        description: newProject.description,
        ownerEmail: email, ownerName: '',
        domain: newProject.domain,
        techStack: newProject.techStack.split(',').map(s => s.trim()).filter(Boolean),
        rolesNeeded: newProject.rolesNeeded.split(',').map(s => s.trim()).filter(Boolean),
        maxMembers: Number(newProject.maxMembers) || 6,
        repoUrl: newProject.repoUrl,
      };
      await axios.post(`${API}/api/projects`, payload);
      setCreateProjectModal(false);
      setNewProject({ name: '', description: '', domain: 'Web', techStack: '', rolesNeeded: '', maxMembers: 6, repoUrl: '' });
      fetchProjects();
    } catch (e) { console.error(e); }
    setActionLoading(false);
  };

  const openProjectView = async (proj) => {
    try {
      const { data } = await axios.get(`${API}/api/projects/${proj.id}`, { params: { email } });
      setProjectModal(data);
      // If owner, fetch join requests
      if (data.isOwner) {
        const jr = await axios.get(`${API}/api/projects/${proj.id}/join-requests`, { params: { email } });
        setProjectJoinRequests(jr.data || []);
      } else {
        setProjectJoinRequests([]);
      }
    } catch { setProjectModal(proj); }
  };

  const handleJoinRequestResponse = async (requestId, action) => {
    try {
      await axios.put(`${API}/api/projects/join-request/${requestId}`, { action });
      setProjectJoinRequests(prev => prev.filter(r => r.id !== requestId));
      // Refresh project data
      if (projectModal) {
        const { data } = await axios.get(`${API}/api/projects/${projectModal.id}`, { params: { email } });
        setProjectModal(data);
      }
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  const renderCollaborate = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Discover Projects & Teams</h3>
          <p className="text-xs text-slate-500 mt-1">Find projects seeking collaborators, join or start your own</p>
        </div>
        <button onClick={() => setCreateProjectModal(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 active:scale-95">
          <PlusCircle size={14} /> Create Project
        </button>
      </div>

      {projects.length === 0
        ? <EmptyBox icon={Code2} title="No projects yet" sub="Be the first to create a project!" />
        : <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p, idx) => (
              <div key={p.id} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-300 hover:border-violet-300 hover:shadow-xl" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">by {p.ownerName || 'Unknown'}</p>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{p.status}</span>
                </div>

                <p className="text-xs leading-relaxed text-slate-600 mb-3">{p.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(p.techStack || []).map((t, i) => <span key={i} className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">{t}</span>)}
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 mb-3 text-[10px] font-semibold text-slate-600">
                  {p.memberCount || 1} / {p.maxMembers || '∞'} members • {p.domain}
                </div>

                {(p.rolesNeeded || []).length > 0 && (
                  <div className="rounded-xl bg-amber-50 p-3 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1.5">Roles Needed</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.rolesNeeded.map((r, i) => <span key={i} className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{r}</span>)}
                    </div>
                  </div>
                )}

                {p.isFull && (
                  <div className="rounded-lg bg-red-50 px-3 py-2 mb-3 text-[10px] font-bold text-red-600">
                    ⚠ Team is full — no more members can join
                  </div>
                )}

                <div className="flex gap-2">
                  {!p.isMember && !p.isFull && (p.rolesNeeded || []).length > 0 && (
                    <button onClick={() => { setJoinModal(p); setJoinRole(p.rolesNeeded?.[0] || ''); }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white transition hover:bg-violet-700 active:scale-95">
                      <UserPlus size={13} /> Join
                    </button>
                  )}
                  {p.isMember && (
                    <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 py-2.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={13} /> Member
                    </span>
                  )}
                  <button onClick={() => openProjectView(p)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-violet-200 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50 active:scale-95">
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            ))}
          </div>}
    </div>
  );

  /* ─── Just For You (Recommendations) ─── */
  const renderPersonal = () => (
    <div className="space-y-5">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 text-indigo-700 mb-2"><Rocket size={18} /><span className="text-[10px] font-bold uppercase tracking-wider">Opportunities</span></div>
          <p className="text-3xl font-black text-indigo-700">{stats.totalOpportunities || 0}</p>
          <p className="text-[10px] text-slate-500 mt-1">Active positionings</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 text-violet-700 mb-2"><FolderGit2 size={18} /><span className="text-[10px] font-bold uppercase tracking-wider">Projects</span></div>
          <p className="text-3xl font-black text-violet-700">{projects.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Projects to join</p>
        </div>
      </div>

      {/* Recommended Mentors */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100"><Users size={16} className="text-emerald-600" /></div>
          <h3 className="text-sm font-bold text-slate-900">Recommended Mentors & Peers</h3>
        </div>
        {faculty.length === 0 && students.length === 0 ? <p className="text-xs text-slate-500">No recommendations yet</p> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {[...faculty.slice(0, 2), ...students.slice(0, 2)].map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50">
                {avatar(p.avatarUrl, p.name, 'h-10 w-10')}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">{p.name}</p>
                  <p className="truncate text-[10px] text-slate-500">{p.type === 'faculty' ? 'Faculty - ' + p.designation : 'Student - ' + p.branch}</p>
                </div>
                <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-indigo-700 active:scale-95">Connect</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Skills */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100"><TrendingUp size={16} className="text-orange-600" /></div>
          <h3 className="text-sm font-bold text-slate-900">Skills You Should Learn</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingSkills.map((s, i) => (
            <span key={i} className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:shadow-md transition cursor-pointer">{s}</span>
          ))}
        </div>
      </div>

      {/* Saved Items */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100"><BookmarkCheck size={16} className="text-amber-600" /></div>
          <h3 className="text-sm font-bold text-slate-900">Your Saved Items</h3>
        </div>
        {saved.size === 0 ? <p className="text-xs text-slate-500">Save opportunities and profiles to keep track of them</p> : (
          <p className="text-sm font-bold text-slate-800">{saved.size} items saved</p>
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
      <div className="relative overflow-hidden py-8 mx-6 mt-2 rounded-2xl bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100">
        <div className="relative mx-auto max-w-7xl px-8 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-200">
            <Compass size={28} className="text-indigo-600" />
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
                'discover-connect': (students.length + faculty.length) || 0,
                'discover-opportunities': opps.length || 0,
                'discover-feed': feedPosts.length || 0,
                'discover-collaborate': projects.length || 0,
                'discover-personal': saved.size || 0,
              };
              const count = counts[t.id] ?? 0;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    active ? 'text-indigo-700 bg-indigo-50 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}>
                  <t.icon size={16} /> {t.label}
                  <span className={`ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{count}</span>
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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Follow Requests Banner */}
        {requestCount > 0 && tab === 'discover-connect' && (
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <Bell size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-indigo-900">Follow Requests</h3>
                  <p className="text-xs text-indigo-600/70">{requestCount} pending request{requestCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {followRequests.slice(0, 5).map(req => (
                <div key={req.id} className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-sm">
                  {req.fromAvatarUrl
                    ? <img src={req.fromAvatarUrl.startsWith('http') ? req.fromAvatarUrl : `${API}${req.fromAvatarUrl}`} alt="" className="h-10 w-10 rounded-full object-cover" />
                    : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-sm font-bold text-white">{(req.fromName || '?').charAt(0).toUpperCase()}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{req.fromName || req.fromEmail}</p>
                    <p className="text-[10px] text-slate-500">{req.fromRole?.toLowerCase()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleFollowAction(req.fromEmail, req.fromName, req.fromAvatarUrl, req.fromRole, 'accept')}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 active:scale-95">
                      Accept
                    </button>
                    <button onClick={() => handleFollowAction(req.fromEmail, req.fromName, req.fromAvatarUrl, req.fromRole, 'reject')}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600 active:scale-95">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'discover-connect'       && renderConnect()}
        {tab === 'discover-opportunities' && renderOpportunitiesSection()}
        {tab === 'discover-feed'          && renderInspiringFeed()}
        {tab === 'discover-collaborate'   && renderCollaborate()}
        {tab === 'discover-personal'      && renderPersonal()}
      </div>

      {/* ═══ Apply Modal ═══ */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setApplyModal(null)}>
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Apply — {applyModal.title}</h3>
              <button onClick={() => setApplyModal(null)} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">{applyModal.company} · {applyModal.type}</p>
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={4} placeholder="Add a cover note (optional)…"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 resize-none" />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setApplyModal(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleApply(applyModal)} disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50">
                {actionLoading ? 'Submitting…' : <><Send size={12} /> Submit Application</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Comment Modal ═══ */}
      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCommentModal(null)}>
          <div className="mx-4 w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Comments</h3>
              <button onClick={() => setCommentModal(null)} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[100px]">
              {comments.length === 0 ? <p className="text-xs text-slate-400 text-center py-6">No comments yet. Be the first!</p> : comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {(c.authorName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800">{c.authorName || c.authorEmail}</span>
                      <span className="text-[10px] text-slate-400">{timeAgo(c.createdAt)} ago</span>
                    </div>
                    <p className="text-xs text-slate-600">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 border-t border-slate-100 pt-3">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…"
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
              <button onClick={submitComment} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Project View Modal ═══ */}
      {projectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setProjectModal(null); setProjectJoinRequests([]); }}>
          <div className="mx-4 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{projectModal.name}</h3>
                <p className="text-xs text-slate-500">by {projectModal.ownerName || 'Unknown'} · {projectModal.status}</p>
              </div>
              <button onClick={() => { setProjectModal(null); setProjectJoinRequests([]); }} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>

            <p className="text-sm text-slate-600 mb-4">{projectModal.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Domain</p><p className="text-xs font-semibold text-slate-700">{projectModal.domain}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Members</p><p className="text-xs font-semibold text-slate-700">{(projectModal.members || []).length} / {projectModal.maxMembers}</p></div>
            </div>

            {(projectModal.techStack || []).length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-1.5">{projectModal.techStack.map((t, i) => <span key={i} className="rounded-md bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">{t}</span>)}</div>
              </div>
            )}

            {projectModal.repoUrl && (
              <a href={projectModal.repoUrl} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:underline">
                <Code2 size={14} /> Repository
              </a>
            )}

            {/* Members */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Team Members ({(projectModal.members || []).length})</p>
              {(projectModal.members || []).length === 0
                ? <p className="text-xs text-slate-400 py-3 text-center">No members yet</p>
                : <div className="space-y-2">
                    {(projectModal.members || []).map((m, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">{(m.name || m.email || '?').charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{m.name || m.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">{m.role}</span>
                            {m.rollNumber && <span className="text-[10px] font-semibold text-slate-500">#{m.rollNumber}</span>}
                            {m.branch && <span className="text-[10px] text-slate-400">{m.branch}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>

            {/* Join Requests (Owner Only) */}
            {projectModal.isOwner && projectJoinRequests.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700 mb-3">Pending Join Requests ({projectJoinRequests.length})</p>
                <div className="space-y-3">
                  {projectJoinRequests.map(jr => (
                    <div key={jr.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{(jr.applicantName || jr.applicantEmail).charAt(0).toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{jr.applicantName || jr.applicantEmail}</p>
                        <p className="text-[10px] text-slate-500">Role: {jr.role} {jr.message && `· "${jr.message}"`}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleJoinRequestResponse(jr.id, 'accept')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700 active:scale-95">Accept</button>
                        <button onClick={() => handleJoinRequestResponse(jr.id, 'reject')} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 active:scale-95">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Create Project Modal ═══ */}
      {createProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCreateProjectModal(false)}>
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
              <button onClick={() => setCreateProjectModal(false)} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
                <input value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" placeholder="My Awesome Project" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
                <textarea value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" placeholder="What's your project about?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain</label>
                  <select value={newProject.domain} onChange={e => setNewProject(p => ({ ...p, domain: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400">
                    {['Web', 'Mobile', 'AI/ML', 'Data Science', 'Cloud', 'DevOps', 'IoT', 'Blockchain', 'Game Dev', 'Cybersecurity'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Members</label>
                  <input type="number" min={2} max={20} value={newProject.maxMembers} onChange={e => setNewProject(p => ({ ...p, maxMembers: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tech Stack (comma-separated)</label>
                <input value={newProject.techStack} onChange={e => setNewProject(p => ({ ...p, techStack: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" placeholder="React, Node.js, MongoDB" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Roles Needed (comma-separated)</label>
                <input value={newProject.rolesNeeded} onChange={e => setNewProject(p => ({ ...p, rolesNeeded: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" placeholder="Frontend Developer, UI Designer" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Repository URL (optional)</label>
                <input value={newProject.repoUrl} onChange={e => setNewProject(p => ({ ...p, repoUrl: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400" placeholder="https://github.com/..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCreateProjectModal(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleCreateProject} disabled={actionLoading || !newProject.name || !newProject.description}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 active:scale-95">
                  {actionLoading ? 'Creating…' : <><PlusCircle size={12} /> Create Project</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Join Project Modal ═══ */}
      {joinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setJoinModal(null)}>
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Join — {joinModal.name}</h3>
              <button onClick={() => setJoinModal(null)} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500 mb-4">Request to join this project. The owner will review your request.</p>
            {(joinModal.rolesNeeded || []).length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">I want to join as:</label>
                <select value={joinRole} onChange={e => setJoinRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400">
                  {joinModal.rolesNeeded.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Message (optional)</label>
              <textarea value={joinMessage} onChange={e => setJoinMessage(e.target.value)} rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400 resize-none" placeholder="Why do you want to join?" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setJoinModal(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleJoinProject} disabled={actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 active:scale-95">
                {actionLoading ? 'Sending…' : <><UserPlus size={12} /> Send Request</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModal && (
        <ProfileModal
          personEmail={profileModal.email}
          personType={profileModal.type}
          currentEmail={email}
          followStatus={getFollowStatus(profileModal.email)}
          onClose={() => setProfileModal(null)}
          onChat={() => { setProfileModal(null); onChat && onChat(profileModal.email); }}
          onFollowAction={async (action) => {
            await handleFollowAction(profileModal.email, '', '', profileModal.type, action);
          }}
        />
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
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-2 py-1"><div className="h-3 w-3/4 rounded bg-slate-200" /><div className="h-2 w-1/2 rounded bg-slate-200" /></div>
          </div>
          <div className="mt-4 space-y-2"><div className="h-2 rounded bg-slate-200" /><div className="h-2 w-5/6 rounded bg-slate-200" /></div>
        </div>
      ))}
    </div>
  );
}
