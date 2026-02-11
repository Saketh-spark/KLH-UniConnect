import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Calendar, Users, Trophy, Search, Filter, MapPin, Clock, Star,
  Heart, Share2, Download, MessageCircle, Bell, ChevronRight, ChevronDown,
  ChevronUp, CheckCircle, XCircle, Loader2, ExternalLink, Award, Bookmark,
  PartyPopper, Megaphone, UserPlus, UserMinus, Shield, Sparkles, Eye,
  BarChart3, Send, Ticket, QrCode, X, Plus, Building2, Flame, Music,
  Dumbbell, BookOpen, Lightbulb, Palette, Globe, RefreshCw, ThumbsUp,
  AlertCircle, Info, FileText
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══════════ TABS ═══════════ */
const TABS = [
  { id: 'events',       label: 'Events',            icon: Calendar,     color: '#6366f1' },
  { id: 'clubs',        label: 'Clubs',             icon: Users,        color: '#8b5cf6' },
  { id: 'my-events',    label: 'My Events',         icon: Ticket,       color: '#f59e0b' },
  { id: 'my-clubs',     label: 'My Clubs',          icon: Shield,       color: '#10b981' },
  { id: 'achievements', label: 'Achievements',      icon: Trophy,       color: '#ef4444' },
];

const EVENT_TYPES = ['All', 'Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Technical', 'Fest', 'Webinar'];
const CLUB_CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Professional', 'Arts', 'Literature', 'Innovation'];
const EVENT_STATUSES = ['Upcoming', 'Ongoing', 'Completed'];

const CATEGORY_ICONS = {
  Technical: Lightbulb, Cultural: Music, Sports: Dumbbell, Academic: BookOpen,
  Social: Globe, Professional: Building2, Arts: Palette, Literature: BookOpen,
  Innovation: Sparkles
};

export default function StudentEventsClubs({ studentId, email, onBack }) {
  const [tab, setTab] = useState('events');
  const [toast, setToast] = useState('');

  /* ── Events state ── */
  const [events, setEvents] = useState([]);
  const [eventSearch, setEventSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [eventStatusFilter, setEventStatusFilter] = useState('Upcoming');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackEvent, setFeedbackEvent] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [attendanceCode, setAttendanceCode] = useState('');
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  /* ── Clubs state ── */
  const [clubs, setClubs] = useState([]);
  const [clubSearch, setClubSearch] = useState('');
  const [clubCategoryFilter, setClubCategoryFilter] = useState('All');
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubDiscussion, setClubDiscussion] = useState('');

  /* ── My data ── */
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [achievements, setAchievements] = useState(null);

  const [loading, setLoading] = useState(false);

  const notify = t => { setToast(t); setTimeout(() => setToast(''), 3500); };

  /* ═══════════ FETCHERS ═══════════ */
  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/faculty/events`);
      setEvents(data.filter(e => e.status === 'Published' || e.status === 'Upcoming' || e.status === 'Completed'));
    } catch { setEvents([]); }
  }, []);

  const fetchClubs = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/faculty/clubs`);
      setClubs(data.filter(c => c.status === 'Active'));
    } catch { setClubs([]); }
  }, []);

  const fetchMyData = useCallback(async () => {
    try {
      const [evRes, clRes] = await Promise.all([
        axios.get(`${API}/api/events/student/registered?email=${email}`).catch(() => ({ data: [] })),
        axios.get(`${API}/api/clubs/student/joined?email=${email}`).catch(() => ({ data: [] })),
      ]);
      setMyRegistrations(evRes.data);
      setMyClubs(clRes.data);
    } catch {}
  }, [email]);

  const fetchAchievements = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/events/student/achievements?email=${email}`);
      setAchievements(data);
    } catch {
      setAchievements({ eventsAttended: 0, certificatesEarned: 0, clubsJoined: 0, leadershipRoles: 0, participationScore: 0 });
    }
  }, [email]);

  useEffect(() => {
    setLoading(true);
    const loads = {
      events: fetchEvents,
      clubs: fetchClubs,
      'my-events': () => Promise.all([fetchEvents(), fetchMyData()]),
      'my-clubs': () => Promise.all([fetchClubs(), fetchMyData()]),
      achievements: () => Promise.all([fetchAchievements(), fetchMyData()]),
    };
    const fn = loads[tab];
    if (fn) fn().finally(() => setLoading(false));
  }, [tab, fetchEvents, fetchClubs, fetchMyData, fetchAchievements]);

  /* ═══════════ ACTIONS ═══════════ */
  const registerForEvent = async (eventId) => {
    try {
      await axios.post(`${API}/api/faculty/events/${eventId}/register/${email}`);
      notify('Registered successfully!');
      fetchEvents(); fetchMyData();
    } catch (e) {
      notify(e.response?.data?.message || 'Registration failed');
    }
  };

  const cancelRegistration = async (eventId) => {
    try {
      await axios.delete(`${API}/api/events/student/${eventId}/cancel?email=${email}`);
      notify('Registration cancelled');
      fetchEvents(); fetchMyData();
    } catch { notify('Could not cancel registration'); }
  };

  const markAttendance = async (eventId) => {
    if (!attendanceCode.trim()) return;
    try {
      await axios.post(`${API}/api/faculty/events/${eventId}/attendance`, {
        studentId: email, studentName: email, studentEmail: email
      });
      notify('Attendance marked!');
      setShowAttendanceModal(false);
      setAttendanceCode('');
    } catch { notify('Invalid code or already marked'); }
  };

  const submitFeedback = async () => {
    if (!feedbackRating || !feedbackEvent) return;
    try {
      await axios.post(`${API}/api/events/${feedbackEvent.id}/feedback`, {
        email, rating: feedbackRating, comment: feedbackText
      });
      notify('Feedback submitted!');
      setShowFeedbackModal(false);
      setFeedbackRating(0); setFeedbackText('');
    } catch { notify('Could not submit feedback'); }
  };

  const joinClub = async (clubId) => {
    try {
      await axios.post(`${API}/api/faculty/clubs/${clubId}/members/${email}`);
      notify('Join request sent!');
      fetchClubs(); fetchMyData();
    } catch (e) {
      notify(e.response?.data?.message || 'Could not join club');
    }
  };

  const leaveClub = async (clubId) => {
    try {
      await axios.delete(`${API}/api/faculty/clubs/${clubId}/members/${email}`);
      notify('Left club');
      fetchClubs(); fetchMyData();
    } catch { notify('Could not leave club'); }
  };

  const isRegistered = (event) => {
    return event.registeredStudents && event.registeredStudents.includes(email);
  };

  const isClubMember = (club) => {
    return club.members && club.members.includes(email);
  };

  /* ═══════════ FILTERED DATA ═══════════ */
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (eventTypeFilter !== 'All' && e.eventType !== eventTypeFilter) return false;
      if (eventSearch && !e.title?.toLowerCase().includes(eventSearch.toLowerCase())) return false;
      // Status filter
      if (eventStatusFilter === 'Upcoming') {
        const d = new Date(e.dateTime);
        if (d < new Date()) return false;
      } else if (eventStatusFilter === 'Completed') {
        if (e.status !== 'Completed') {
          const d = new Date(e.dateTime);
          if (d >= new Date()) return false;
        }
      }
      return true;
    });
  }, [events, eventTypeFilter, eventSearch, eventStatusFilter]);

  const filteredClubs = useMemo(() => {
    return clubs.filter(c => {
      if (clubCategoryFilter !== 'All' && c.category !== clubCategoryFilter) return false;
      if (clubSearch && !c.name?.toLowerCase().includes(clubSearch.toLowerCase())) return false;
      return true;
    });
  }, [clubs, clubCategoryFilter, clubSearch]);

  const myRegisteredEvents = useMemo(() => {
    return events.filter(e => isRegistered(e));
  }, [events, email]);

  const myJoinedClubs = useMemo(() => {
    return clubs.filter(c => isClubMember(c));
  }, [clubs, email]);

  /* ═══════════ HELPERS ═══════════ */
  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };
  const seatsLeft = (e) => (e.maxParticipants || 100) - (e.registrationCount || 0);

  /* ═══════════ 1. EVENTS TAB ═══════════ */
  const renderEvents = () => (
    <div className="space-y-5">
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={eventSearch} onChange={e => setEventSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400" />
        </div>
        <select value={eventTypeFilter} onChange={e => setEventTypeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none">
          {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
          {EVENT_STATUSES.map(s => (
            <button key={s} onClick={() => setEventStatusFilter(s)}
              className={`px-3 py-2 text-xs font-semibold transition ${eventStatusFilter === s ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards */}
      {selectedEvent ? renderEventDetail() : (
        filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No events found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredEvents.map(event => (
              <div key={event.id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
                {/* Banner */}
                <div className="relative h-36 bg-gradient-to-br from-indigo-500 to-purple-600">
                  {event.bannerUrl && <img src={event.bannerUrl} alt="" className="h-full w-full object-cover" />}
                  <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${
                      event.eventType === 'Workshop' ? 'bg-blue-500' :
                      event.eventType === 'Competition' ? 'bg-red-500' :
                      event.eventType === 'Cultural' ? 'bg-pink-500' :
                      event.eventType === 'Sports' ? 'bg-green-500' : 'bg-indigo-500'
                    }`}>{event.eventType}</span>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 hover:bg-white/40 transition">
                      <Heart size={14} className="text-white" />
                    </button>
                    <button className="rounded-full bg-white/20 backdrop-blur-sm p-1.5 hover:bg-white/40 transition">
                      <Share2 size={14} className="text-white" />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{event.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(event.dateTime)}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {formatTime(event.dateTime)}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {event.venue || 'TBA'}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        seatsLeft(event) > 20 ? 'bg-green-100 text-green-700' :
                        seatsLeft(event) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>{seatsLeft(event) > 0 ? `${seatsLeft(event)} seats left` : 'Full'}</span>
                      <span className="text-[10px] text-slate-400">{event.registrationCount || 0} registered</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedEvent(event)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition">
                        Details
                      </button>
                      {isRegistered(event) ? (
                        <span className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-[11px] font-bold text-green-700">
                          <CheckCircle size={12} /> Registered
                        </span>
                      ) : seatsLeft(event) > 0 ? (
                        <button onClick={() => registerForEvent(event.id)}
                          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 transition">
                          Register
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );

  /* ── Event Detail ── */
  const renderEventDetail = () => {
    const e = selectedEvent;
    if (!e) return null;
    const registered = isRegistered(e);
    const past = new Date(e.dateTime) < new Date();
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft size={16} /> Back to Events
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md">
          <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
            {e.bannerUrl && <img src={e.bannerUrl} alt="" className="h-full w-full object-cover" />}
            <div className="absolute bottom-4 left-4">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-indigo-700">{e.eventType}</span>
            </div>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-black text-slate-900">{e.title}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{e.description}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Calendar, label: 'Date', value: formatDate(e.dateTime) },
                { icon: Clock, label: 'Time', value: formatTime(e.dateTime) },
                { icon: MapPin, label: 'Venue', value: e.venue || 'TBA' },
                { icon: Users, label: 'Capacity', value: `${e.registrationCount || 0}/${e.maxParticipants || '∞'}` },
              ].map(d => (
                <div key={d.label} className="rounded-xl bg-slate-50 p-3">
                  <d.icon size={14} className="text-slate-400 mb-1" />
                  <p className="text-[10px] text-slate-400">{d.label}</p>
                  <p className="text-xs font-bold text-slate-800">{d.value}</p>
                </div>
              ))}
            </div>

            {e.registrationDeadline && (
              <p className="mt-3 text-xs text-slate-500">Registration deadline: <strong>{formatDate(e.registrationDeadline)}</strong></p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {!past && !registered && seatsLeft(e) > 0 && (
                <button onClick={() => registerForEvent(e.id)}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition active:scale-95">
                  <Ticket size={16} /> Register Now
                </button>
              )}
              {!past && registered && (
                <>
                  <button onClick={() => cancelRegistration(e.id)}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition">
                    <XCircle size={16} /> Cancel Registration
                  </button>
                  <button onClick={() => { setShowAttendanceModal(true); }}
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition">
                    <QrCode size={16} /> Mark Attendance
                  </button>
                </>
              )}
              {past && registered && (
                <button onClick={() => { setFeedbackEvent(e); setShowFeedbackModal(true); }}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition">
                  <Star size={16} /> Give Feedback
                </button>
              )}
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                <Share2 size={16} /> Share
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                <Download size={16} /> Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════ 2. CLUBS TAB ═══════════ */
  const renderClubs = () => (
    <div className="space-y-5">
      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={clubSearch} onChange={e => setClubSearch(e.target.value)}
            placeholder="Search clubs..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-purple-400" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CLUB_CATEGORIES.map(c => (
          <button key={c} onClick={() => setClubCategoryFilter(c)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
              clubCategoryFilter === c ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>{c}</button>
        ))}
      </div>

      {selectedClub ? renderClubDetail() : (
        filteredClubs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
            <Users size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No clubs found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map(club => {
              const CatIcon = CATEGORY_ICONS[club.category] || Users;
              const member = isClubMember(club);
              return (
                <div key={club.id} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-purple-200 transition cursor-pointer"
                  onClick={() => setSelectedClub(club)}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 group-hover:from-purple-200 group-hover:to-indigo-200 transition">
                      <CatIcon size={26} className="text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate">{club.name}</h3>
                        {member && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                      </div>
                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">{club.category}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500 line-clamp-2 leading-relaxed">{club.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Users size={13} />{club.memberCount || 0} members</span>
                    {!member ? (
                      <button onClick={e => { e.stopPropagation(); joinClub(club.id); }}
                        className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm">
                        Join Club
                      </button>
                    ) : (
                      <span className="rounded-lg bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-600">Member</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );

  /* ── Club Detail ── */
  const renderClubDetail = () => {
    const c = selectedClub;
    if (!c) return null;
    const member = isClubMember(c);
    const CatIcon = CATEGORY_ICONS[c.category] || Users;
    const clubEvents = events.filter(e => e.clubId === c.id);
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedClub(null)} className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700">
          <ArrowLeft size={16} /> Back to Clubs
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100">
              <CatIcon size={28} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{c.name}</h2>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">{c.category}</span>
                <span className="text-xs text-slate-500">{c.memberCount || 0} members</span>
                {c.clubPresident && <span className="text-xs text-slate-500">President: {c.clubPresident}</span>}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 leading-relaxed">{c.description}</p>
          
          <div className="mt-5 flex flex-wrap gap-3">
            {!member ? (
              <button onClick={() => joinClub(c.id)}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition active:scale-95">
                <UserPlus size={16} /> Join Club
              </button>
            ) : (
              <>
                <span className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2.5 text-sm font-bold text-green-700">
                  <CheckCircle size={16} /> Member
                </span>
                <button onClick={() => leaveClub(c.id)}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition">
                  <UserMinus size={16} /> Leave
                </button>
              </>
            )}
          </div>
        </div>

        {/* Club Events */}
        {clubEvents.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700">Club Events</h3>
            <div className="space-y-2">
              {clubEvents.map(ev => (
                <div key={ev.id} onClick={() => { setSelectedClub(null); setTab('events'); setSelectedEvent(ev); }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition cursor-pointer">
                  <Calendar size={16} className="text-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(ev.dateTime)} · {ev.venue}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion (placeholder) */}
        {member && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-800">Club Discussion</h3>
            </div>
            <div className="h-40 flex items-center justify-center text-xs text-slate-400">
              Discussion feed coming soon
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
              <input value={clubDiscussion} onChange={e => setClubDiscussion(e.target.value)}
                placeholder="Say something..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-purple-400" />
              <button className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition">
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════ 3. MY EVENTS ═══════════ */
  const renderMyEvents = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Registered', value: myRegisteredEvents.length, color: 'from-indigo-500 to-indigo-600', icon: Ticket },
          { label: 'Attended', value: myRegisteredEvents.filter(e => e.attendance?.some(a => a.studentEmail === email)).length, color: 'from-green-500 to-green-600', icon: CheckCircle },
          { label: 'Upcoming', value: myRegisteredEvents.filter(e => new Date(e.dateTime) >= new Date()).length, color: 'from-amber-500 to-amber-600', icon: Calendar },
        ].map(s => (
          <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
            <s.icon size={18} className="mb-1 opacity-80" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] text-white/80">{s.label}</p>
          </div>
        ))}
      </div>

      {myRegisteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <Ticket size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">No registered events yet</p>
          <button onClick={() => setTab('events')} className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700">Browse Events →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {myRegisteredEvents.map(event => {
            const past = new Date(event.dateTime) < new Date();
            const attended = event.attendance?.some(a => a.studentEmail === email);
            return (
              <div key={event.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${past ? 'bg-slate-100' : 'bg-indigo-100'}`}>
                  <Calendar size={20} className={past ? 'text-slate-400' : 'text-indigo-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{event.title}</h4>
                  <p className="text-[11px] text-slate-500">{formatDate(event.dateTime)} · {event.venue}</p>
                </div>
                <div className="flex items-center gap-2">
                  {attended && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Attended</span>}
                  {!past && (
                    <button onClick={() => cancelRegistration(event.id)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                  )}
                  {past && !attended && (
                    <button onClick={() => { setFeedbackEvent(event); setShowFeedbackModal(true); }}
                      className="rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-200">Feedback</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ═══════════ 4. MY CLUBS ═══════════ */
  const renderMyClubs = () => (
    <div className="space-y-5">
      {myJoinedClubs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
          <Users size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">You haven't joined any clubs yet</p>
          <button onClick={() => setTab('clubs')} className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-700">Explore Clubs →</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {myJoinedClubs.map(club => {
            const CatIcon = CATEGORY_ICONS[club.category] || Users;
            return (
              <div key={club.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                    <CatIcon size={22} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{club.name}</h3>
                    <span className="text-[10px] text-slate-500">{club.category} · {club.memberCount} members</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => { setTab('clubs'); setSelectedClub(club); }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition">
                    View Club
                  </button>
                  <button onClick={() => leaveClub(club.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 transition">
                    Leave
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ═══════════ 5. ACHIEVEMENTS ═══════════ */
  const renderAchievements = () => {
    const a = achievements || {};
    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'Events Attended', value: a.eventsAttended ?? myRegisteredEvents.filter(e => e.attendance?.some(at => at.studentEmail === email)).length, icon: Calendar, color: 'from-indigo-500 to-indigo-600' },
            { label: 'Certificates', value: a.certificatesEarned ?? 0, icon: Award, color: 'from-amber-500 to-amber-600' },
            { label: 'Clubs Joined', value: a.clubsJoined ?? myJoinedClubs.length, icon: Users, color: 'from-purple-500 to-purple-600' },
            { label: 'Leadership Roles', value: a.leadershipRoles ?? 0, icon: Shield, color: 'from-green-500 to-green-600' },
            { label: 'Participation Score', value: a.participationScore ?? 0, icon: BarChart3, color: 'from-rose-500 to-rose-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
              <s.icon size={18} className="mb-1 opacity-80" />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] text-white/80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Participation History */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Participation History</h3>
          {myRegisteredEvents.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No participation history yet</p>
          ) : (
            <div className="space-y-2">
              {myRegisteredEvents.slice(0, 10).map(event => (
                <div key={event.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                    <Calendar size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{event.title}</p>
                    <p className="text-[10px] text-slate-400">{formatDate(event.dateTime)} · {event.eventType}</p>
                  </div>
                  {event.attendance?.some(a => a.studentEmail === email) ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">✓ Attended</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Registered</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skill impact note */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-indigo-600" />
            <h4 className="text-sm font-bold text-indigo-800">Portfolio & Placements</h4>
          </div>
          <p className="text-xs text-indigo-700/80">Your event participation, club activities, and leadership roles are factored into your placement profile and portfolio score. Keep participating to boost your profile!</p>
        </div>
      </div>
    );
  };

  /* ═══════════ MODALS ═══════════ */
  const renderAttendanceModal = () => (
    showAttendanceModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAttendanceModal(false)}>
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Mark Attendance</h3>
            <button onClick={() => setShowAttendanceModal(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="text-center mb-4">
            <QrCode size={48} className="mx-auto mb-2 text-green-500" />
            <p className="text-xs text-slate-500">Enter the OTP code shown at the event</p>
          </div>
          <input value={attendanceCode} onChange={e => setAttendanceCode(e.target.value)}
            placeholder="Enter attendance code"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-bold tracking-widest outline-none focus:border-green-400" />
          <button onClick={() => markAttendance(selectedEvent?.id)}
            className="mt-4 w-full rounded-xl bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 transition">
            Confirm Attendance
          </button>
        </div>
      </div>
    )
  );

  const renderFeedbackModal = () => (
    showFeedbackModal && feedbackEvent && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowFeedbackModal(false)}>
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Event Feedback</h3>
            <button onClick={() => setShowFeedbackModal(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <p className="text-xs text-slate-500 mb-3">{feedbackEvent.title}</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setFeedbackRating(n)}
                className={`text-2xl transition ${n <= feedbackRating ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
            ))}
          </div>
          <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
            placeholder="Share your experience..." rows={3}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-amber-400 resize-none" />
          <button onClick={submitFeedback}
            className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white hover:bg-amber-600 transition">
            Submit Feedback
          </button>
        </div>
      </div>
    )
  );

  /* ═══════════ MAIN ═══════════ */
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Back */}
      <div className="mx-auto max-w-5xl px-6 pt-4 pb-1">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden py-8 mx-6 mt-2 rounded-2xl bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100">
        <div className="relative mx-auto max-w-5xl px-8 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-200">
            <PartyPopper size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Events & Clubs</h1>
            <p className="mt-1 text-sm text-slate-500">Discover events, join clubs, build your portfolio</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => { setTab(t.id); setSelectedEvent(null); setSelectedClub(null); }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    active ? 'text-indigo-700 bg-indigo-50 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}>
                  <t.icon size={16} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {tab === 'events'       && renderEvents()}
            {tab === 'clubs'        && renderClubs()}
            {tab === 'my-events'    && renderMyEvents()}
            {tab === 'my-clubs'     && renderMyClubs()}
            {tab === 'achievements' && renderAchievements()}
          </>
        )}
      </div>

      {/* Modals */}
      {renderAttendanceModal()}
      {renderFeedbackModal()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
