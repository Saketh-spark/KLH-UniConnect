import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  Users,
  BarChart3,
  AlertCircle,
  Plus,
  Download,
  Filter,
  Search,
  Clipboard
} from 'lucide-react';
import FacultyNotesAndMaterials from './FacultyNotesAndMaterials.js';
import FacultyAssignments from './FacultyAssignments.js';
import FacultyAttendance from './FacultyAttendance.js';
import FacultyGrades from './FacultyGrades.js';
import FacultyTestExam from './FacultyTestExam.js';

const FacultyAcademics = ({ email = '', onBack = () => {} }) => {
  const [activeTab, setActiveTab] = useState('notes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Sample data for dashboard widgets
  const academicsStats = {
    subjectsHandling: 4,
    totalStudents: 245,
    pendingAssignmentsReview: 28,
    studentsLowAttendance: 12,
    averageClassPerformance: 75.4
  };

  const subjects = [
    { id: 1, name: 'Mathematical Optimization', section: 'A', batch: '2024', semester: '6' },
    { id: 2, name: 'Machine Learning', section: 'A', batch: '2024', semester: '6' },
    { id: 3, name: 'Design and Analysis of Algorithms', section: 'A', batch: '2024', semester: '6' },
    { id: 4, name: 'Cloud Infrastructure and Services', section: 'A', batch: '2024', semester: '6' },
    { id: 5, name: 'Foundations of AI-Enabled Edge Computing', section: 'A', batch: '2024', semester: '6' },
    { id: 6, name: 'Full Stack Application Development', section: 'A', batch: '2024', semester: '6' },
    { id: 7, name: 'Computer Networks', section: 'A', batch: '2024', semester: '6' }
  ];

  const tabs = [
    { id: 'notes', label: 'Notes & Materials', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <CheckSquare className="h-5 w-5" /> },
    { id: 'tests', label: 'Tests & Exams', icon: <Clipboard className="h-5 w-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <Users className="h-5 w-5" /> },
    { id: 'grades', label: 'Grades', icon: <BarChart3 className="h-5 w-5" /> }
  ];

  const renderContent = () => {
    const props = { email, onBack, selectedSubject, setSelectedSubject, searchTerm, setSearchTerm };
    
    switch (activeTab) {
      case 'notes':
        return <FacultyNotesAndMaterials {...props} />;
      case 'assignments':
        return <FacultyAssignments {...props} />;
      case 'tests':
        return <FacultyTestExam {...props} />;
      case 'attendance':
        return <FacultyAttendance {...props} />;
      case 'grades':
        return <FacultyGrades {...props} />;
      default:
        return <FacultyNotesAndMaterials {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-slate-900">Academics Management</h1>
          <p className="mt-0.5 text-sm text-slate-500">Create materials, assign work, track attendance & grades</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Dashboard Widgets */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Subjects</p>
                <p className="mt-2 text-3xl font-black text-blue-600">{academicsStats.subjectsHandling}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Students</p>
                <p className="mt-2 text-3xl font-black text-green-600">{academicsStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Pending Reviews</p>
                <p className="mt-2 text-3xl font-black text-orange-600">{academicsStats.pendingAssignmentsReview}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-orange-200" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Low Attendance</p>
                <p className="mt-2 text-3xl font-black text-red-600">{academicsStats.studentsLowAttendance}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Avg Performance</p>
                <p className="mt-2 text-3xl font-black text-purple-600">{academicsStats.averageClassPerformance}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.section})
                </option>
              ))}
            </select>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Create New
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FacultyAcademics;
