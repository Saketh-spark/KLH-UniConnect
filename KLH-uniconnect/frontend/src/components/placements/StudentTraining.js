import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Video, Award, Users, Calendar, Clock, CheckCircle, Play,
  Loader2, Star, Target, TrendingUp, FileText, Brain, ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentTraining = ({ studentId, email }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('training');
  const [trainings, setTrainings] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [mentorSessions, setMentorSessions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [skillScore, setSkillScore] = useState(0);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data
      setTrainings([
        { id: '1', title: 'Aptitude Training - Batch A', type: 'Aptitude', progress: 75, sessions: 12, attended: 9, nextSession: '2026-01-25', time: '10:00 AM', status: 'ongoing' },
        { id: '2', title: 'Communication Skills Workshop', type: 'Soft Skills', progress: 100, sessions: 6, attended: 6, status: 'completed', certificate: true },
        { id: '3', title: 'DSA Bootcamp', type: 'Technical', progress: 40, sessions: 20, attended: 8, nextSession: '2026-01-26', time: '2:00 PM', status: 'ongoing' }
      ]);

      setMockTests([
        { id: '1', title: 'Aptitude Mock Test 5', type: 'Aptitude', score: 82, maxScore: 100, date: '2026-01-20', percentile: 85 },
        { id: '2', title: 'Coding Challenge 3', type: 'Technical', score: 156, maxScore: 200, date: '2026-01-18', percentile: 72 },
        { id: '3', title: 'Verbal Reasoning', type: 'Aptitude', score: 45, maxScore: 50, date: '2026-01-15', percentile: 92 }
      ]);

      setMentorSessions([
        { id: '1', mentor: 'Dr. Rajesh Kumar', topic: 'Career Guidance', date: '2026-01-28', time: '4:00 PM', status: 'scheduled', meetingLink: 'https://meet.google.com/abc' },
        { id: '2', mentor: 'Ms. Priya Singh', topic: 'Resume Review', date: '2026-01-22', time: '3:00 PM', status: 'completed', feedback: 'Good structure, add more projects' }
      ]);

      setCertificates([
        { id: '1', title: 'Communication Skills', issueDate: '2026-01-15', type: 'Training' },
        { id: '2', title: 'Python Basics', issueDate: '2025-12-20', type: 'Course' }
      ]);

      setSkillScore(76);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading training data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skill Readiness Score */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900">Career Readiness Score</h3>
            <p className="text-sm text-blue-600 mt-1">Based on training completion, mock tests, and skill assessments</p>
          </div>
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke={skillScore >= 70 ? '#10b981' : skillScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${skillScore * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{skillScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Trainings</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{trainings.filter(t => t.status === 'ongoing').length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Mock Tests Taken</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{mockTests.length}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Certificates</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{certificates.length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Avg Test Score</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">
            {Math.round(mockTests.reduce((acc, t) => acc + (t.score / t.maxScore * 100), 0) / mockTests.length)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'training', label: 'Training Programs', icon: BookOpen },
          { id: 'mocks', label: 'Mock Tests', icon: Target },
          { id: 'mentors', label: 'Mentor Sessions', icon: Users },
          { id: 'certificates', label: 'Certificates', icon: Award }
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

      {/* Training Programs Tab */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          {trainings.map(training => (
            <div key={training.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    training.type === 'Technical' ? 'bg-blue-100' :
                    training.type === 'Aptitude' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    <BookOpen className={`h-6 w-6 ${
                      training.type === 'Technical' ? 'text-blue-600' :
                      training.type === 'Aptitude' ? 'text-purple-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{training.title}</h3>
                    <p className="text-sm text-slate-500">{training.type}</p>
                    <div className="mt-2 flex gap-4 text-sm text-slate-600">
                      <span>Sessions: {training.attended}/{training.sessions}</span>
                      {training.nextSession && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Calendar className="h-4 w-4" />
                          Next: {training.nextSession} at {training.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    training.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {training.status === 'completed' ? 'Completed' : `${training.progress}%`}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium">{training.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div 
                    className={`h-full rounded-full ${training.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${training.progress}%` }}
                  />
                </div>
              </div>
              {training.certificate && (
                <div className="mt-4 flex items-center gap-2 text-green-600">
                  <Award className="h-4 w-4" />
                  <span className="text-sm font-medium">Certificate Earned</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mock Tests Tab */}
      {activeTab === 'mocks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Recent Mock Tests</h3>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
              <Play className="h-4 w-4" />
              Take New Test
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Test</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Percentile</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTests.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{test.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.type}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{test.score}</span>
                      <span className="text-slate-500">/{test.maxScore}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        test.percentile >= 80 ? 'bg-green-100 text-green-700' :
                        test.percentile >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        Top {100 - test.percentile}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{test.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mentor Sessions Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          {mentorSessions.map(session => (
            <div key={session.id} className={`rounded-xl border p-6 ${
              session.status === 'scheduled' ? 'border-purple-200 bg-purple-50/50' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{session.mentor}</h3>
                    <p className="text-slate-600">{session.topic}</p>
                    <div className="mt-2 flex gap-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.time}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  session.status === 'scheduled' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                }`}>
                  {session.status}
                </span>
              </div>
              {session.status === 'scheduled' && session.meetingLink && (
                <div className="mt-4">
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                  >
                    <Video className="h-4 w-4" />
                    Join Session
                  </a>
                </div>
              )}
              {session.feedback && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Feedback:</span> {session.feedback}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {certificates.map(cert => (
            <div key={cert.id} className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                  <Award className="h-7 w-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{cert.title}</h3>
                  <p className="text-sm text-slate-600">{cert.type}</p>
                  <p className="text-xs text-slate-500 mt-1">Issued: {cert.issueDate}</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-amber-700 text-sm font-semibold hover:text-amber-800">
                <FileText className="h-4 w-4" />
                Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTraining;
