import React, { useState } from 'react';
import { Plus, Phone, Mail, Calendar, Users, Briefcase, Star, CheckCircle, AlertCircle } from 'lucide-react';

const FacultyCompanyConnect = ({ searchTerm }) => {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Google India',
      lastVisit: '2023-11-15',
      recruiterName: 'Priya Sharma',
      recruiterEmail: 'priya@google.com',
      recruiterPhone: '+91-9876543210',
      placementsLastYear: 12,
      averageSalary: '18 LPA',
      targetProfiles: ['CSE', 'ECE'],
      focusAreas: ['Data Science', 'Backend Development'],
      status: 'Active'
    },
    {
      id: 2,
      name: 'Microsoft India',
      lastVisit: '2023-10-20',
      recruiterName: 'Rajesh Kumar',
      recruiterEmail: 'rajesh@microsoft.com',
      recruiterPhone: '+91-8765432109',
      placementsLastYear: 10,
      averageSalary: '16 LPA',
      targetProfiles: ['CSE', 'ECE'],
      focusAreas: ['Cloud Computing', 'AI/ML'],
      status: 'Active'
    },
    {
      id: 3,
      name: 'Amazon India',
      lastVisit: '2023-09-10',
      recruiterName: 'Neha Singh',
      recruiterEmail: 'neha@amazon.com',
      recruiterPhone: '+91-7654321098',
      placementsLastYear: 9,
      averageSalary: '15 LPA',
      targetProfiles: ['CSE'],
      focusAreas: ['DevOps', 'System Design'],
      status: 'Active'
    }
  ]);

  const [alumni, setAlumni] = useState([
    {
      id: 1,
      name: 'Aman Gupta',
      graduationYear: 2020,
      company: 'Google India',
      designation: 'Senior Software Engineer',
      yearsOfExperience: 3,
      mentorshipAvailable: true,
      phoneContactAvailable: true,
      emailContactAvailable: true,
      currentSalary: '18 LPA'
    },
    {
      id: 2,
      name: 'Anjali Verma',
      graduationYear: 2019,
      company: 'Goldman Sachs',
      designation: 'Analyst',
      yearsOfExperience: 4,
      mentorshipAvailable: true,
      phoneContactAvailable: true,
      emailContactAvailable: true,
      currentSalary: '20 LPA'
    },
    {
      id: 3,
      name: 'Ravi Patel',
      graduationYear: 2021,
      company: 'Amazon India',
      designation: 'SDE-1',
      yearsOfExperience: 2,
      mentorshipAvailable: true,
      phoneContactAvailable: false,
      emailContactAvailable: true,
      currentSalary: '15 LPA'
    }
  ]);

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [newCompany, setNewCompany] = useState({
    name: '',
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    targetProfiles: [],
    focusAreas: '',
    averageSalary: ''
  });

  const [newEvent, setNewEvent] = useState({
    type: 'Drive',
    date: '',
    time: '',
    description: ''
  });

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.recruiterEmail) {
      setCompanies([...companies, {
        ...newCompany,
        id: Date.now(),
        lastVisit: new Date().toISOString().split('T')[0],
        placementsLastYear: 0,
        status: 'New'
      }]);
      setNewCompany({
        name: '',
        recruiterName: '',
        recruiterEmail: '',
        recruiterPhone: '',
        targetProfiles: [],
        focusAreas: '',
        averageSalary: ''
      });
      setShowCompanyModal(false);
    }
  };

  const handleScheduleEvent = () => {
    if (newEvent.date && selectedCompany) {
      alert(`Event scheduled with ${selectedCompany.name} on ${newEvent.date} at ${newEvent.time}`);
      setShowScheduleModal(false);
      setNewEvent({
        type: 'Drive',
        date: '',
        time: '',
        description: ''
      });
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAlumni = alumni.filter(alum =>
    alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alum.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Company Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Active Companies</h3>
          <button
            onClick={() => setShowCompanyModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>

        {/* Company List */}
        <div className="space-y-3">
          {filteredCompanies.map(company => (
            <div key={company.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{company.name}</h4>
                      <p className="text-xs text-slate-600">Recruiter: {company.recruiterName}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Contact Info</p>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Mail className="h-4 w-4 text-slate-500" />
                          {company.recruiterEmail}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Phone className="h-4 w-4 text-slate-500" />
                          {company.recruiterPhone}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Hiring Details</p>
                      <div className="mt-1 space-y-1 text-sm text-slate-700">
                        <div>Last Visit: {new Date(company.lastVisit).toLocaleDateString()}</div>
                        <div>{company.placementsLastYear} placements (last year)</div>
                        <div>Avg Salary: {company.averageSalary}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {company.targetProfiles.map((profile, idx) => (
                      <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {profile}
                      </span>
                    ))}
                    {company.focusAreas?.split(',').map((area, idx) => (
                      <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        {area.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setShowScheduleModal(true);
                    }}
                    className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-200"
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule Event
                  </button>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    company.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {company.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alumni Network Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Alumni Network</h3>

        {/* Alumni List */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAlumni.map(alum => (
            <div key={alum.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{alum.name}</h4>
                      <p className="text-xs text-slate-600">Batch {alum.graduationYear}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{alum.designation}</p>
                        <p className="text-xs text-slate-600">{alum.company}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      Experience: {alum.yearsOfExperience} years • Salary: {alum.currentSalary}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-1">
                    {alum.mentorshipAvailable && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Mentor
                      </span>
                    )}
                    {alum.phoneContactAvailable && (
                      <button
                        onClick={() => alert(`Phone contact: Initiating call...`)}
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                        title="Call available"
                      >
                        <Phone className="h-3 w-3" />
                      </button>
                    )}
                    {alum.emailContactAvailable && (
                      <button
                        onClick={() => alert(`Email: ${alum.name}@alumni.college.com`)}
                        className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-200"
                        title="Email available"
                      >
                        <Mail className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Add New Company</h3>
            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Company Name"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Recruiter Name"
                value={newCompany.recruiterName}
                onChange={(e) => setNewCompany({ ...newCompany, recruiterName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Recruiter Email"
                value={newCompany.recruiterEmail}
                onChange={(e) => setNewCompany({ ...newCompany, recruiterEmail: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Recruiter Phone"
                value={newCompany.recruiterPhone}
                onChange={(e) => setNewCompany({ ...newCompany, recruiterPhone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Average Salary (e.g., 15 LPA)"
                value={newCompany.averageSalary}
                onChange={(e) => setNewCompany({ ...newCompany, averageSalary: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Focus Areas (comma-separated)"
                value={newCompany.focusAreas}
                onChange={(e) => setNewCompany({ ...newCompany, focusAreas: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddCompany}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                >
                  Add Company
                </button>
                <button
                  onClick={() => setShowCompanyModal(false)}
                  className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Event Modal */}
      {showScheduleModal && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Schedule Event - {selectedCompany.name}</h3>
            <div className="mt-4 space-y-4">
              <select
                value={newEvent.type}
                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Drive">Placement Drive</option>
                <option value="Interview">Interview</option>
                <option value="Internship">Internship Opportunity</option>
                <option value="Talk">Alumni Talk</option>
              </select>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <textarea
                placeholder="Event Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleScheduleEvent}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                >
                  Schedule
                </button>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedCompany(null);
                  }}
                  className="flex-1 rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-900 transition hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyCompanyConnect;
