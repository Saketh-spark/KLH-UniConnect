import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, XCircle, AlertCircle, Search, Filter, Eye, Edit2,
  FileText, Loader2, ChevronDown, ChevronRight, Mail, Phone, GraduationCap,
  Code, Award, Clock, Check, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyProfilesEligibility = ({ email, searchTerm }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [eligibilityRules, setEligibilityRules] = useState({
    minCGPA: 6.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']
  });
  const [pendingResumes, setPendingResumes] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchEligibilityRules();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Mock data for demo
      setStudents([
        { id: '1', fullName: 'Rahul Kumar', rollNumber: '2021CSE001', branch: 'CSE', cgpa: 8.5, backlogs: 0, profileStatus: 'pending', resumeStatus: 'pending', skills: ['Java', 'Python', 'React'] },
        { id: '2', fullName: 'Priya Singh', rollNumber: '2021ECE012', branch: 'ECE', cgpa: 7.8, backlogs: 1, profileStatus: 'approved', resumeStatus: 'approved', skills: ['VLSI', 'Embedded', 'C++'] },
        { id: '3', fullName: 'Amit Patel', rollNumber: '2021CSE045', branch: 'CSE', cgpa: 5.5, backlogs: 3, profileStatus: 'submitted', resumeStatus: 'pending', skills: ['HTML', 'CSS'] },
        { id: '4', fullName: 'Sneha Sharma', rollNumber: '2021MECH008', branch: 'MECH', cgpa: 7.2, backlogs: 0, profileStatus: 'approved', resumeStatus: 'approved', skills: ['AutoCAD', 'SolidWorks'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEligibilityRules = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/eligibility/rules`);
      if (response.ok) {
        const data = await response.json();
        setEligibilityRules(data);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const checkEligibility = (student) => {
    if (student.cgpa < eligibilityRules.minCGPA) return { eligible: false, reason: 'Low CGPA' };
    if (student.backlogs > eligibilityRules.maxBacklogs) return { eligible: false, reason: 'Backlogs exceed limit' };
    if (!eligibilityRules.allowedBranches.includes(student.branch)) return { eligible: false, reason: 'Branch not eligible' };
    if (student.profileStatus !== 'approved') return { eligible: false, reason: 'Profile not verified' };
    return { eligible: true, reason: 'All criteria met' };
  };

  const handleApproveProfile = async (studentId) => {
    try {
      await fetch(`${API_BASE}/api/students/${studentId}/approve`, { method: 'POST' });
      setStudents(students.map(s => s.id === studentId ? { ...s, profileStatus: 'approved' } : s));
    } catch (error) {
      console.error('Error approving profile:', error);
    }
  };

  const handleRejectProfile = async (studentId) => {
    try {
      await fetch(`${API_BASE}/api/students/${studentId}/reject`, { method: 'POST' });
      setStudents(students.map(s => s.id === studentId ? { ...s, profileStatus: 'rejected' } : s));
    } catch (error) {
      console.error('Error rejecting profile:', error);
    }
  };

  const handleSaveRules = async () => {
    try {
      await fetch(`${API_BASE}/api/placements/eligibility/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eligibilityRules)
      });
      setShowRulesModal(false);
      alert('Eligibility rules updated!');
    } catch (error) {
      console.error('Error saving rules:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         student.rollNumber?.toLowerCase().includes((searchTerm || '').toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'eligible') return matchesSearch && checkEligibility(student).eligible;
    if (filter === 'ineligible') return matchesSearch && !checkEligibility(student).eligible;
    if (filter === 'pending') return matchesSearch && student.profileStatus === 'submitted';
    if (filter === 'approved') return matchesSearch && student.profileStatus === 'approved';
    return matchesSearch;
  });

  const stats = {
    total: students.length,
    eligible: students.filter(s => checkEligibility(s).eligible).length,
    pendingReview: students.filter(s => s.profileStatus === 'submitted').length,
    pendingResumes: students.filter(s => s.resumeStatus === 'pending').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Students</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Eligible</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{stats.eligible}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Pending Review</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{stats.pendingReview}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Resumes Pending</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{stats.pendingResumes}</p>
        </div>
      </div>

      {/* Eligibility Rules Card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-blue-900">Current Eligibility Rules</h3>
            <p className="text-sm text-blue-600 mt-1">
              Min CGPA: {eligibilityRules.minCGPA} | Max Backlogs: {eligibilityRules.maxBacklogs} | 
              Branches: {eligibilityRules.allowedBranches.join(', ')}
            </p>
          </div>
          <button
            onClick={() => setShowRulesModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <Edit2 className="h-4 w-4 inline mr-2" />
            Edit Rules
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {['all', 'eligible', 'ineligible', 'pending', 'approved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? 'All Students' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Students Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Branch</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">CGPA</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Backlogs</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Eligibility</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Profile</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Resume</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(student => {
                const eligibility = checkEligibility(student);
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{student.fullName}</p>
                        <p className="text-sm text-slate-500">{student.rollNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{student.branch}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${student.cgpa >= eligibilityRules.minCGPA ? 'text-green-600' : 'text-red-600'}`}>
                        {student.cgpa}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${student.backlogs <= eligibilityRules.maxBacklogs ? 'text-green-600' : 'text-red-600'}`}>
                        {student.backlogs}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        eligibility.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {eligibility.eligible ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.profileStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        student.profileStatus === 'submitted' ? 'bg-amber-100 text-amber-700' :
                        student.profileStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {student.profileStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.resumeStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        student.resumeStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {student.resumeStatus || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-2 rounded-lg hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </button>
                        {student.profileStatus === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApproveProfile(student.id)}
                              className="p-2 rounded-lg hover:bg-green-100"
                              title="Approve"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleRejectProfile(student.id)}
                              className="p-2 rounded-lg hover:bg-red-100"
                              title="Reject"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Eligibility Rules</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Minimum CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={eligibilityRules.minCGPA}
                  onChange={(e) => setEligibilityRules(prev => ({ ...prev, minCGPA: parseFloat(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Maximum Backlogs Allowed</label>
                <input
                  type="number"
                  value={eligibilityRules.maxBacklogs}
                  onChange={(e) => setEligibilityRules(prev => ({ ...prev, maxBacklogs: parseInt(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Allowed Branches (comma-separated)</label>
                <input
                  type="text"
                  value={eligibilityRules.allowedBranches.join(', ')}
                  onChange={(e) => setEligibilityRules(prev => ({ 
                    ...prev, 
                    allowedBranches: e.target.value.split(',').map(b => b.trim()).filter(b => b)
                  }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRules}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Save Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">{selectedStudent.fullName}</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <p><span className="font-medium">Roll Number:</span> {selectedStudent.rollNumber}</p>
                <p><span className="font-medium">Branch:</span> {selectedStudent.branch}</p>
                <p><span className="font-medium">CGPA:</span> {selectedStudent.cgpa}</p>
                <p><span className="font-medium">Backlogs:</span> {selectedStudent.backlogs}</p>
              </div>
              <div>
                <p className="font-medium mb-2">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills?.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {selectedStudent.profileStatus === 'submitted' && (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => { handleRejectProfile(selectedStudent.id); setSelectedStudent(null); }}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Reject Profile
                </button>
                <button
                  onClick={() => { handleApproveProfile(selectedStudent.id); setSelectedStudent(null); }}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                >
                  Approve Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyProfilesEligibility;
