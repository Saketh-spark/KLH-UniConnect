import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Play, Clock, CheckCircle, XCircle, Calendar, Video,
  Award, AlertCircle, Loader2, FileText, Users, Star, Timer, ChevronRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentAssessments = ({ studentId, email }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testsRes, interviewsRes, resultsRes] = await Promise.all([
        fetch(`${API_BASE}/api/placements/tests/student/${studentId}`).catch(() => null),
        fetch(`${API_BASE}/api/placements/interviews/student/${studentId}`).catch(() => null),
        fetch(`${API_BASE}/api/placements/results/student/${studentId}`).catch(() => null)
      ]);

      if (testsRes?.ok) setTests(await testsRes.json());
      if (interviewsRes?.ok) setInterviews(await interviewsRes.json());
      if (resultsRes?.ok) setResults(await resultsRes.json());

      // Mock data
      if (!testsRes?.ok) {
        setTests([
          { id: '1', company: 'Google', type: 'Aptitude Test', date: '2026-01-25', time: '10:00 AM', duration: '90 mins', status: 'upcoming', platform: 'HackerRank' },
          { id: '2', company: 'Microsoft', type: 'Coding Test', date: '2026-01-28', time: '2:00 PM', duration: '120 mins', status: 'upcoming', platform: 'HackerEarth' },
          { id: '3', company: 'TCS', type: 'Aptitude Test', date: '2026-01-15', time: '11:00 AM', duration: '60 mins', status: 'completed', score: 78, maxScore: 100 }
        ]);
      }
      if (!interviewsRes?.ok) {
        setInterviews([
          { id: '1', company: 'Amazon', type: 'Technical Interview', date: '2026-01-30', time: '3:00 PM', round: 'Round 1', status: 'scheduled', meetingLink: 'https://meet.google.com/xyz' },
          { id: '2', company: 'TCS', type: 'HR Interview', date: '2026-01-22', time: '11:00 AM', round: 'Final', status: 'completed', feedback: 'Good communication skills' }
        ]);
      }
      if (!resultsRes?.ok) {
        setResults([
          { id: '1', company: 'TCS', stage: 'Aptitude Test', status: 'Passed', score: '78/100', date: '2026-01-15' },
          { id: '2', company: 'TCS', stage: 'Technical Interview', status: 'Passed', score: '8/10', date: '2026-01-18' },
          { id: '3', company: 'Infosys', stage: 'Aptitude Test', status: 'Failed', score: '45/100', date: '2026-01-10' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': case 'passed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'in-progress': return 'text-amber-600 bg-amber-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getTimeUntil = (date, time) => {
    const target = new Date(`${date} ${time}`);
    const now = new Date();
    const diff = target - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return 'Past';
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Soon';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading assessments...</span>
      </div>
    );
  }

  const upcomingTests = tests.filter(t => t.status === 'upcoming');
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-600">Upcoming Tests</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{upcomingTests.length}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Scheduled Interviews</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{upcomingInterviews.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Tests Passed</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{results.filter(r => r.status === 'Passed').length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Average Score</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">76%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'tests', label: 'Tests', icon: ClipboardList },
          { id: 'interviews', label: 'Interviews', icon: Video },
          { id: 'results', label: 'Results', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {tests.length > 0 ? tests.map(test => (
            <div
              key={test.id}
              className={`rounded-xl border p-6 ${
                test.status === 'upcoming' ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{test.company}</h3>
                    <p className="text-slate-600">{test.type}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {test.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {test.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-4 w-4" />
                        {test.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                  {test.status === 'upcoming' && (
                    <p className="mt-2 text-sm font-medium text-blue-600">
                      {getTimeUntil(test.date, test.time)}
                    </p>
                  )}
                  {test.status === 'completed' && test.score && (
                    <p className="mt-2 text-lg font-bold text-green-600">
                      {test.score}/{test.maxScore}
                    </p>
                  )}
                </div>
              </div>
              {test.status === 'upcoming' && (
                <div className="mt-4 flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                    <Play className="h-4 w-4" />
                    Start Test
                  </button>
                  <span className="px-3 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">
                    Platform: {test.platform}
                  </span>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-12 text-slate-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No tests scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {interviews.length > 0 ? interviews.map(interview => (
            <div
              key={interview.id}
              className={`rounded-xl border p-6 ${
                interview.status === 'scheduled' ? 'border-purple-200 bg-purple-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{interview.company}</h3>
                    <p className="text-slate-600">{interview.type} - {interview.round}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {interview.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {interview.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                  {interview.status === 'scheduled' && (
                    <p className="mt-2 text-sm font-medium text-purple-600">
                      {getTimeUntil(interview.date, interview.time)}
                    </p>
                  )}
                </div>
              </div>
              {interview.status === 'scheduled' && interview.meetingLink && (
                <div className="mt-4">
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                  >
                    <Video className="h-4 w-4" />
                    Join Meeting
                  </a>
                </div>
              )}
              {interview.feedback && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Feedback:</span> {interview.feedback}
                  </p>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-12 text-slate-500">
              <Video className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p>No interviews scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Stage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Score</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map(result => (
                <tr key={result.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{result.company}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{result.stage}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{result.score}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{result.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentAssessments;
