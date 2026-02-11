import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  BarChart3,
  Clock,
  Download,
  FileJson,
  FileSpreadsheet,
  File,
  Search as SearchIcon,
  Zap,
  Brain,
  BarChart2,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  Upload as UploadIcon,
  Loader,
  Clipboard,
  Calendar,
  Users,
  BookMarked,
  FlaskConical
} from 'lucide-react';
import StudentTestExam from './StudentTestExam';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const AcademicsAndLearning = ({ onBack = () => {}, studentId = null, onModuleSelect = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileType, setSelectedFileType] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState(null);
  const [actualStudentId, setActualStudentId] = useState(studentId || localStorage.getItem('studentId'));
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState({
    overallPercentage: 0,
    totalAttended: 0,
    totalClasses: 0,
    criticalSubjects: []
  });
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [stats, setStats] = useState({
    cgpa: 0,
    attendance: 0,
    assignments: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Update actualStudentId when studentId prop changes
  useEffect(() => {
    console.log('AcademicsAndLearning studentId prop:', studentId);
    if (studentId) {
      setActualStudentId(studentId);
      localStorage.setItem('studentId', studentId);
      console.log('Updated actualStudentId:', studentId);
    }
  }, [studentId]);

  // Fallback to localStorage on component mount
  useEffect(() => {
    if (!actualStudentId) {
      const stored = localStorage.getItem('studentId');
      if (stored) {
        setActualStudentId(stored);
        console.log('Loaded studentId from localStorage:', stored);
      }
    }
  }, []);

  // Fetch materials when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'notes') {
      fetchMaterials();
    }
  }, [activeTab, selectedSemester, selectedFileType, searchQuery]);

  // Fetch assignments when tab changes and studentId is available
  useEffect(() => {
    if (activeTab === 'assignments' && actualStudentId) {
      fetchAssignments();
    }
  }, [activeTab, actualStudentId]);

  // Fetch attendance when tab changes
  useEffect(() => {
    if (activeTab === 'attendance' && actualStudentId) {
      fetchAttendance();
    }
  }, [activeTab, actualStudentId]);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSemester !== 'All') params.append('semester', selectedSemester);
      if (selectedFileType !== 'All') params.append('type', selectedFileType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_BASE}/api/materials?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.message);
      setMaterials(mockMaterials); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/assignments`, {
        headers: {
          'X-Student-Id': actualStudentId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      
      const data = await response.json();
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err.message);
      setAssignments(mockAssignments); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/attendance/student/${actualStudentId}/overview`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      
      const data = await response.json();
      setAttendanceData(data.subjects || []);
      setAttendanceOverview({
        overallPercentage: data.overallPercentage || 0,
        totalAttended: data.totalAttended || 0,
        totalClasses: data.totalClasses || 0,
        criticalSubjects: data.criticalSubjects || []
      });
      // Update stats
      setStats(prev => ({
        ...prev,
        attendance: data.overallPercentage || 0
      }));
    } catch (err) {
      console.error('Error fetching attendance:', err);
      // Keep default mock data if API fails
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleDownload = async (materialId, fileUrl) => {
    try {
      // Check if fileUrl exists
      if (!fileUrl) {
        alert('File is not available for download.');
        return;
      }

      console.log('Starting download for material:', materialId, 'URL:', fileUrl);

      // Show loading state
      const downloadBtn = event.target.closest('button');
      if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span>Downloading...</span>';
      }

      try {
        // Increment download count
        await fetch(`${API_BASE}/api/materials/${materialId}/download`, {
          method: 'POST'
        }).catch(err => console.warn('Could not update download count:', err));

        // Trigger file download
        const fullUrl = `${API_BASE}${fileUrl}`;
        console.log('Full download URL:', fullUrl);
        
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = fileUrl.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('Download triggered successfully');

        // Refresh materials to show updated download count after a delay
        setTimeout(() => {
          fetchMaterials();
        }, 1000);
      } finally {
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download';
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      alert(`Failed to download file. Error: ${err.message}`);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    console.log('handleSubmitAssignment called. actualStudentId:', actualStudentId);
    if (!actualStudentId) {
      alert('Please sign in to submit assignments');
      return;
    }

    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.ppt,.pptx';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setSubmittingAssignmentId(assignmentId);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/api/assignments/${assignmentId}/submit`, {
          method: 'POST',
          headers: {
            'X-Student-Id': actualStudentId
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit assignment');
        }

        const result = await response.json();
        alert('Assignment submitted successfully!');
        
        // Refresh assignments
        fetchAssignments();
      } catch (err) {
        console.error('Submission error:', err);
        alert(`Failed to submit assignment: ${err.message}`);
      } finally {
        setSubmittingAssignmentId(null);
      }
    };

    fileInput.click();
  };

  // Animated counter effect
  useEffect(() => {
    if (!mounted) return;

    const animateValue = (start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        return Math.floor(progress * (end - start) + start);
      };
      return step;
    };

    const counters = {
      cgpa: 8.5,
      attendance: 85.3,
      assignments: 21,
      pending: 2,
      overdue: 2
    };

    setStats(counters);
  }, [mounted]);

  const tabs = [
    { id: 'notes', label: 'Notes & Materials', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'tests', label: 'Tests & Exams', icon: Clipboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'grades', label: 'Grades', icon: BarChart3 }
  ];

  const fileTypeFilters = ['All', 'PPT', 'Notes', 'PDF', 'Document'];
  const semesterFilters = ['All', 'Sem 3', 'Sem 4'];

  const mockMaterials = [
    {
      id: 1,
      title: 'Database Management Systems – Unit 1 & 2',
      subject: 'DBMS',
      semester: 'Sem 4',
      author: 'Dr. Rajesh Kumar',
      date: '2024-11-20',
      fileSize: '12.5 MB',
      downloads: 245,
      type: 'PDF',
      icon: FileJson,
      fileUrl: null // Sample data - no actual file
    },
    {
      id: 2,
      title: 'Web Development Fundamentals',
      subject: 'Web Technologies',
      semester: 'Sem 4',
      author: 'Prof. Sneha Sharma',
      date: '2024-11-18',
      fileSize: '8.3 MB',
      downloads: 189,
      type: 'Notes',
      icon: FileText,
      fileUrl: null // Sample data - no actual file
    },
    {
      id: 3,
      title: 'Data Structures & Algorithms – Sorting',
      subject: 'DSA',
      semester: 'Sem 3',
      author: 'Dr. Vikram Singh',
      date: '2024-11-15',
      fileSize: '5.2 MB',
      downloads: 412,
      type: 'PDF',
      icon: FileJson,
      fileUrl: null // Sample data - no actual file
    },
    {
      id: 4,
      title: 'Operating Systems – Process Management',
      subject: 'Operating Systems',
      semester: 'Sem 4',
      author: 'Prof. Aditya Patel',
      date: '2024-11-12',
      fileSize: '15.8 MB',
      downloads: 178,
      type: 'PPT',
      icon: FileSpreadsheet,
      fileUrl: null // Sample data - no actual file
    },
    {
      id: 5,
      title: 'Microprocessors & Interfacing',
      subject: 'Microprocessors',
      semester: 'Sem 3',
      author: 'Dr. Priya Mishra',
      date: '2024-11-10',
      fileSize: '9.7 MB',
      downloads: 94,
      type: 'Notes',
      icon: FileText,
      fileUrl: null // Sample data - no actual file
    }
  ];

  const mockAssignments = [
    {
      id: 1,
      title: 'Implement Sorting Algorithms',
      subject: 'DSA',
      description: 'Implement and compare Quick Sort, Merge Sort, and Heap Sort with time complexity analysis',
      dueDate: '12/20/2024',
      isOverdue: true,
      daysOverdue: 378,
      status: 'Pending',
      marks: null,
      totalMarks: 25
    },
    {
      id: 2,
      title: 'Microcontroller Programming Project',
      subject: 'Microprocessors',
      description: 'Program an 8085 microcontroller to control LED patterns',
      dueDate: '12/25/2024',
      isOverdue: true,
      daysOverdue: 373,
      status: 'Pending',
      marks: null,
      totalMarks: 30
    },
    {
      id: 3,
      title: 'Design a Relational Database Schema',
      subject: 'DBMS',
      description: 'Design a database for an e-commerce platform with 5+ tables',
      dueDate: '12/10/2024',
      isOverdue: false,
      status: 'Graded',
      marks: 18,
      totalMarks: 20,
      feedback: '"Good schema design! Consider adding indexes for better performance."'
    },
    {
      id: 4,
      title: 'Build a Personal Portfolio Website',
      subject: 'Web Technologies',
      description: 'Create a responsive website showcasing your projects using HTML, CSS, and JavaScript',
      dueDate: '12/15/2024',
      isOverdue: false,
      status: 'Graded',
      marks: 19,
      totalMarks: 20,
      feedback: '"Excellent design and functionality! Mobile responsiveness is perfect."'
    },
    {
      id: 5,
      title: 'Process Scheduling Algorithms',
      subject: 'Operating Systems',
      description: 'Simulate and analyze FCFS, SJF, and Round Robin scheduling algorithms',
      dueDate: '12/8/2024',
      isOverdue: true,
      daysOverdue: 390,
      status: 'Overdue',
      marks: null,
      totalMarks: 20
    }
  ];

  const displayMaterials = materials.length > 0 ? materials : mockMaterials;
  const displayAssignments = assignments.length > 0 ? assignments : mockAssignments;

  const subjects = [
    {
      id: 1,
      name: 'Database Management Systems',
      code: 'CS304',
      semester: 'Sem 4',
      internalMarks: 18,
      externalMarks: 72,
      totalMarks: 90,
      grade: 'A',
      status: 'Excellent'
    },
    {
      id: 2,
      name: 'Web Technologies',
      code: 'CS305',
      semester: 'Sem 4',
      internalMarks: 19,
      externalMarks: 78,
      totalMarks: 97,
      grade: 'A+',
      status: 'Excellent'
    },
    {
      id: 3,
      name: 'Data Structures & Algorithms',
      code: 'CS302',
      semester: 'Sem 3',
      internalMarks: 16,
      externalMarks: 68,
      totalMarks: 84,
      grade: 'A',
      status: 'Good'
    },
    {
      id: 4,
      name: 'Operating Systems',
      code: 'CS303',
      semester: 'Sem 3',
      internalMarks: 17,
      externalMarks: 75,
      totalMarks: 92,
      grade: 'A',
      status: 'Excellent'
    },
    {
      id: 5,
      name: 'Microprocessors',
      code: 'EC301',
      semester: 'Sem 3',
      internalMarks: 14,
      externalMarks: 61,
      totalMarks: 75,
      grade: 'B+',
      status: 'Warning'
    }
  ];

  // Mock attendance data removed - now fetched from API via attendanceData state

  const learningResources = [
    {
      id: 1,
      title: 'AI Learning Assistant',
      description: 'Get instant help with your academic doubts 24/7',
      icon: Brain,
      ctaText: 'Ask Now',
      gradient: 'from-purple-100 to-pink-100',
      moduleKey: 'ai'
    },
    {
      id: 2,
      title: 'Virtual Lab Access',
      description: 'Practice coding and experiments in an interactive environment',
      icon: Zap,
      ctaText: 'Access Lab',
      gradient: 'from-blue-100 to-cyan-100'
    },
    {
      id: 3,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed insights and recommendations',
      icon: BarChart2,
      ctaText: 'View Analytics',
      gradient: 'from-amber-100 to-orange-100'
    }
  ];

  const filteredMaterials = displayMaterials.filter(material => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFileType = selectedFileType === 'All' || material.type === selectedFileType;
    const matchesSemester = selectedSemester === 'All' || material.semester === selectedSemester;
    return matchesSearch && matchesFileType && matchesSemester;
  }).sort((a, b) => new Date(b.uploadDate || b.date || 0) - new Date(a.uploadDate || a.date || 0));

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
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h1 className="text-4xl font-black text-slate-900">Academics & Learning</h1>
            <p className="mt-2 text-lg text-slate-600">Manage your studies, track progress, and excel in your courses</p>
          </div>
        </div>
      </div>

      {/* Academic Stats Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div
            className={`grid gap-8 md:grid-cols-5 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {[
              { label: 'CGPA', value: stats.cgpa, suffix: '' },
              { label: 'Avg Attendance', value: stats.attendance, suffix: '%' },
              { label: 'Assignments', value: `${stats.assignments}/25`, suffix: '' },
              { label: 'Pending', value: stats.pending, suffix: '', color: 'text-yellow-600' },
              { label: 'Overdue', value: stats.overdue, suffix: '', color: 'text-red-600' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className={`text-3xl font-bold ${stat.color || 'text-slate-900'}`}>
                  {typeof stat.value === 'number' ? (
                    <>
                      {Math.floor(stat.value)}
                      {stat.value % 1 !== 0 && `.${Math.round((stat.value % 1) * 100)}`}
                    </>
                  ) : (
                    stat.value
                  )}
                  <span className="text-xl">{stat.suffix}</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-600 uppercase tracking-[0.3em]">
                  {stat.label}
                </p>
              </div>
            ))}
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
          <div className="flex gap-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 text-sm font-semibold transition relative ${
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

        {/* Search & Filters */}
        {activeTab === 'notes' && (
          <div
            className={`mb-8 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Search Bar */}
            <div className="mb-6 relative">
              <SearchIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or subject…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[20px] border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {/* Filter Chips */}
            <div className="space-y-4">
              {/* File Type Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">File Type:</span>
                <div className="flex flex-wrap gap-2">
                  {fileTypeFilters.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedFileType(type)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedFileType === type
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">Semester:</span>
                <div className="flex flex-wrap gap-2">
                  {semesterFilters.map(sem => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selectedSemester === sem
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Materials List */}
        {activeTab === 'notes' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader size={48} className="mb-4 animate-spin text-sky-600" />
                <p className="text-lg font-semibold text-slate-600">Loading materials...</p>
              </div>
            ) : (
              <div
                className={`space-y-4 mb-12 transform transition duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '250ms' }}
              >
                {filteredMaterials.map((material, index) => {
                  const Icon = material.icon || FileText;
                  return (
                    <div
                      key={material.id}
                      className={`flex items-center justify-between rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md hover:-translate-y-0.5 transform ${
                        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${250 + index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-slate-100 text-slate-600">
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{material.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                              {material.subject}
                            </span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {material.semester}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            by {material.author} • {material.date}
                          </p>
                          <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                            <span>🔥 {material.fileSize}</span>
                            <span>⬇️ {material.downloads} downloads</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDownload(material.id, material.fileUrl)}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader size={48} className="mb-4 animate-spin text-sky-600" />
                <p className="text-lg font-semibold text-slate-600">Loading assignments...</p>
              </div>
            ) : (
              <div
                className={`space-y-4 mb-12 transform transition duration-500 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '250ms' }}
              >
                {[...displayAssignments].sort((a, b) => {
                  // Recently uploaded first, most overdue last
                  if (a.isOverdue && !b.isOverdue) return 1;
                  if (!a.isOverdue && b.isOverdue) return -1;
                  if (a.isOverdue && b.isOverdue) return (b.daysOverdue || 0) - (a.daysOverdue || 0);
                  return new Date(b.dueDate || b.date || 0) - new Date(a.dueDate || a.date || 0);
                }).map((assignment, index) => (
              <div
                key={assignment.id}
                className={`rounded-[16px] border-l-4 ${
                  assignment.status === 'Graded'
                    ? 'border-l-emerald-500 bg-emerald-50 border border-emerald-200'
                    : assignment.isOverdue
                    ? 'border-l-red-500 bg-red-50 border border-red-200'
                    : 'border-l-yellow-500 bg-yellow-50 border border-yellow-200'
                } p-6 shadow-sm transition duration-300 hover:shadow-md transform ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${250 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{assignment.title}</h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          assignment.status === 'Graded'
                            ? 'bg-emerald-200 text-emerald-800'
                            : assignment.status === 'Overdue'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {assignment.status === 'Graded' && '🟢'} {assignment.status === 'Overdue' && '🔴'}{' '}
                        {assignment.status === 'Pending' && '🟡'} {assignment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{assignment.subject}</p>
                    <p className="mt-2 text-sm text-slate-700">{assignment.description}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                      <div>
                        <span className="font-semibold text-slate-700">Due Date:</span>
                        <span className="ml-2 text-slate-600">{assignment.dueDate}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Time Left:</span>
                        <span
                          className={`ml-2 font-semibold ${assignment.isOverdue ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {assignment.isOverdue ? `${assignment.daysOverdue} days overdue` : 'On Track'}
                        </span>
                      </div>
                      {assignment.status === 'Graded' && (
                        <div>
                          <span className="font-semibold text-slate-700">Marks:</span>
                          <span className="ml-2 font-bold text-slate-900">
                            {assignment.marks}/{assignment.totalMarks}
                          </span>
                        </div>
                      )}
                    </div>

                    {assignment.feedback && (
                      <div className="mt-3 rounded-[8px] bg-white bg-opacity-60 p-3 text-sm italic text-slate-700">
                        Faculty Feedback: {assignment.feedback}
                      </div>
                    )}
                  </div>

                  {assignment.status !== 'Graded' && (
                    <button 
                      onClick={() => handleSubmitAssignment(assignment.id)}
                      disabled={submittingAssignmentId === assignment.id}
                      className="flex items-center gap-2 whitespace-nowrap rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      {submittingAssignmentId === assignment.id ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <UploadIcon size={16} />
                          Submit
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}

        {/* Tests & Exams Tab */}
        {activeTab === 'tests' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            <StudentTestExam studentId={actualStudentId} onBack={() => setActiveTab('notes')} />
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div
            className={`mb-12 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            {attendanceLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-sky-600" />
                <span className="ml-2 text-slate-600">Loading attendance data...</span>
              </div>
            ) : (
              <StudentAttendanceView
                attendanceData={attendanceData}
                attendanceOverview={attendanceOverview}
                mounted={mounted}
              />
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div
            className={`mb-12 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '250ms' }}
          >
            {/* CGPA Card */}
            <div className="mb-8 rounded-[16px] border border-slate-200 bg-gradient-to-br from-blue-100 to-purple-100 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-700">Cumulative GPA</h3>
                  <p className="mt-4 text-5xl font-bold text-sky-700">8.50</p>
                  <p className="mt-2 text-sm text-slate-600">Out of 10.0</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">Excellent Performance</p>
                  <p className="mt-2 text-sm text-slate-600">Keep up the great work!</p>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <h3 className="mb-6 text-xl font-bold text-slate-900">Grade Distribution</h3>
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {[
                { grade: 'A+', count: 1, color: 'from-emerald-400 to-emerald-600' },
                { grade: 'A', count: 3, color: 'from-green-400 to-green-600' },
                { grade: 'B+', count: 1, color: 'from-blue-400 to-blue-600' }
              ].map((item, index) => (
                <div
                  key={index}
                  className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${item.color} p-6 text-white shadow-sm transition duration-300 hover:shadow-md transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${250 + index * 50}ms` }}
                >
                  <p className="text-6xl font-bold">{item.grade}</p>
                  <p className="mt-2 text-sm font-semibold">{item.count} subjects</p>
                </div>
              ))}
            </div>

            {/* Semester Grades */}
            <h3 className="mb-6 text-xl font-bold text-slate-900">Semester Grades</h3>
            <div className="space-y-4">
              {subjects.map((subject, index) => {
                const gradeColor =
                  subject.grade === 'A+'
                    ? 'emerald'
                    : subject.grade === 'A'
                    ? 'green'
                    : 'blue';

                const bgColors =
                  gradeColor === 'emerald'
                    ? 'bg-emerald-50'
                    : gradeColor === 'green'
                    ? 'bg-green-50'
                    : 'bg-blue-50';

                const textColors =
                  gradeColor === 'emerald'
                    ? 'text-emerald-700'
                    : gradeColor === 'green'
                    ? 'text-green-700'
                    : 'text-blue-700';

                return (
                  <div
                    key={subject.id}
                    className={`rounded-[16px] border border-slate-200 ${bgColors} p-6 transition duration-300 hover:shadow-md transform ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${300 + index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-slate-900">{subject.name}</h4>
                          <span className={`rounded-full ${textColors} bg-white px-3 py-1 text-sm font-bold`}>
                            {subject.grade}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {subject.code} • {subject.semester}
                        </p>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Internal Marks:</span>
                            <span className="font-bold text-slate-900">{subject.internalMarks}/20</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">External Marks:</span>
                            <span className="font-bold text-slate-900">{subject.externalMarks}/80</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-slate-900">Total Marks:</span>
                            <span className="text-lg font-bold text-sky-600">{subject.totalMarks}/100</span>
                          </div>
                        </div>

                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              gradeColor === 'emerald'
                                ? 'bg-emerald-500'
                                : gradeColor === 'green'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{
                              width: mounted ? `${subject.totalMarks}%` : '0%'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Learning Resources */}
        <div
          className={`transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Learning Resources</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {learningResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={resource.id}
                  className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${resource.gradient} p-6 transition duration-300 hover:shadow-md hover:-translate-y-1 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${400 + index * 50}ms` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/50 text-slate-700">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                  <button
                    onClick={() => resource.moduleKey ? onModuleSelect(resource.moduleKey) : null}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700 bg-transparent border-none cursor-pointer p-0"
                  >
                    {resource.ctaText} →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

/* ═══════════ STUDENT ATTENDANCE VIEW (Timetable-Mapped) ═══════════ */
const SUBJECTS = [
  { code: 'MO',     name: 'Mathematical Optimization',                   short: 'MO' },
  { code: 'ML',     name: 'Machine Learning',                            short: 'ML' },
  { code: 'DAA',    name: 'Design and Analysis of Algorithms',           short: 'DAA' },
  { code: 'CIS',    name: 'Cloud Infrastructure and Services',           short: 'CIS' },
  { code: 'FAIEDC', name: 'Foundations of AI-Enabled Edge Computing',    short: 'FAIEDC' },
  { code: 'FSAD',   name: 'Full Stack Application Development',         short: 'FSAD' },
  { code: 'CN',     name: 'Computer Networks',                           short: 'CN' },
];

const TIMETABLE = {
  Monday:    [
    { subject: 'MO',     type: 'Theory',           time: '8:15 AM – 9:05 AM' },
    { subject: 'MO',     type: 'Theory',           time: '9:05 AM – 9:55 AM' },
    { subject: 'FSAD',   type: 'Theory',           time: '10:10 AM – 11:00 AM' },
    { subject: 'FSAD',   type: 'Theory',           time: '11:00 AM – 11:50 AM' },
    { subject: 'FAIEDC', type: 'Theory',           time: '11:50 AM – 12:45 PM' },
    { subject: 'CIS',    type: 'Theory',           time: '1:30 PM – 2:20 PM' },
    { subject: 'ML',     type: 'Lab',              time: '2:20 PM – 3:10 PM' },
    { subject: 'ML',     type: 'Lab',              time: '3:10 PM – 4:00 PM' },
  ],
  Tuesday:   [
    { subject: 'DAA',    type: 'Theory',           time: '8:15 AM – 9:05 AM' },
    { subject: 'DAA',    type: 'Theory',           time: '9:05 AM – 9:55 AM' },
    { subject: 'FSAD',   type: 'Theory',           time: '10:10 AM – 11:00 AM' },
    { subject: 'FSAD',   type: 'Theory',           time: '11:00 AM – 11:50 AM' },
    { subject: 'FAIEDC', type: 'Theory',           time: '11:50 AM – 12:45 PM' },
    { subject: 'CIS',    type: 'Theory',           time: '1:30 PM – 2:20 PM' },
    { subject: 'CIS',    type: 'Theory',           time: '2:20 PM – 3:10 PM' },
    { subject: 'Sports', type: 'Sports',           time: '3:10 PM – 4:00 PM' },
  ],
  Wednesday: [
    { subject: 'DAA',    type: 'Lab',              time: '8:15 AM – 9:05 AM' },
    { subject: 'DAA',    type: 'Lab',              time: '9:05 AM – 9:55 AM' },
    { subject: 'CN',     type: 'Theory',           time: '10:10 AM – 11:00 AM' },
    { subject: 'FAIEDC', type: 'Lab',              time: '11:00 AM – 11:50 AM' },
    { subject: 'FAIEDC', type: 'Lab',              time: '11:50 AM – 12:45 PM' },
    { subject: 'ML',     type: 'Theory',           time: '1:30 PM – 2:20 PM' },
    { subject: 'Coding', type: 'Coding Practice',  time: '2:20 PM – 3:10 PM' },
    { subject: 'Coding', type: 'Coding Practice',  time: '3:10 PM – 4:00 PM' },
  ],
  Thursday:  [
    { subject: 'CRT',    type: 'CRT',              time: '10:10 AM – 11:00 AM' },
    { subject: 'CRT',    type: 'CRT',              time: '11:00 AM – 11:50 AM' },
    { subject: 'DAA',    type: 'Theory',           time: '11:50 AM – 12:45 PM' },
    { subject: 'CN',     type: 'Theory',           time: '1:30 PM – 2:20 PM' },
    { subject: 'DA',     type: 'DA/Mentor-Mentee', time: '2:20 PM – 4:00 PM' },
  ],
  Friday:    [
    { subject: 'MO',     type: 'Tutorial',         time: '8:15 AM – 9:05 AM' },
    { subject: 'MO',     type: 'Tutorial',         time: '9:05 AM – 9:55 AM' },
    { subject: 'CIS',    type: 'Theory',           time: '10:10 AM – 11:00 AM' },
    { subject: 'DAA',    type: 'Theory',           time: '11:00 AM – 11:50 AM' },
    { subject: 'DAA',    type: 'Theory',           time: '11:50 AM – 12:45 PM' },
    { subject: 'CN',     type: 'Theory',           time: '1:30 PM – 2:20 PM' },
    { subject: 'CN',     type: 'Theory',           time: '2:20 PM – 3:10 PM' },
  ],
  Saturday:  [
    { subject: 'ML',     type: 'Theory',           time: '8:15 AM – 9:05 AM' },
    { subject: 'ML',     type: 'Theory',           time: '9:05 AM – 9:55 AM' },
    { subject: 'CIS',    type: 'Lab',              time: '10:10 AM – 11:00 AM' },
    { subject: 'CIS',    type: 'Lab',              time: '11:00 AM – 11:50 AM' },
    { subject: 'DAA',    type: 'Theory',           time: '11:50 AM – 12:45 PM' },
    { subject: 'CN',     type: 'Lab',              time: '1:30 PM – 2:20 PM' },
    { subject: 'CN',     type: 'Lab',              time: '2:20 PM – 3:10 PM' },
    { subject: 'Sports', type: 'Sports',           time: '3:10 PM – 4:00 PM' },
  ],
};

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const typeBadge = (type) => {
  const m = {
    Theory:   'bg-blue-100 text-blue-700',
    Lab:      'bg-purple-100 text-purple-700',
    Practical:'bg-amber-100 text-amber-700',
    Tutorial: 'bg-cyan-100 text-cyan-700',
    Sports:   'bg-green-100 text-green-700',
    CRT:      'bg-orange-100 text-orange-700',
    'Coding Practice': 'bg-teal-100 text-teal-700',
    'DA/Mentor-Mentee': 'bg-pink-100 text-pink-700',
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${m[type] || 'bg-slate-100 text-slate-600'}`}>{type}</span>;
};

const typeIcon = (type) => {
  if (type === 'Lab') return <FlaskConical size={14} className="text-purple-500" />;
  if (type === 'Practical') return <BookMarked size={14} className="text-amber-500" />;
  if (type === 'Tutorial') return <BookOpen size={14} className="text-cyan-500" />;
  if (type === 'Sports') return <Users size={14} className="text-green-500" />;
  if (type === 'CRT') return <Clock size={14} className="text-orange-500" />;
  if (type === 'Coding Practice') return <BookMarked size={14} className="text-teal-500" />;
  if (type === 'DA/Mentor-Mentee') return <Users size={14} className="text-pink-500" />;
  return <BookOpen size={14} className="text-blue-500" />;
};

function StudentAttendanceView({ attendanceData, attendanceOverview, mounted }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('subjects'); // 'subjects' | 'timetable'

  // Merge API data with our subject list
  const subjectStats = useMemo(() => {
    return SUBJECTS.map(sub => {
      // Try to find matching data from API by code or name
      const apiMatch = attendanceData.find(
        d => d.subjectCode === sub.code || d.subject === sub.name ||
             d.subject === sub.short || (d.subject || '').toLowerCase().includes(sub.short.toLowerCase())
      );
      return {
        ...sub,
        attended: apiMatch?.attended ?? 0,
        total: apiMatch?.total ?? 0,
        percentage: apiMatch?.percentage ?? 0,
        theory: apiMatch?.theory ?? { attended: 0, total: 0 },
        lab: apiMatch?.lab ?? { attended: 0, total: 0 },
        practical: apiMatch?.practical ?? { attended: 0, total: 0 },
      };
    });
  }, [attendanceData]);

  const overall = attendanceOverview;

  const pctColor = (pct) => pct >= 85 ? 'emerald' : pct >= 75 ? 'yellow' : 'red';
  const pctGradient = (pct) => {
    if (pct >= 85) return 'from-emerald-500 to-emerald-600';
    if (pct >= 75) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Overall', value: `${overall.overallPercentage?.toFixed?.(1) ?? 0}%`, sub: `${overall.totalAttended || 0}/${overall.totalClasses || 0}`, color: 'from-sky-500 to-sky-600', icon: BarChart3 },
          { label: 'Subjects', value: SUBJECTS.length, sub: 'enrolled', color: 'from-indigo-500 to-indigo-600', icon: BookOpen },
          { label: 'Classes Attended', value: overall.totalAttended || 0, sub: 'total', color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
          { label: 'Critical', value: (overall.criticalSubjects || []).length, sub: 'below 75%', color: 'from-red-500 to-red-600', icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className={`rounded-xl bg-gradient-to-br ${s.color} p-4 text-white shadow-md`}>
            <s.icon size={16} className="mb-1 opacity-80" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-[10px] text-white/80">{s.label} · {s.sub}</p>
          </div>
        ))}
      </div>

      {/* Critical Alert */}
      {overall.criticalSubjects && overall.criticalSubjects.length > 0 && (
        <div className="rounded-xl border-l-4 border-l-red-500 border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 text-red-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Attendance Below 75% — Detention Risk</h4>
              <div className="mt-2 space-y-1">
                {overall.criticalSubjects.map((s, i) => (
                  <p key={i} className="text-xs text-red-700">● <strong>{s.subject}</strong> — {s.percentage?.toFixed?.(1) ?? 0}%</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        {['subjects', 'timetable'].map(m => (
          <button key={m} onClick={() => setViewMode(m)}
            className={`rounded-lg px-4 py-2 text-xs font-bold capitalize transition ${
              viewMode === m ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>{m === 'subjects' ? 'Subject-wise' : 'Timetable View'}</button>
        ))}
      </div>

      {/* ── Subject-wise View ── */}
      {viewMode === 'subjects' && (
        <div className="space-y-3">
          {subjectStats.map((sub, idx) => {
            const c = pctColor(sub.percentage);
            return (
              <div key={sub.code}
                className={`rounded-xl border-l-4 transition hover:shadow-md ${
                  c === 'emerald' ? 'border-l-emerald-500 bg-emerald-50 border border-emerald-200'
                  : c === 'yellow' ? 'border-l-yellow-500 bg-yellow-50 border border-yellow-200'
                  : 'border-l-red-500 bg-red-50 border border-red-200'
                } p-5`}
                style={{ transitionDelay: `${idx * 40}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{sub.name}</h4>
                    <p className="text-[11px] text-slate-500">{sub.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">{sub.percentage.toFixed(1)}%</p>
                    <p className="text-[11px] text-slate-500">{sub.attended}/{sub.total} classes</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 mb-3">
                  <div className={`h-full rounded-full bg-gradient-to-r ${pctGradient(sub.percentage)} transition-all duration-700`}
                    style={{ width: mounted ? `${Math.min(sub.percentage, 100)}%` : '0%' }} />
                </div>

                {/* Theory / Lab / Practical breakdown */}
                <div className="flex flex-wrap gap-3">
                  {[{ label: 'Theory', data: sub.theory, icon: BookOpen, clr: 'blue' },
                    { label: 'Lab', data: sub.lab, icon: FlaskConical, clr: 'purple' },
                    { label: 'Practical', data: sub.practical, icon: BookMarked, clr: 'amber' },
                  ].filter(t => t.data.total > 0).map(t => (
                    <div key={t.label} className={`flex items-center gap-1.5 rounded-lg bg-${t.clr}-100/60 px-2.5 py-1`}>
                      <t.icon size={12} className={`text-${t.clr}-600`} />
                      <span className="text-[10px] font-semibold text-slate-700">{t.label}: {t.data.attended}/{t.data.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Timetable View ── */}
      {viewMode === 'timetable' && (
        <div className="space-y-4">
          {DAYS_ORDER.map(day => (
            <div key={day} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-sky-500" />
                  <span className="text-sm font-bold text-slate-800">{day}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                    {TIMETABLE[day].length} session{TIMETABLE[day].length > 1 ? 's' : ''}
                  </span>
                </div>
                <span className={`transition-transform ${selectedDay === day ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {selectedDay === day && (
                <div className="border-t border-slate-100 divide-y divide-slate-100">
                  {TIMETABLE[day].map((slot, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50">
                      {typeIcon(slot.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          {SUBJECTS.find(s => s.code === slot.subject)?.name || slot.subject}
                        </p>
                        <p className="text-[10px] text-slate-500">{slot.time}</p>
                      </div>
                      {typeBadge(slot.type)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No data fallback */}
      {attendanceData.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <Clock size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600">No attendance data available yet.</p>
          <p className="text-sm text-slate-500 mt-2">Check back after your faculty marks attendance.</p>
        </div>
      )}
    </div>
  );
}

export default AcademicsAndLearning;
