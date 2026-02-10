import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Shield, AlertTriangle, Phone, MapPin, Send, Clock, FileText,
  Heart, Search, X, ChevronRight, ChevronDown, ChevronUp, Bell, Eye,
  Camera, Upload, MessageCircle, CheckCircle, Loader2, AlertCircle,
  Siren, Activity, BookOpen, Users, Building2, Navigation, PhoneCall,
  Stethoscope, Brain, CalendarCheck, Megaphone, Info, ExternalLink,
  Lock, Paperclip, Image, Video, File, Trash2, RefreshCw, Map,
  ShieldCheck, Zap, Flame, CloudRain, XCircle, Mail, Radio
} from 'lucide-react';

const API = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/* ═══════════ TABS ═══════════ */
const TABS = [
  { id: 'sos',        label: 'Emergency SOS',     icon: Siren,       color: '#ef4444' },
  { id: 'report',     label: 'Report Incident',    icon: FileText,    color: '#f59e0b' },
  { id: 'wellbeing',  label: 'Health & Wellbeing', icon: Heart,       color: '#10b981' },
  { id: 'alerts',     label: 'Safety Alerts',      icon: Bell,        color: '#6366f1' },
  { id: 'resources',  label: 'Policies & Contacts', icon: BookOpen,   color: '#8b5cf6' },
];

const INCIDENT_TYPES = [
  'Ragging', 'Harassment', 'Bullying', 'Misconduct', 'Violence',
  'Infrastructure Hazard', 'Discrimination', 'Abuse', 'Theft', 'Other'
];
const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

/* ═══════════ COMPONENT ═══════════ */
export default function StudentSafetyCenter({ email, onBack }) {
  const [tab, setTab] = useState('sos');
  const [toast, setToast] = useState('');

  /* ── SOS state ── */
  const [sosActive, setSosActive] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosHistory, setSosHistory] = useState([]);
  const [activeSos, setActiveSos] = useState(null);
  const [location, setLocation] = useState(null);

  /* ── Reports state ── */
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState({ type: '', severity: 'Medium', description: '', anonymous: false, attachments: [] });
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportMessages, setReportMessages] = useState([]);
  const [chatMsg, setChatMsg] = useState('');

  /* ── Wellbeing state ── */
  const [counselingSessions, setCounselingSessions] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ type: 'counseling', reason: '', preferredDate: '', urgency: 'Normal' });
  const [healthAlerts, setHealthAlerts] = useState([]);

  /* ── Alerts state ── */
  const [alerts, setAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState('All');

  /* ── Resources state ── */
  const [resources, setResources] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [guides, setGuides] = useState([]);
  const [expandedPolicy, setExpandedPolicy] = useState(null);

  const [loading, setLoading] = useState(false);

  const notify = t => { setToast(t); setTimeout(() => setToast(''), 3500); };

  /* ── Get GPS location ── */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 17.4965, lng: 78.3910 }) // KLH default
      );
    }
  }, []);

  /* ── Fetch data based on active tab ── */
  const fetchSosHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/sos/history`, { params: { email } });
      setSosHistory(data);
      const active = data.find(s => s.status === 'ACTIVE' || s.status === 'RESPONDING');
      setActiveSos(active || null);
      if (active) setSosActive(true);
    } catch {}
  }, [email]);

  const fetchReports = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/complaints`, { params: { email } });
      setReports(data);
    } catch {}
  }, [email]);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/alerts/student`);
      setAlerts(data);
    } catch {}
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      const [r1, r2, r3] = await Promise.all([
        axios.get(`${API}/api/safety/resources/student`),
        axios.get(`${API}/api/safety/contacts/student`),
        axios.get(`${API}/api/faculty/safety/guides`),
      ]);
      setResources(r1.data); setContacts(r2.data); setGuides(r3.data.filter(g => g.isPublished));
    } catch {}
  }, []);

  const fetchCounseling = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/safety/counseling`, { params: { email } });
      setCounselingSessions(data);
    } catch {}
  }, [email]);

  useEffect(() => {
    setLoading(true);
    const fn = { sos: fetchSosHistory, report: fetchReports, alerts: fetchAlerts, resources: fetchResources, wellbeing: fetchCounseling }[tab];
    if (fn) fn().finally(() => setLoading(false));
  }, [tab, fetchSosHistory, fetchReports, fetchAlerts, fetchResources, fetchCounseling]);

  /* ═══════════ SOS ═══════════ */
  const triggerSOS = async () => {
    setSosLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/safety/sos/trigger`, {
        email,
        latitude: location?.lat,
        longitude: location?.lng,
        timestamp: new Date().toISOString(),
      });
      setActiveSos(data);
      setSosActive(true);
      notify('🚨 SOS Alert Sent! Help is on the way.');
      fetchSosHistory();
    } catch { notify('Failed to send SOS. Try calling directly.'); }
    setSosLoading(false);
  };

  const cancelSOS = async () => {
    if (!activeSos) return;
    try {
      await axios.put(`${API}/api/safety/sos/${activeSos.id}/cancel`, { email });
      setSosActive(false); setActiveSos(null);
      notify('SOS cancelled');
      fetchSosHistory();
    } catch { notify('Failed to cancel SOS'); }
  };

  /* ═══════════ COMPLAINTS ═══════════ */
  const submitReport = async () => {
    if (!reportForm.type || !reportForm.description) { notify('Please fill type and description'); return; }
    setReportLoading(true);
    try {
      await axios.post(`${API}/api/safety/complaints`, {
        ...reportForm,
        email: reportForm.anonymous ? null : email,
        submittedAt: new Date().toISOString(),
      });
      notify('Report submitted successfully');
      setShowReportForm(false);
      setReportForm({ type: '', severity: 'Medium', description: '', anonymous: false, attachments: [] });
      fetchReports();
    } catch { notify('Failed to submit report'); }
    setReportLoading(false);
  };

  const sendReportMessage = async () => {
    if (!chatMsg.trim() || !selectedReport) return;
    try {
      await axios.post(`${API}/api/safety/complaints/${selectedReport.id}/messages`, {
        email, content: chatMsg, timestamp: new Date().toISOString()
      });
      setChatMsg('');
      const { data } = await axios.get(`${API}/api/safety/complaints/${selectedReport.id}/messages`);
      setReportMessages(data);
    } catch { notify('Failed to send message'); }
  };

  const openReportChat = async (report) => {
    setSelectedReport(report);
    try {
      const { data } = await axios.get(`${API}/api/safety/complaints/${report.id}/messages`);
      setReportMessages(data);
    } catch { setReportMessages([]); }
  };

  /* ═══════════ WELLBEING ═══════════ */
  const bookSession = async () => {
    if (!bookingForm.reason) { notify('Please enter a reason'); return; }
    try {
      await axios.post(`${API}/api/safety/counseling`, { ...bookingForm, email, requestedAt: new Date().toISOString() });
      notify('Session request submitted');
      setShowBooking(false);
      setBookingForm({ type: 'counseling', reason: '', preferredDate: '', urgency: 'Normal' });
      fetchCounseling();
    } catch { notify('Failed to book session'); }
  };

  /* ═══════════ ALERT ACKNOWLEDGE ═══════════ */
  const acknowledgeAlert = async (id) => {
    try {
      await axios.put(`${API}/api/safety/alerts/${id}/acknowledge`, { email });
      notify('Alert acknowledged');
      fetchAlerts();
    } catch {}
  };

  /* ═══════════ STATUS BADGE ═══════════ */
  const statusBadge = (status) => {
    const map = {
      'ACTIVE': 'bg-red-100 text-red-700', 'RESPONDING': 'bg-orange-100 text-orange-700',
      'RESOLVED': 'bg-green-100 text-green-700', 'CANCELLED': 'bg-slate-100 text-slate-500',
      'Submitted': 'bg-blue-100 text-blue-700', 'Under Review': 'bg-yellow-100 text-yellow-700',
      'Action Taken': 'bg-orange-100 text-orange-700', 'Closed': 'bg-green-100 text-green-700',
      'Pending': 'bg-yellow-100 text-yellow-700', 'Scheduled': 'bg-blue-100 text-blue-700',
      'Completed': 'bg-green-100 text-green-700',
    };
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${map[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
  };

  const severityColor = (s) => ({ Low: 'text-green-600', Medium: 'text-yellow-600', High: 'text-orange-600', Critical: 'text-red-600' }[s] || 'text-slate-600');

  /* ═══════════ RENDER TABS ═══════════ */

  /* ── 1. Emergency SOS ── */
  const renderSOS = () => (
    <div className="space-y-6">
      {/* Main SOS Button */}
      <div className="relative rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-8 text-center text-white shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 right-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="relative">
          <Siren size={36} className="mx-auto mb-3 animate-pulse" />
          <h2 className="text-2xl font-black">Emergency SOS</h2>
          <p className="mt-1 text-sm text-white/80">Instantly alert campus security, your mentor, and emergency contacts</p>

          {!sosActive ? (
            <button onClick={triggerSOS} disabled={sosLoading}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-lg font-black text-red-600 shadow-2xl transition hover:scale-105 hover:shadow-red-500/30 active:scale-95 disabled:opacity-50">
              {sosLoading ? <Loader2 size={22} className="animate-spin" /> : <Siren size={22} />}
              {sosLoading ? 'Sending SOS...' : 'PRESS FOR SOS'}
            </button>
          ) : (
            <div className="mt-6 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-2 text-sm font-bold backdrop-blur-sm">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-400" />
                {activeSos?.status === 'RESPONDING' ? 'Help is on the way!' : 'SOS Active — Notifying...'}
              </div>
              {activeSos?.respondedBy && (
                <p className="text-sm text-white/90">Responding: <strong>{activeSos.respondedBy}</strong></p>
              )}
              <button onClick={cancelSOS} className="mt-2 rounded-full border-2 border-white/50 px-6 py-2 text-sm font-bold text-white hover:bg-white/10 transition">
                Cancel SOS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Call Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Security', icon: Shield, phone: '040-23456789', color: 'from-blue-500 to-blue-700' },
          { label: 'Medical Room', icon: Stethoscope, phone: '040-23456790', color: 'from-green-500 to-green-700' },
          { label: 'Women Safety', icon: ShieldCheck, phone: '181', color: 'from-pink-500 to-pink-700' },
        ].map(c => (
          <a key={c.label} href={`tel:${c.phone}`}
            className={`flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${c.color} p-4 text-white shadow-md transition hover:scale-105 active:scale-95`}>
            <c.icon size={24} />
            <span className="text-xs font-bold">{c.label}</span>
            <span className="text-[10px] text-white/70">{c.phone}</span>
          </a>
        ))}
      </div>

      {/* Location Info */}
      {location && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <MapPin size={20} className="text-red-500" />
          <div>
            <p className="text-sm font-bold text-slate-800">Your Location</p>
            <p className="text-xs text-slate-500">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
          </div>
          <Navigation size={16} className="ml-auto text-slate-400" />
        </div>
      )}

      {/* SOS History */}
      {sosHistory.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700">Recent SOS History</h3>
          <div className="space-y-2">
            {sosHistory.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <Siren size={16} className={s.status === 'RESOLVED' ? 'text-green-500' : 'text-red-500'} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800">{new Date(s.timestamp).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">{s.respondedBy ? `Responded by: ${s.respondedBy}` : 'Pending response'}</p>
                </div>
                {statusBadge(s.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  /* ── 2. Incident Reporting ── */
  const renderReports = () => (
    <div className="space-y-6">
      {!showReportForm && !selectedReport && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">My Reports</h3>
            <button onClick={() => setShowReportForm(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition active:scale-95">
              <FileText size={14} /> New Report
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
              <FileText size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No reports submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => openReportChat(r)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${severityColor(r.severity)}`}>● {r.severity}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{r.type}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-800 line-clamp-1">{r.description}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{new Date(r.submittedAt).toLocaleDateString()} {r.anonymous && '· Anonymous'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(r.status)}
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* New Report Form */}
      {showReportForm && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Submit Report</h3>
            <button onClick={() => setShowReportForm(false)} className="rounded-lg p-1.5 hover:bg-slate-100"><X size={18} /></button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Incident Type *</label>
            <div className="flex flex-wrap gap-2">
              {INCIDENT_TYPES.map(t => (
                <button key={t} onClick={() => setReportForm(f => ({ ...f, type: t }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${reportForm.type === t ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Severity</label>
            <div className="flex gap-2">
              {SEVERITY_LEVELS.map(s => (
                <button key={s} onClick={() => setReportForm(f => ({ ...f, severity: s }))}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${reportForm.severity === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Description *</label>
            <textarea value={reportForm.description} onChange={e => setReportForm(f => ({ ...f, description: e.target.value }))}
              rows={4} placeholder="Describe the incident in detail..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none" />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
            <input type="checkbox" checked={reportForm.anonymous} onChange={e => setReportForm(f => ({ ...f, anonymous: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Submit Anonymously</p>
              <p className="text-[10px] text-slate-500">Your identity will be hidden from investigators</p>
            </div>
            <Lock size={16} className="ml-auto text-slate-400" />
          </label>

          <div className="flex gap-3">
            <button onClick={() => setShowReportForm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={submitReport} disabled={reportLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition">
              {reportLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {reportLoading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}

      {/* Report Detail + Chat */}
      {selectedReport && (
        <div className="space-y-4">
          <button onClick={() => { setSelectedReport(null); setReportMessages([]); }}
            className="flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700">
            <ArrowLeft size={16} /> Back to Reports
          </button>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold ${severityColor(selectedReport.severity)}`}>● {selectedReport.severity}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{selectedReport.type}</span>
              {statusBadge(selectedReport.status)}
            </div>
            <p className="text-sm text-slate-800">{selectedReport.description}</p>
            <p className="mt-2 text-[10px] text-slate-400">Submitted: {new Date(selectedReport.submittedAt).toLocaleString()}</p>
            {selectedReport.assignedTo && <p className="text-[10px] text-slate-500">Assigned to: {selectedReport.assignedTo}</p>}

            {/* Status Timeline */}
            <div className="mt-4 flex items-center gap-1">
              {['Submitted', 'Under Review', 'Action Taken', 'Closed'].map((st, i) => {
                const stages = ['Submitted', 'Under Review', 'Action Taken', 'Closed'];
                const currentIdx = stages.indexOf(selectedReport.status);
                const isDone = i <= currentIdx;
                return (
                  <React.Fragment key={st}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${isDone ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {isDone ? '✓' : i + 1}
                    </div>
                    {i < 3 && <div className={`h-0.5 flex-1 ${i < currentIdx ? 'bg-green-400' : 'bg-slate-200'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-slate-400">
              <span>Submitted</span><span>Under Review</span><span>Action Taken</span><span>Closed</span>
            </div>
          </div>

          {/* Chat with Authority */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h4 className="text-sm font-bold text-slate-800">Communication</h4>
              <p className="text-[10px] text-slate-500">Secure chat with assigned authority</p>
            </div>
            <div className="h-48 overflow-y-auto p-4 space-y-2">
              {reportMessages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No messages yet</p>
              ) : reportMessages.map((m, i) => (
                <div key={i} className={`flex ${m.fromStudent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${m.fromStudent ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'}`}>
                    <p>{m.content}</p>
                    <p className="mt-0.5 text-[9px] opacity-60">{new Date(m.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type a message..."
                onKeyDown={e => e.key === 'Enter' && sendReportMessage()}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-amber-400" />
              <button onClick={sendReportMessage} className="rounded-lg bg-amber-600 p-2 text-white hover:bg-amber-700 transition">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── 3. Health & Wellbeing ── */
  const renderWellbeing = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Request Medical Help', icon: Stethoscope, color: 'from-red-500 to-red-600', action: () => { setBookingForm(f => ({ ...f, type: 'medical' })); setShowBooking(true); } },
          { label: 'Book Counseling', icon: Brain, color: 'from-teal-500 to-teal-600', action: () => { setBookingForm(f => ({ ...f, type: 'counseling' })); setShowBooking(true); } },
        ].map(a => (
          <button key={a.label} onClick={a.action}
            className={`flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${a.color} p-5 text-white shadow-md hover:scale-105 transition active:scale-95`}>
            <a.icon size={28} />
            <span className="text-xs font-bold">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Resource Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">Wellness Resources</h3>
        {[
          { title: 'Stress Management', desc: 'Techniques for managing academic stress and anxiety', icon: Activity, color: 'bg-blue-50 text-blue-600' },
          { title: 'Wellness Guidance', desc: 'Healthy lifestyle tips for campus life', icon: Heart, color: 'bg-pink-50 text-pink-600' },
          { title: 'Emergency Medical Contacts', desc: 'Ambulance, hospital, and on-campus medical contacts', icon: Phone, color: 'bg-red-50 text-red-600' },
        ].map(r => (
          <div key={r.title} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${r.color}`}><r.icon size={22} /></div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">{r.title}</h4>
              <p className="text-[10px] text-slate-500">{r.desc}</p>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
        ))}
      </div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700">Critical Health Alerts</h3>
          {healthAlerts.map(a => (
            <div key={a.id} className="rounded-xl border-l-4 border-red-400 bg-red-50 p-3">
              <p className="text-sm font-bold text-red-800">{a.title}</p>
              <p className="text-xs text-red-600/70">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* My Sessions */}
      {counselingSessions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-700">My Sessions</h3>
          <div className="space-y-2">
            {counselingSessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.type === 'medical' ? 'bg-red-100' : 'bg-teal-100'}`}>
                  {s.type === 'medical' ? <Stethoscope size={18} className="text-red-600" /> : <Brain size={18} className="text-teal-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 capitalize">{s.type} Session</p>
                  <p className="text-[10px] text-slate-500 truncate">{s.reason}</p>
                  {s.scheduledDate && <p className="text-[10px] text-blue-500">{new Date(s.scheduledDate).toLocaleDateString()}</p>}
                </div>
                {statusBadge(s.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowBooking(false)}>
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 capitalize">{bookingForm.type === 'medical' ? 'Medical Assistance' : 'Counseling Session'}</h3>
              <button onClick={() => setShowBooking(false)} className="rounded-lg p-1 hover:bg-slate-100"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Reason *</label>
                <textarea value={bookingForm.reason} onChange={e => setBookingForm(f => ({ ...f, reason: e.target.value }))}
                  rows={3} placeholder="Briefly describe your concern..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-teal-400 resize-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Preferred Date</label>
                <input type="date" value={bookingForm.preferredDate} onChange={e => setBookingForm(f => ({ ...f, preferredDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Urgency</label>
                <div className="flex gap-2">
                  {['Normal', 'Urgent', 'Emergency'].map(u => (
                    <button key={u} onClick={() => setBookingForm(f => ({ ...f, urgency: u }))}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${bookingForm.urgency === u ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowBooking(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600">Cancel</button>
              <button onClick={bookSession} className="flex-1 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ── 4. Safety Alerts ── */
  const alertTypes = ['All', 'Emergency', 'Weather', 'Security', 'Health', 'Campus'];
  const filteredAlerts = alertFilter === 'All' ? alerts : alerts.filter(a => a.type === alertFilter);

  const alertIcon = (type) => {
    const map = { Emergency: Flame, Weather: CloudRain, Security: Shield, Health: Stethoscope, Campus: Building2 };
    const Icon = map[type] || Bell;
    return <Icon size={18} />;
  };
  const alertColor = (severity) => {
    const map = { critical: 'border-red-400 bg-red-50', high: 'border-orange-400 bg-orange-50', medium: 'border-yellow-400 bg-yellow-50', low: 'border-blue-400 bg-blue-50' };
    return map[severity?.toLowerCase()] || 'border-slate-200 bg-white';
  };

  const renderAlerts = () => (
    <div className="space-y-5">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {alertTypes.map(t => (
          <button key={t} onClick={() => setAlertFilter(t)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${alertFilter === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <Bell size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(a => (
            <div key={a.id} className={`rounded-xl border-l-4 ${alertColor(a.severity)} p-4 shadow-sm`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{alertIcon(a.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{a.title}</h4>
                    {a.severity && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.severity === 'critical' ? 'bg-red-200 text-red-800' : a.severity === 'high' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-200 text-yellow-800'}`}>{a.severity}</span>}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{a.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(a.createdAt).toLocaleString()}</span>
                    {a.location && <span className="flex items-center gap-1"><MapPin size={10} /> {a.location}</span>}
                  </div>
                </div>
              </div>
              {!a.acknowledged && (
                <button onClick={() => acknowledgeAlert(a.id)}
                  className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-indigo-700 transition">
                  <CheckCircle size={12} /> Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ── 5. Policies & Resources ── */
  const policies = [
    { id: 'anti-ragging', title: 'Anti-Ragging Policy', icon: Shield, content: 'KLH University maintains a zero-tolerance policy towards ragging in any form, as per UGC Regulations 2009. Any student found guilty of ragging will face strict disciplinary action including suspension or expulsion.' },
    { id: 'women-safety', title: 'Women Safety Policy', icon: ShieldCheck, content: 'The university ensures a safe and secure environment for all women students and staff. The Internal Complaints Committee (ICC) addresses all complaints related to sexual harassment under the POSH Act 2013.' },
    { id: 'emergency-procedures', title: 'Emergency Procedures', icon: AlertTriangle, content: 'In case of emergency: 1) Stay calm. 2) Call campus security. 3) Move to the nearest assembly point. 4) Follow instructions from safety personnel. 5) Do not use elevators during fire.' },
    { id: 'safety-guidelines', title: 'Safety Guidelines', icon: BookOpen, content: 'Always carry your ID card on campus. Report suspicious activities immediately. Use well-lit pathways at night. Save emergency numbers on your phone. Participate in safety drills.' },
  ];

  const renderResources = () => (
    <div className="space-y-6">
      {/* Policies */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Campus Policies</h3>
        <div className="space-y-2">
          {policies.map(p => (
            <div key={p.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button onClick={() => setExpandedPolicy(expandedPolicy === p.id ? null : p.id)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50 transition">
                <p.icon size={18} className="text-indigo-600 shrink-0" />
                <span className="flex-1 text-sm font-semibold text-slate-800">{p.title}</span>
                {expandedPolicy === p.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {expandedPolicy === p.id && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-slate-600 leading-relaxed">{p.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-700">Emergency Contact Directory</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { name: 'Campus Security', phone: '040-23456789', avail: '24/7' },
            { name: 'Medical Center', phone: '040-23456790', avail: '8 AM - 10 PM' },
            { name: 'Women Safety Cell', phone: '181', avail: '24/7' },
            { name: 'Anti-Ragging Helpline', phone: '1800-180-5522', avail: '24/7' },
            { name: 'Police (Nearest Station)', phone: '100', avail: '24/7' },
            { name: 'Ambulance', phone: '108', avail: '24/7' },
            { name: 'Fire Station', phone: '101', avail: '24/7' },
            { name: 'Dean of Students', phone: '040-23456800', avail: '9 AM - 5 PM' },
          ].map(c => (
            <a key={c.name} href={`tel:${c.phone}`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:bg-slate-50 transition">
              <Phone size={16} className="text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                <p className="text-[10px] text-slate-500">{c.avail}</p>
              </div>
              <span className="text-xs font-semibold text-blue-600">{c.phone}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Campus Map Placeholder */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center">
        <Map size={40} className="mx-auto mb-3 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-800">Interactive Campus Map</h3>
        <p className="mt-1 text-xs text-slate-500">View security posts, medical centers, and emergency exits</p>
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          {['Security Posts', 'Medical Centers', 'Emergency Exits', 'Assembly Points'].map(l => (
            <span key={l} className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );

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
            <p className="mt-1 text-sm text-slate-500">Your safety is our priority — report, alert, and stay protected</p>
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
                <button key={t.id} onClick={() => { setTab(t.id); setSelectedReport(null); setShowReportForm(false); }}
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
            {tab === 'sos'       && renderSOS()}
            {tab === 'report'    && renderReports()}
            {tab === 'wellbeing' && renderWellbeing()}
            {tab === 'alerts'    && renderAlerts()}
            {tab === 'resources' && renderResources()}
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
