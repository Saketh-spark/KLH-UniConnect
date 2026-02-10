import React, { useState, useEffect } from 'react';
import {
  Briefcase, Search, MapPin, Building2, DollarSign, Clock, Filter,
  ChevronDown, ExternalLink, BookOpen, Star, CheckCircle, AlertCircle, Loader2, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentOpportunitiesTab = ({ studentId, email }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterCompany, setFilterCompany] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterSalary, setFilterSalary] = useState('All');
  const [filterEligibility, setFilterEligibility] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applying, setApplying] = useState(null);
  const [applicationStatuses, setApplicationStatuses] = useState({});

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/placements/jobs/active`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) { console.error('Failed to fetch jobs:', e); }
    finally { setLoading(false); }
  };

  const fetchMyApplications = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`${API_BASE}/api/placements/applications/student/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        const appliedSet = new Set();
        const statusMap = {};
        (data || []).forEach(app => {
          appliedSet.add(app.jobId);
          statusMap[app.jobId] = app.status || 'Applied';
        });
        setAppliedJobs(appliedSet);
        setApplicationStatuses(statusMap);
      }
    } catch (e) { console.error('Failed to fetch applications:', e); }
  };

  const handleApply = async (job) => {
    if (!studentId) {
      alert('Please log in to apply for jobs.');
      return;
    }
    setApplying(job.id);
    try {
      const res = await fetch(`${API_BASE}/api/placements/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          studentId: studentId,
          studentName: email?.split('@')[0] || 'Student',
          studentEmail: email,
          company: job.company,
          jobTitle: job.position,
          status: 'Applied'
        })
      });
      if (res.ok) {
        setAppliedJobs(prev => new Set([...prev, job.id]));
        setApplicationStatuses(prev => ({ ...prev, [job.id]: 'Applied' }));
      } else if (res.status === 409) {
        // Already applied
        setAppliedJobs(prev => new Set([...prev, job.id]));
        setApplicationStatuses(prev => ({ ...prev, [job.id]: 'Applied' }));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Failed to apply. Please try again.');
      }
    } catch (e) {
      console.error('Failed to apply:', e);
      alert('Network error. Please check your connection and try again.');
    }
    finally { setApplying(null); }
  };

  const companies = [...new Set(jobs.map(j => j.company).filter(Boolean))];
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];
  const roles = [...new Set(jobs.map(j => j.type || j.position).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || job.company?.toLowerCase().includes(q) || job.position?.toLowerCase().includes(q) || job.description?.toLowerCase().includes(q);
    const matchRole = filterRole === 'All' || job.type === filterRole || job.position === filterRole;
    const matchCompany = filterCompany === 'All' || job.company === filterCompany;
    const matchLocation = filterLocation === 'All' || job.location === filterLocation;
    return matchSearch && matchRole && matchCompany && matchLocation;
  });

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-700',
    'Shortlisted': 'bg-yellow-100 text-yellow-700',
    'Interview': 'bg-purple-100 text-purple-700',
    'Selected': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        <span className="ml-3 text-slate-600">Loading opportunities...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, or keyword..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${showFilters ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Filter size={16} /> Filters <ChevronDown size={14} className={`transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <div className="text-sm text-slate-500">{filteredJobs.length} opportunities found</div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Role</label>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="All">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Company</label>
              <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="All">All Companies</option>
                {companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Location</label>
              <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="All">All Locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Salary</label>
              <select value={filterSalary} onChange={e => setFilterSalary(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option value="All">All Packages</option>
                <option value="3-6">3-6 LPA</option>
                <option value="6-10">6-10 LPA</option>
                <option value="10-20">10-20 LPA</option>
                <option value="20+">20+ LPA</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-700">No opportunities found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{job.position}</h3>
                    {job.status === 'Closing Soon' && (
                      <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold">CLOSING SOON</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Building2 size={14} /> {job.company}</span>
                    {job.location && <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>}
                    {job.salary && <span className="flex items-center gap-1"><DollarSign size={14} /> {job.salary}</span>}
                    {job.type && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{job.type}</span>}
                  </div>
                  {job.description && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{job.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills?.slice(0, 5).map((skill, i) => (
                      <span key={i} className="rounded-full bg-sky-50 text-sky-700 px-2.5 py-0.5 text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    {job.minCGPA > 0 && <span>Min CGPA: {job.minCGPA}</span>}
                    {job.branch && <span>Branch: {job.branch.join(', ')}</span>}
                    {job.deadline && <span className="flex items-center gap-1"><Clock size={12} /> Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {appliedJobs.has(job.id) || applicationStatuses[job.id] ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColors[applicationStatuses[job.id] || 'Applied'] || 'bg-blue-100 text-blue-700'}`}>
                        <CheckCircle size={12} className="inline mr-1" />
                        {applicationStatuses[job.id] || 'Applied'}
                      </span>
                      <span className="text-[10px] text-slate-400">Application submitted</span>
                    </div>
                  ) : (
                    <button onClick={() => handleApply(job)} disabled={applying === job.id}
                      className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-bold text-white hover:bg-sky-700 transition disabled:opacity-50">
                      {applying === job.id ? <Loader2 size={14} className="animate-spin" /> : 'Apply Now'}
                    </button>
                  )}
                  <button onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
                    View Details <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Expanded Job Details */}
              {selectedJob?.id === job.id && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Job Description</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-line">{job.description || 'No description provided.'}</p>
                  </div>
                  {job.skills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-1">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((s, i) => (
                          <span key={i} className="rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-xs font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><span className="text-slate-400">Type:</span> <span className="font-medium text-slate-700">{job.type || 'N/A'}</span></div>
                    <div><span className="text-slate-400">Experience:</span> <span className="font-medium text-slate-700">{job.experience || 'Fresher'}</span></div>
                    <div><span className="text-slate-400">Min CGPA:</span> <span className="font-medium text-slate-700">{job.minCGPA || 'N/A'}</span></div>
                    <div><span className="text-slate-400">Max Backlogs:</span> <span className="font-medium text-slate-700">{job.maxBacklogs ?? 'N/A'}</span></div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentOpportunitiesTab;
