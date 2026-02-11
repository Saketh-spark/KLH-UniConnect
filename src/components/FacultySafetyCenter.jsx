import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Shield, AlertTriangle, Phone, MapPin, Send, Clock, FileText,
  Heart, Search, X, ChevronRight, ChevronDown, ChevronUp, Bell, Eye,
  Upload, MessageCircle, CheckCircle, Loader2, AlertCircle, Users,
  Siren, Activity, BookOpen, Building2, Navigation, PhoneCall,
  Stethoscope, Brain, CalendarCheck, Megaphone, Info, ExternalLink,
  Lock, Filter, BarChart3, PieChart, TrendingUp, Download, RefreshCw,
  ShieldCheck, Zap, Flame, CloudRain, Radio, UserCheck, Mail,
  XCircle, Map
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══════════ TABS ═══════════ */
const TABS = [
  { id: 'sos',        label: 'SOS Monitor',          icon: Siren,      color: '#ef4444' },
  { id: 'complaints', label: 'Complaint Management', icon: FileText,   color: '#f59e0b' },
  { id: 'wellbeing',  label: 'Student Wellbeing',    icon: Heart,      color: '#10b981' },
  { id: 'broadcast',  label: 'Alert Broadcasting',   icon: Megaphone,  color: '#6366f1' },
  { id: 'analytics',  label: 'Safety Analytics',     icon: BarChart3,  color: '#8b5cf6' },
];

const SEVERITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low'];
const CATEGORY_OPTIONS = ['All', 'Ragging', 'Harassment', 'Bullying', 'Misconduct', 'Violence', 'Infrastructure Hazard', 'Discrimination', 'Abuse', 'Theft', 'Other'];
const STATUS_OPTIONS = ['All', 'Submitted', 'Under Review', 'Action Taken', 'Closed'];

/* ═══════════ COMPONENT ═══════════ */
export default function FacultySafetyCenter({ email, onBack }) {
  const [tab, setTab] = useState('sos');
  const [toast, setToast] = useState('');

  /* ── SOS state ── */
  const [sosAlerts, setSosAlerts] = useState([]);
  const [selectedSos, setSelectedSos] = useState(null);
  const [sosResponseNote, setSosResponseNote] = useState('');

  /* ── Complaints state ── */
  const [complaints, setComplaints] = useState([]);
  const [complaintFilter, setComplaintFilter] = useState({ severity: 'All', category: 'All', status: 'All', department: 'All' });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintMessages, setComplaintMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState('');
  const [investigationLog, setInvestigationLog] = useState('');

  /* ── Wellbeing state ── */
  const [counselingRequests, setCounselingRequests] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);

  /* ── Broadcast state ── */
  const [broadcastForm, setBroadcastForm] = useState({ title: '', description: '', type: 'Emergency', severity: 'high', target: 'all', departments: [], location: '' });
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState([]);

  /* ── Analytics state ── */
  const [analyticsData, setAnalyticsData] = useState(null);

  const [loading, setLoading] = useState(false);

  const notify = t => { setToast(t); setTimeout(() => setToast(''), 3500); };

  /* ── Fetch data per tab ── */
  const fetchSosAlerts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/sos/active`);
      setSosAlerts(data);
    } catch {}
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/complaints/all`);
      setComplaints(data);
    } catch {}
  }, []);

  const fetchCounseling = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/counseling/all`);
      setCounselingRequests(data);
    } catch {}
  }, []);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/alerts/all`);
      setBroadcastHistory(data);
    } catch {}
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/analytics`);
      setAnalyticsData(data);
    } catch {
      // Provide default analytics data if endpoint doesn't exist yet
      setAnalyticsData({
        totalIncidents: 0, resolvedCount: 0, pendingCount: 0, avgResponseTime: '0h',
        byType: [], byLocation: [], monthlyTrend: [], highRiskZones: [], repeatComplaints: 0
      });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const fn = { sos: fetchSosAlerts, complaints: fetchComplaints, wellbeing: fetchCounseling, broadcast: fetchBroadcasts, analytics: fetchAnalytics }[tab];
    if (fn) fn().finally(() => setLoading(false));
  }, [tab, fetchSosAlerts, fetchComplaints, fetchCounseling, fetchBroadcasts, fetchAnalytics]);

  // Auto-refresh SOS every 10s
  useEffect(() => {
    if (tab !== 'sos') return;
    const iv = setInterval(fetchSosAlerts, 10000);
    return () => clearInterval(iv);
  }, [tab, fetchSosAlerts]);

  /* ═══════════ SOS ACTIONS ═══════════ */
  const respondToSos = async (sosId, status) => {
    try {
      await axios.put(`${API}/api/safety/sos/${sosId}/respond`, {
        respondedBy: email, status, notes: sosResponseNote
      });
      notify(status === 'RESPONDING' ? 'Responding to SOS...' : 'SOS marked as resolved');
      setSosResponseNote('');
      fetchSosAlerts();
    } catch { notify('Failed to update SOS'); }
  };

  /* ═══════════ COMPLAINT ACTIONS ═══════════ */
  const updateComplaintStatus = async (id, status) => {
    try {
      await axios.put(`${API}/api/safety/complaints/${id}/status`, { status, updatedBy: email });
      notify(`Status updated to: ${status}`);
      fetchComplaints();
      if (selectedComplaint?.id === id) setSelectedComplaint(c => ({ ...c, status }));
    } catch { notify('Failed to update status'); }
  };

  const assignComplaint = async (id, assignee) => {
    try {
      await axios.put(`${API}/api/safety/complaints/${id}/assign`, { assignedTo: assignee, assignedBy: email });
      notify('Complaint assigned');
      fetchComplaints();
    } catch { notify('Failed to assign'); }
  };

  const addInvestigationLog = async (id) => {
    if (!investigationLog.trim()) return;
    try {
      await axios.post(`${API}/api/safety/complaints/${id}/logs`, {
        content: investigationLog, author: email, timestamp: new Date().toISOString()
      });
      setInvestigationLog('');
      notify('Log entry added');
    } catch { notify('Failed to add log'); }
  };

  const sendComplaintMessage = async () => {
    if (!chatMsg.trim() || !selectedComplaint) return;
    try {
      await axios.post(`${API}/api/safety/complaints/${selectedComplaint.id}/messages`, {
        email, content: chatMsg, timestamp: new Date().toISOString(), fromStudent: false
      });
      setChatMsg('');
      const { data } = await axios.get(`${API}/api/safety/complaints/${selectedComplaint.id}/messages`);
      setComplaintMessages(data);
    } catch { notify('Failed to send message'); }
  };

  const openComplaintDetail = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const { data } = await axios.get(`${API}/api/safety/complaints/${complaint.id}/messages`);
      setComplaintMessages(data);
    } catch { setComplaintMessages([]); }
  };

  /* ═══════════ COUNSELING ACTIONS ═══════════ */
  const updateCounselingStatus = async (id, status, assignee) => {
    try {
      await axios.put(`${API}/api/safety/counseling/${id}/update`, { status, assignedCounselor: assignee, updatedBy: email });
      notify('Session updated');
      fetchCounseling();
    } catch { notify('Failed to update session'); }
  };

  /* ═══════════ BROADCAST ═══════════ */
  const sendBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.description) { notify('Title and description required'); return; }
    try {
      await axios.post(`${API}/api/safety/alerts/broadcast`, {
        ...broadcastForm, createdBy: email, createdAt: new Date().toISOString(), isActive: true
      });
      notify('Alert broadcasted successfully');
      setShowBroadcastForm(false);
      setBroadcastForm({ title: '', description: '', type: 'Emergency', severity: 'high', target: 'all', departments: [], location: '' });
      fetchBroadcasts();
    } catch { notify('Failed to broadcast alert'); }
  };

  /* ═══════════ HELPERS ═══════════ */
  const statusBadge = (status) => {
    const map = {
      'ACTIVE': 'bg-red-100 text-red-700 animate-pulse', 'RESPONDING': 'bg-orange-100 text-orange-700',
      'RESOLVED': 'bg-green-100 text-green-700', 'CANCELLED': 'bg-slate-100 text-slate-500',
      'Submitted': 'bg-blue-100 text-blue-700', 'Under Review': 'bg-yellow-100 text-yellow-700',
      'Action Taken': 'bg-orange-100 text-orange-700', 'Closed': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700', 'Scheduled': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700', 'In Progress': 'bg-orange-100 text-orange-700',
    };
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  const severityDot = (s) => {
    const color = { Low: 'bg-green-500', Medium: 'bg-yellow-500', High: 'bg-orange-500', Critical: 'bg-red-500' }[s] || 'bg-slate-400';
    return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
  };

  /* ═══════════ RENDER TABS ═══════════ */

  /* ── 1. SOS Monitor ── */
  const renderSosMonitor = () => (
    <div className="space-y-6">
      {/* Active SOS Count */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active SOS', value: sosAlerts.filter(s => s.status === 'ACTIVE').length, color: 'from-red-500 to-red-600', icon: Siren },
          { label: 'Responding', value: sosAlerts.filter(s => s.status === 'RESPONDING').length, color: 'from-orange-500 to-orange-600', icon: Activity },
          { label: 'Resolved Today', value: sosAlerts.filter(s => s.status === 'RESOLVED').length, color: 'from-green-500 to-green-600', icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
            <s.icon size={20} className="mb-1 opacity-80" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[11px] text-white/80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active SOS Alerts */}
      {sosAlerts.filter(s => s.status === 'ACTIVE' || s.status === 'RESPONDING').length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" /> Live SOS Alerts
          </h3>
          {sosAlerts.filter(s => s.status === 'ACTIVE' || s.status === 'RESPONDING').map(sos => (
            <div key={sos.id} className={`rounded-xl border-2 ${sos.status === 'ACTIVE' ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'} p-4 shadow-md`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Siren size={18} className={sos.status === 'ACTIVE' ? 'text-red-600 animate-pulse' : 'text-orange-600'} />
                    <span className="text-sm font-bold text-slate-900">{sos.studentName || sos.email}</span>
                    {statusBadge(sos.status)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
                    {sos.latitude && <span className="flex items-center gap-1"><MapPin size={12} /> {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}</span>}
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(sos.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {sos.status === 'ACTIVE' && (
                  <button onClick={() => respondToSos(sos.id, 'RESPONDING')}
                    className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-700 transition">
                    <Activity size={12} /> Mark Responding
                  </button>
                )}
                <button onClick={() => respondToSos(sos.id, 'RESOLVED')}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition">
                  <CheckCircle size={12} /> Resolve
                </button>
                <a href={`tel:${sos.email}`} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition">
                  <Phone size={12} /> Contact Student
                </a>
                <a href="tel:040-23456789" className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition">
                  <Shield size={12} /> Call Security
                </a>
              </div>

              {/* Response Note */}
              <div className="mt-3 flex items-center gap-2">
                <input value={sosResponseNote} onChange={e => setSosResponseNote(e.target.value)}
                  placeholder="Add response note..."
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-orange-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-300 bg-green-50 py-12 text-center">
          <CheckCircle size={40} className="mx-auto mb-3 text-green-400" />
          <p className="text-sm font-bold text-green-700">All Clear</p>
          <p className="text-xs text-green-600/70">No active SOS alerts at this time</p>
        </div>
      )}

      {/* SOS History */}
      {sosAlerts.filter(s => s.status === 'RESOLVED' || s.status === 'CANCELLED').length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700">Recent History</h3>
          <div className="space-y-2">
            {sosAlerts.filter(s => s.status === 'RESOLVED' || s.status === 'CANCELLED').slice(0, 8).map(sos => (
              <div key={sos.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <Siren size={14} className="text-slate-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{sos.studentName || sos.email}</p>
                  <p className="text-[10px] text-slate-500">{new Date(sos.timestamp).toLocaleString()}</p>
                </div>
                {statusBadge(sos.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ── 2. Complaint Management ── */
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (complaintFilter.severity !== 'All' && c.severity !== complaintFilter.severity) return false;
      if (complaintFilter.category !== 'All' && c.type !== complaintFilter.category) return false;
      if (complaintFilter.status !== 'All' && c.status !== complaintFilter.status) return false;
      return true;
    });
  }, [complaints, complaintFilter]);

  const renderComplaints = () => (
    <div className="space-y-5">
      {!selectedComplaint ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select value={complaintFilter.severity} onChange={e => setComplaintFilter(f => ({ ...f, severity: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none">
              {SEVERITY_OPTIONS.map(o => <option key={o} value={o}>Severity: {o}</option>)}
            </select>
            <select value={complaintFilter.category} onChange={e => setComplaintFilter(f => ({ ...f, category: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none">
              {CATEGORY_OPTIONS.map(o => <option key={o} value={o}>Category: {o}</option>)}
            </select>
            <select value={complaintFilter.status} onChange={e => setComplaintFilter(f => ({ ...f, status: e.target.value }))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none">
              {STATUS_OPTIONS.map(o => <option key={o} value={o}>Status: {o}</option>)}
            </select>
            <span className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">{filteredComplaints.length} results</span>
          </div>

          {/* Complaints List */}
          {filteredComplaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <FileText size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No complaints match your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredComplaints.map(c => (
                <div key={c.id} onClick={() => openComplaintDetail(c)}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                  {severityDot(c.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800">{c.type}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{c.severity}</span>
                      {c.anonymous && <Lock size={10} className="text-slate-400" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">{c.description}</p>
                    <p className="text-[10px] text-slate-400">{new Date(c.submittedAt).toLocaleDateString()} {c.assignedTo ? `· Assigned: ${c.assignedTo}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(c.status)}
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Complaint Detail View */
        <div className="space-y-4">
          <button onClick={() => { setSelectedComplaint(null); setComplaintMessages([]); }}
            className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700">
            <ArrowLeft size={16} /> Back to All Complaints
          </button>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {severityDot(selectedComplaint.severity)}
              <span className="text-sm font-bold text-slate-800">{selectedComplaint.type}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{selectedComplaint.severity}</span>
              {statusBadge(selectedComplaint.status)}
              {selectedComplaint.anonymous && <span className="flex items-center gap-1 text-[10px] text-slate-500"><Lock size={10} /> Anonymous</span>}
            </div>
            <p className="text-sm text-slate-700">{selectedComplaint.description}</p>
            <p className="mt-2 text-[10px] text-slate-400">Submitted: {new Date(selectedComplaint.submittedAt).toLocaleString()}</p>
            {!selectedComplaint.anonymous && <p className="text-[10px] text-slate-500">Reporter: {selectedComplaint.email}</p>}
            {selectedComplaint.assignedTo && <p className="text-[10px] text-slate-500">Assigned: {selectedComplaint.assignedTo}</p>}

            {/* Status Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Under Review', 'Action Taken', 'Closed'].map(st => (
                <button key={st} onClick={() => updateComplaintStatus(selectedComplaint.id, st)}
                  disabled={selectedComplaint.status === st}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${selectedComplaint.status === st ? 'bg-slate-200 text-slate-400' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Investigation Log */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Investigation Log</h4>
            <div className="flex gap-2">
              <input value={investigationLog} onChange={e => setInvestigationLog(e.target.value)}
                placeholder="Add confidential investigation note..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400" />
              <button onClick={() => addInvestigationLog(selectedComplaint.id)}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 transition">
                Add Log
              </button>
            </div>
          </div>

          {/* Communication with Student */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-sm font-bold text-slate-800">Secure Communication</h4>
              <p className="text-[10px] text-slate-500">Chat with the reporting student</p>
            </div>
            <div className="h-48 overflow-y-auto p-4 space-y-2">
              {complaintMessages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No messages yet</p>
              ) : complaintMessages.map((m, i) => (
                <div key={i} className={`flex ${m.fromStudent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${m.fromStudent ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-900'}`}>
                    <p>{m.content}</p>
                    <p className="mt-0.5 text-[9px] opacity-60">{new Date(m.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && sendComplaintMessage()}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400" />
              <button onClick={sendComplaintMessage} className="rounded-lg bg-amber-600 p-2 text-white hover:bg-amber-700 transition">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── 3. Student Wellbeing ── */
  const renderWellbeing = () => (
    <div className="space-y-6">
      {/* Counseling Requests */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Counseling & Medical Requests</h3>
        {counselingRequests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <Heart size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {counselingRequests.map(req => (
              <div key={req.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${req.type === 'medical' ? 'bg-red-100' : 'bg-teal-100'}`}>
                      {req.type === 'medical' ? <Stethoscope size={18} className="text-red-600" /> : <Brain size={18} className="text-teal-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{req.email}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{req.type} · {req.urgency === 'Emergency' ? '🔴' : req.urgency === 'Urgent' ? '🟡' : '🟢'} {req.urgency}</p>
                    </div>
                  </div>
                  {statusBadge(req.status)}
                </div>
                <p className="mt-2 text-xs text-slate-600">{req.reason}</p>
                {req.preferredDate && <p className="mt-1 text-[10px] text-blue-500">Preferred: {new Date(req.preferredDate).toLocaleDateString()}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {req.status === 'Pending' && (
                    <>
                      <button onClick={() => updateCounselingStatus(req.id, 'Scheduled', email)}
                        className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition">
                        Schedule Session
                      </button>
                      <button onClick={() => updateCounselingStatus(req.id, 'Referred', null)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
                        Refer to Counselor
                      </button>
                    </>
                  )}
                  {req.status === 'Scheduled' && (
                    <button onClick={() => updateCounselingStatus(req.id, 'Completed', null)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Note */}
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={16} className="text-teal-600" />
          <h4 className="text-sm font-bold text-teal-800">Privacy-Controlled Access</h4>
        </div>
        <p className="text-xs text-teal-700/80">Student sensitive health data is protected. Faculty can only view risk alerts and resolution outcomes where permitted by institutional policy.</p>
      </div>
    </div>
  );

  /* ── 4. Alert Broadcasting ── */
  const ALERT_TYPES = ['Emergency', 'Weather', 'Security', 'Health', 'Campus'];
  const TARGETS = [
    { id: 'all', label: 'Campus-wide' },
    { id: 'departments', label: 'Specific Departments' },
    { id: 'hostels', label: 'Hostels' },
    { id: 'faculty', label: 'Faculty Only' },
  ];

  const renderBroadcast = () => (
    <div className="space-y-6">
      {!showBroadcastForm ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Alert Broadcasting</h3>
            <button onClick={() => setShowBroadcastForm(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-95">
              <Megaphone size={14} /> New Alert
            </button>
          </div>

          {/* Broadcast History */}
          {broadcastHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <Megaphone size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No alerts broadcasted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {broadcastHistory.map(a => (
                <div key={a.id} className={`rounded-xl border-l-4 ${a.isActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-white'} p-4 shadow-sm`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{a.title}</h4>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.severity === 'critical' ? 'bg-red-200 text-red-800' : a.severity === 'high' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-200 text-yellow-800'}`}>{a.severity}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{a.description}</p>
                      <p className="mt-1 text-[10px] text-slate-400">By {a.createdBy} · {new Date(a.createdAt).toLocaleString()}</p>
                    </div>
                    {a.isActive && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Active</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* New Alert Form */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Broadcast New Alert</h3>
            <button onClick={() => setShowBroadcastForm(false)} className="rounded-lg p-1.5 hover:bg-slate-100"><X size={18} /></button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Alert Title *</label>
            <input value={broadcastForm.title} onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Campus Closure Due to Weather"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description *</label>
            <textarea value={broadcastForm.description} onChange={e => setBroadcastForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Provide detailed alert information..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {ALERT_TYPES.map(t => (
                  <button key={t} onClick={() => setBroadcastForm(f => ({ ...f, type: t }))}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${broadcastForm.type === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Severity</label>
              <div className="flex gap-1.5">
                {['low', 'medium', 'high', 'critical'].map(s => (
                  <button key={s} onClick={() => setBroadcastForm(f => ({ ...f, severity: s }))}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold capitalize transition ${broadcastForm.severity === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {TARGETS.map(t => (
                <button key={t.id} onClick={() => setBroadcastForm(f => ({ ...f, target: t.id }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${broadcastForm.target === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Location (optional)</label>
            <input value={broadcastForm.location} onChange={e => setBroadcastForm(f => ({ ...f, location: e.target.value }))}
              placeholder="e.g. Main Campus, Hostel Block A"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowBroadcastForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={sendBroadcast}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition">
              <Radio size={14} /> Broadcast Now
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /* ── 5. Analytics ── */
  const renderAnalytics = () => {
    const data = analyticsData || {};
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Incidents', value: data.totalIncidents || 0, icon: FileText, color: 'from-slate-600 to-slate-800' },
            { label: 'Resolved', value: data.resolvedCount || 0, icon: CheckCircle, color: 'from-green-500 to-green-700' },
            { label: 'Pending', value: data.pendingCount || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
            { label: 'Avg Response', value: data.avgResponseTime || '0h', icon: Zap, color: 'from-blue-500 to-blue-700' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
              <s.icon size={18} className="mb-1 opacity-80" />
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-[10px] text-white/80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Incidents by Type */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Incidents by Type</h3>
          {(data.byType || []).length > 0 ? (
            <div className="space-y-2">
              {data.byType.map((item, i) => {
                const maxVal = Math.max(...data.byType.map(x => x.count));
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-semibold text-slate-600 truncate">{item.type}</span>
                    <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                        style={{ width: `${maxVal ? (item.count / maxVal) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{item.count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No data available</p>
          )}
        </div>

        {/* High Risk Zones */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">High-Risk Zones</h3>
          {(data.highRiskZones || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.highRiskZones.map((zone, i) => (
                <span key={i} className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">
                  <MapPin size={12} /> {zone}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No high-risk zones identified</p>
          )}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-black text-slate-800">{data.repeatComplaints || 0}</p>
            <p className="text-xs text-slate-500">Repeat Complaints</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-black text-slate-800">{data.resolvedCount && data.totalIncidents ? Math.round((data.resolvedCount / data.totalIncidents) * 100) : 0}%</p>
            <p className="text-xs text-slate-500">Resolution Rate</p>
          </div>
        </div>

        {/* Export */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>
    );
  };

  /* ═══════════ MAIN RENDER ═══════════ */
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Back Link */}
      <div className="mx-auto max-w-5xl px-6 pt-4 pb-1">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden py-8 mx-6 mt-2 rounded-2xl bg-gradient-to-r from-red-100 via-orange-50 to-amber-100">
        <div className="relative mx-auto max-w-5xl px-8 flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-600/10 border border-red-200">
            <Shield size={28} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Safety Center</h1>
            <p className="mt-1 text-sm text-slate-500">Monitor, respond, and manage campus safety</p>
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
                <button key={t.id} onClick={() => { setTab(t.id); setSelectedComplaint(null); setShowBroadcastForm(false); }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                    active ? 'text-red-700 bg-red-50 border-b-2 border-red-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
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
            {tab === 'sos'        && renderSosMonitor()}
            {tab === 'complaints' && renderComplaints()}
            {tab === 'wellbeing'  && renderWellbeing()}
            {tab === 'broadcast'  && renderBroadcast()}
            {tab === 'analytics'  && renderAnalytics()}
          </>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
