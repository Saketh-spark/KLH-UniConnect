import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Download, AlertCircle, CheckCircle, Calendar, Users,
  Edit2, Trash2, Lock, X, Save, RefreshCw, BookOpen, Clock,
  FlaskConical, BookMarked, ChevronDown, ChevronUp
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8085/api';

/* ═══════════ SUBJECTS & TIMETABLE ═══════════ */
const SUBJECTS = [
  { code: 'MO',     name: 'Mathematical Optimization',                short: 'MO' },
  { code: 'ML',     name: 'Machine Learning',                         short: 'ML' },
  { code: 'DAA',    name: 'Design and Analysis of Algorithms',        short: 'DAA' },
  { code: 'CIS',    name: 'Cloud Infrastructure and Services',        short: 'CIS' },
  { code: 'FAIEDC', name: 'Foundations of AI-Enabled Edge Computing', short: 'FAIEDC' },
  { code: 'FSAD',   name: 'Full Stack Application Development',      short: 'FSAD' },
  { code: 'CN',     name: 'Computer Networks',                        short: 'CN' },
];

const TIMETABLE = {
  Monday: [
    { subject: 'FSAD',   type: 'Lab',       time: '10:10 AM – 11:50 AM',  period: 'Mon P1-P2' },
    { subject: 'FAIEDC', type: 'Lab',       time: '11:50 AM – 12:45 PM',  period: 'Mon P3' },
    { subject: 'CIS',    type: 'Lab',       time: '1:30 PM – 2:20 PM',    period: 'Mon P4' },
    { subject: 'ML',     type: 'Practical', time: '2:20 PM – 4:00 PM',    period: 'Mon P5-P6' },
  ],
  Tuesday: [
    { subject: 'FSAD',   type: 'Theory',   time: '10:10 AM – 11:00 AM',  period: 'Tue P1' },
    { subject: 'FAIEDC', type: 'Lab',       time: '11:00 AM – 12:45 PM',  period: 'Tue P2-P3' },
    { subject: 'CIS',    type: 'Lab',       time: '1:30 PM – 3:10 PM',    period: 'Tue P4-P5' },
  ],
  Wednesday: [
    { subject: 'CN',     type: 'Lab',       time: '10:10 AM – 11:00 AM',  period: 'Wed P1' },
    { subject: 'FAIEDC', type: 'Practical', time: '11:00 AM – 12:45 PM',  period: 'Wed P2-P3' },
    { subject: 'ML',     type: 'Lab',       time: '1:30 PM – 2:20 PM',    period: 'Wed P4' },
  ],
  Thursday: [
    { subject: 'CN',     type: 'Lab',       time: '1:30 PM – 2:20 PM',    period: 'Thu P4' },
  ],
  Friday: [
    { subject: 'CIS',    type: 'Theory',   time: '10:10 AM – 11:00 AM',  period: 'Fri P1' },
    { subject: 'DAA',    type: 'Theory',   time: '11:00 AM – 11:50 AM',  period: 'Fri P2' },
    { subject: 'DAA',    type: 'Practical', time: '11:50 AM – 12:45 PM',  period: 'Fri P3' },
    { subject: 'CN',     type: 'Lab',       time: '1:30 PM – 2:20 PM',    period: 'Fri P4' },
  ],
  Saturday: [
    { subject: 'ML',     type: 'Lab',       time: '8:15 AM – 9:55 AM',    period: 'Sat P1-P2' },
    { subject: 'CIS',    type: 'Practical', time: '10:10 AM – 11:00 AM',  period: 'Sat P3' },
    { subject: 'CN',     type: 'Practical', time: '1:30 PM – 3:10 PM',    period: 'Sat P4-P5' },
  ],
};

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const typeBadge = (type) => {
  const m = { Theory: 'bg-blue-100 text-blue-700', Lab: 'bg-purple-100 text-purple-700', Practical: 'bg-amber-100 text-amber-700' };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${m[type] || 'bg-slate-100 text-slate-600'}`}>{type}</span>;
};

const typeIcon = (type) => {
  if (type === 'Lab') return <FlaskConical size={14} className="text-purple-500" />;
  if (type === 'Practical') return <BookMarked size={14} className="text-amber-500" />;
  return <BookOpen size={14} className="text-blue-500" />;
};

/* ═══════════ MAIN COMPONENT ═══════════ */
const FacultyAttendance = ({ selectedSubject, setSelectedSubject, searchTerm }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');
  const notify = (t) => { setToast(t); setTimeout(() => setToast(''), 3500); };

  // Modal states
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // New attendance form
  const [formSubject, setFormSubject] = useState('');
  const [formType, setFormType] = useState('Theory');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPeriod, setFormPeriod] = useState('');
  const [studentList, setStudentList] = useState([]);

  // Filter & expand
  const [filterSubject, setFilterSubject] = useState('all');
  const [expandedDay, setExpandedDay] = useState(null);

  /* ═══ Fetch ═══ */
  const fetchAllStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const res = await fetch(`${API_BASE_URL}/attendance/students`);
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setAllStudents(data);
    } catch (err) { console.error(err); } finally { setStudentsLoading(false); }
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/attendance/faculty`, {
        headers: { 'X-Faculty-Id': 'faculty-001', 'X-Faculty-Name': 'Dr. Faculty' }
      });
      if (!res.ok) throw new Error('Failed to fetch records');
      setAttendanceRecords(await res.json());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);

  const fetchLowAttendance = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/low-attendance`, {
        headers: { 'X-Faculty-Id': 'faculty-001' }
      });
      if (res.ok) setLowAttendanceStudents(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchLowAttendance();
    fetchAllStudents();
  }, [fetchRecords, fetchLowAttendance, fetchAllStudents]);

  /* ═══ Actions ═══ */
  const openMarkAttendance = (subjectCode, type, period) => {
    const sub = SUBJECTS.find(s => s.code === subjectCode);
    if (!sub) return;
    setFormSubject(sub.name);
    setFormType(type);
    setFormPeriod(period || `${type} session`);
    setFormDate(new Date().toISOString().split('T')[0]);
    const initial = allStudents.map(s => ({
      studentId: s.studentId, studentName: s.studentName,
      rollNumber: s.rollNumber || s.studentId, status: 'PRESENT', remarks: ''
    }));
    setStudentList(initial);
    setShowMarkModal(true);
  };

  const handleCreateRecord = async () => {
    if (!formSubject || studentList.length === 0) { notify('Subject and students required'); return; }
    try {
      const sub = SUBJECTS.find(s => s.name === formSubject);
      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Faculty-Id': 'faculty-001', 'X-Faculty-Name': 'Dr. Faculty' },
        body: JSON.stringify({
          subject: formSubject,
          subjectCode: sub?.code || '',
          section: 'A',
          date: formDate,
          period: `${formType} – ${formPeriod}`,
          totalStudents: studentList.length,
          students: studentList
        })
      });
      if (!res.ok) throw new Error('Failed');
      const rec = await res.json();
      setAttendanceRecords(prev => [rec, ...prev]);
      setShowMarkModal(false);
      notify('Attendance saved!');
      fetchLowAttendance();
    } catch { notify('Failed to save attendance'); }
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedRecord.subject,
          subjectCode: selectedRecord.subjectCode,
          section: selectedRecord.section,
          date: selectedRecord.date,
          period: selectedRecord.period,
          totalStudents: studentList.length,
          students: studentList
        })
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setAttendanceRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      setShowRecordsModal(false);
      setSelectedRecord(null);
      notify('Attendance updated!');
      fetchLowAttendance();
    } catch { notify('Failed to update'); }
  };

  const handleLock = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/${id}/lock`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed');
      const locked = await res.json();
      setAttendanceRecords(prev => prev.map(r => r.id === locked.id ? locked : r));
      notify('Record locked');
    } catch { notify('Failed to lock'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setAttendanceRecords(prev => prev.filter(r => r.id !== id));
      notify('Record deleted');
    } catch { notify('Failed to delete'); }
  };

  const toggleStatus = (studentId, status) => {
    setStudentList(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
  };

  const markAllAs = (status) => {
    setStudentList(prev => prev.map(s => ({ ...s, status })));
  };

  /* ═══ Derived ═══ */
  const filteredRecords = useMemo(() => {
    return attendanceRecords
      .filter(r => filterSubject === 'all' || r.subject === filterSubject || SUBJECTS.find(s => s.code === filterSubject)?.name === r.subject)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendanceRecords, filterSubject]);

  const subjectSummary = useMemo(() => {
    return SUBJECTS.map(sub => {
      const recs = attendanceRecords.filter(r => r.subject === sub.name || r.subjectCode === sub.code);
      const totalStudents = recs.reduce((s, r) => s + ((r.students || []).length), 0);
      const present = recs.reduce((s, r) => s + ((r.students || []).filter(st => st.status === 'PRESENT').length), 0);
      return { ...sub, sessions: recs.length, totalStudents, present };
    });
  }, [attendanceRecords]);

  const todayDay = useMemo(() => {
    const d = new Date();
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
  }, []);

  const todaySessions = TIMETABLE[todayDay] || [];

  /* ═══ Loading ═══ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading attendance records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ══ Dashboard Cards ══ */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Subjects', value: SUBJECTS.length, color: 'from-indigo-500 to-indigo-600', icon: BookOpen },
          { label: 'Records', value: attendanceRecords.length, color: 'from-blue-500 to-blue-600', icon: Calendar },
          { label: 'Low Attendance', value: lowAttendanceStudents.length, color: 'from-red-500 to-red-600', icon: AlertCircle },
          { label: 'Students', value: allStudents.length, color: 'from-emerald-500 to-emerald-600', icon: Users },
        ].map(s => (
          <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
            <s.icon size={16} className="mb-1 opacity-80" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] text-white/80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ══ Today's Sessions ══ */}
      {todaySessions.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Clock size={16} /> Today's Sessions ({todayDay})
          </h3>
          <div className="space-y-2">
            {todaySessions.map((slot, i) => {
              const sub = SUBJECTS.find(s => s.code === slot.subject);
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-white border border-blue-100 p-3 shadow-sm">
                  {typeIcon(slot.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800">{sub?.name || slot.subject}</p>
                    <p className="text-[10px] text-slate-500">{slot.time}</p>
                  </div>
                  {typeBadge(slot.type)}
                  <button onClick={() => openMarkAttendance(slot.subject, slot.type, slot.period)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 transition">
                    <Plus size={12} /> Mark
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ Subject-wise Summary ══ */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">Subject-wise Summary</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {subjectSummary.map(sub => (
            <div key={sub.code} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{sub.short}</h4>
                  <p className="text-[10px] text-slate-500 truncate max-w-[160px]">{sub.name}</p>
                </div>
                <span className="text-lg font-black text-indigo-600">{sub.sessions}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {sub.sessions} session{sub.sessions !== 1 ? 's' : ''} recorded
                {sub.totalStudents > 0 && ` · ${sub.present}/${sub.totalStudents} present`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Full Timetable with Quick Mark ══ */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">Weekly Timetable</h3>
        <div className="space-y-2">
          {DAYS_ORDER.map(day => (
            <div key={day} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-800">{day}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {TIMETABLE[day].length} session{TIMETABLE[day].length > 1 ? 's' : ''}
                  </span>
                  {day === todayDay && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Today</span>}
                </div>
                {expandedDay === day ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
              {expandedDay === day && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {TIMETABLE[day].map((slot, i) => {
                    const sub = SUBJECTS.find(s => s.code === slot.subject);
                    return (
                      <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                        {typeIcon(slot.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800">{sub?.name || slot.subject}</p>
                          <p className="text-[10px] text-slate-500">{slot.time}</p>
                        </div>
                        {typeBadge(slot.type)}
                        <button onClick={() => openMarkAttendance(slot.subject, slot.type, slot.period)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-700 transition">
                          <Plus size={10} /> Mark
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══ Recent Records ══ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">Attendance Records</h3>
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-indigo-400">
            <option value="all">All Subjects</option>
            {SUBJECTS.map(s => <option key={s.code} value={s.code}>{s.short} – {s.name}</option>)}
          </select>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">No attendance records yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredRecords.map(rec => {
              const presentCount = (rec.students || []).filter(s => s.status === 'PRESENT').length;
              const total = (rec.students || []).length;
              const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
              return (
                <div key={rec.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <Calendar size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{rec.subject}</h4>
                      {rec.locked && <Lock size={12} className="text-slate-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500">{rec.date} · {rec.period} · {presentCount}/{total} present ({pct}%)</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!rec.locked && (
                      <>
                        <button onClick={() => {
                          setSelectedRecord(rec);
                          setStudentList((rec.students || []).map(s => ({
                            studentId: s.studentId, studentName: s.studentName,
                            rollNumber: s.rollNumber || s.studentId, status: s.status || 'PRESENT', remarks: s.remarks || ''
                          })));
                          setShowRecordsModal(true);
                        }} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleLock(rec.id)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50" title="Lock">
                          <Lock size={14} />
                        </button>
                        <button onClick={() => handleDelete(rec.id)}
                          className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ Low Attendance Students ══ */}
      {lowAttendanceStudents.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Low Attendance Students ({lowAttendanceStudents.length})
          </h3>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {lowAttendanceStudents.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-white border border-red-100 p-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600">{i + 1}</span>
                <span className="flex-1 text-xs text-slate-700 truncate">{s.studentName || s.studentId}</span>
                <span className="text-xs font-bold text-red-600">{s.overallPercentage?.toFixed?.(1) ?? s.percentage ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════ Mark Attendance Modal ══════ */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowMarkModal(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Mark Attendance</h3>
                <p className="text-xs text-slate-500">{formSubject} · {formType} · {formPeriod}</p>
              </div>
              <button onClick={() => setShowMarkModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Date</label>
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400" />
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => markAllAs('PRESENT')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700">All Present</button>
              <button onClick={() => markAllAs('ABSENT')} className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-red-700">All Absent</button>
              <span className="ml-auto text-xs text-slate-500">
                {studentList.filter(s => s.status === 'PRESENT').length}/{studentList.length} Present
              </span>
            </div>

            {/* Student list */}
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm text-slate-500">Loading students...</span>
              </div>
            ) : studentList.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No students found in database.</p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2">
                {studentList.map((s, i) => (
                  <div key={s.studentId} className={`flex items-center gap-3 rounded-lg p-2.5 transition ${
                    s.status === 'PRESENT' ? 'bg-emerald-50' : s.status === 'ABSENT' ? 'bg-red-50' : 'bg-yellow-50'
                  }`}>
                    <span className="w-6 text-center text-[10px] font-bold text-slate-500">{i + 1}</span>
                    <span className="flex-1 text-xs text-slate-700 truncate">{s.studentName} ({s.rollNumber})</span>
                    <div className="flex gap-1">
                      {['PRESENT', 'ABSENT', 'LATE'].map(st => (
                        <button key={st} onClick={() => toggleStatus(s.studentId, st)}
                          className={`rounded-md px-2 py-1 text-[9px] font-bold transition ${
                            s.status === st
                              ? st === 'PRESENT' ? 'bg-emerald-600 text-white' : st === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}>{st[0]}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowMarkModal(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateRecord}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition">
                <Save size={14} /> Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ Edit Record Modal ══════ */}
      {showRecordsModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => { setShowRecordsModal(false); setSelectedRecord(null); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Attendance</h3>
                <p className="text-xs text-slate-500">{selectedRecord.subject} · {selectedRecord.date} · {selectedRecord.period}</p>
              </div>
              <button onClick={() => { setShowRecordsModal(false); setSelectedRecord(null); }}><X size={18} className="text-slate-400" /></button>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => markAllAs('PRESENT')} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-700">All Present</button>
              <button onClick={() => markAllAs('ABSENT')} className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-red-700">All Absent</button>
              <span className="ml-auto text-xs text-slate-500">
                {studentList.filter(s => s.status === 'PRESENT').length}/{studentList.length} Present
              </span>
            </div>

            {/* Student list */}
            <div className="space-y-1 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2">
              {studentList.map((s, i) => (
                <div key={s.studentId} className={`flex items-center gap-3 rounded-lg p-2.5 transition ${
                  s.status === 'PRESENT' ? 'bg-emerald-50' : s.status === 'ABSENT' ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <span className="w-6 text-center text-[10px] font-bold text-slate-500">{i + 1}</span>
                  <span className="flex-1 text-xs text-slate-700 truncate">{s.studentName} ({s.rollNumber})</span>
                  <div className="flex gap-1">
                    {['PRESENT', 'ABSENT', 'LATE'].map(st => (
                      <button key={st} onClick={() => toggleStatus(s.studentId, st)}
                        className={`rounded-md px-2 py-1 text-[9px] font-bold transition ${
                          s.status === st
                            ? st === 'PRESENT' ? 'bg-emerald-600 text-white' : st === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>{st[0]}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowRecordsModal(false); setSelectedRecord(null); }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleUpdateRecord}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition">
                <Save size={14} /> Update Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
};

export default FacultyAttendance;
