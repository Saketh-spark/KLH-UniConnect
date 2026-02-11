import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Briefcase, Building, Calendar, MapPin, DollarSign, Users, Edit2, Trash2,
  X, Save, Clock, CheckCircle, AlertTriangle, Search, Filter, ChevronDown, ChevronUp,
  GraduationCap, Star, Eye
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyJobManagementTab = ({ email, onBack }) => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [expandedJob, setExpandedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const [form, setForm] = useState({
    company: '', position: '', type: 'Full-Time', location: '', salary: '',
    description: '', deadline: '', minCGPA: '', branch: '', skills: '',
    maxBacklogs: '0', experience: 'Fresher', status: 'Active'
  });
  const [companyForm, setCompanyForm] = useState({
    name: '', industry: '', website: '', contactPerson: '', contactEmail: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/placements/jobs`);
      setJobs(res.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/placements/companies`);
      setCompanies(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        branch: form.branch.split(',').map(s => s.trim()).filter(Boolean),
        minCGPA: parseFloat(form.minCGPA) || 0,
        maxBacklogs: parseInt(form.maxBacklogs) || 0,
      };
      if (editingJob) {
        await axios.put(`${API_BASE}/api/placements/jobs/${editingJob.id}`, payload);
      } else {
        await axios.post(`${API_BASE}/api/placements/jobs`, payload);
      }
      setShowForm(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const handleSubmitCompany = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/placements/companies`, companyForm);
      setShowCompanyForm(false);
      setCompanyForm({ name: '', industry: '', website: '', contactPerson: '', contactEmail: '' });
      fetchCompanies();
    } catch (e) { console.error(e); }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await axios.delete(`${API_BASE}/api/placements/jobs/${id}`);
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const handleCloseJob = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/placements/jobs/${id}/close`);
      fetchJobs();
    } catch (e) { console.error(e); }
  };

  const resetForm = () => setForm({
    company: '', position: '', type: 'Full-Time', location: '', salary: '',
    description: '', deadline: '', minCGPA: '', branch: '', skills: '',
    maxBacklogs: '0', experience: 'Fresher', status: 'Active'
  });

  const startEdit = (job) => {
    setForm({
      ...job,
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
      branch: Array.isArray(job.branch) ? job.branch.join(', ') : job.branch || '',
      minCGPA: job.minCGPA?.toString() || '',
      maxBacklogs: job.maxBacklogs?.toString() || '0',
    });
    setEditingJob(job);
    setShowForm(true);
  };

  const filtered = jobs.filter(j => {
    const matchSearch = !searchTerm || j.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Clock className="animate-spin text-sky-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Search jobs..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { resetForm(); setEditingJob(null); setShowForm(true); }}
            className="flex items-center gap-2 rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700 transition">
            <Plus size={16} /> Post Job/Drive
          </button>
          <button onClick={() => setShowCompanyForm(true)}
            className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition">
            <Building size={16} /> Add Company
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Postings', value: jobs.length, icon: Briefcase, color: 'text-sky-600 bg-sky-50' },
          { label: 'Active', value: jobs.filter(j => j.status === 'Active').length, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Closed', value: jobs.filter(j => j.status !== 'Active').length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Companies', value: companies.length, icon: Building, color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <div className={`rounded-lg p-2 ${s.color}`}><Icon size={18} /></div>
              <div>
                <div className="text-xl font-black text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{editingJob ? 'Edit Job Posting' : 'Post New Job / Drive'}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Company *</label>
                  <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Position *</label>
                  <input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {['Full-Time', 'Internship', 'Campus Drive', 'Pool Drive', 'Part-Time'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Salary / CTC</label>
                  <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 6 LPA" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Min CGPA</label>
                  <input type="number" step="0.1" value={form.minCGPA} onChange={e => setForm({ ...form, minCGPA: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="e.g. 7.0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Max Backlogs</label>
                  <input type="number" value={form.maxBacklogs} onChange={e => setForm({ ...form, maxBacklogs: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Experience</label>
                  <select value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {['Fresher', '0-1 years', '1-2 years', '2+ years'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Eligible Branches (comma-separated)</label>
                <input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="CSE, ECE, IT, EEE" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Required Skills (comma-separated)</label>
                <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Java, Python, SQL, React" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Job Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit"
                  className="rounded-lg bg-sky-600 text-white px-6 py-2 text-sm font-medium hover:bg-sky-700 flex items-center gap-2">
                  <Save size={14} /> {editingJob ? 'Update' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Form Modal */}
      {showCompanyForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCompanyForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add Company</h3>
              <button onClick={() => setShowCompanyForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitCompany} className="space-y-3">
              {[
                { key: 'name', label: 'Company Name *', required: true },
                { key: 'industry', label: 'Industry' },
                { key: 'website', label: 'Website' },
                { key: 'contactPerson', label: 'Contact Person' },
                { key: 'contactEmail', label: 'Contact Email', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                  <input value={companyForm[f.key]} onChange={e => setCompanyForm({ ...companyForm, [f.key]: e.target.value })}
                    required={f.required} type={f.type || 'text'}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCompanyForm(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">Cancel</button>
                <button type="submit" className="rounded-lg bg-sky-600 text-white px-6 py-2 text-sm font-medium hover:bg-sky-700">
                  <Save size={14} className="inline mr-1" /> Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Listings */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Briefcase size={48} className="mx-auto mb-3 opacity-40" />
          <p>No job postings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => (
            <div key={job.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                    {job.company?.charAt(0) || 'J'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{job.position}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Building size={12} /> {job.company}</span>
                      {job.location && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
                      {job.salary && <span className="flex items-center gap-1"><DollarSign size={12} /> {job.salary}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>{job.status || 'Active'}</span>
                  <span className="rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-bold">{job.type}</span>
                  {expandedJob === job.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>
              {expandedJob === job.id && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    {job.minCGPA > 0 && <div><span className="text-xs text-slate-500">Min CGPA:</span><br /><strong>{job.minCGPA}</strong></div>}
                    {job.maxBacklogs !== undefined && <div><span className="text-xs text-slate-500">Max Backlogs:</span><br /><strong>{job.maxBacklogs}</strong></div>}
                    {job.experience && <div><span className="text-xs text-slate-500">Experience:</span><br /><strong>{job.experience}</strong></div>}
                    {job.deadline && <div><span className="text-xs text-slate-500">Deadline:</span><br /><strong>{new Date(job.deadline).toLocaleDateString()}</strong></div>}
                  </div>
                  {job.branch?.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-slate-500">Branches:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(job.branch) ? job.branch : [job.branch]).map((b, i) => (
                          <span key={i} className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-medium">{b}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {job.skills?.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs text-slate-500">Skills Required:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(job.skills) ? job.skills : [job.skills]).map((s, i) => (
                          <span key={i} className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {job.description && <p className="text-sm text-slate-600 mt-2">{job.description}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => startEdit(job)} className="flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Edit2 size={12} /> Edit
                    </button>
                    {job.status === 'Active' && (
                      <button onClick={() => handleCloseJob(job.id)} className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100">
                        <AlertTriangle size={12} /> Close
                      </button>
                    )}
                    <button onClick={() => handleDeleteJob(job.id)} className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Companies Section */}
      {companies.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Building size={16} className="text-purple-600" /> Registered Companies ({companies.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {companies.map((c, i) => (
              <div key={i} className="rounded-lg border border-slate-100 p-3">
                <h4 className="font-bold text-sm text-slate-800">{c.name}</h4>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  {c.industry && <div>{c.industry}</div>}
                  {c.contactPerson && <div>Contact: {c.contactPerson}</div>}
                  {c.visits > 0 && <div>Campus Visits: {c.visits}</div>}
                  {c.totalHired > 0 && <div>Total Hired: {c.totalHired}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyJobManagementTab;
