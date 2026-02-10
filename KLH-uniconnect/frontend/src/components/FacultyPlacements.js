import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Users,
  FileText,
  BookOpen,
  BarChart3
} from 'lucide-react';

// Import new 5-tab modular placement components
import {
  FacultyJobManagementTab,
  FacultyApplicantTab,
  FacultyResumeReviewTab,
  FacultyTrainingManagementTab,
  FacultyAnalyticsTab
} from './placements';

const FacultyPlacements = ({ email = '', onBack = () => {} }) => {
  const [activeTab, setActiveTab] = useState('jobs');

  // New 5-tab structure for faculty placements portal
  const tabs = [
    { id: 'jobs', label: 'Job & Drive Management', icon: <Briefcase className="h-5 w-5" /> },
    { id: 'applicants', label: 'Applicants & Shortlisting', icon: <Users className="h-5 w-5" /> },
    { id: 'resumes', label: 'Resume Review & Readiness', icon: <FileText className="h-5 w-5" /> },
    { id: 'training', label: 'Training & Workshops', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'analytics', label: 'Placement Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const renderContent = () => {
    const props = { email, onBack };
    
    switch (activeTab) {
      case 'jobs':
        return <FacultyJobManagementTab {...props} />;
      case 'applicants':
        return <FacultyApplicantTab {...props} />;
      case 'resumes':
        return <FacultyResumeReviewTab {...props} />;
      case 'training':
        return <FacultyTrainingManagementTab {...props} />;
      case 'analytics':
        return <FacultyAnalyticsTab {...props} />;
      default:
        return <FacultyJobManagementTab {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-black text-slate-900">Placements & Careers</h1>
          <p className="mt-1 text-slate-600">Manage placement drives, applicants, training, and analytics</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FacultyPlacements;
