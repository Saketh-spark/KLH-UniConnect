import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Calendar, Users, Trophy, Search, Filter, MapPin, Clock, Star,
  Plus, Download, MessageCircle, Bell, ChevronRight, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Loader2, ExternalLink, Award, Edit, Trash2,
  PartyPopper, Megaphone, UserPlus, UserMinus, Shield, Sparkles, Eye,
  BarChart3, Send, Ticket, QrCode, X, Image, Upload, FileText, AlertCircle,
  Building2, Lightbulb, Music, Dumbbell, BookOpen, Palette, Globe,
  PieChart, TrendingUp, Settings, Hash, RefreshCw, Copy
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══════════ TABS ═══════════ */
const TABS = [
  { id: 'dashboard',   label: 'Dashboard',         icon: BarChart3,  color: '#6366f1' },
  { id: 'events',      label: 'Manage Events',     icon: Calendar,   color: '#f59e0b' },
  { id: 'clubs',       label: 'Manage Clubs',       icon: Users,      color: '#8b5cf6' },
  { id: 'attendance',  label: 'Attendance & Certs', icon: QrCode,     color: '#10b981' },
  { id: 'analytics',   label: 'Analytics',          icon: PieChart,   color: '#ef4444' },
];

const EVENT_TYPES = ['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Technical', 'Fest', 'Webinar'];
const CLUB_CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Professional', 'Arts'];

const EMPTY_EVENT = {
  title: '', description: '', eventType: 'Workshop', dateTime: '', venue: '', maxParticipants: 100,
  registrationDeadline: '', bannerUrl: '', clubId: '', departmentId: '', status: 'Draft'
};

const EMPTY_CLUB = {
  name: '', description: '', category: 'Technical', iconUrl: '', bannerUrl: '', clubPresident: ''
};

export default function FacultyEventsClubsCenter({ email, onBack }) {
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState('');

  /* ── Events ── */
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ ...EMPTY_EVENT });
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  /* ── Clubs ── */
  const [clubs, setClubs] = useState([]);
  const [clubForm, setClubForm] = useState({ ...EMPTY_CLUB });
  const [showClubForm, setShowClubForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);

  /* ── Attendance ── */
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [manualStudentId, setManualStudentId] = useState('');

  /* ── Dashboard stats ── */
  const [eventStats, setEventStats] = useState(null);
  const [clubStats, setClubStats] = useState(null);

  /* ── Notifications ── */
  const [notifForm, setNotifForm] = useState({ target: 'all', message: '' });
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const notify = t => { setToast(t); setTimeout(() => setToast(''), 3500); };
  const fid = email; // faculty identifier

  /* ═══════════ FETCHERS ═══════════ */
  const fetchEvents = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/faculty/events`, { headers: { 'Faculty-Id': fid } });
      setEvents(data);
    } catch { setEvents([]); }
  }, [fid]);

  const fetchClubs = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/faculty/clubs`, { headers: { 'Faculty-Id': fid } });
      setClubs(data);
    } catch { setClubs([]); }
  }, [fid]);

  const fetchStats = useCallback(async () => {
    try {
      const [es, cs] = await Promise.all([
        axios.get(`${API}/api/faculty/events/stats`, { headers: { 'Faculty-Id': fid } }).catch(() => ({ data: {} })),
        axios.get(`${API}/api/faculty/clubs/stats`, { headers: { 'Faculty-Id': fid } }).catch(() => ({ data: {} })),
      ]);
      setEventStats(es.data);
      setClubStats(cs.data);
    } catch {}
  }, [fid]);

  useEffect(() => {
    setLoading(true);
    const loads = {
      dashboard: () => Promise.all([fetchEvents(), fetchClubs(), fetchStats()]),
      events: fetchEvents,
      clubs: fetchClubs,
      attendance: fetchEvents,
      analytics: () => Promise.all([fetchEvents(), fetchClubs(), fetchStats()]),
    };
    (loads[tab] || fetchEvents)().finally(() => setLoading(false));
  }, [tab, fetchEvents, fetchClubs, fetchStats]);

  /* ═══════════ EVENT ACTIONS ═══════════ */
  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.description) { notify('Title and description required'); return; }
    try {
      if (editingEvent) {
        await axios.put(`${API}/api/faculty/events/${editingEvent.id}`, { ...eventForm, updatedAt: new Date().toISOString() });
        notify('Event updated');
      } else {
        await axios.post(`${API}/api/faculty/events`, eventForm, { headers: { 'Faculty-Id': fid } });
        notify('Event created');
      }
      setShowEventForm(false); setEditingEvent(null); setEventForm({ ...EMPTY_EVENT });
      fetchEvents();
    } catch (e) { notify(e.response?.data?.message || 'Failed to save event'); }
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${API}/api/faculty/events/${id}`);
      notify('Event deleted');
      fetchEvents();
    } catch { notify('Failed to delete'); }
  };

  const publishEvent = async (id) => {
    try {
      await axios.patch(`${API}/api/faculty/events/${id}/publish`);
      notify('Event published!');
      fetchEvents();
    } catch { notify('Failed to publish'); }
  };

  const exportRegistrations = async (eventId) => {
    try {
      const { data } = await axios.get(`${API}/api/faculty/events/${eventId}/registrations/export`, { responseType: 'text' });
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'registrations.csv'; a.click();
      URL.revokeObjectURL(url);
      notify('Exported!');
    } catch { notify('Export failed'); }
  };

  /* ═══════════ CLUB ACTIONS ═══════════ */
  const saveClub = async () => {
    if (!clubForm.name || !clubForm.description) { notify('Name and description required'); return; }
    try {
      if (editingClub) {
        await axios.put(`${API}/api/faculty/clubs/${editingClub.id}`, { ...clubForm, updatedAt: new Date().toISOString() });
        notify('Club updated');
      } else {
        await axios.post(`${API}/api/faculty/clubs`, clubForm, { headers: { 'Faculty-Id': fid } });
        notify('Club created');
      }
      setShowClubForm(false); setEditingClub(null); setClubForm({ ...EMPTY_CLUB });
      fetchClubs();
    } catch (e) { notify(e.response?.data?.message || 'Failed to save club'); }
  };

  const deleteClub = async (id) => {
    try {
      await axios.delete(`${API}/api/faculty/clubs/${id}`);
      notify('Club deleted');
      fetchClubs();
    } catch { notify('Failed to delete'); }
  };

  const approveClub = async (id) => {
    try {
      await axios.patch(`${API}/api/faculty/clubs/${id}/approve`, null, { headers: { 'Faculty-Id': fid } });
      notify('Club approved'); fetchClubs();
    } catch { notify('Failed to approve'); }
  };

  const suspendClub = async (id) => {
    try {
      await axios.patch(`${API}/api/faculty/clubs/${id}/suspend`);
      notify('Club suspended'); fetchClubs();
    } catch { notify('Failed to suspend'); }
  };

  const removeMember = async (clubId, studentId) => {
    try {
      await axios.delete(`${API}/api/faculty/clubs/${clubId}/members/${studentId}`);
      notify('Member removed'); fetchClubs();
    } catch { notify('Failed to remove member'); }
  };

  /* ═══════════ ATTENDANCE ACTIONS ═══════════ */
  const markStudentAttendance = async (eventId) => {
    if (!manualStudentId.trim()) return;
    try {
      await axios.post(`${API}/api/faculty/events/${eventId}/attendance`, {
        studentId: manualStudentId, studentName: manualStudentId, studentEmail: manualStudentId
      });
      notify('Attendance marked');
      setManualStudentId('');
      fetchEvents();
    } catch { notify('Failed to mark attendance'); }
  };

  /* ═══════════ HELPERS ═══════════ */
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const statusBadge = (status) => {
    const map = {
      Draft: 'bg-slate-100 text-slate-600', Published: 'bg-green-100 text-green-700', Upcoming: 'bg-blue-100 text-blue-700',
      Completed: 'bg-purple-100 text-purple-700', Cancelled: 'bg-red-100 text-red-700',
      Active: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700',
      Suspended: 'bg-red-100 text-red-700', Rejected: 'bg-red-100 text-red-700',
    };
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  /* ═══════════ 1. DASHBOARD ═══════════ */
  const renderDashboard = () => {
    const es = eventStats || {};
    const cs = clubStats || {};
    const myEvents = events.filter(e => e.createdBy === fid);
    const myClubs = clubs.filter(c => c.facultyCoordinator === fid);
    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'My Events', value: es.totalEvents ?? myEvents.length, icon: Calendar, color: 'from-indigo-500 to-indigo-600' },
            { label: 'Total Registrations', value: es.totalRegistrations ?? myEvents.reduce((s, e) => s + (e.registrationCount || 0), 0), icon: Ticket, color: 'from-amber-500 to-amber-600' },
            { label: 'My Clubs', value: cs.facultyClubs ?? myClubs.length, icon: Users, color: 'from-purple-500 to-purple-600' },
            { label: 'Total Members', value: cs.totalMembers ?? myClubs.reduce((s, c) => s + (c.memberCount || 0), 0), icon: UserPlus, color: 'from-green-500 to-green-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
              <s.icon size={18} className="mb-1 opacity-80" />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] text-white/80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setTab('events'); setShowEventForm(true); setEditingEvent(null); setEventForm({ ...EMPTY_EVENT }); }}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-95">
            <Plus size={14} /> Create Event
          </button>
          <button onClick={() => { setTab('clubs'); setShowClubForm(true); setEditingClub(null); setClubForm({ ...EMPTY_CLUB }); }}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition active:scale-95">
            <Plus size={14} /> Create Club
          </button>
          <button onClick={() => setShowNotifModal(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition">
            <Bell size={14} /> Send Notification
          </button>
        </div>

        {/* Recent Events */}
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700">Recent Events</h3>
          <div className="space-y-2">
            {events.slice(0, 5).map(ev => (
              <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <Calendar size={16} className="text-indigo-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{ev.title}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(ev.dateTime)} · {ev.registrationCount || 0} registrations</p>
                </div>
                {statusBadge(ev.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Pending Clubs */}
        {clubs.filter(c => c.status === 'Pending').length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700">Pending Club Approvals</h3>
            <div className="space-y-2">
              {clubs.filter(c => c.status === 'Pending').map(c => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                  <Users size={16} className="text-yellow-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{c.name}</p>
                    <p className="text-[10px] text-slate-500">{c.category}</p>
                  </div>
                  <button onClick={() => approveClub(c.id)} className="rounded-lg bg-green-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-green-700">Approve</button>
                  <button onClick={() => suspendClub(c.id)} className="rounded-lg border border-red-200 px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50">Reject</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════ 2. MANAGE EVENTS ═══════════ */
  const renderEvents = () => (
    <div className="space-y-5">
      {!showEventForm && !selectedEvent && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Events</h3>
            <button onClick={() => { setShowEventForm(true); setEditingEvent(null); setEventForm({ ...EMPTY_EVENT }); }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition">
              <Plus size={14} /> New Event
            </button>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No events yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                    <Calendar size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{ev.title}</h4>
                      {statusBadge(ev.status)}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{ev.eventType}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{formatDate(ev.dateTime)} · {ev.venue} · {ev.registrationCount || 0} registered</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {ev.status === 'Draft' && (
                      <button onClick={() => publishEvent(ev.id)}
                        className="rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-green-700">Publish</button>
                    )}
                    <button onClick={() => setSelectedEvent(ev)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"><Eye size={14} /></button>
                    <button onClick={() => { setEditingEvent(ev); setEventForm({ ...ev }); setShowEventForm(true); }}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"><Edit size={14} /></button>
                    <button onClick={() => deleteEvent(ev.id)}
                      className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Event Form */}
      {showEventForm && renderEventForm()}

      {/* Event Detail with participants */}
      {selectedEvent && !showEventForm && renderEventParticipants()}
    </div>
  );

  const renderEventForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
        <button onClick={() => { setShowEventForm(false); setEditingEvent(null); }}><X size={18} className="text-slate-400" /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Title *</label>
          <input value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Event title" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Description *</label>
          <textarea value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
            rows={3} placeholder="Event description..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 resize-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Event Type</label>
          <select value={eventForm.eventType} onChange={e => setEventForm(f => ({ ...f, eventType: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Venue</label>
          <input value={eventForm.venue} onChange={e => setEventForm(f => ({ ...f, venue: e.target.value }))}
            placeholder="Location or online link" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Date & Time</label>
          <input type="datetime-local" value={eventForm.dateTime ? eventForm.dateTime.slice(0, 16) : ''} onChange={e => setEventForm(f => ({ ...f, dateTime: new Date(e.target.value).toISOString() }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Capacity</label>
          <input type="number" value={eventForm.maxParticipants} onChange={e => setEventForm(f => ({ ...f, maxParticipants: parseInt(e.target.value) || 0 }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Registration Deadline</label>
          <input type="datetime-local" value={eventForm.registrationDeadline ? eventForm.registrationDeadline.slice(0, 16) : ''} onChange={e => setEventForm(f => ({ ...f, registrationDeadline: new Date(e.target.value).toISOString() }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Banner URL</label>
          <input value={eventForm.bannerUrl} onChange={e => setEventForm(f => ({ ...f, bannerUrl: e.target.value }))}
            placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Department</label>
          <input value={eventForm.departmentId} onChange={e => setEventForm(f => ({ ...f, departmentId: e.target.value }))}
            placeholder="e.g. CSE, ECE" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Link to Club</label>
          <select value={eventForm.clubId} onChange={e => setEventForm(f => ({ ...f, clubId: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
            <option value="">None</option>
            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => { setShowEventForm(false); setEditingEvent(null); }}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={saveEvent}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition">
          {editingEvent ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </div>
  );

  const renderEventParticipants = () => {
    const ev = selectedEvent; if (!ev) return null;
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{ev.title}</h3>
              <p className="text-xs text-slate-500">{formatDate(ev.dateTime)} · {ev.venue} · {ev.registrationCount || 0} registered</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportRegistrations(ev.id)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>

          {/* Registered students */}
          <h4 className="text-sm font-bold text-slate-700 mb-2">Registered Students ({ev.registeredStudents?.length || 0})</h4>
          {(ev.registeredStudents || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No registrations yet</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {ev.registeredStudents.map((s, i) => {
                const attended = ev.attendance?.some(a => a.studentId === s || a.studentEmail === s);
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">{i + 1}</span>
                    <span className="flex-1 text-xs text-slate-700 truncate">{s}</span>
                    {attended ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Present</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">Not marked</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Attendance */}
          <h4 className="mt-5 text-sm font-bold text-slate-700 mb-2">Attendance ({ev.attendance?.length || 0})</h4>
          {(ev.attendance || []).length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto mb-3">
              {ev.attendance.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-green-50 p-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-slate-700">{a.studentEmail || a.studentName}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">{a.markedAt ? new Date(a.markedAt).toLocaleTimeString() : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ═══════════ 3. MANAGE CLUBS ═══════════ */
  const renderClubs = () => (
    <div className="space-y-5">
      {!showClubForm && !selectedClub && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Clubs</h3>
            <button onClick={() => { setShowClubForm(true); setEditingClub(null); setClubForm({ ...EMPTY_CLUB }); }}
              className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 transition">
              <Plus size={14} /> New Club
            </button>
          </div>

          {clubs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <Users size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No clubs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clubs.map(c => (
                <div key={c.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                    <Users size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{c.name}</h4>
                      {statusBadge(c.status)}
                      <span className="text-[10px] text-slate-500">{c.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{c.memberCount || 0} members · Coordinator: {c.facultyCoordinator || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.status === 'Pending' && (
                      <button onClick={() => approveClub(c.id)} className="rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-green-700">Approve</button>
                    )}
                    <button onClick={() => setSelectedClub(c)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"><Eye size={14} /></button>
                    <button onClick={() => { setEditingClub(c); setClubForm({ ...c }); setShowClubForm(true); }} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"><Edit size={14} /></button>
                    <button onClick={() => deleteClub(c.id)} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showClubForm && renderClubForm()}
      {selectedClub && !showClubForm && renderClubDetail()}
    </div>
  );

  const renderClubForm = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{editingClub ? 'Edit Club' : 'Create Club'}</h3>
        <button onClick={() => { setShowClubForm(false); setEditingClub(null); }}><X size={18} className="text-slate-400" /></button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Club Name *</label>
          <input value={clubForm.name} onChange={e => setClubForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Club name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-700">Description *</label>
          <textarea value={clubForm.description} onChange={e => setClubForm(f => ({ ...f, description: e.target.value }))}
            rows={3} placeholder="Club description..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-purple-400 resize-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Category</label>
          <select value={clubForm.category} onChange={e => setClubForm(f => ({ ...f, category: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
            {CLUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Club President (Student ID)</label>
          <input value={clubForm.clubPresident} onChange={e => setClubForm(f => ({ ...f, clubPresident: e.target.value }))}
            placeholder="Student email or ID" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700">Banner URL</label>
          <input value={clubForm.bannerUrl} onChange={e => setClubForm(f => ({ ...f, bannerUrl: e.target.value }))}
            placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => { setShowClubForm(false); setEditingClub(null); }}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
        <button onClick={saveClub}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition">
          {editingClub ? 'Update Club' : 'Create Club'}
        </button>
      </div>
    </div>
  );

  const renderClubDetail = () => {
    const c = selectedClub; if (!c) return null;
    const clubEvents = events.filter(e => e.clubId === c.id);
    return (
      <div className="space-y-5">
        <button onClick={() => setSelectedClub(null)} className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">{c.name}</h3>
          <div className="flex items-center gap-2 mt-1">{statusBadge(c.status)} <span className="text-xs text-slate-500">{c.category} · {c.memberCount || 0} members</span></div>
          <p className="mt-3 text-sm text-slate-600">{c.description}</p>
          {c.clubPresident && <p className="mt-2 text-xs text-slate-500">President: <strong>{c.clubPresident}</strong></p>}

          <div className="mt-4 flex flex-wrap gap-2">
            {c.status === 'Pending' && <button onClick={() => approveClub(c.id)} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700">Approve</button>}
            {c.status === 'Active' && <button onClick={() => suspendClub(c.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">Suspend</button>}
          </div>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Members ({c.members?.length || 0})</h4>
          {(c.members || []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No members yet</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {c.members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">{i + 1}</span>
                  <span className="flex-1 text-xs text-slate-700 truncate">{m}</span>
                  {m === c.clubPresident && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">President</span>}
                  <button onClick={() => removeMember(c.id, m)} className="text-red-400 hover:text-red-600"><XCircle size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Club Events */}
        {clubEvents.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700">Club Events</h4>
            <div className="space-y-2">
              {clubEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
                  <Calendar size={14} className="text-indigo-500" />
                  <span className="flex-1 text-xs text-slate-700 truncate">{ev.title}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(ev.dateTime)}</span>
                  {statusBadge(ev.status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════ 4. ATTENDANCE & CERTS ═══════════ */
  const renderAttendance = () => {
    const publishedEvents = events.filter(e => e.status === 'Published' || e.status === 'Upcoming' || e.status === 'Completed');
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-slate-900">Attendance & Certificates</h3>

        {/* Select Event */}
        {!attendanceEvent ? (
          publishedEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center">
              <QrCode size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No events to manage attendance</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Select an event to manage attendance:</p>
              {publishedEvents.map(ev => (
                <div key={ev.id} onClick={() => setAttendanceEvent(ev)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                  <Calendar size={16} className="text-indigo-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{ev.title}</p>
                    <p className="text-[10px] text-slate-500">{ev.registrationCount || 0} registered · {ev.attendance?.length || 0} attended</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">{ev.attendance?.length || 0}/{ev.registrationCount || 0}</p>
                    <p className="text-[10px] text-slate-400">attendance</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <button onClick={() => setAttendanceEvent(null)} className="flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700">
              <ArrowLeft size={16} /> Back
            </button>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800">{attendanceEvent.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{attendanceEvent.registrationCount || 0} registered · {attendanceEvent.attendance?.length || 0} present</p>

              {/* Manual mark */}
              <div className="mt-4 flex items-center gap-2">
                <input value={manualStudentId} onChange={e => setManualStudentId(e.target.value)}
                  placeholder="Enter student email to mark attendance..."
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-400" />
                <button onClick={() => markStudentAttendance(attendanceEvent.id)}
                  className="rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700 transition">
                  Mark Present
                </button>
              </div>

              {/* Attendance List */}
              <div className="mt-4">
                <h5 className="text-xs font-bold text-slate-700 mb-2">Attendance Log</h5>
                {(attendanceEvent.attendance || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No attendance marked yet</p>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {attendanceEvent.attendance.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-100 p-2.5">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="flex-1 text-xs text-slate-700">{a.studentEmail || a.studentName}</span>
                        <span className="text-[10px] text-slate-400">{a.markedAt ? new Date(a.markedAt).toLocaleString() : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export & Certificate buttons */}
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => exportRegistrations(attendanceEvent.id)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                  <Download size={14} /> Export Report
                </button>
                <button className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-sm">
                  <Award size={14} /> Generate Certificates
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════ 5. ANALYTICS ═══════════ */
  const renderAnalytics = () => {
    const es = eventStats || {};
    const cs = clubStats || {};
    const totalRegs = events.reduce((s, e) => s + (e.registrationCount || 0), 0);
    const totalAtt = events.reduce((s, e) => s + (e.attendance?.length || 0), 0);

    // Events by type
    const byType = {};
    events.forEach(e => { byType[e.eventType] = (byType[e.eventType] || 0) + 1; });

    // Clubs by category
    const byCat = {};
    clubs.forEach(c => { byCat[c.category] = (byCat[c.category] || 0) + 1; });

    // Top active students
    const studentCounts = {};
    events.forEach(e => (e.attendance || []).forEach(a => {
      const key = a.studentEmail || a.studentName;
      studentCounts[key] = (studentCounts[key] || 0) + 1;
    }));
    const topStudents = Object.entries(studentCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Events', value: events.length, icon: Calendar, color: 'from-indigo-500 to-indigo-600' },
            { label: 'Total Registrations', value: totalRegs, icon: Ticket, color: 'from-blue-500 to-blue-600' },
            { label: 'Total Attendance', value: totalAtt, icon: CheckCircle, color: 'from-green-500 to-green-600' },
            { label: 'Attendance %', value: totalRegs ? Math.round((totalAtt / totalRegs) * 100) + '%' : '0%', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
              <s.icon size={18} className="mb-1 opacity-80" />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] text-white/80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Events by Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Events by Type</h3>
          {Object.entries(byType).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(byType).map(([type, count]) => {
                const max = Math.max(...Object.values(byType));
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-semibold text-slate-600 truncate">{type}</span>
                    <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-xs text-slate-400 text-center py-4">No data</p>}
        </div>

        {/* Clubs by Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Clubs by Category</h3>
          {Object.entries(byCat).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {Object.entries(byCat).map(([cat, count]) => (
                <div key={cat} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-lg font-black text-purple-600">{count}</p>
                  <p className="text-[10px] text-slate-500">{cat}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400 text-center py-4">No data</p>}
        </div>

        {/* Top Active Students */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Top Active Students</h3>
          {topStudents.length > 0 ? (
            <div className="space-y-1">
              {topStudents.map(([student, count], i) => (
                <div key={student} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                  }`}>{i + 1}</span>
                  <span className="flex-1 text-xs text-slate-700 truncate">{student}</span>
                  <span className="text-xs font-bold text-indigo-600">{count} events</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400 text-center py-4">No attendance data yet</p>}
        </div>

        {/* Export */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>
    );
  };

  /* ═══════════ NOTIFICATION MODAL ═══════════ */
  const renderNotifModal = () => (
    showNotifModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowNotifModal(false)}>
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Send Notification</h3>
            <button onClick={() => setShowNotifModal(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Target</label>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'club', 'department', 'year'].map(t => (
                  <button key={t} onClick={() => setNotifForm(f => ({ ...f, target: t }))}
                    className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold capitalize transition ${notifForm.target === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t === 'all' ? 'Everyone' : t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Message</label>
              <textarea value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}
                rows={3} placeholder="Write your notification..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 resize-none" />
            </div>
            <button onClick={() => { notify('Notification sent!'); setShowNotifModal(false); setNotifForm({ target: 'all', message: '' }); }}
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition">
              Send Notification
            </button>
          </div>
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
      <div className="relative overflow-hidden py-8 mx-6 mt-2 rounded-2xl bg-gradient-to-r from-amber-100 via-orange-50 to-red-100">
        <div className="relative mx-auto max-w-5xl px-8 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-600/10 border border-amber-200">
            <PartyPopper size={28} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Events & Clubs</h1>
            <p className="mt-1 text-sm text-slate-500">Create events, manage clubs, track engagement</p>
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
                <button key={t.id} onClick={() => { setTab(t.id); setSelectedEvent(null); setSelectedClub(null); setShowEventForm(false); setShowClubForm(false); setAttendanceEvent(null); }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    active ? 'text-amber-700 bg-amber-50 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
            {tab === 'dashboard'  && renderDashboard()}
            {tab === 'events'     && renderEvents()}
            {tab === 'clubs'      && renderClubs()}
            {tab === 'attendance' && renderAttendance()}
            {tab === 'analytics'  && renderAnalytics()}
          </>
        )}
      </div>

      {/* Modals */}
      {renderNotifModal()}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
