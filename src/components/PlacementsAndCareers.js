import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Video,
  CheckCircle,
  TrendingUp,
  Brain,
  Users,
  BookOpen,
  Search as SearchIcon,
  BarChart3,
  Clock,
  Download,
  Edit2,
  X,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Plus,
  Trash2,
  Sparkles,
  ClipboardList,
  Award,
  Target,
  Calendar,
  Building2,
  ExternalLink,
  AlertCircle,
  Star
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const PlacementsAndCareers = ({ onBack = () => {}, studentId = '', email = '' }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('job-opportunities');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobOpportunities, setJobOpportunities] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [studentStats, setStudentStats] = useState(null);
  const [myInterviews, setMyInterviews] = useState([]);
  const [resume, setResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [editingResume, setEditingResume] = useState(false);
  const [resumeForm, setResumeForm] = useState(null);
  const [showResumeInputModal, setShowResumeInputModal] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumeInputData, setResumeInputData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    targetRole: '',
    industry: '',
    experienceLevel: 'fresher',
    careerGoal: '',
    degree: '',
    institution: '',
    graduationYear: '',
    gpa: '',
    experiences: [{ jobTitle: '', company: '', duration: '', location: '', responsibilities: '' }],
    projects: [{ name: '', description: '', technologies: '', impact: '' }],
    technicalSkills: '',
    tools: '',
    softSkills: '',
    certifications: '',
    resumeLength: '1 page',
    resumeTone: 'professional'
  });

  const actualStudentId = studentId || localStorage.getItem('klhStudentId') || localStorage.getItem('studentId');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      setLoadingJobs(true);
      try {
        const response = await fetch(`${API_BASE}/api/placements/jobs/active`);
        if (response.ok) {
          const data = await response.json();
          // Transform backend data to match frontend format
          const formattedJobs = data.map(job => ({
            id: job.id,
            title: job.position,
            company: job.company,
            location: job.location || 'India',
            salary: job.salary || 'Not disclosed',
            experience: job.experience || 'Fresher',
            type: job.type || 'Full-time',
            applicants: job.applicants || 0,
            description: job.description || '',
            requirements: job.skills || [],
            category: job.branch?.includes('CSE') ? 'Software' : 'Other'
          }));
          setJobOpportunities(formattedJobs);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!actualStudentId) return;
      try {
        const response = await fetch(`${API_BASE}/api/jobs/applications/${actualStudentId}`);
        if (response.ok) {
          const data = await response.json();
          setAppliedJobs(data);
        }
      } catch (error) {
        console.error('Failed to fetch applied jobs:', error);
      }
    };
    fetchAppliedJobs();
  }, [actualStudentId]);

  // Fetch student stats and interviews
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!actualStudentId) return;
      try {
        const [statsRes, interviewsRes] = await Promise.all([
          fetch(`${API_BASE}/api/placements/stats/student/${actualStudentId}`),
          fetch(`${API_BASE}/api/placements/interviews/student/${actualStudentId}`)
        ]);
        if (statsRes.ok) setStudentStats(await statsRes.json());
        if (interviewsRes.ok) setMyInterviews(await interviewsRes.json());
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      }
    };
    fetchStudentData();
  }, [actualStudentId]);

  // Fetch resume
  useEffect(() => {
    const fetchResume = async () => {
      if (!actualStudentId || activeTab !== 'resume-builder') return;
      setLoadingResume(true);
      try {
        const response = await fetch(`${API_BASE}/api/resume/${actualStudentId}`);
        if (response.ok) {
          const data = await response.json();
          setResume(data);
        }
      } catch (error) {
        console.error('Failed to fetch resume:', error);
      } finally {
        setLoadingResume(false);
      }
    };
    fetchResume();
  }, [actualStudentId, activeTab]);

  const handleApplyClick = (job) => {
    if (!actualStudentId) {
      alert('Please login to apply for jobs');
      return;
    }
    setSelectedJob(job);
    setCoverLetter('');
    setShowApplyModal(true);
  };

  const handleApplySubmit = async () => {
    if (!selectedJob || !actualStudentId) return;
    
    setApplyingJob(selectedJob.id);
    try {
      const response = await fetch(`${API_BASE}/api/jobs/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: actualStudentId,
          jobId: String(selectedJob.id),
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          coverLetter: coverLetter,
          resumeUrl: resume ? `/api/resume/${actualStudentId}` : ''
        })
      });

      if (response.ok) {
        const application = await response.json();
        setAppliedJobs([...appliedJobs, application]);
        alert('Application submitted successfully!');
        setShowApplyModal(false);
        setSelectedJob(null);
        setCoverLetter('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      alert('Failed to submit application');
    } finally {
      setApplyingJob(null);
    }
  };

  // Open the resume input form modal
  const handleOpenResumeForm = () => {
    if (!actualStudentId) {
      alert('Please login to generate resume');
      return;
    }
    // Pre-fill with existing data if available
    setResumeInputData(prev => ({
      ...prev,
      email: email || localStorage.getItem('klhEmail') || ''
    }));
    setShowResumeInputModal(true);
  };

  // Add experience entry
  const addExperience = () => {
    setResumeInputData(prev => ({
      ...prev,
      experiences: [...prev.experiences, { jobTitle: '', company: '', duration: '', location: '', responsibilities: '' }]
    }));
  };

  // Remove experience entry
  const removeExperience = (index) => {
    setResumeInputData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index)
    }));
  };

  // Add project entry
  const addProject = () => {
    setResumeInputData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: '', impact: '' }]
    }));
  };

  // Remove project entry
  const removeProject = (index) => {
    setResumeInputData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Generate AI Resume with form data
  const handleGenerateAI = async () => {
    if (!actualStudentId) {
      alert('Please login to generate resume');
      return;
    }

    // Validate required fields
    if (!resumeInputData.fullName || !resumeInputData.email || !resumeInputData.targetRole) {
      alert('Please fill in required fields: Full Name, Email, and Target Role');
      return;
    }
    
    setGeneratingAI(true);
    setShowResumeInputModal(false);
    
    try {
      const response = await fetch(`${API_BASE}/api/resume/generate-ai-custom/${actualStudentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeInputData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.resume) {
          setResume(data.resume);
          setShowResumePreview(true);
        } else {
          setResume(data);
          setShowResumePreview(true);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to generate AI resume');
      }
    } catch (error) {
      console.error('Failed to generate AI resume:', error);
      alert('Failed to generate AI resume');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Quick generate from profile (existing behavior)
  const handleQuickGenerate = async () => {
    if (!actualStudentId) {
      alert('Please login to generate resume');
      return;
    }
    
    setGeneratingAI(true);
    try {
      const response = await fetch(`${API_BASE}/api/resume/generate-ai/${actualStudentId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.resume) {
          setResume(data.resume);
          setShowResumePreview(true);
        } else {
          setResume(data);
          setShowResumePreview(true);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to generate AI resume');
      }
    } catch (error) {
      console.error('Failed to generate AI resume:', error);
      alert('Failed to generate AI resume');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleEditResume = () => {
    if (!resume) return;
    setResumeForm({...resume});
    setEditingResume(true);
  };

  const handleSaveResume = async () => {
    if (!resumeForm || !actualStudentId) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/resume/${actualStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeForm)
      });

      if (response.ok) {
        const data = await response.json();
        setResume(data);
        setEditingResume(false);
        alert('Resume updated successfully!');
      } else {
        alert('Failed to update resume');
      }
    } catch (error) {
      console.error('Failed to update resume:', error);
      alert('Failed to update resume');
    }
  };

  const handleDownloadResume = () => {
    if (!resume && !resumeInputData.fullName) {
      alert('No resume to download');
      return;
    }
    
    // Generate professional HTML resume for PDF
    const fullName = resumeInputData.fullName || resume?.title?.split('|')[0]?.trim() || 'Your Name';
    const targetRole = resumeInputData.targetRole || resume?.title?.split('|')[1]?.trim() || 'Professional';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${fullName} - Resume</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.5; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 25px; }
          .name { font-size: 28pt; font-weight: bold; color: #1e293b; letter-spacing: 1px; }
          .contact-info { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 12px; font-size: 10pt; color: #475569; }
          .contact-item { display: flex; align-items: center; gap: 5px; }
          .section { margin-bottom: 22px; }
          .section-title { font-size: 13pt; font-weight: bold; color: #1e293b; border-bottom: 1px solid #c7d2fe; padding-bottom: 5px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          .section-title::before { content: ''; width: 8px; height: 8px; background: #4f46e5; border-radius: 50%; }
          .summary { color: #475569; font-size: 10.5pt; line-height: 1.6; }
          .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .skill-category { padding: 12px; border-radius: 8px; }
          .skill-category.technical { background: #eef2ff; }
          .skill-category.tools { background: #f0fdfa; }
          .skill-category.soft { background: #fef9c3; }
          .skill-header { font-size: 9pt; font-weight: bold; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; }
          .skill-header.technical { background: #c7d2fe; color: #3730a3; }
          .skill-header.tools { background: #99f6e4; color: #115e59; }
          .skill-header.soft { background: #fde047; color: #854d0e; }
          .skill-list { list-style: none; font-size: 9.5pt; color: #475569; }
          .skill-list li { padding: 2px 0; }
          .skill-list li::before { content: '• '; color: #6366f1; }
          .experience-item { margin-bottom: 15px; }
          .exp-header { display: flex; justify-content: space-between; align-items: flex-start; }
          .exp-title { font-weight: bold; color: #1e293b; font-size: 11pt; }
          .exp-company { color: #4f46e5; font-size: 10pt; }
          .exp-date { color: #64748b; font-size: 9.5pt; }
          .exp-responsibilities { margin-top: 8px; padding-left: 15px; }
          .exp-responsibilities li { color: #475569; font-size: 10pt; margin-bottom: 4px; }
          .project-item { margin-bottom: 12px; }
          .project-name { font-weight: bold; color: #1e293b; font-size: 10.5pt; }
          .project-desc { color: #475569; font-size: 10pt; margin-top: 4px; }
          .project-tech { color: #4f46e5; font-size: 9pt; margin-top: 3px; }
          .project-impact { color: #059669; font-size: 9pt; margin-top: 2px; }
          .edu-header { display: flex; justify-content: space-between; align-items: flex-start; }
          .edu-degree { font-weight: bold; color: #1e293b; font-size: 11pt; }
          .edu-institution { color: #4f46e5; font-size: 10pt; }
          .edu-year { color: #64748b; font-size: 9.5pt; }
          .edu-gpa { color: #475569; font-size: 9pt; }
          .cert-list { display: flex; flex-wrap: wrap; gap: 8px; }
          .cert-item { background: #f1f5f9; padding: 5px 12px; border-radius: 20px; font-size: 9.5pt; color: #475569; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${fullName}</div>
          <div class="contact-info">
            ${resumeInputData.email ? `<span class="contact-item">✉ ${resumeInputData.email}</span>` : ''}
            ${resumeInputData.phone ? `<span class="contact-item">📞 ${resumeInputData.phone}</span>` : ''}
            ${resumeInputData.location ? `<span class="contact-item">📍 ${resumeInputData.location}</span>` : ''}
            ${resumeInputData.linkedIn ? `<span class="contact-item">🔗 ${resumeInputData.linkedIn}</span>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <p class="summary">${resume?.summary || resumeInputData.careerGoal || `Dynamic and results-driven dedicated fresher eager to contribute pursuing ${targetRole}. Strong problem-solving abilities with a passion for innovation and continuous learning.`}</p>
        </div>

        <div class="section">
          <div class="section-title">CORE SKILLS</div>
          <div class="skills-grid">
            ${resumeInputData.technicalSkills ? `
              <div class="skill-category technical">
                <div class="skill-header technical">Technical Skills</div>
                <ul class="skill-list">
                  ${resumeInputData.technicalSkills.split(',').map(s => `<li>${s.trim()}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${resumeInputData.tools ? `
              <div class="skill-category tools">
                <div class="skill-header tools">Tools & Technologies</div>
                <ul class="skill-list">
                  ${resumeInputData.tools.split(',').map(s => `<li>${s.trim()}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${resumeInputData.softSkills ? `
              <div class="skill-category soft">
                <div class="skill-header soft">Soft Skills</div>
                <ul class="skill-list">
                  ${resumeInputData.softSkills.split(',').map(s => `<li>${s.trim()}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>

        ${resumeInputData.experiences.some(e => e.jobTitle) ? `
          <div class="section">
            <div class="section-title">PROFESSIONAL EXPERIENCE</div>
            ${resumeInputData.experiences.filter(e => e.jobTitle).map(exp => `
              <div class="experience-item">
                <div class="exp-header">
                  <div>
                    <div class="exp-title">${exp.jobTitle}</div>
                    <div class="exp-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                  </div>
                  <div class="exp-date">${exp.duration}</div>
                </div>
                ${exp.responsibilities ? `
                  <ul class="exp-responsibilities">
                    ${exp.responsibilities.split('\\n').map(r => `<li>${r.replace(/^[-•]\\s*/, '')}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${resumeInputData.projects.some(p => p.name) ? `
          <div class="section">
            <div class="section-title">PROJECTS</div>
            ${resumeInputData.projects.filter(p => p.name).map(proj => `
              <div class="project-item">
                <div class="project-name">${proj.name}</div>
                <div class="project-desc">${proj.description}</div>
                ${proj.technologies ? `<div class="project-tech"><strong>Technologies:</strong> ${proj.technologies}</div>` : ''}
                ${proj.impact ? `<div class="project-impact"><strong>Impact:</strong> ${proj.impact}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="section">
          <div class="section-title">EDUCATION</div>
          <div class="edu-header">
            <div>
              <div class="edu-degree">${resumeInputData.degree || 'Bachelor\'s Degree'}</div>
              <div class="edu-institution">${resumeInputData.institution || 'University'}</div>
            </div>
            <div style="text-align: right;">
              <div class="edu-year">${resumeInputData.graduationYear || '2024'}</div>
              ${resumeInputData.gpa ? `<div class="edu-gpa">GPA: ${resumeInputData.gpa}</div>` : ''}
            </div>
          </div>
        </div>

        ${resumeInputData.certifications ? `
          <div class="section">
            <div class="section-title">CERTIFICATIONS</div>
            <div class="cert-list">
              ${resumeInputData.certifications.split(',').map(c => `<span class="cert-item">• ${c.trim()}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    // Open print dialog for PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const isJobApplied = (jobId) => {
    return appliedJobs.some(app => app.jobId === String(jobId));
  };

  const mockInterviews = [
    {
      id: 1,
      title: 'JavaScript Advanced Concepts',
      platform: 'Tech Interview Prep',
      type: 'Technical',
      difficulty: 'Hard',
      duration: 60,
      topics: ['Closures', 'Event Loop', 'Async/Await', 'Promises'],
      score: 85,
      feedback: 'Excellent understanding of concepts. Good explanation of event loop.',
      completed: true,
      date: '2024-01-10'
    },
    {
      id: 2,
      title: 'System Design Interview',
      platform: 'Tech Interview Prep',
      type: 'Technical',
      difficulty: 'Hard',
      duration: 90,
      topics: ['Scalability', 'Database Design', 'Caching', 'Load Balancing', 'Microservices'],
      score: 72,
      feedback: 'Good approach but could improve on database normalization and caching strategies.',
      completed: true,
      date: '2024-01-08'
    },
    {
      id: 3,
      title: 'HR Round – Behavioral Interview',
      platform: 'Tech Interview Prep',
      type: 'Behavioral',
      difficulty: 'Medium',
      duration: 30,
      topics: ['Conflict Resolution', 'Team Work', 'Leadership', 'Communication'],
      score: 78,
      feedback: 'Good communication skills. Work on concrete examples from your experience.',
      completed: true,
      date: '2024-01-05'
    },
    {
      id: 4,
      title: 'Data Structures & Algorithms – Arrays',
      platform: 'LeetCode Interview Prep',
      type: 'Technical',
      difficulty: 'Medium',
      duration: 45,
      topics: ['Arrays', 'Time Complexity', 'Space Complexity', 'Two Pointers', 'Sorting'],
      score: null,
      feedback: null,
      completed: false,
      date: null
    },
    {
      id: 5,
      title: 'React Component Design',
      platform: 'Frontend Masters',
      type: 'Technical',
      difficulty: 'Medium',
      duration: 60,
      topics: ['Component Architecture', 'State Management', 'Hooks', 'Performance Optimization'],
      score: null,
      feedback: null,
      completed: false,
      date: null
    },
    {
      id: 6,
      title: 'Case Study – Product Strategy',
      platform: 'Consulting Interview Prep',
      type: 'Case Study',
      difficulty: 'Hard',
      duration: 75,
      topics: ['Market Analysis', 'Strategy', 'Execution', 'Metrics'],
      score: null,
      feedback: null,
      completed: false,
      date: null
    }
  ];

  // Static fallback jobs (used when backend is empty)
  const fallbackJobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'Google',
      location: 'Bangalore, India',
      salary: '₹20-30 LPA',
      experience: '3-5 years',
      type: 'Full-time',
      applicants: 342,
      description: 'We are looking for an experienced Frontend Engineer to join our team and build amazing user experiences.',
      requirements: ['5+ years of experience in web development', 'Strong proficiency in React/Vue/Angular', 'Experience with TypeScript and modern CSS'],
      category: 'Software'
    },
    {
      id: 2,
      title: 'Data Scientist',
      company: 'Amazon',
      location: 'Hyderabad, India',
      salary: '₹18-28 LPA',
      experience: '2-4 years',
      type: 'Full-time',
      applicants: 289,
      description: 'Join our data science team to build ML models that impact millions of customers.',
      requirements: ['Strong background in machine learning and statistics', 'Proficiency in Python/R', 'Experience with TensorFlow or PyTorch'],
      category: 'Data Science'
    },
    {
      id: 3,
      title: 'DevOps Engineer',
      company: 'Meta',
      location: 'Bangalore, India',
      salary: '₹22-32 LPA',
      experience: '3-6 years',
      type: 'Full-time',
      applicants: 234,
      description: 'Manage infrastructure and deployment pipelines at scale.',
      requirements: ['Experience with Docker and Kubernetes', 'Knowledge of AWS/GCP/Azure', 'Proficiency in shell scripting'],
      category: 'Software'
    },
    {
      id: 4,
      title: 'Backend Engineer - Internship',
      company: 'Microsoft',
      location: 'Pune, India',
      salary: '₹3-5 LPA',
      experience: 'Fresher',
      type: 'Internship',
      applicants: 567,
      description: 'Internship opportunity to work on cloud infrastructure and backend services.',
      requirements: ['Good understanding of data structures and algorithms', 'Familiarity with any programming language', 'Basic knowledge of databases'],
      category: 'Software'
    },
    {
      id: 5,
      title: 'Financial Analyst',
      company: 'Goldman Sachs',
      location: 'Mumbai, India',
      salary: '₹15-25 LPA',
      experience: '1-3 years',
      type: 'Full-time',
      applicants: 198,
      description: 'Analyzing financial markets and developing investment strategies.',
      requirements: ['Strong analytical and quantitative skills', 'Knowledge of financial markets', 'Proficiency in Excel and VBA'],
      category: 'Finance'
    },
    {
      id: 6,
      title: 'Management Consultant',
      company: 'McKinsey',
      location: 'Delhi, India',
      salary: '₹20-32 LPA',
      experience: '1-2 years',
      type: 'Full-time',
      applicants: 412,
      description: 'Help clients solve complex business problems and drive strategic transformation.',
      requirements: ['Strong business acumen', 'Excellent communication skills', 'Ability to work in teams'],
      category: 'Consulting'
    }
  ];

  const recentPlacements = [
    { id: 1, name: 'Priya Sharma', role: 'Senior Developer', company: 'Google', salary: '₹25 LPA' },
    { id: 2, name: 'Arjun Patel', role: 'Data Scientist', company: 'Amazon', salary: '₹20 LPA' },
    { id: 3, name: 'Sneha Gupta', role: 'Product Manager', company: 'Microsoft', salary: '₹22 LPA' }
  ];

  const careerResources = [
    {
      id: 1,
      title: 'AI Interview Coach',
      description: 'Get personalized feedback from AI-powered interview coaching. Analyze your performance and improve communication skills.',
      icon: Brain,
      ctaText: 'Start Session',
      color: 'from-blue-100 to-blue-50'
    },
    {
      id: 2,
      title: 'Networking Events',
      description: 'Connect with recruiters and industry professionals. Attend virtual and in-person networking events.',
      icon: Users,
      ctaText: 'View Events',
      color: 'from-purple-100 to-purple-50'
    },
    {
      id: 3,
      title: 'Learning Resources',
      description: 'Access guides on resume writing, interview preparation, and career development tips from industry experts.',
      icon: BookOpen,
      ctaText: 'Browse Resources',
      color: 'from-emerald-100 to-emerald-50'
    }
  ];

  const tabs = [
    { id: 'job-opportunities', label: 'Job Opportunities', icon: Briefcase },
    { id: 'my-applications', label: 'My Applications', icon: ClipboardList },
    { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
    { id: 'mock-interviews', label: 'Mock Interviews', icon: Video },
    { id: 'analytics', label: 'My Analytics', icon: BarChart3 },
    { id: 'resources', label: 'Career Resources', icon: BookOpen }
  ];

  const filteredInterviews = mockInterviews.filter(interview => {
    if (selectedFilter === 'Pending') return !interview.completed;
    if (selectedFilter === 'Completed') return interview.completed;
    return true;
  });

  // Use backend jobs or fallback to static data if empty
  const displayJobs = jobOpportunities.length > 0 ? jobOpportunities : fallbackJobs;

  const filteredJobs = displayJobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (job.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dynamic stats from backend or calculated from state
  const stats = [
    { label: 'Profile Completion', value: studentStats?.profileCompletion ? `${studentStats.profileCompletion}%` : '85%', type: 'progress' },
    { label: 'Jobs Applied', value: `${appliedJobs.length}`, type: 'numeric' },
    { label: 'Interviews', value: `${studentStats?.interviewsCompleted || myInterviews.filter(i => i.status === 'Completed').length}`, type: 'numeric' },
    { label: 'Average Score', value: studentStats?.avgInterviewScore ? `${studentStats.avgInterviewScore}/10` : 'N/A', type: 'score' }
  ];

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
              <p className="mt-1 text-lg text-slate-600">Explore job opportunities and prepare for interviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div
            className={`grid gap-4 md:grid-cols-4 transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="rounded-[12px] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-sm transition duration-300 hover:shadow-md hover:scale-105 transform"
              >
                <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">{stat.value}</p>
                {stat.type === 'progress' && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-700"
                      style={{ width: mounted ? '85%' : '0%' }}
                    />
                  </div>
                )}
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

        {/* Job Opportunities Tab */}
        {activeTab === 'job-opportunities' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Search Bar */}
            <div className="mb-6 relative">
              <SearchIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[20px] border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              />
            </div>

            {/* Category Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {['All', 'Software', 'Data Science', 'Finance', 'Consulting', 'Other'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Job Cards */}
            <div className="space-y-4 mb-8">
              {filteredJobs.map((job, index) => (
                <div
                  key={job.id}
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${200 + index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <p className="mt-1 text-sm text-sky-600 font-semibold">{job.company}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span>📍 {job.location}</span>
                        <span>💼 {job.experience}</span>
                        <span>⏱️ {job.type}</span>
                        <span>👥 {job.applicants} applicants</span>
                      </div>

                      <p className="mt-3 text-sm text-slate-700">{job.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {job.requirements.map((req, idx) => (
                          <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {req.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{job.salary}</p>
                      <button 
                        onClick={() => handleApplyClick(job)}
                        disabled={isJobApplied(job.id) || applyingJob === job.id}
                        className={`mt-4 rounded-full px-6 py-2 text-sm font-semibold transition ${
                          isJobApplied(job.id)
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : applyingJob === job.id
                            ? 'bg-gray-400 text-white cursor-wait'
                            : 'bg-sky-600 text-white hover:bg-sky-700'
                        }`}
                      >
                        {isJobApplied(job.id) ? '✓ Applied' : applyingJob === job.id ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume Builder Tab */}
        {activeTab === 'resume-builder' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="rounded-[16px] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Resume Builder</h2>
                  <p className="mt-2 text-lg text-slate-600">Create a professional resume that stands out to recruiters.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDownloadResume}
                    disabled={!resume || loadingResume}
                    className="flex items-center gap-2 rounded-full border-2 border-sky-600 px-6 py-3 font-semibold text-sky-600 transition hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={18} />
                    {loadingResume ? 'Loading...' : 'Download'}
                  </button>
                  <button 
                    onClick={handleEditResume}
                    disabled={!resume || loadingResume || editingResume}
                    className="flex items-center gap-2 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit2 size={18} />
                    {editingResume ? 'Editing...' : 'Edit Resume'}
                  </button>
                </div>
              </div>

              {loadingResume ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-sky-600" size={48} />
                </div>
              ) : resume ? (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[12px] bg-white p-4">
                    <h4 className="font-bold text-slate-900">Professional Summary</h4>
                    <p className="mt-2 text-sm text-slate-600">{resume.summary || 'No summary added yet'}</p>
                  </div>
                  <div className="rounded-[12px] bg-white p-4">
                    <h4 className="font-bold text-slate-900">Experience</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {resume.experience && resume.experience.length > 0 
                        ? `${resume.experience.length} role(s) listed`
                        : 'No experience added yet'}
                    </p>
                  </div>
                  <div className="rounded-[12px] bg-white p-4">
                    <h4 className="font-bold text-slate-900">Skills</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {resume.skills && resume.skills.length > 0
                        ? resume.skills.slice(0, 5).join(', ') + (resume.skills.length > 5 ? '...' : '')
                        : 'No skills added yet'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-center text-slate-500 py-8">
                  No resume found. Click "Generate AI Resume" to create one.
                </div>
              )}

              <div className="mt-6 rounded-[12px] bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <h3 className="text-lg font-bold">Optimize Your Resume with AI</h3>
                <p className="mt-2 text-sm">Use AI-powered resume optimization to improve your resume score and get noticed by recruiters.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button 
                    onClick={handleOpenResumeForm}
                    disabled={generatingAI}
                    className="flex items-center gap-2 rounded-full bg-white px-6 py-2 font-semibold text-purple-600 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingAI ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {generatingAI ? 'Generating...' : '+ Generate AI Resume'}
                  </button>
                  <button 
                    onClick={handleQuickGenerate}
                    disabled={generatingAI}
                    className="flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-6 py-2 font-semibold text-white transition hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrendingUp size={18} />
                    Quick Generate from Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mock Interviews Tab */}
        {activeTab === 'mock-interviews' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Mock Interview Metrics */}
            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {[
                { label: 'Interviews Completed', value: '3', icon: CheckCircle, color: 'emerald' },
                { label: 'Average Score', value: '78.3', icon: BarChart3, color: 'amber' },
                { label: 'Total Practice', value: '6', icon: Video, color: 'blue' }
              ].map((metric, idx) => {
                const Icon = metric.icon;
                const colorClasses = {
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
                  amber: 'bg-amber-50 border-amber-200 text-amber-600',
                  blue: 'bg-blue-50 border-blue-200 text-blue-600'
                };
                return (
                  <div
                    key={idx}
                    className={`rounded-[16px] border ${colorClasses[metric.color]} p-6 shadow-sm transform transition duration-300 hover:shadow-md ${
                      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${200 + idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-600">{metric.label}</p>
                        <p className="mt-2 text-4xl font-bold text-slate-900">{metric.value}</p>
                      </div>
                      <Icon size={32} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
              {['All', 'Pending', 'Completed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedFilter === filter
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Interview Cards */}
            <div className="space-y-4 mb-8">
              {filteredInterviews.map((interview, index) => (
                <div
                  key={interview.id}
                  className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${250 + index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">{interview.title}</h3>
                        {interview.completed && <CheckCircle size={20} className="text-emerald-500" />}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{interview.platform}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          interview.type === 'Technical'
                            ? 'bg-blue-100 text-blue-700'
                            : interview.type === 'Behavioral'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {interview.type}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          interview.difficulty === 'Hard'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {interview.difficulty}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          <Clock size={14} />
                          {interview.duration} minutes
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {interview.topics.map((topic, idx) => (
                          <span key={idx} className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                            {topic}
                          </span>
                        ))}
                      </div>

                      {interview.completed && (
                        <>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-slate-700">Score</span>
                              <span className="text-lg font-bold text-slate-900">{interview.score}/100</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  interview.score >= 80
                                    ? 'bg-emerald-500'
                                    : interview.score >= 70
                                    ? 'bg-yellow-500'
                                    : 'bg-orange-500'
                                }`}
                                style={{ width: mounted ? `${interview.score}%` : '0%' }}
                              />
                            </div>
                          </div>

                          <div className="mt-3 rounded-[8px] bg-slate-100 p-3">
                            <p className="text-sm text-slate-700">
                              <span className="font-semibold">Feedback: </span>
                              {interview.feedback}
                            </p>
                          </div>

                          <p className="mt-2 text-xs text-slate-500">Completed on {interview.date}</p>
                        </>
                      )}
                    </div>

                    <button className={`whitespace-nowrap rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                      interview.completed
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}>
                      {interview.completed ? 'Review' : 'Start'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Practice CTA */}
            <div className="mb-8 rounded-[16px] bg-gradient-to-r from-blue-100 to-purple-100 p-8 shadow-sm">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-4 text-blue-600" size={40} />
                <h3 className="text-2xl font-bold text-slate-900">Continue Your Interview Practice</h3>
                <p className="mt-2 text-slate-600">Get ready for your dream job with our mock interview platform. Practice with industry experts.</p>
                <button className="mt-6 rounded-full bg-sky-600 px-8 py-3 font-semibold text-white transition hover:bg-sky-700">
                  Start Mock Interview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === 'my-applications' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Application Stats */}
            <div className="mb-8 grid gap-4 md:grid-cols-4">
              {[
                { label: 'Total Applied', value: appliedJobs.length || 0, icon: ClipboardList, color: 'blue' },
                { label: 'Under Review', value: appliedJobs.filter(j => j.status === 'applied' || j.status === 'under_review').length || 0, icon: Clock, color: 'amber' },
                { label: 'Interviews', value: appliedJobs.filter(j => j.status === 'interview').length || 0, icon: Calendar, color: 'purple' },
                { label: 'Offers', value: appliedJobs.filter(j => j.status === 'accepted').length || 0, icon: Award, color: 'emerald' }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                const colorClasses = {
                  blue: 'bg-blue-50 border-blue-200 text-blue-600',
                  amber: 'bg-amber-50 border-amber-200 text-amber-600',
                  purple: 'bg-purple-50 border-purple-200 text-purple-600',
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600'
                };
                return (
                  <div
                    key={idx}
                    className={`rounded-[16px] border ${colorClasses[stat.color]} p-6 shadow-sm transition duration-300 hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                        <p className="mt-2 text-4xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <Icon size={32} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Applications List */}
            {appliedJobs.length === 0 ? (
              <div className="rounded-[16px] border border-slate-200 bg-white p-12 text-center">
                <ClipboardList size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">No Applications Yet</h3>
                <p className="mt-2 text-slate-600">Start applying to jobs to track your applications here.</p>
                <button
                  onClick={() => setActiveTab('job-opportunities')}
                  className="mt-6 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((application, index) => (
                  <div
                    key={application.id || index}
                    className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-slate-100">
                            <Building2 size={24} className="text-slate-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{application.jobTitle}</h3>
                            <p className="text-sm text-slate-600">{application.company}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                            application.status === 'interview' ? 'bg-purple-100 text-purple-700' :
                            application.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {(application.status || 'applied').replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar size={14} />
                            Applied: {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                          View Details
                        </button>
                        {application.status === 'interview' && (
                          <button className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700">
                            Prepare
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Analytics Tab */}
        {activeTab === 'analytics' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Placement Readiness Score */}
            <div className="mb-8 rounded-[16px] bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white/80">Your Placement Readiness Score</h3>
                  <p className="mt-2 text-5xl font-bold">78%</p>
                  <p className="mt-2 text-white/80">You're on track! Complete a few more activities to boost your score.</p>
                </div>
                <div className="relative">
                  <div className="h-32 w-32 rounded-full border-8 border-white/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Target size={48} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {/* Profile Completion */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Profile Completion</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900">85%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[85%] rounded-full bg-blue-500" />
                </div>
                <p className="mt-2 text-sm text-slate-600">Add skills and certifications to complete</p>
              </div>

              {/* Resume Score */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <FileText size={20} className="text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Resume Score</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900">{resume ? '72' : '0'}%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full bg-emerald-500`} style={{ width: resume ? '72%' : '0%' }} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{resume ? 'Optimize with AI for better score' : 'Build your resume to get started'}</p>
              </div>

              {/* Interview Readiness */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Video size={20} className="text-purple-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Interview Readiness</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900">65%</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-[65%] rounded-full bg-purple-500" />
                </div>
                <p className="mt-2 text-sm text-slate-600">Complete more mock interviews</p>
              </div>

              {/* Skills Assessment */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                    <Brain size={20} className="text-amber-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Skills Verified</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900">4/10</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['React', 'JavaScript', 'Python', 'SQL'].map((skill, i) => (
                    <span key={i} className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {skill} ✓
                    </span>
                  ))}
                </div>
              </div>

              {/* Application Success Rate */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                    <TrendingUp size={20} className="text-cyan-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Application Success</h4>
                </div>
                <p className="text-3xl font-bold text-slate-900">
                  {appliedJobs.length > 0 
                    ? Math.round((appliedJobs.filter(j => j.status === 'INTERVIEW_SCHEDULED' || j.status === 'OFFER_RECEIVED').length / appliedJobs.length) * 100)
                    : 0}%
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {appliedJobs.filter(j => j.status === 'INTERVIEW_SCHEDULED').length} interviews from {appliedJobs.length} applications
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                  <h4 className="font-bold text-slate-900">Action Items</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    Complete DSA assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    Practice system design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Update resume with projects
                  </li>
                </ul>
              </div>
            </div>

            {/* Weekly Activity Chart Placeholder */}
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4">Your Weekly Activity</h4>
              <div className="flex items-end justify-between h-32 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [60, 80, 40, 100, 70, 30, 50];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${heights[i]}%` }}
                      />
                      <span className="text-xs text-slate-500">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Career Resources Tab */}
        {activeTab === 'resources' && (
          <div
            className={`transform transition duration-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Featured Resources */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Featured Resources</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {careerResources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <div
                      key={resource.id}
                      className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${resource.color} p-6 shadow-sm transition duration-300 hover:shadow-md hover:-translate-y-1`}
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/50">
                        <Icon size={24} className="text-slate-700" />
                      </div>
                      <h3 className="font-bold text-slate-900">{resource.title}</h3>
                      <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                      <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700">
                        {resource.ctaText} <ExternalLink size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Paths */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Learning Paths</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { title: 'Software Engineering Track', progress: 65, modules: 12, completed: 8, icon: '💻' },
                  { title: 'Data Science Track', progress: 40, modules: 10, completed: 4, icon: '📊' },
                  { title: 'Product Management', progress: 20, modules: 8, completed: 2, icon: '📋' },
                  { title: 'Interview Preparation', progress: 80, modules: 15, completed: 12, icon: '🎯' }
                ].map((path, idx) => (
                  <div key={idx} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{path.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{path.title}</h4>
                        <p className="text-sm text-slate-600">{path.completed}/{path.modules} modules completed</p>
                      </div>
                      <span className="text-lg font-bold text-sky-600">{path.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                    <button className="mt-4 w-full rounded-lg border border-sky-600 py-2 text-sm font-semibold text-sky-600 transition hover:bg-sky-50">
                      Continue Learning
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Upcoming Career Events</h3>
              <div className="space-y-4">
                {[
                  { title: 'Resume Workshop with Google HR', date: 'Jan 25, 2026', time: '3:00 PM', type: 'Workshop', spots: 45 },
                  { title: 'Mock Interview Session - Tech', date: 'Jan 27, 2026', time: '2:00 PM', type: 'Practice', spots: 20 },
                  { title: 'Career Fair - Spring 2026', date: 'Feb 5, 2026', time: '10:00 AM', type: 'Networking', spots: 200 },
                  { title: 'LinkedIn Profile Optimization', date: 'Feb 10, 2026', time: '4:00 PM', type: 'Workshop', spots: 50 }
                ].map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-purple-100">
                        <Calendar size={24} className="text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{event.title}</h4>
                        <p className="text-sm text-slate-600">{event.date} at {event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.type === 'Workshop' ? 'bg-blue-100 text-blue-700' :
                        event.type === 'Practice' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-sm text-slate-500">{event.spots} spots</span>
                      <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Placement Statistics */}
            <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Campus Placement Statistics</h3>
              <div className="grid gap-6 md:grid-cols-4">
                {[
                  { label: 'Placement Rate', value: '92%', icon: TrendingUp, color: 'emerald' },
                  { label: 'Avg. Package', value: '₹12.5 LPA', icon: Award, color: 'blue' },
                  { label: 'Top Companies', value: '50+', icon: Building2, color: 'purple' },
                  { label: 'Highest Package', value: '₹45 LPA', icon: Star, color: 'amber' }
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    emerald: 'text-emerald-600 bg-emerald-100',
                    blue: 'text-blue-600 bg-blue-100',
                    purple: 'text-purple-600 bg-purple-100',
                    amber: 'text-amber-600 bg-amber-100'
                  };
                  return (
                    <div key={idx} className="text-center">
                      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colorClasses[stat.color]}`}>
                        <Icon size={24} />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-sm text-slate-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Resume Optimization Section */}
        <div
          className={`mb-8 rounded-[16px] bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white shadow-sm transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Optimize Your Resume with AI</h3>
              <p className="mt-2 text-white/90">Use AI-powered resume optimization to improve your resume score and get noticed by recruiters.</p>
            </div>
            <button className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 py-3 font-semibold text-purple-600 transition hover:bg-slate-100">
              <span>+</span>
              Generate AI Resume
            </button>
          </div>
        </div>

        {/* Career Development Resources */}
        <div
          className={`mb-12 transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '450ms' }}
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Career Development Resources</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {careerResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={resource.id}
                  className={`rounded-[16px] border border-slate-200 bg-gradient-to-br ${resource.color} p-6 shadow-sm transition duration-300 hover:shadow-md hover:-translate-y-1 transform ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${450 + index * 50}ms` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-white/50">
                    <Icon size={24} className="text-slate-700" />
                  </div>
                  <h3 className="font-bold text-slate-900">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{resource.description}</p>
                  <a
                    href="#"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700"
                  >
                    {resource.ctaText} →
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Placements */}
        <div
          className={`mb-12 transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Recent Placements</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {recentPlacements.map((placement, index) => (
              <div
                key={placement.id}
                className={`rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:shadow-md transform ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${500 + index * 50}ms` }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-bold text-white">
                    {placement.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-slate-900">{placement.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-sky-600">{placement.role}</p>
                  <p className="mt-1 text-sm text-slate-600">{placement.company}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{placement.salary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div
          className={`rounded-[16px] bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-8 shadow-sm transform transition duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '550ms' }}
        >
          <div className="text-center">
            <TrendingUp className="mx-auto mb-4 text-blue-600" size={40} />
            <h2 className="text-3xl font-bold text-slate-900">Ready for Your Dream Job?</h2>
            <p className="mt-2 text-slate-600">
              Complete your profile, apply to jobs, and prepare with mock interviews. Our platform has helped hundreds of students land their dream jobs at top companies.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button className="rounded-full bg-sky-600 px-8 py-3 font-semibold text-white transition hover:bg-sky-700">
                Start Applying Now
              </button>
              <button className="rounded-full border-2 border-sky-600 px-8 py-3 font-semibold text-sky-600 transition hover:bg-sky-50">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Apply Job Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">Apply for {selectedJob.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">{selectedJob.company}</h4>
                <p className="text-sm text-slate-600">📍 {selectedJob.location} | 💼 {selectedJob.type}</p>
                <p className="text-sm font-semibold text-sky-600 mt-1">{selectedJob.salary}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're a great fit for this role..."
                  rows={6}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-slate-700">
                  {resume 
                    ? '✓ Your resume will be attached automatically' 
                    : '⚠️ No resume found. Please create one in the Resume Builder tab first.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 rounded-full border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplySubmit}
                  disabled={applyingJob === selectedJob.id || !coverLetter.trim()}
                  className="flex-1 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyingJob === selectedJob.id ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Resume Modal */}
      {editingResume && resumeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">Edit Resume</h3>
              <button onClick={() => setEditingResume(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Title</label>
                <input
                  type="text"
                  value={resumeForm.title || ''}
                  onChange={(e) => setResumeForm({...resumeForm, title: e.target.value})}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Professional Summary</label>
                <textarea
                  value={resumeForm.summary || ''}
                  onChange={(e) => setResumeForm({...resumeForm, summary: e.target.value})}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={resumeForm.skills ? resumeForm.skills.join(', ') : ''}
                  onChange={(e) => setResumeForm({...resumeForm, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                  placeholder="React, Node.js, MongoDB, AWS..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Template</label>
                <select
                  value={resumeForm.template || 'modern'}
                  onChange={(e) => setResumeForm({...resumeForm, template: e.target.value})}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="modern">Modern</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingResume(false)}
                  className="flex-1 rounded-full border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResume}
                  className="flex-1 rounded-full bg-sky-600 px-6 py-3 font-semibold text-white transition hover:bg-sky-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Input Form Modal */}
      {showResumeInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
              <button
                onClick={() => setShowResumeInputModal(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white transition"
              >
                <X size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Sparkles className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Resume Generator</h2>
                  <p className="text-white/80 text-sm">Fill in your details to generate a professional, ATS-optimized resume</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users size={20} className="text-indigo-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={resumeInputData.fullName}
                      onChange={(e) => setResumeInputData({...resumeInputData, fullName: e.target.value})}
                      placeholder="Johnathan Taylor"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={resumeInputData.email}
                      onChange={(e) => setResumeInputData({...resumeInputData, email: e.target.value})}
                      placeholder="johnathan.taylor@email.com"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={resumeInputData.phone}
                      onChange={(e) => setResumeInputData({...resumeInputData, phone: e.target.value})}
                      placeholder="+1 (123) 456-7890"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={resumeInputData.location}
                      onChange={(e) => setResumeInputData({...resumeInputData, location: e.target.value})}
                      placeholder="San Francisco, CA"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={resumeInputData.linkedIn}
                      onChange={(e) => setResumeInputData({...resumeInputData, linkedIn: e.target.value})}
                      placeholder="linkedin.com/in/johntaylor"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GitHub / Portfolio</label>
                    <input
                      type="url"
                      value={resumeInputData.github}
                      onChange={(e) => setResumeInputData({...resumeInputData, github: e.target.value})}
                      placeholder="github.com/johntaylor"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Career Details */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-indigo-600" />
                  Career Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Job Role *</label>
                    <input
                      type="text"
                      value={resumeInputData.targetRole}
                      onChange={(e) => setResumeInputData({...resumeInputData, targetRole: e.target.value})}
                      placeholder="Software Engineer"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={resumeInputData.industry}
                      onChange={(e) => setResumeInputData({...resumeInputData, industry: e.target.value})}
                      placeholder="Technology / Software"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                    <select
                      value={resumeInputData.experienceLevel}
                      onChange={(e) => setResumeInputData({...resumeInputData, experienceLevel: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="fresher">Fresher / Student</option>
                      <option value="intern">Intern</option>
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (3-5 years)</option>
                      <option value="senior">Senior (5+ years)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Career Objective</label>
                    <textarea
                      value={resumeInputData.careerGoal}
                      onChange={(e) => setResumeInputData({...resumeInputData, careerGoal: e.target.value})}
                      placeholder="Seeking challenging opportunities to leverage my technical skills..."
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" />
                  Education
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={resumeInputData.degree}
                      onChange={(e) => setResumeInputData({...resumeInputData, degree: e.target.value})}
                      placeholder="Bachelor of Science in Computer Science"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
                    <input
                      type="text"
                      value={resumeInputData.institution}
                      onChange={(e) => setResumeInputData({...resumeInputData, institution: e.target.value})}
                      placeholder="University of California, Berkeley"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={resumeInputData.graduationYear}
                      onChange={(e) => setResumeInputData({...resumeInputData, graduationYear: e.target.value})}
                      placeholder="2024"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GPA / Percentage</label>
                    <input
                      type="text"
                      value={resumeInputData.gpa}
                      onChange={(e) => setResumeInputData({...resumeInputData, gpa: e.target.value})}
                      placeholder="3.8 / 4.0"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Experience */}
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase size={20} className="text-indigo-600" />
                    Professional Experience
                  </h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus size={16} /> Add Experience
                  </button>
                </div>
                {resumeInputData.experiences.map((exp, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 mb-3 border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-600">Experience {index + 1}</span>
                      {resumeInputData.experiences.length > 1 && (
                        <button onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Job Title (e.g., Software Engineer)"
                        value={exp.jobTitle}
                        onChange={(e) => {
                          const updated = [...resumeInputData.experiences];
                          updated[index].jobTitle = e.target.value;
                          setResumeInputData({...resumeInputData, experiences: updated});
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...resumeInputData.experiences];
                          updated[index].company = e.target.value;
                          setResumeInputData({...resumeInputData, experiences: updated});
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., Jun 2020 - Present)"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...resumeInputData.experiences];
                          updated[index].duration = e.target.value;
                          setResumeInputData({...resumeInputData, experiences: updated});
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...resumeInputData.experiences];
                          updated[index].location = e.target.value;
                          setResumeInputData({...resumeInputData, experiences: updated});
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <textarea
                        placeholder="Key responsibilities & achievements (use bullet points)"
                        value={exp.responsibilities}
                        onChange={(e) => {
                          const updated = [...resumeInputData.experiences];
                          updated[index].responsibilities = e.target.value;
                          setResumeInputData({...resumeInputData, experiences: updated});
                        }}
                        className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects */}
              <div className="bg-slate-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-indigo-600" />
                    Projects
                  </h3>
                  <button
                    onClick={addProject}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus size={16} /> Add Project
                  </button>
                </div>
                {resumeInputData.projects.map((proj, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 mb-3 border border-slate-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-slate-600">Project {index + 1}</span>
                      {resumeInputData.projects.length > 1 && (
                        <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Project Name"
                        value={proj.name}
                        onChange={(e) => {
                          const updated = [...resumeInputData.projects];
                          updated[index].name = e.target.value;
                          setResumeInputData({...resumeInputData, projects: updated});
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Technologies Used"
                        value={proj.technologies}
                        onChange={(e) => {
                          const updated = [...resumeInputData.projects];
                          updated[index].technologies = e.target.value;
                          setResumeInputData({...resumeInputData, projects: updated});
                        }}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                      <textarea
                        placeholder="Project Description"
                        value={proj.description}
                        onChange={(e) => {
                          const updated = [...resumeInputData.projects];
                          updated[index].description = e.target.value;
                          setResumeInputData({...resumeInputData, projects: updated});
                        }}
                        className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={2}
                      />
                      <input
                        type="text"
                        placeholder="Impact / Outcome"
                        value={proj.impact}
                        onChange={(e) => {
                          const updated = [...resumeInputData.projects];
                          updated[index].impact = e.target.value;
                          setResumeInputData({...resumeInputData, projects: updated});
                        }}
                        className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-indigo-600" />
                  Skills
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Technical Skills</label>
                    <textarea
                      value={resumeInputData.technicalSkills}
                      onChange={(e) => setResumeInputData({...resumeInputData, technicalSkills: e.target.value})}
                      placeholder="JavaScript, React, Node.js, Python, Django, SQL, HTML, CSS"
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tools & Technologies</label>
                    <textarea
                      value={resumeInputData.tools}
                      onChange={(e) => setResumeInputData({...resumeInputData, tools: e.target.value})}
                      placeholder="AWS, Docker, Git/GitHub, Jenkins, Agile/Scrum"
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Soft Skills</label>
                    <textarea
                      value={resumeInputData.softSkills}
                      onChange={(e) => setResumeInputData({...resumeInputData, softSkills: e.target.value})}
                      placeholder="Problem-Solving, Team Collaboration, Communication, Leadership"
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-indigo-600" />
                  Certifications & Achievements
                </h3>
                <textarea
                  value={resumeInputData.certifications}
                  onChange={(e) => setResumeInputData({...resumeInputData, certifications: e.target.value})}
                  placeholder="AWS Certified Solutions Architect, Certified ScrumMaster (CSM), etc."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Resume Preferences */}
              <div className="bg-slate-50 rounded-xl p-5">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Resume Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resume Length</label>
                    <select
                      value={resumeInputData.resumeLength}
                      onChange={(e) => setResumeInputData({...resumeInputData, resumeLength: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
                    >
                      <option value="1 page">1 Page</option>
                      <option value="2 pages">2 Pages</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resume Tone</label>
                    <select
                      value={resumeInputData.resumeTone}
                      onChange={(e) => setResumeInputData({...resumeInputData, resumeTone: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2.5"
                    >
                      <option value="professional">Professional</option>
                      <option value="modern">Modern</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResumeInputModal(false)}
                  className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
                >
                  {generatingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  {generatingAI ? 'Generating Resume...' : 'Generate Professional Resume'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Resume Preview Modal */}
      {showResumePreview && resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowResumePreview(false)}
              className="absolute right-4 top-4 z-10 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"
            >
              <X size={20} />
            </button>

            {/* Resume Content */}
            <div className="resume-preview p-8" id="resume-content">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-200 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-slate-800 tracking-wide">
                  {resumeInputData.fullName || resume.title?.split('|')[0]?.trim() || 'Your Name'}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-sm text-slate-600">
                  {(resumeInputData.email || email) && (
                    <span className="flex items-center gap-1">
                      <Mail size={14} className="text-indigo-600" />
                      {resumeInputData.email || email}
                    </span>
                  )}
                  {resumeInputData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={14} className="text-indigo-600" />
                      {resumeInputData.phone}
                    </span>
                  )}
                  {resumeInputData.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} className="text-indigo-600" />
                      {resumeInputData.location}
                    </span>
                  )}
                  {resumeInputData.linkedIn && (
                    <span className="flex items-center gap-1">
                      <Linkedin size={14} className="text-indigo-600" />
                      {resumeInputData.linkedIn}
                    </span>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-200 pb-1 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {resume.summary || resumeInputData.careerGoal || 'Results-oriented professional with expertise in developing scalable solutions.'}
                </p>
              </div>

              {/* Core Skills */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-200 pb-1 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  CORE SKILLS
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {resumeInputData.technicalSkills && (
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-indigo-800 mb-2 bg-indigo-200 px-2 py-1 rounded">Technical Skills</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {resumeInputData.technicalSkills.split(',').map((skill, i) => (
                          <li key={i} className="flex items-start gap-1">• {skill.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {resumeInputData.tools && (
                    <div className="bg-teal-50 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-teal-800 mb-2 bg-teal-200 px-2 py-1 rounded">Tools & Technologies</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {resumeInputData.tools.split(',').map((tool, i) => (
                          <li key={i} className="flex items-start gap-1">• {tool.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {resumeInputData.softSkills && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-amber-800 mb-2 bg-amber-200 px-2 py-1 rounded">Soft Skills</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {resumeInputData.softSkills.split(',').map((skill, i) => (
                          <li key={i} className="flex items-start gap-1">• {skill.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Experience */}
              {resumeInputData.experiences.some(e => e.jobTitle) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-200 pb-1 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    PROFESSIONAL EXPERIENCE
                  </h2>
                  {resumeInputData.experiences.filter(e => e.jobTitle).map((exp, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800">{exp.jobTitle}</h3>
                          <p className="text-sm text-indigo-600">{exp.company}{exp.location && `, ${exp.location}`}</p>
                        </div>
                        <span className="text-sm text-slate-500">{exp.duration}</span>
                      </div>
                      {exp.responsibilities && (
                        <ul className="mt-2 text-sm text-slate-600 space-y-1">
                          {exp.responsibilities.split('\n').map((line, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-indigo-600 mt-1">•</span>
                              <span>{line.replace(/^[-•]\s*/, '')}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resumeInputData.projects.some(p => p.name) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-200 pb-1 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    PROJECTS
                  </h2>
                  {resumeInputData.projects.filter(p => p.name).map((proj, index) => (
                    <div key={index} className="mb-3">
                      <h3 className="font-bold text-slate-800">{proj.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{proj.description}</p>
                      {proj.technologies && (
                        <p className="text-xs text-indigo-600 mt-1">
                          <strong>Technologies:</strong> {proj.technologies}
                        </p>
                      )}
                      {proj.impact && (
                        <p className="text-xs text-emerald-600 mt-1">
                          <strong>Impact:</strong> {proj.impact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-200 pb-1 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  EDUCATION
                </h2>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{resumeInputData.degree || 'Bachelor\'s Degree'}</h3>
                    <p className="text-sm text-indigo-600">{resumeInputData.institution || 'University'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-500">{resumeInputData.graduationYear || '2024'}</span>
                    {resumeInputData.gpa && (
                      <p className="text-xs text-slate-600">GPA: {resumeInputData.gpa}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {resumeInputData.certifications && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-indigo-200 pb-1 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    CERTIFICATIONS
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeInputData.certifications.split(',').map((cert, i) => (
                      <span key={i} className="text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-700">
                        • {cert.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ATS Keywords & Tips */}
              <div className="mt-8 pt-6 border-t-2 border-indigo-200">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                  <h3 className="font-bold text-indigo-800 mb-3">TOP 5 ATS KEYWORDS | 3 UI & CONTENT IMPROVEMENT TIPS</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <ol className="text-slate-600 space-y-1">
                        <li>1. {resumeInputData.targetRole || 'Software Development'}</li>
                        <li>2. {resumeInputData.technicalSkills?.split(',')[0]?.trim() || 'Full Stack Development'}</li>
                        <li>3. {resumeInputData.tools?.split(',')[0]?.trim() || 'Cloud Technologies'}</li>
                      </ol>
                    </div>
                    <div>
                      <ol className="text-slate-600 space-y-1">
                        <li>1. Highlight personal achievements within projects</li>
                        <li>2. Add quantified metrics to demonstrate impact</li>
                        <li>3. Incorporate role-specific action verbs</li>
                      </ol>
                    </div>
                  </div>
                  <button className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition">
                    Generate Cover Letter
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex gap-3">
              <button
                onClick={() => setShowResumePreview(false)}
                className="flex-1 rounded-xl border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit Details
              </button>
              <button
                onClick={handleDownloadResume}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                <Download size={18} />
                Download Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementsAndCareers;
