import React, { useState, useEffect } from 'react';
import { 
  User, FileText, CheckCircle, XCircle, AlertCircle, Edit2, Save, 
  GraduationCap, Briefcase, Code, Award, Plus, Trash2, Loader2, 
  Lock, Unlock, Eye, Download, Sparkles, Upload
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const StudentProfileEligibility = ({ studentId, email, onOpenResumeBuilder }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    rollNumber: '',
    branch: '',
    section: '',
    cgpa: 0,
    backlogs: 0,
    skills: [],
    projects: [],
    certifications: [],
    linkedIn: '',
    github: '',
    portfolio: ''
  });
  const [eligibilityRules, setEligibilityRules] = useState({
    minCGPA: 6.0,
    maxBacklogs: 0,
    allowedBranches: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT']
  });
  const [eligibilityStatus, setEligibilityStatus] = useState({
    isEligible: false,
    reasons: []
  });
  const [profileStatus, setProfileStatus] = useState('pending'); // pending, submitted, approved, rejected
  const [editMode, setEditMode] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, [studentId]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, rulesRes, resumesRes] = await Promise.all([
        fetch(`${API_BASE}/api/students/${studentId}`).catch(() => null),
        fetch(`${API_BASE}/api/placements/eligibility/rules`).catch(() => null),
        fetch(`${API_BASE}/api/resume/${studentId}`).catch(() => null)
      ]);

      if (profileRes?.ok) {
        const data = await profileRes.json();
        setProfile(prev => ({ ...prev, ...data }));
        setProfileStatus(data.profileStatus || 'pending');
      }
      if (rulesRes?.ok) {
        const rules = await rulesRes.json();
        setEligibilityRules(rules);
      }
      if (resumesRes?.ok) {
        const resumeData = await resumesRes.json();
        setResumes(Array.isArray(resumeData) ? resumeData : [resumeData]);
      }

      // Calculate eligibility
      calculateEligibility();
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEligibility = () => {
    const reasons = [];
    let isEligible = true;

    if (profile.cgpa < eligibilityRules.minCGPA) {
      reasons.push(`CGPA ${profile.cgpa} is below minimum ${eligibilityRules.minCGPA}`);
      isEligible = false;
    }
    if (profile.backlogs > eligibilityRules.maxBacklogs) {
      reasons.push(`${profile.backlogs} backlogs exceed maximum allowed ${eligibilityRules.maxBacklogs}`);
      isEligible = false;
    }
    if (!eligibilityRules.allowedBranches.includes(profile.branch)) {
      reasons.push(`Branch ${profile.branch} is not eligible`);
      isEligible = false;
    }
    if (profileStatus !== 'approved') {
      reasons.push('Profile not yet verified by faculty');
      isEligible = false;
    }

    setEligibilityStatus({ isEligible, reasons });
  };

  useEffect(() => {
    calculateEligibility();
  }, [profile, eligibilityRules, profileStatus]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        setEditMode(false);
        alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForVerification = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/students/${studentId}/submit-profile`, {
        method: 'POST'
      });
      if (response.ok) {
        setProfileStatus('submitted');
        alert('Profile submitted for verification!');
      }
    } catch (error) {
      console.error('Error submitting profile:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Eligibility Status Banner */}
      <div className={`rounded-xl p-6 ${
        eligibilityStatus.isEligible 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
      }`}>
        <div className="flex items-start gap-4">
          {eligibilityStatus.isEligible ? (
            <CheckCircle className="h-8 w-8 text-green-600 mt-1" />
          ) : (
            <AlertCircle className="h-8 w-8 text-amber-600 mt-1" />
          )}
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${eligibilityStatus.isEligible ? 'text-green-800' : 'text-amber-800'}`}>
              {eligibilityStatus.isEligible ? 'You are Eligible!' : 'Eligibility Pending'}
            </h3>
            {!eligibilityStatus.isEligible && eligibilityStatus.reasons.length > 0 && (
              <ul className="mt-2 space-y-1">
                {eligibilityStatus.reasons.map((reason, idx) => (
                  <li key={idx} className="text-sm text-amber-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            profileStatus === 'approved' ? 'bg-green-100 text-green-700' :
            profileStatus === 'submitted' ? 'bg-blue-100 text-blue-700' :
            profileStatus === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              {profileStatus === 'approved' ? <CheckCircle className="h-4 w-4" /> :
               profileStatus === 'submitted' ? <Lock className="h-4 w-4" /> :
               <Unlock className="h-4 w-4" />}
              <span className="font-semibold text-sm capitalize">{profileStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Criteria */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Eligibility Criteria</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500">Minimum CGPA</p>
            <p className="text-2xl font-bold text-slate-900">{eligibilityRules.minCGPA}</p>
            <p className={`text-sm mt-1 ${profile.cgpa >= eligibilityRules.minCGPA ? 'text-green-600' : 'text-red-600'}`}>
              Your CGPA: {profile.cgpa || 'N/A'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500">Max Backlogs Allowed</p>
            <p className="text-2xl font-bold text-slate-900">{eligibilityRules.maxBacklogs}</p>
            <p className={`text-sm mt-1 ${profile.backlogs <= eligibilityRules.maxBacklogs ? 'text-green-600' : 'text-red-600'}`}>
              Your Backlogs: {profile.backlogs || 0}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <p className="text-sm text-slate-500">Allowed Branches</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {eligibilityRules.allowedBranches.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Profile Details
          </h3>
          {profileStatus === 'pending' && (
            <div className="flex gap-2">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-600 text-sm font-semibold hover:bg-blue-50"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Academic Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Academic Details
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-500">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  disabled={!editMode}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-500">Roll Number</label>
                  <input
                    type="text"
                    value={profile.rollNumber}
                    disabled
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Branch</label>
                  <input
                    type="text"
                    value={profile.branch}
                    disabled
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-500">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={profile.cgpa}
                    onChange={(e) => setProfile(prev => ({ ...prev, cgpa: parseFloat(e.target.value) }))}
                    disabled={!editMode}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-500">Backlogs</label>
                  <input
                    type="number"
                    value={profile.backlogs}
                    onChange={(e) => setProfile(prev => ({ ...prev, backlogs: parseInt(e.target.value) }))}
                    disabled={!editMode}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Code className="h-5 w-5 text-green-600" />
              Skills & Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((skill, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  {skill}
                  {editMode && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {editMode && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add skill..."
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <button onClick={addSkill} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Resume
          </h3>
          <button
            onClick={onOpenResumeBuilder}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            AI Resume Builder
          </button>
        </div>
        
        {resumes.length > 0 ? (
          <div className="space-y-3">
            {resumes.map((resume, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{resume.title || 'My Resume'}</p>
                    <p className="text-sm text-slate-500">Updated: {resume.updatedAt || 'Recently'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg hover:bg-slate-100">
                    <Eye className="h-5 w-5 text-slate-600" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-slate-100">
                    <Download className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>No resume uploaded yet</p>
            <p className="text-sm mt-1">Use the AI Resume Builder to create a professional resume</p>
          </div>
        )}
      </div>

      {/* Submit for Verification */}
      {profileStatus === 'pending' && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmitForVerification}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            <CheckCircle className="h-5 w-5" />
            Submit for Verification
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentProfileEligibility;
