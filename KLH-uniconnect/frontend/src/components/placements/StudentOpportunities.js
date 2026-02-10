import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Building2, MapPin, DollarSign, Clock, Users, CheckCircle,
  Filter, Search, Calendar, AlertCircle, ChevronRight, Loader2, Star,
  BookmarkPlus, ExternalLink, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentOpportunities = ({ studentId, email }) => {
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    fetchAppliedJobs();
  }, [studentId]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/jobs/active`);
      if (response.ok) {
        const data = await response.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      // Mock data
      setOpportunities([
        { id: '1', company: 'Google', position: 'Software Engineer', location: 'Bangalore', salary: '25-35 LPA', type: 'Full-time', deadline: '2026-02-15', minCGPA: 7.0, maxBacklogs: 0, skills: ['DSA', 'System Design', 'Java/Python'], applicants: 145, status: 'Active', description: 'Join Google as a Software Engineer...' },
        { id: '2', company: 'Microsoft', position: 'Product Manager', location: 'Hyderabad', salary: '20-28 LPA', type: 'Full-time', deadline: '2026-02-20', minCGPA: 7.5, maxBacklogs: 0, skills: ['Product Strategy', 'Analytics', 'Leadership'], applicants: 89, status: 'Active' },
        { id: '3', company: 'Amazon', position: 'SDE Intern', location: 'Remote', salary: '60K/month', type: 'Internship', deadline: '2026-02-10', minCGPA: 6.5, maxBacklogs: 1, skills: ['DSA', 'OOP', 'AWS'], applicants: 234, status: 'Active' },
        { id: '4', company: 'TCS', position: 'System Engineer', location: 'Multiple', salary: '7-9 LPA', type: 'Full-time', deadline: '2026-03-01', minCGPA: 6.0, maxBacklogs: 2, skills: ['Java', 'SQL', 'Communication'], applicants: 456, status: 'Active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/applications/student/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setAppliedJobs(data.map(a => a.jobId));
      }
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const handleApply = async (job) => {
    setApplying(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          jobId: job.id,
          company: job.company,
          position: job.position
        })
      });

      if (response.ok) {
        setAppliedJobs([...appliedJobs, job.id]);
        setShowApplyModal(false);
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async (jobId) => {
    if (!window.confirm('Are you sure you want to withdraw your application?')) return;

    try {
      await fetch(`${API_BASE}/api/placements/applications/${jobId}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });
      setAppliedJobs(appliedJobs.filter(id => id !== jobId));
    } catch (error) {
      console.error('Error withdrawing:', error);
    }
  };

  const isApplied = (jobId) => appliedJobs.includes(jobId);

  const getDeadlineStatus = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: 'Expired', color: 'text-red-600 bg-red-100' };
    if (days <= 3) return { text: `${days} days left`, color: 'text-red-600 bg-red-100' };
    if (days <= 7) return { text: `${days} days left`, color: 'text-amber-600 bg-amber-100' };
    return { text: `${days} days left`, color: 'text-green-600 bg-green-100' };
  };

  const filteredOpportunities = opportunities.filter(job => {
    const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.position.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'applied') return matchesSearch && isApplied(job.id);
    if (filter === 'available') return matchesSearch && !isApplied(job.id);
    if (filter === 'internship') return matchesSearch && job.type === 'Internship';
    if (filter === 'fulltime') return matchesSearch && job.type === 'Full-time';
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading opportunities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Opportunities</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">{opportunities.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Applied</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{appliedJobs.length}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Internships</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{opportunities.filter(j => j.type === 'Internship').length}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-600">Closing Soon</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{opportunities.filter(j => {
            const days = Math.ceil((new Date(j.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            return days <= 7 && days > 0;
          }).length}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'available', 'applied', 'fulltime', 'internship'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'fulltime' ? 'Full-time' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredOpportunities.map(job => {
          const deadlineStatus = getDeadlineStatus(job.deadline);
          const applied = isApplied(job.id);

          return (
            <div
              key={job.id}
              className={`rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition cursor-pointer ${
                applied ? 'border-green-300 bg-green-50/30' : 'border-slate-200'
              }`}
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{job.position}</h3>
                    <p className="text-slate-600">{job.company}</p>
                  </div>
                </div>
                {applied && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                    <CheckCircle className="h-3 w-3" />
                    Applied
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {job.applicants} applicants
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills?.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                    {skill}
                  </span>
                ))}
                {job.skills?.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                    +{job.skills.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${deadlineStatus.color}`}>
                  <Clock className="h-3 w-3" />
                  {deadlineStatus.text}
                </span>
                <div className="text-xs text-slate-500">
                  Min CGPA: {job.minCGPA} | Max Backlogs: {job.maxBacklogs}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Briefcase className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <p>No opportunities found matching your criteria</p>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                    <Building2 className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedJob.position}</h2>
                    <p className="text-lg text-slate-600">{selectedJob.company}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {selectedJob.location}
                </span>
                <span className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
                  <DollarSign className="h-4 w-4" />
                  {selectedJob.salary}
                </span>
                <span className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg">
                  <Briefcase className="h-4 w-4" />
                  {selectedJob.type}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Eligibility Criteria</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Minimum CGPA</p>
                    <p className="font-bold text-slate-900">{selectedJob.minCGPA}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500">Max Backlogs</p>
                    <p className="font-bold text-slate-900">{selectedJob.maxBacklogs}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills?.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {selectedJob.description && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Job Description</h4>
                  <p className="text-slate-600">{selectedJob.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-500">
                  <span className="font-semibold">{selectedJob.applicants}</span> students have applied
                </div>
                {isApplied(selectedJob.id) ? (
                  <div className="flex gap-3">
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                      <CheckCircle className="h-5 w-5" />
                      Applied
                    </span>
                    <button
                      onClick={() => handleWithdraw(selectedJob.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50"
                    >
                      Withdraw
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(selectedJob)}
                    disabled={applying}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOpportunities;
