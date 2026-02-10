import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Loader2,
  RefreshCw,
  X,
  Download,
  FileText,
  User,
  Send,
  Star
} from 'lucide-react';

const API_BASE = 'http://localhost:8085/api/assignments';

const FacultyAssignments = ({ selectedSubject, setSelectedSubject, searchTerm }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
  const [grading, setGrading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: selectedSubject !== 'all' ? selectedSubject : '',
    unit: '',
    dueDate: '',
    dueTime: '23:59',
    type: 'File Upload',
    description: '',
    totalMarks: 100,
    totalStudents: 45
  });

  // Get faculty info from localStorage
  const getFacultyId = () => localStorage.getItem('facultyId') || 'faculty-001';
  const getFacultyName = () => localStorage.getItem('facultyName') || 'Prof. Faculty';

  // Fetch assignments from backend
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/faculty`, {
        headers: {
          'X-Faculty-Id': getFacultyId(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load assignments on mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  // Update form subject when selectedSubject changes
  useEffect(() => {
    if (selectedSubject !== 'all') {
      setFormData(prev => ({ ...prev, subject: selectedSubject }));
    }
  }, [selectedSubject]);

  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.subject || !formData.dueDate) {
      alert('Please fill in title, subject, and due date');
      return;
    }

    try {
      setCreating(true);
      
      // Combine date and time for backend
      const dueDateTime = `${formData.dueDate}T${formData.dueTime || '23:59'}`;

      const requestBody = {
        title: formData.title,
        subject: formData.subject,
        unit: formData.unit,
        description: formData.description,
        dueDate: dueDateTime,
        assignmentType: formData.type,
        totalMarks: parseInt(formData.totalMarks) || 100,
        totalStudents: parseInt(formData.totalStudents) || 45
      };

      const response = await fetch(`${API_BASE}/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Faculty-Id': getFacultyId(),
          'X-Faculty-Name': getFacultyName()
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create assignment');
      }

      const newAssignment = await response.json();
      setAssignments([newAssignment, ...assignments]);
      
      // Reset form
      setFormData({
        title: '',
        subject: selectedSubject !== 'all' ? selectedSubject : '',
        unit: '',
        dueDate: '',
        dueTime: '23:59',
        type: 'File Upload',
        description: '',
        totalMarks: 100,
        totalStudents: 45
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating assignment:', err);
      alert('Failed to create assignment: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This will also delete all submissions.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/faculty/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Faculty-Id': getFacultyId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      setAssignments(assignments.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('Failed to delete assignment: ' + err.message);
    }
  };

  // View Submissions
  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);

    try {
      const response = await fetch(`${API_BASE}/faculty/${assignment.id}/submissions`, {
        headers: {
          'X-Faculty-Id': getFacultyId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Open Feedback Modal
  const handleOpenFeedback = async (assignment) => {
    setSelectedAssignment(assignment);
    setShowFeedbackModal(true);
    setLoadingSubmissions(true);

    try {
      const response = await fetch(`${API_BASE}/faculty/${assignment.id}/submissions`, {
        headers: {
          'X-Faculty-Id': getFacultyId()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Grade Submission
  const handleGradeSubmission = async () => {
    if (!selectedSubmission || gradeData.marks === '') {
      alert('Please select a submission and enter marks');
      return;
    }

    try {
      setGrading(true);
      const response = await fetch(`${API_BASE}/faculty/submissions/${selectedSubmission.id}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Faculty-Id': getFacultyId()
        },
        body: JSON.stringify({
          marks: parseInt(gradeData.marks),
          feedback: gradeData.feedback
        })
      });

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      const updatedSubmission = await response.json();
      
      // Update submissions list
      setSubmissions(submissions.map(s => 
        s.id === updatedSubmission.id ? updatedSubmission : s
      ));
      
      // Reset
      setSelectedSubmission(null);
      setGradeData({ marks: '', feedback: '' });
      
      // Refresh assignments to update stats
      fetchAssignments();
      
      alert('Submission graded successfully!');
    } catch (err) {
      console.error('Error grading submission:', err);
      alert('Failed to grade submission: ' + err.message);
    } finally {
      setGrading(false);
    }
  };

  // Download submission file
  const handleDownloadFile = (fileUrl, fileName) => {
    if (!fileUrl) {
      alert('No file available');
      return;
    }
    
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8085${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  const filteredAssignments = assignments
    .filter(a => selectedSubject === 'all' || a.subject === selectedSubject)
    .filter(a => a.title?.toLowerCase().includes((searchTerm || '').toLowerCase()));

  const getStatusColor = (assignment) => {
    if (assignment.overdue > 0) return 'red';
    if (assignment.pending > 0) return 'orange';
    return 'green';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading assignments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">Error loading assignments</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchAssignments}
          className="mt-4 flex items-center gap-2 mx-auto rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">
          Assignments ({filteredAssignments.length})
        </h3>
        <button
          onClick={fetchAssignments}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Create Assignment */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </button>

        {showCreateModal && (
          <div className="mt-4 space-y-4 rounded-lg border border-blue-300 bg-white p-4">
            <input
              type="text"
              placeholder="Assignment Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Subject *</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Database Design">Database Design</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
            </select>
            <input
              type="text"
              placeholder="Unit / Topic"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Due Time</label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="File Upload">File Upload</option>
                <option value="MCQ">Multiple Choice</option>
                <option value="Coding">Coding Assignment</option>
                <option value="Project">Project-Based</option>
              </select>
              <div>
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Total Students"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateAssignment}
                disabled={creating}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assignments List */}
      <div className="space-y-3">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(assignment => {
            const statusColor = getStatusColor(assignment);
            const statusIcon = statusColor === 'green' ? '✓' : statusColor === 'orange' ? '⏳' : '⚠';
            
            return (
              <div key={assignment.id} className={`rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:bg-slate-50 transition ${statusColor === 'red' ? 'border-red-200 bg-red-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center rounded-lg p-2 text-xl ${statusColor === 'green' ? 'bg-green-100' : statusColor === 'orange' ? 'bg-orange-100' : 'bg-red-100'}`}>
                        {statusIcon}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{assignment.title}</h4>
                        <p className="text-xs text-slate-600">
                          {assignment.subject} • {assignment.unit || 'No unit'} • {assignment.assignmentType || assignment.type}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${assignment.isPastDue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        <Clock className="h-3 w-3" />
                        Due: {assignment.dueDate} {assignment.dueTime && `at ${assignment.dueTime}`}
                        {assignment.isPastDue && ' (Past Due)'}
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Total: {assignment.totalStudents || 0} Students
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        {assignment.submissions || 0} Submitted
                      </div>
                      {assignment.pending > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          <Clock className="h-3 w-3" />
                          {assignment.pending} Pending
                        </div>
                      )}
                      {assignment.overdue > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          <AlertCircle className="h-3 w-3" />
                          {assignment.overdue} Overdue
                        </div>
                      )}
                      <div className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        <BarChart3 className="h-3 w-3" />
                        Avg: {assignment.avgScore || 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewSubmissions(assignment)}
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                      title="Review Submissions"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenFeedback(assignment)}
                      className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                      title="Grade & Feedback"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                      title="Delete Assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No assignments found. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* View Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Submissions - {selectedAssignment.title}
              </h3>
              <button
                onClick={() => { setShowSubmissionsModal(false); setSelectedAssignment(null); setSubmissions([]); }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex gap-4 text-sm">
              <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                {selectedAssignment.submissions || 0} Submitted
              </span>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                {selectedAssignment.pending || 0} Pending
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
                {selectedAssignment.overdue || 0} Overdue
              </span>
            </div>

            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map(submission => (
                  <div key={submission.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{submission.studentName}</p>
                          <p className="text-xs text-slate-500">ID: {submission.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Submitted</p>
                          <p className="text-sm font-medium">{submission.submittedAt}</p>
                        </div>
                        {submission.status === 'Graded' && (
                          <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                            {submission.marksObtained}/{submission.totalMarks}
                          </div>
                        )}
                        {submission.fileName && (
                          <button
                            onClick={() => handleDownloadFile(submission.fileUrl, submission.fileName)}
                            className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-200"
                          >
                            <Download className="h-4 w-4" />
                            {submission.fileName}
                          </button>
                        )}
                      </div>
                    </div>
                    {submission.feedback && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-600">Feedback:</p>
                        <p className="text-sm text-slate-700">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback/Grade Modal */}
      {showFeedbackModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Grade Submissions - {selectedAssignment.title}
              </h3>
              <button
                onClick={() => { 
                  setShowFeedbackModal(false); 
                  setSelectedAssignment(null); 
                  setSubmissions([]); 
                  setSelectedSubmission(null);
                  setGradeData({ marks: '', feedback: '' });
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Submissions List */}
              <div>
                <h4 className="mb-3 font-semibold text-slate-700">Select Submission to Grade</h4>
                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-slate-600">No submissions to grade</p>
                  </div>
                ) : (
                  <div className="max-h-[400px] space-y-2 overflow-auto">
                    {submissions.map(submission => (
                      <div
                        key={submission.id}
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setGradeData({
                            marks: submission.marksObtained || '',
                            feedback: submission.feedback || ''
                          });
                        }}
                        className={`cursor-pointer rounded-lg border p-3 transition ${
                          selectedSubmission?.id === submission.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">{submission.studentName}</span>
                          </div>
                          {submission.status === 'Graded' ? (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              <Star className="h-3 w-3" />
                              {submission.marksObtained}/{submission.totalMarks}
                            </span>
                          ) : (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{submission.submittedAt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Grade Form */}
              <div>
                <h4 className="mb-3 font-semibold text-slate-700">Grade & Feedback</h4>
                {selectedSubmission ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-sm text-slate-600">Student: <strong>{selectedSubmission.studentName}</strong></p>
                      {selectedSubmission.fileName && (
                        <button
                          onClick={() => handleDownloadFile(selectedSubmission.fileUrl, selectedSubmission.fileName)}
                          className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Submission: {selectedSubmission.fileName}
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Marks (out of {selectedAssignment.totalMarks || 100})
                      </label>
                      <input
                        type="number"
                        value={gradeData.marks}
                        onChange={(e) => setGradeData({ ...gradeData, marks: e.target.value })}
                        max={selectedAssignment.totalMarks || 100}
                        min={0}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Enter marks"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Feedback
                      </label>
                      <textarea
                        value={gradeData.feedback}
                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Enter feedback for the student..."
                      />
                    </div>

                    <button
                      onClick={handleGradeSubmission}
                      disabled={grading || gradeData.marks === ''}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {grading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Save Grade & Feedback
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-600">
                      Select a submission from the list to grade
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignments;
