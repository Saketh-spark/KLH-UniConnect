import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Edit2, Trash2, Eye, Users, Calendar, Clock, MapPin,
  DollarSign, Briefcase, Search, Filter, CheckCircle, XCircle, Loader2,
  ChevronDown, AlertCircle, X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyOpportunities = ({ email, searchTerm }) => {
  const [loading, setLoading] = useState(true);
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);

  const [driveForm, setDriveForm] = useState({
    company: '',
    position: '',
    description: '',
    location: 'Hyderabad',
    salary: '',
    type: 'Full-time',
    deadline: '',
    minCGPA: 6.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'ECE', 'IT'],
    skills: '',
    rounds: [{ name: 'Online Test', date: '', description: '' }]
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/jobs`);
      if (response.ok) {
        const data = await response.json();
        setDrives(data);
      }
    } catch (error) {
      console.error('Error fetching drives:', error);
      // Mock data
      setDrives([
        { id: '1', company: 'Google', position: 'Software Engineer', status: 'Active', applicants: 145, shortlisted: 45, deadline: '2026-02-15', location: 'Bangalore', salary: '25-35 LPA' },
        { id: '2', company: 'Microsoft', position: 'Product Manager', status: 'Active', applicants: 89, shortlisted: 28, deadline: '2026-02-20', location: 'Hyderabad', salary: '20-28 LPA' },
        { id: '3', company: 'Amazon', position: 'SDE Intern', status: 'Closed', applicants: 234, shortlisted: 67, deadline: '2026-01-15', location: 'Remote', salary: '60K/month' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/placements/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([
        { id: '1', name: 'Google', industry: 'Technology' },
        { id: '2', name: 'Microsoft', industry: 'Technology' },
        { id: '3', name: 'Amazon', industry: 'E-commerce/Technology' },
        { id: '4', name: 'TCS', industry: 'IT Services' }
      ]);
    }
  };

  const handleCreateDrive = async () => {
    setSaving(true);
    try {
      const driveData = {
        ...driveForm,
        skills: driveForm.skills.split(',').map(s => s.trim()).filter(s => s),
        createdBy: email
      };

      const response = await fetch(`${API_BASE}/api/placements/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driveData)
      });

      if (response.ok) {
        const newDrive = await response.json();
        setDrives([newDrive, ...drives]);
        setShowCreateModal(false);
        resetDriveForm();
      }
    } catch (error) {
      console.error('Error creating drive:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCompany = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/placements/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm)
      });

      if (response.ok) {
        const newCompany = await response.json();
        setCompanies([...companies, newCompany]);
        setShowCompanyModal(false);
        setCompanyForm({ name: '', industry: '', website: '', contactPerson: '', contactEmail: '', contactPhone: '' });
      }
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDrive = async (driveId) => {
    try {
      await fetch(`${API_BASE}/api/placements/jobs/${driveId}/close`, { method: 'POST' });
      setDrives(drives.map(d => d.id === driveId ? { ...d, status: 'Closed' } : d));
    } catch (error) {
      console.error('Error closing drive:', error);
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) return;
    try {
      await fetch(`${API_BASE}/api/placements/jobs/${driveId}`, { method: 'DELETE' });
      setDrives(drives.filter(d => d.id !== driveId));
    } catch (error) {
      console.error('Error deleting drive:', error);
    }
  };

  const addRound = () => {
    setDriveForm(prev => ({
      ...prev,
      rounds: [...prev.rounds, { name: '', date: '', description: '' }]
    }));
  };

  const removeRound = (index) => {
    setDriveForm(prev => ({
      ...prev,
      rounds: prev.rounds.filter((_, i) => i !== index)
    }));
  };

  const resetDriveForm = () => {
    setDriveForm({
      company: '',
      position: '',
      description: '',
      location: 'Hyderabad',
      salary: '',
      type: 'Full-time',
      deadline: '',
      minCGPA: 6.0,
      maxBacklogs: 0,
      allowedBranches: ['CSE', 'ECE', 'IT'],
      skills: '',
      rounds: [{ name: 'Online Test', date: '', description: '' }]
    });
  };

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.company?.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                         drive.position?.toLowerCase().includes((searchTerm || '').toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && drive.status === 'Active';
    if (filter === 'closed') return matchesSearch && drive.status === 'Closed';
    return matchesSearch;
  });

  const stats = {
    totalDrives: drives.length,
    activeDrives: drives.filter(d => d.status === 'Active').length,
    totalApplicants: drives.reduce((sum, d) => sum + (d.applicants || 0), 0),
    totalShortlisted: drives.reduce((sum, d) => sum + (d.shortlisted || 0), 0)
  };

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
          <p className="text-sm font-medium text-slate-500">Total Drives</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalDrives}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-medium text-green-600">Active</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{stats.activeDrives}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-600">Total Applicants</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{stats.totalApplicants}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-sm font-medium text-purple-600">Shortlisted</p>
          <p className="mt-1 text-3xl font-bold text-purple-700">{stats.totalShortlisted}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create New Drive
        </button>
        <button
          onClick={() => setShowCompanyModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100"
        >
          <Building2 className="h-5 w-5" />
          Add Company
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['all', 'active', 'closed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Drives Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Company / Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Package</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Deadline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Applicants</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrives.map(drive => (
                <tr key={drive.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{drive.company}</p>
                        <p className="text-sm text-slate-500">{drive.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{drive.location}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">{drive.salary}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{drive.deadline}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="font-semibold text-slate-900">{drive.applicants}</span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-green-600">{drive.shortlisted} shortlisted</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      drive.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {drive.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDrive(drive)}
                        className="p-2 rounded-lg hover:bg-slate-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      {drive.status === 'Active' && (
                        <button
                          onClick={() => handleCloseDrive(drive.id)}
                          className="p-2 rounded-lg hover:bg-amber-100"
                          title="Close Drive"
                        >
                          <XCircle className="h-4 w-4 text-amber-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteDrive(drive.id)}
                        className="p-2 rounded-lg hover:bg-red-100"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Drive Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Create Placement Drive</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <select
                    value={driveForm.company}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, company: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Position</label>
                  <input
                    type="text"
                    value={driveForm.position}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Software Engineer"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <textarea
                  value={driveForm.description}
                  onChange={(e) => setDriveForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Location</label>
                  <input
                    type="text"
                    value={driveForm.location}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Salary/CTC</label>
                  <input
                    type="text"
                    value={driveForm.salary}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, salary: e.target.value }))}
                    placeholder="12-18 LPA"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Type</label>
                  <select
                    value={driveForm.type}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, type: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  >
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Deadline</label>
                  <input
                    type="date"
                    value={driveForm.deadline}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={driveForm.minCGPA}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, minCGPA: parseFloat(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Max Backlogs</label>
                  <input
                    type="number"
                    value={driveForm.maxBacklogs}
                    onChange={(e) => setDriveForm(prev => ({ ...prev, maxBacklogs: parseInt(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={driveForm.skills}
                  onChange={(e) => setDriveForm(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="Java, Python, DSA, System Design"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-600">Selection Rounds</label>
                  <button onClick={addRound} className="text-sm text-blue-600 hover:underline">
                    + Add Round
                  </button>
                </div>
                {driveForm.rounds.map((round, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => {
                        const newRounds = [...driveForm.rounds];
                        newRounds[idx].name = e.target.value;
                        setDriveForm(prev => ({ ...prev, rounds: newRounds }));
                      }}
                      placeholder="Round name"
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    />
                    <input
                      type="date"
                      value={round.date}
                      onChange={(e) => {
                        const newRounds = [...driveForm.rounds];
                        newRounds[idx].date = e.target.value;
                        setDriveForm(prev => ({ ...prev, rounds: newRounds }));
                      }}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                    />
                    {driveForm.rounds.length > 1 && (
                      <button onClick={() => removeRound(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDrive}
                disabled={saving || !driveForm.company || !driveForm.position}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-400"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Company</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Company Name</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Industry</label>
                <input
                  type="text"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Contact Person</label>
                <input
                  type="text"
                  value={companyForm.contactPerson}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Contact Email</label>
                <input
                  type="email"
                  value={companyForm.contactEmail}
                  onChange={(e) => setCompanyForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={saving || !companyForm.name}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
              >
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyOpportunities;
