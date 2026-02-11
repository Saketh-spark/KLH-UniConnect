import React, { useState } from 'react';
import { FileText, Check, AlertCircle, MessageSquare, Eye, Download, Star } from 'lucide-react';

const FacultyResumeReview = ({ searchTerm }) => {
  const [resumes, setResumes] = useState([
    {
      id: 1,
      studentName: 'Aman Kumar',
      studentId: 'AMK001',
      branch: 'CSE',
      cgpa: 8.2,
      resumeScore: 8.5,
      status: 'Approved',
      missingItems: [],
      feedback: 'Well-structured resume. Good project descriptions.',
      uploadDate: '2024-01-03'
    },
    {
      id: 2,
      studentName: 'Priya Singh',
      studentId: 'PRI002',
      branch: 'ECE',
      cgpa: 7.9,
      resumeScore: 7.8,
      status: 'Needs Improvement',
      missingItems: ['Projects', 'Certifications'],
      feedback: 'Add more project details and include relevant certifications.',
      uploadDate: '2024-01-02'
    },
    {
      id: 3,
      studentName: 'Rajesh Patel',
      studentId: 'RAJ003',
      branch: 'CSE',
      cgpa: 8.6,
      resumeScore: 8.9,
      status: 'Approved',
      missingItems: [],
      feedback: 'Excellent resume with strong internship experiences.',
      uploadDate: '2024-01-01'
    },
    {
      id: 4,
      studentName: 'Sneha Sharma',
      studentId: 'SNE004',
      branch: 'IT',
      cgpa: 6.8,
      resumeScore: 6.5,
      status: 'Pending',
      missingItems: ['Internships', 'Skills', 'Projects'],
      feedback: 'Resume needs significant improvement. Missing key sections.',
      uploadDate: '2023-12-31'
    }
  ]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statuses = ['all', 'Approved', 'Pending', 'Needs Improvement'];

  const handleApproveResume = (id) => {
    setResumes(resumes.map(r =>
      r.id === id ? { ...r, status: 'Approved' } : r
    ));
  };

  const handleUpdateStatus = (id, status) => {
    setResumes(resumes.map(r =>
      r.id === id ? { ...r, status } : r
    ));
  };

  const filteredResumes = resumes
    .filter(r => selectedStatus === 'all' || r.status === selectedStatus)
    .filter(r => r.studentName.toLowerCase().includes(searchTerm.toLowerCase()));

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-orange-100 text-orange-700';
      case 'Needs Improvement':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-3">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:border-slate-400'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Resumes List */}
      <div className="space-y-4">
        {filteredResumes.length > 0 ? (
          filteredResumes.map(resume => (
            <div key={resume.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{resume.studentName}</h4>
                      <p className="text-xs text-slate-600">{resume.studentId} • {resume.branch} • CGPA: {resume.cgpa}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(resume.status)}`}>
                      {resume.status === 'Approved' && <Check className="h-3 w-3" />}
                      {resume.status === 'Needs Improvement' && <AlertCircle className="h-3 w-3" />}
                      {resume.status}
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      <Star className="h-3 w-3 inline mr-1" />
                      Score: {resume.resumeScore}/10
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {resume.uploadDate}
                    </span>
                  </div>

                  {resume.missingItems.length > 0 && (
                    <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3">
                      <p className="text-xs font-semibold text-orange-700 uppercase">Missing Items:</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {resume.missingItems.map((item, idx) => (
                          <span key={idx} className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.feedback && (
                    <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
                      <p className="text-xs font-semibold text-slate-600 uppercase">Faculty Feedback</p>
                      <p className="mt-1 text-sm text-slate-700">{resume.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                    title="View Resume"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedResume(resume);
                      setFeedbackText(resume.feedback);
                      setShowFeedbackModal(true);
                    }}
                    className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                    title="Add/Edit Feedback"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  {resume.status !== 'Approved' && (
                    <button
                      onClick={() => handleApproveResume(resume.id)}
                      className="rounded-lg bg-green-100 p-2 text-green-600 transition hover:bg-green-200"
                      title="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No resumes found.</p>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Resume Feedback for {selectedResume.studentName}</h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter feedback..."
              className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows="4"
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedResume(null);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Save Feedback
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedResume(null);
                }}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyResumeReview;
