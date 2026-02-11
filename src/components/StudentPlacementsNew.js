import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  ClipboardList,
  BookOpen,
  BarChart3
} from 'lucide-react';

// Import new 5-tab modular placement components
import {
  StudentOpportunitiesTab,
  StudentApplicationsTab,
  StudentResumeTab,
  StudentTrainingTab,
  StudentAnalyticsTab
} from './placements';

const StudentPlacementsNew = ({ onBack = () => {}, studentId = '', email = '' }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('opportunities');
  
  const actualStudentId = studentId || localStorage.getItem('klhStudentId') || localStorage.getItem('studentId');
  const actualEmail = email || localStorage.getItem('klhEmail') || '';

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // New 5-tab structure for student placements portal
  const tabs = [
    { id: 'opportunities', label: 'Opportunities & Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications & Tracking', icon: ClipboardList },
    { id: 'resume', label: 'Resume & Career Profile', icon: FileText },
    { id: 'training', label: 'Training & Preparation', icon: BookOpen },
    { id: 'analytics', label: 'Placement Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
    const props = { 
      studentId: actualStudentId, 
      email: actualEmail,
    };
    
    switch (activeTab) {
      case 'opportunities':
        return <StudentOpportunitiesTab {...props} />;
      case 'applications':
        return <StudentApplicationsTab {...props} />;
      case 'resume':
        return <StudentResumeTab {...props} />;
      case 'training':
        return <StudentTrainingTab {...props} />;
      case 'analytics':
        return <StudentAnalyticsTab {...props} />;
      default:
        return <StudentOpportunitiesTab {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700 mb-4 transform ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            style={{ transitionDelay: '50ms' }}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div
            className={`flex items-center gap-4 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-blue-100 text-blue-600">
              <Briefcase size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">Placements & Careers</h1>
              <p className="mt-1 text-lg text-slate-600">Track your placement journey and career development</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Tab Navigation */}
        <div
          className={`mb-8 border-b border-slate-200 transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '150ms' }}
        >
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-3 text-sm font-semibold transition relative whitespace-nowrap ${
                    activeTab === tab.id ? 'text-sky-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div
          className={`transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentPlacementsNew;
