import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ArrowLeft, BarChart3, PieChart, Zap, Target,
  CheckCircle2, Clock, Award, Users, FileText, ArrowUpRight,
  Activity, Flame, BookOpen, Award as BadgeIcon, AlertCircle,
  TrendingDown, Calendar, Download
} from 'lucide-react';

export default function Analytics({ onBack }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('month');

  useEffect(() => {
    setMounted(true);
  }, []);

  const overviewMetrics = [
    { label: 'Overall Score', value: 78, color: 'text-slate-900', bg: 'from-slate-100 to-slate-50' },
    { label: 'Performance Metrics', value: 6, color: 'text-blue-600', bg: 'from-blue-100 to-blue-50' },
    { label: 'Skills Tracked', value: 6, color: 'text-purple-600', bg: 'from-purple-100 to-purple-50' },
    { label: 'Active Goals', value: 4, color: 'text-slate-900', bg: 'from-slate-100 to-slate-50' },
    { label: 'Recent Actions', value: 6, color: 'text-slate-900', bg: 'from-slate-100 to-slate-50' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: 6 },
    { id: 'charts', label: 'Charts', icon: PieChart, count: 4 },
    { id: 'skills', label: 'Skills', icon: Zap, count: 6 },
    { id: 'goals', label: 'Goals & Activity', icon: Target, count: 4 },
    { id: 'reports', label: 'Reports', icon: FileText, count: 3 }
  ];

  const goals = [
    {
      id: 1,
      title: 'Improve GPA to 9.0',
      description: 'Target cumulative GPA of 9.0 by end of semester',
      icon: '📚',
      status: 'On Track',
      progress: 94,
      startDate: '2024-01-01',
      targetDate: '2024-05-31',
      milestones: [
        { name: 'Complete Core Courses', date: '2024-02-15', completed: true },
        { name: 'Achieve 8.5+ GPA', date: '2024-02-12', completed: true },
        { name: 'Complete All Assignments', date: '2024-04-30', completed: false },
        { name: 'Final Exams', date: '2024-05-31', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Secure Internship',
      description: 'Get selected for a premium tech internship',
      icon: '💼',
      status: 'On Track',
      progress: 78,
      startDate: '2024-01-01',
      targetDate: '2024-03-31',
      milestones: [
        { name: 'Build Portfolio', date: '2024-01-31', completed: true },
        { name: 'Complete Interview Prep', date: '2024-02-10', completed: true },
        { name: 'Apply to Companies', date: '2024-02-12', completed: true },
        { name: 'Final Selection', date: '2024-03-31', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Master 5 New Technologies',
      description: 'Learn and become proficient in 5 new tech skills',
      icon: '🚀',
      status: 'On Track',
      progress: 60,
      startDate: '2024-01-01',
      targetDate: '2024-12-31',
      milestones: [
        { name: 'Learn React', date: '2024-02-01', completed: true },
        { name: 'Learn Node.js', date: '2024-02-15', completed: true },
        { name: 'Learn TypeScript', date: '2024-03-31', completed: false },
        { name: 'Learn Cloud Tech', date: '2024-06-30', completed: false }
      ]
    },
    {
      id: 4,
      title: 'Maintain Fitness Routine',
      description: 'Exercise for at least 30 minutes daily',
      icon: '🏃',
      status: 'At Risk',
      progress: 45,
      startDate: '2024-01-01',
      targetDate: '2024-12-31',
      milestones: [
        { name: 'Join Gym', date: '2024-01-15', completed: true },
        { name: '30 days consistency', date: '2024-02-28', completed: false },
        { name: '3 months consistency', date: '2024-04-30', completed: false },
        { name: '1 year consistency', date: '2024-12-31', completed: false }
      ]
    }
  ];

  const skills = [
    {
      id: 1,
      name: 'React.js',
      category: 'Technical',
      proficiency: 85,
      endorsements: 23,
      status: 'Expert',
      statusColor: 'text-blue-600',
      statusBg: 'bg-blue-100',
      lastUpdated: '2024-02-12'
    },
    {
      id: 2,
      name: 'Communication',
      category: 'Professional',
      proficiency: 78,
      endorsements: 18,
      status: 'Stable',
      statusColor: 'text-amber-600',
      statusBg: 'bg-amber-100',
      lastUpdated: '2024-02-09'
    },
    {
      id: 3,
      name: 'Team Leadership',
      category: 'Leadership',
      proficiency: 72,
      endorsements: 15,
      status: 'Improving',
      statusColor: 'text-yellow-600',
      statusBg: 'bg-yellow-100',
      lastUpdated: '2024-02-09'
    },
    {
      id: 4,
      name: 'Public Speaking',
      category: 'Communication',
      proficiency: 68,
      endorsements: 12,
      status: 'Improving',
      statusColor: 'text-yellow-600',
      statusBg: 'bg-yellow-100',
      lastUpdated: '2024-02-08'
    },
    {
      id: 5,
      name: 'Data Analysis',
      category: 'Technical',
      proficiency: 81,
      endorsements: 20,
      status: 'Stable',
      statusColor: 'text-amber-600',
      statusBg: 'bg-amber-100',
      lastUpdated: '2024-02-12'
    },
    {
      id: 6,
      name: 'JavaScript',
      category: 'Technical',
      proficiency: 88,
      endorsements: 25,
      status: 'Expert',
      statusColor: 'text-blue-600',
      statusBg: 'bg-blue-100',
      lastUpdated: '2024-02-12'
    }
  ];

  const reports = [
    {
      id: 1,
      title: 'Monthly Academic Report',
      description: 'Comprehensive academic performance analysis for February 2024',
      month: 'February 2024',
      generated: '2024-02-12',
      icon: '📊',
      color: 'from-blue-100 to-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 2,
      title: 'Placement Readiness Report',
      description: 'Your progress towards placement readiness',
      month: 'February 2024',
      generated: '2024-02-12',
      icon: '💼',
      color: 'from-pink-100 to-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 3,
      title: 'Skills Development Report',
      description: 'Analysis of your skill development journey',
      month: 'February 2024',
      generated: '2024-02-12',
      icon: '🎯',
      color: 'from-green-100 to-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const keyInsights = [
    {
      icon: TrendingUp,
      title: 'Performance Trend',
      description: 'Your academic performance is trending upward with a 5% improvement this month.',
      cta: 'View Details'
    },
    {
      icon: Zap,
      title: 'Skill Development',
      description: 'You\'ve improved 3 skills this month. Keep up the great work!',
      cta: 'Track Skills'
    },
    {
      icon: Target,
      title: 'Goal Progress',
      description: 'You\'re on track with most of your goals. 1 goal needs attention.',
      cta: 'View Goals'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700 mb-4 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '50ms' }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div
            className={`flex items-center gap-4 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-blue-100 text-blue-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Analytics & Insights</h1>
              <p className="mt-1 text-lg text-slate-600">Track your performance, progress, and achieve your goals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div
            className={`grid gap-4 md:grid-cols-5 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {overviewMetrics.map((metric, idx) => (
              <div
                key={idx}
                className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${metric.bg} p-6 shadow-sm transition duration-300 hover:shadow-md hover:scale-105 transform`}
                style={{ transitionDelay: `${100 + idx * 50}ms` }}
              >
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{metric.label}</p>
                <p className={`mt-3 text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                {metric.label === 'Overall Score' && <p className="text-xs text-slate-500 mt-1">out of 100</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Tab Navigation */}
        <div
          className={`mb-8 border-b border-slate-200 overflow-x-auto transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          <div className="flex gap-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 text-sm font-semibold transition relative flex-shrink-0 ${
                    activeTab === tab.id ? 'text-sky-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  <span className="text-xs font-bold text-slate-500 ml-1">{tab.count}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Academic Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-slate-900" />
                <h2 className="text-xl font-bold text-slate-900">Academic</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Academic Performance */}
                <div
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '250ms' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Academic Performance</p>
                      <p className="text-xs text-slate-500 mt-1">Target: 9 GPA</p>
                    </div>
                    <span className="text-2xl">📚</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-slate-900">8.5 <span className="text-lg text-slate-500">GPA</span></p>
                    <p className="text-sm text-green-600 font-semibold mt-1">↑ +5%</p>
                  </div>
                  <div className="mb-3">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: '94%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">94% of target</p>
                  </div>
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                    On Track
                  </span>
                </div>

                {/* Assignments Completed */}
                <div
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '300ms' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Assignments Completed</p>
                      <p className="text-xs text-slate-500 mt-1">Target: 40 submitted</p>
                    </div>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-slate-900">34 <span className="text-lg text-slate-500">submitted</span></p>
                    <p className="text-sm text-green-600 font-semibold mt-1">↑ +7%</p>
                  </div>
                  <div className="mb-3">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">85% of target</p>
                  </div>
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Needs Work
                  </span>
                </div>
              </div>
            </div>

            {/* Placement Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">💼</span>
                <h2 className="text-xl font-bold text-slate-900">Placement</h2>
              </div>
              <div
                className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform md:w-1/2 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '350ms' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Placement Readiness</p>
                    <p className="text-xs text-slate-500 mt-1">Target: 90%</p>
                  </div>
                  <span className="text-2xl">💼</span>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-slate-900">78 <span className="text-lg text-slate-500">%</span></p>
                  <p className="text-sm text-green-600 font-semibold mt-1">↑ +12%</p>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                      style={{ width: '87%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">87% of target</p>
                </div>
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Needs Work
                </span>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">🎯</span>
                <h2 className="text-xl font-bold text-slate-900">Skills</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Skills Mastered */}
                <div
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Skills Mastered</p>
                      <p className="text-xs text-slate-500 mt-1">Target: 20 skills</p>
                    </div>
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-slate-900">12 <span className="text-lg text-slate-500">skills</span></p>
                    <p className="text-sm text-green-600 font-semibold mt-1">↑ +8%</p>
                  </div>
                  <div className="mb-3">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">60% of target</p>
                  </div>
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Needs Work
                  </span>
                </div>

                {/* Certifications Earned */}
                <div
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: '450ms' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-600">Certifications Earned</p>
                      <p className="text-xs text-slate-500 mt-1">Target: 5 certs</p>
                    </div>
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-slate-900">3 <span className="text-lg text-slate-500">certs</span></p>
                    <p className="text-sm text-slate-500 font-semibold mt-1">− 0%</p>
                  </div>
                  <div className="mb-3">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">60% of target</p>
                  </div>
                  <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Needs Work
                  </span>
                </div>
              </div>
            </div>

            {/* Activities Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">⏱️</span>
                <h2 className="text-xl font-bold text-slate-900">Activities</h2>
              </div>
              <div
                className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform md:w-1/2 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '500ms' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Learning Hours</p>
                    <p className="text-xs text-slate-500 mt-1">Target: 200 hours</p>
                  </div>
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-slate-900">145 <span className="text-lg text-slate-500">hours</span></p>
                  <p className="text-sm text-green-600 font-semibold mt-1">↑ +2%</p>
                </div>
                <div className="mb-3">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                      style={{ width: '73%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">73% of target</p>
                </div>
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Needs Work
                </span>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mb-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={20} />
                Key Insights
              </h2>

              <div className="grid gap-6 md:grid-cols-3">
                {keyInsights.map((insight, idx) => {
                  const Icon = insight.icon;
                  return (
                    <div
                      key={idx}
                      className={`rounded-[16px] border border-slate-200 bg-gradient-to-br from-purple-100 to-purple-50 p-6 shadow-sm transition duration-300 hover:shadow-md hover:-translate-y-1 transform ${
                        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${550 + idx * 50}ms` }}
                    >
                      <Icon className="text-purple-600 mb-4" size={28} />
                      <h3 className="font-bold text-slate-900">{insight.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{insight.description}</p>
                      <button className="mt-4 text-sm font-semibold text-sky-600 hover:text-sky-700 transition">
                        {insight.cta} →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Skills Summary */}
            <div className="grid gap-4 md:grid-cols-4 mb-12">
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 uppercase">Total Skills</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">6</p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 uppercase">Average Proficiency</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">79%</p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 uppercase">Expert Level (80%+)</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">3</p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-slate-600 uppercase">Total Endorsements</p>
                <p className="mt-3 text-3xl font-bold text-purple-600">141</p>
              </div>
            </div>

            {/* Skills Cards */}
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Skills Summary</h2>
            <div className="space-y-4">
              {skills.map((skill, idx) => (
                <div
                  key={skill.id}
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${250 + idx * 40}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{skill.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{skill.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{skill.proficiency}%</p>
                      <span className={`text-xs font-semibold ${skill.statusColor} ${skill.statusBg} px-2 py-1 rounded-full`}>
                        {skill.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                      style={{ width: `${skill.proficiency}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Beginner</span>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{skill.endorsements} Endorsements</span>
                    </div>
                    <span>Expert</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Last updated: {skill.lastUpdated}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals & Activity Tab */}
        {activeTab === 'goals' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Active Goals</h2>
            <div className="space-y-6">
              {goals.map((goal, idx) => (
                <div
                  key={goal.id}
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transform transition duration-300 ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${250 + idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{goal.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                      goal.status === 'On Track'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {goal.status === 'On Track' ? '✓' : '⚠'} {goal.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-600">Progress</span>
                      <span className={`text-sm font-bold ${goal.progress >= 75 ? 'text-green-600' : 'text-blue-600'}`}>
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Started: {goal.startDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Target: {goal.targetDate}
                    </span>
                  </div>

                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                  >
                    <p className="font-semibold text-slate-900 text-sm mb-3">Milestones</p>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            readOnly
                            className="w-4 h-4 rounded border-slate-300"
                          />
                          <span className={`text-sm ${milestone.completed ? 'line-through text-slate-400' : 'text-slate-600'}`}>
                            {milestone.name}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">{milestone.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Analytics Reports</h2>
            <p className="text-slate-600 mb-6">Comprehensive analysis of your performance and progress</p>

            <div className="space-y-4">
              {reports.map((report, idx) => (
                <div
                  key={report.id}
                  className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${report.color} p-6 shadow-sm hover:shadow-md hover:scale-102 transition duration-300 cursor-pointer transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${250 + idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{report.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{report.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {report.month}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            Generated: {report.generated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={20} className="text-slate-600 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Time Period Toggles */}
            <div
              className={`mb-8 flex gap-3 transform transition duration-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '250ms' }}
            >
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-6 py-2.5 rounded-full font-semibold transition text-sm ${
                    chartPeriod === period
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-8 mb-12">
              {/* Academic Performance Trend */}
              <div
                className={`rounded-[16px] border border-slate-200 bg-white p-8 shadow-sm transform transition duration-300 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '300ms' }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-blue-100">
                    <BarChart3 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Academic Performance Trend</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Last Month</p>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="flex gap-4 items-end justify-center h-48 mb-8 px-4">
                  {[65, 70, 75, 83].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-xl transition-all duration-700 hover:opacity-90"
                        style={{ height: `${(val / 100) * 150}px` }}
                      ></div>
                      <span className="text-xs font-medium text-slate-600">Week {i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">8.2</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Maximum</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">8.5</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Minimum</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">8.0</p>
                  </div>
                </div>
              </div>

              {/* Time Investment by Category */}
              <div
                className={`rounded-[16px] border border-slate-200 bg-white p-8 shadow-sm transform transition duration-300 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '350ms' }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-blue-100">
                    <PieChart size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Time Investment by Category</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Last Month</p>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="grid gap-12 md:grid-cols-2 items-center">
                  <div className="flex justify-center">
                    <div className="relative w-56 h-56">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e7ff" strokeWidth="12" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="12"
                          strokeDasharray="100 250"
                          className="transition-all duration-1000"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="12"
                          strokeDasharray="75 250"
                          strokeDashoffset="-100"
                          className="transition-all duration-1000"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#ec4899"
                          strokeWidth="12"
                          strokeDasharray="50 250"
                          strokeDashoffset="-175"
                          className="transition-all duration-1000"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="12"
                          strokeDasharray="25 250"
                          strokeDashoffset="-225"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-slate-900">100</p>
                          <p className="text-xs text-slate-500 mt-1">hours/month</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="space-y-4">
                    {[
                      { color: 'bg-blue-500', label: 'Academics', percent: '40%' },
                      { color: 'bg-purple-500', label: 'Placements', percent: '30%' },
                      { color: 'bg-pink-500', label: 'Skills', percent: '20%' },
                      { color: 'bg-teal-500', label: 'Social', percent: '10%' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 transform transition duration-300 ${
                          mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}
                        style={{ transitionDelay: `${400 + idx * 50}ms` }}
                      >
                        <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium text-slate-700">{item.label}:</span>
                        <span className="text-sm font-bold text-slate-900">{item.percent}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">25.0</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Maximum</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">40</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Minimum</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">10</p>
                  </div>
                </div>
              </div>

              {/* Placement Readiness Score */}
              <div
                className={`rounded-[16px] border border-slate-200 bg-white p-8 shadow-sm transform transition duration-300 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '400ms' }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-blue-100">
                      <Clock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Placement Readiness Score</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Last Month</p>
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                    78.0
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="flex gap-4 items-end justify-center h-48 mb-8 px-4">
                  {[70, 75, 80, 85].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-xl transition-all duration-700 hover:opacity-90"
                        style={{ height: `${(val / 100) * 150}px` }}
                      ></div>
                      <span className="text-xs font-medium text-slate-600">Week {i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">71.3</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Maximum</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">78</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Minimum</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">65</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 rounded-[16px] border border-slate-200 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-12 text-center shadow-sm transform transition duration-500" style={{ transitionDelay: '400ms' }}>
          <TrendingUp className="mx-auto mb-4 text-sky-600" size={40} />
          <h2 className="text-3xl font-bold text-slate-900">Optimize Your Growth</h2>
          <p className="mt-2 text-slate-600 max-w-2xl mx-auto">
            Use these analytics to identify areas for improvement and track your progress toward your goals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button className="rounded-full bg-sky-600 px-8 py-3 font-semibold text-white transition hover:bg-sky-700 flex items-center gap-2">
              <TrendingUp size={18} />
              View Full Analytics
            </button>
            <button className="rounded-full border-2 border-sky-600 px-8 py-3 font-semibold text-sky-600 transition hover:bg-sky-50 flex items-center gap-2">
              <Download size={18} />
              Generate Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
