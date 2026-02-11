import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Lock, Eye, Clock, Users, DollarSign, Briefcase, Loader2, MapPin, Building2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyJobPostings = ({ searchTerm, email }) => {
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    salary: '',
    deadline: '',
    minCGPA: 6.0,
    branch: [],
    skills: '',
    maxBacklogs: 0,
    visibility: 'All Students',
    description: '',
    location: '',
    type: 'Full-time',
    experience: 'Fresher'
  });

  // Fetch jobs from backend
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobPostings(data);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosting = async () => {
    if (!formData.company || !formData.position || !formData.deadline) {
      alert('Please fill in company, position, and deadline');
      return;
    }

    setSaving(true);
    try {
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        createdBy: email
      };

      const response = await fetch(`${API_BASE}/api/placements/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobPostings([newJob, ...jobPostings]);
        setFormData({
          company: '',
          position: '',
          salary: '',
          deadline: '',
          minCGPA: 6.0,
          branch: [],
          skills: '',
          maxBacklogs: 0,
          visibility: 'All Students',
          description: '',
          location: '',
          type: 'Full-time',
          experience: 'Fresher'
        });
        setShowCreateModal(false);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to create job posting');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      alert('Failed to create job posting');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePosting = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/placements/jobs/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setJobPostings(jobPostings.filter(j => j.id !== id));
      } else {
        alert('Failed to delete job posting');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job posting');
    }
  };

  const handleClosePosting = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/jobs/${id}/close`, {
        method: 'POST'
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobPostings(jobPostings.map(j => j.id === id ? updatedJob : j));
      } else {
        alert('Failed to close job posting');
      }
    } catch (err) {
      console.error('Error closing job:', err);
      alert('Failed to close job posting');
    }
  };

  const filteredPostings = jobPostings.filter(job =>
    (job.company?.toLowerCase() || '').includes((searchTerm || '').toLowerCase()) ||
    (job.position?.toLowerCase() || '').includes((searchTerm || '').toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading job postings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Posting */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New Posting
        </button>

        {showCreateModal && (
          <div className="mt-4 space-y-4 rounded-lg border border-blue-300 bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Company Name"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Salary (e.g., 12-16 LPA)"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Min CGPA"
                step="0.1"
                min="0"
                max="10"
                value={formData.minCGPA}
                onChange={(e) => setFormData({ ...formData, minCGPA: parseFloat(e.target.value) })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Skills (comma-separated)"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="All Students">Visible to All Students</option>
                <option value="2nd Year Students">2nd Year Students</option>
                <option value="3rd Year Students">3rd Year Students</option>
                <option value="CSE Only">CSE Only</option>
              </select>
              <input
                type="number"
                placeholder="Max Backlogs Allowed"
                min="0"
                value={formData.backlogs}
                onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreatePosting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Create Posting
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Postings List */}
      <div className="space-y-3">
        {filteredPostings.length > 0 ? (
          filteredPostings.map(job => (
            <div key={job.id} className={`rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition ${job.status === 'Closed' ? 'opacity-60 bg-slate-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg bg-slate-100 p-2">
                      <Briefcase className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{job.position}</h4>
                      <p className="text-sm text-slate-600">{job.company} • {job.visibility}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      <Clock className="h-3 w-3" />
                      Deadline: {job.deadline}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      Min CGPA: {job.minCGPA}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      <Users className="h-3 w-3" />
                      {job.applicants} Applied
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200"
                    title="View/Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                    title="Preview as Student"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {job.status === 'Active' && (
                    <button
                      onClick={() => handleClosePosting(job.id)}
                      className="rounded-lg bg-orange-100 p-2 text-orange-600 transition hover:bg-orange-200"
                      title="Close Posting"
                    >
                      <Lock className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePosting(job.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-slate-600">No job postings found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyJobPostings;
