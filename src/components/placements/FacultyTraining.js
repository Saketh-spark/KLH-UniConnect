import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, Clock, Plus, Edit, Trash2, Eye,
  Loader2, Target, TrendingUp, CheckCircle, X, BarChart3,
  FileText, Download, UserCheck, AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyTraining = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('programs');
  const [trainings, setTrainings] = useState([]);
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  const [newTraining, setNewTraining] = useState({
    title: '',
    type: 'Technical',
    description: '',
    startDate: '',
    endDate: '',
    sessions: 10,
    capacity: 60,
    trainer: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data
      setTrainings([
        { 
          id: '1', 
          title: 'Aptitude Training - Batch A', 
          type: 'Aptitude', 
          trainer: 'Mr. Suresh Reddy',
          startDate: '2026-01-10', 
          endDate: '2026-02-28',
          sessions: 12, 
          completedSessions: 9,
          enrolled: 58, 
          capacity: 60,
          avgAttendance: 85,
          status: 'active'
        },
        { 
          id: '2', 
          title: 'DSA Bootcamp', 
          type: 'Technical',
          trainer: 'Dr. Anil Kumar',
          startDate: '2026-01-15', 
          endDate: '2026-03-15',
          sessions: 20, 
          completedSessions: 8,
          enrolled: 45, 
          capacity: 50,
          avgAttendance: 78,
          status: 'active'
        },
        { 
          id: '3', 
          title: 'Communication Skills', 
          type: 'Soft Skills',
          trainer: 'Ms. Priya Singh',
          startDate: '2025-12-01', 
          endDate: '2026-01-15',
          sessions: 6, 
          completedSessions: 6,
          enrolled: 50, 
          capacity: 50,
          avgAttendance: 92,
          status: 'completed'
        }
      ]);

      setSkillAnalysis({
        overall: 68,
        aptitude: 72,
        technical: 65,
        softSkills: 78,
        lowPerformers: 45,
        highPerformers: 120,
        needsImprovement: ['Logical Reasoning', 'Data Structures', 'Time Management']
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTraining = () => {
    // API call to create training
    setShowCreateModal(false);
    setNewTraining({
      title: '',
      type: 'Technical',
      description: '',
      startDate: '',
      endDate: '',
      sessions: 10,
      capacity: 60,
      trainer: ''
    });
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
      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Programs</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">
            {trainings.filter(t => t.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Total Enrolled</p>
          <p className="mt-1 text-3xl font-bold text-green-700">
            {trainings.reduce((acc, t) => acc + t.enrolled, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Avg Attendance</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">
            {Math.round(trainings.reduce((acc, t) => acc + t.avgAttendance, 0) / trainings.length)}%
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Skill Readiness</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{skillAnalysis?.overall}%</p>
        </div>
      </div>

      {/* Skill Gap Analysis Banner */}
      <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-red-900">Skill Gap Analysis</h3>
            <p className="text-sm text-red-700 mt-1">
              {skillAnalysis?.lowPerformers} students need improvement in these areas:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {skillAnalysis?.needsImprovement.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">
            Create Remedial Program
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'programs', label: 'Training Programs', icon: BookOpen },
          { id: 'analysis', label: 'Skill Analysis', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: FileText }
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
      {activeTab === 'programs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">All Training Programs</h3>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Program
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Program</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Trainer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Sessions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Enrolled</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Attendance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainings.map(training => (
                  <tr key={training.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{training.title}</p>
                        <p className="text-xs text-slate-500">{training.type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{training.trainer}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {training.completedSessions}/{training.sessions}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {training.enrolled}/{training.capacity}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        training.avgAttendance >= 80 ? 'bg-green-100 text-green-700' :
                        training.avgAttendance >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {training.avgAttendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        training.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {training.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedTraining(training); setShowAttendanceModal(true); }}
                          className="p-2 rounded-lg hover:bg-slate-100" title="View Attendance"
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100" title="Edit">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Skill Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Aptitude</p>
                  <p className="text-3xl font-bold text-purple-600">{skillAnalysis?.aptitude}%</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center">
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${skillAnalysis?.aptitude}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Technical</p>
                  <p className="text-3xl font-bold text-blue-600">{skillAnalysis?.technical}%</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${skillAnalysis?.technical}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Soft Skills</p>
                  <p className="text-3xl font-bold text-green-600">{skillAnalysis?.softSkills}%</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${skillAnalysis?.softSkills}%` }} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-green-200 bg-green-50 p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">High Performers</p>
                  <p className="text-3xl font-bold text-green-700">{skillAnalysis?.highPerformers}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-green-600">Students with skill score above 80%</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">Needs Improvement</p>
                  <p className="text-3xl font-bold text-red-700">{skillAnalysis?.lowPerformers}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-red-600">Students with skill score below 50%</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Training Progress Report</h3>
                  <p className="text-sm text-slate-500">All training programs with attendance</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Skill Assessment Report</h3>
                  <p className="text-sm text-slate-500">Student-wise skill scores</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-purple-600 text-sm font-semibold hover:text-purple-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Attendance Report</h3>
                  <p className="text-sm text-slate-500">Session-wise attendance data</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold hover:text-green-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Certificate Report</h3>
                  <p className="text-sm text-slate-500">Certificates issued to students</p>
                </div>
              </div>
              <button className="mt-4 flex items-center gap-2 text-amber-600 text-sm font-semibold hover:text-amber-700">
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Training Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-slate-900">Create Training Program</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newTraining.title}
                  onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Aptitude Training - Batch B"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                  <select
                    value={newTraining.type}
                    onChange={(e) => setNewTraining({ ...newTraining, type: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Trainer</label>
                  <input
                    type="text"
                    value={newTraining.trainer}
                    onChange={(e) => setNewTraining({ ...newTraining, trainer: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Trainer name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={newTraining.description}
                  onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Program description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTraining.startDate}
                    onChange={(e) => setNewTraining({ ...newTraining, startDate: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newTraining.endDate}
                    onChange={(e) => setNewTraining({ ...newTraining, endDate: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sessions</label>
                  <input
                    type="number"
                    value={newTraining.sessions}
                    onChange={(e) => setNewTraining({ ...newTraining, sessions: parseInt(e.target.value) })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={newTraining.capacity}
                    onChange={(e) => setNewTraining({ ...newTraining, capacity: parseInt(e.target.value) })}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTraining}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Create Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-slate-900">{selectedTraining.title} - Attendance</h2>
              <button onClick={() => setShowAttendanceModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600">Total Enrolled</p>
                  <p className="text-2xl font-bold text-blue-700">{selectedTraining.enrolled}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600">Avg Attendance</p>
                  <p className="text-2xl font-bold text-green-700">{selectedTraining.avgAttendance}%</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-600">Sessions Done</p>
                  <p className="text-2xl font-bold text-purple-700">{selectedTraining.completedSessions}/{selectedTraining.sessions}</p>
                </div>
              </div>
              <p className="text-center text-slate-500 py-8">Session-wise attendance data will be displayed here</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyTraining;
