import React, { useState, useEffect } from 'react';
import {
	Award,
	Building2,
	Brain,
	Briefcase,
	BookOpenCheck,
	Camera,
	ClipboardCheck,
	FileSearch,
	Lock,
	MessageCircle,
	MonitorCheck,
	ShieldCheck,
	Sparkles,
	Users,
	Wrench
} from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import FeatureCategories from './components/FeatureCategories';
import CorePillars from './components/CorePillars';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import AuthenticationScreen from './components/AuthenticationScreen';
import FacultyAuthenticationScreen from './components/FacultyAuthenticationScreen';
import StudentDashboard from './components/StudentDashboard.js';
import FacultyDashboard from './components/FacultyDashboard.js';
import StudentProfile from './components/StudentProfile.jsx';
import FacultyProfile from './components/FacultyProfile.jsx';
import ReelsAndFeed from './components/ReelsAndFeed.js';
import AcademicsAndLearning from './components/AcademicsAndLearning.js';
import FacultyAcademics from './components/FacultyAcademics.js';
import CertificatesAndAchievements from './components/CertificatesAndAchievements.js';
import PlacementsAndCareers from './components/PlacementsAndCareers.js';
import StudentPlacementsNew from './components/StudentPlacementsNew.js';
import FacultyPlacements from './components/FacultyPlacements.js';
import FacultyCertificates from './components/FacultyCertificates.js';
import PublicCertificateView from './components/PublicCertificateView.jsx';
import ChatModule from './components/ChatModule.js';
import StudentSafetyCenter from './components/StudentSafetyCenter.jsx';
import FacultySafetyCenter from './components/FacultySafetyCenter.jsx';
import StudentAnalytics from './components/StudentAnalytics.jsx';
import StudentAnalyticsEnhanced from './components/StudentAnalyticsEnhanced.jsx';
import FacultyAnalytics from './components/FacultyAnalytics.jsx';
import StudentDiscover from './components/StudentDiscover.jsx';
import FacultyDiscover from './components/FacultyDiscover.jsx';
import StudentAIAssistant from './components/StudentAIAssistant.js';
import FacultyAIAssistant from './components/FacultyAIAssistant.js';
import StudentEventsClubs from './components/StudentEventsClubs.jsx';
import FacultyEventsClubsCenter from './components/FacultyEventsClubsCenter.jsx';
import Analytics from './components/Analytics.js';

const heroFeatures = [
	{ emoji: '📷', label: 'Reels' },
	{ emoji: '📚', label: 'Academics' },
	{ emoji: '💼', label: 'Placements' },
	{ emoji: '🤝', label: 'Community' },
	{ emoji: '🧠', label: 'AI Smart' },
	{ emoji: '🛡', label: 'Secure' }
];

const stats = [
	{ value: '42+', label: 'Active Modules', description: 'Universities sharing academics, community, and admin experiences' },
	{ value: '12+', label: 'AI Features', description: 'Chat assistants, insights, guides, and teammate matching bots' },
	{ value: '6+', label: 'Security Layers', description: 'OTP, JWT, RBAC, and monitoring across every touchpoint' }
];

const featureCategories = [
	{
		title: 'Security & Authentication',
		emoji: '🔐',
		summary: 'Secure access, monitoring, and analytics for campus-wide trust',
		cards: [
			{
				title: 'Secure University Login',
				description: 'KLH email verification with OTP, JWT, RBAC, and encrypted passwords',
				icon: <Lock className="h-6 w-6" />
			},
			{
				title: 'Admin & Security Panel',
				description: 'Fake account blocking, chat monitoring, and analytics',
				icon: <ShieldCheck className="h-6 w-6" />
			}
		]
	},
	{
		title: 'Digital Identity',
		emoji: '👤',
		summary: 'Verified profiles, certificates, and achievements in one hub',
		cards: [
			{
				title: 'Personal Profile',
				description: 'Digital identity with verified certificates, skills, GitHub/LinkedIn, and portfolio',
				icon: <Users className="h-6 w-6" />
			},
			{
				title: 'Certificates & Achievements',
				description: 'Upload and verify internships, courses, hackathons, and sports achievements',
				icon: <Award className="h-6 w-6" />
			}
		]
	},
	{
		title: 'Social & Community',
		emoji: '📸',
		summary: 'Expressive community features that keep campus life vibrant',
		cards: [
			{
				title: 'Reels & Video Sharing',
				description: 'Share project demos, performances, and trending algorithms',
				icon: <Camera className="h-6 w-6" />
			},
			{
				title: 'University-wide Chat',
				description: 'Real-time messaging with file sharing, voice notes, and encryption',
				icon: <MessageCircle className="h-6 w-6" />
			},
			{
				title: 'Events & Clubs',
				description: 'Create clubs, manage events with QR entry, auto-attendance, and certificates',
				icon: <ClipboardCheck className="h-6 w-6" />
			}
		]
	},
	{
		title: 'Discovery & Connection',
		emoji: '🔎',
		summary: 'Precision matching and search for teammates and opportunities',
		cards: [
			{
				title: 'Smart Search & Discovery',
				description: 'Find students by skills, branch, and year for hackathons and internships',
				icon: <FileSearch className="h-6 w-6" />
			},
			{
				title: 'AI Project Teammate Finder',
				description: 'Matches students based on skills, availability, and project preferences',
				icon: <MonitorCheck className="h-6 w-6" />
			}
		]
	},
	{
		title: 'Academics & Learning',
		emoji: '📚',
		summary: 'Study aids, attendance, assignments, and AI tutoring together',
		cards: [
			{
				title: 'Notes & Study Materials',
				description: 'Central hub for notes, PPTs, and question papers with offline access',
				icon: <BookOpenCheck className="h-6 w-6" />
			},
			{
				title: 'Smart Attendance & Assignments',
				description: 'Real-time attendance tracking with plagiarism-aware submissions',
				icon: <ClipboardCheck className="h-6 w-6" />
			},
			{
				title: 'AI Learning Assistant',
				description: '24/7 chatbot for subject doubts, coding help, and exam preparation',
				icon: <Brain className="h-6 w-6" />
			}
		]
	},
	{
		title: 'Placements & Careers',
		emoji: '💼',
		summary: 'Jobs, resumes, and coaching for every student journey',
		cards: [
			{
				title: 'Placement Portal',
				description: 'Centralized job postings with eligibility checking and auto-application',
				icon: <Briefcase className="h-6 w-6" />
			},
			{
				title: 'AI Resume Builder',
				description: 'Auto-generate ATS-optimized resumes from profile, skills, and certificates',
				icon: <Sparkles className="h-6 w-6" />
			},
			{
				title: 'Mock Interview System',
				description: 'Practice interviews with alumni/faculty, AI feedback, and improvement plans',
				icon: <Wrench className="h-6 w-6" />
			}
		]
	}
];

const pillars = [
	{
		title: 'Social Media',
		description: 'Reels, certificates, and community sharing',
		icon: <Camera className="h-6 w-6" />
	},
	{
		title: 'Academics',
		description: 'Study materials, attendance, and assessments',
		icon: <BookOpenCheck className="h-6 w-6" />
	},
	{
		title: 'Placements',
		description: 'Jobs, AI resumes, and mock interviews',
		icon: <Briefcase className="h-6 w-6" />
	},
	{
		title: 'AI Intelligence',
		description: 'Smart recommendations and automation',
		icon: <Brain className="h-6 w-6" />
	},
	{
		title: 'Administration',
		description: 'Digital ID, grievances, and utilities',
		icon: <Building2 className="h-6 w-6" />
	},
	{
		title: 'Safety & Security',
		description: 'User verification and emergency support',
		icon: <ShieldCheck className="h-6 w-6" />
	}
];

const App = () => {
	const [view, setView] = useState('landing');
	const [userRole, setUserRole] = useState(null); // 'student' or 'faculty'
	const [email, setEmail] = useState(() => localStorage.getItem('klhEmail') || '');
	const [studentId, setStudentId] = useState(() => localStorage.getItem('klhStudentId') || localStorage.getItem('studentId') || null);
	const [facultyId, setFacultyId] = useState(() => localStorage.getItem('klhFacultyId') || null);
	const [shareLink, setShareLink] = useState(null);

	// Check for certificate share link in URL
	useEffect(() => {
		const path = window.location.pathname;
		const match = path.match(/\/certificate\/(.+)/);
		if (match) {
			setShareLink(match[1]);
			setView('certificate-view');
		}
	}, []);

	const showRoleSelection = () => setView('roles');
	const returnToLanding = () => setView('landing');
	const returnToRoles = () => setView('roles');
	const showDashboard = () => setView('dashboard');
	const logout = () => {
		localStorage.removeItem('klhEmail');
		localStorage.removeItem('klhStudentId');
		localStorage.removeItem('studentId');
		localStorage.removeItem('klhFacultyId');
		setEmail('');
		setStudentId(null);
		setFacultyId(null);
		setUserRole(null);
		setView('landing');
	};

	const handleRoleSelect = (role) => {
		if (role === 'Student') {
			setUserRole('student');
			setView('auth');
		} else if (role === 'Faculty') {
			setUserRole('faculty');
			setView('faculty-auth');
		}
	};

	const handleAuthenticated = (emailAddress, receivedStudentId) => {
		setEmail(emailAddress || '');
		// Use received studentId from backend, or extract from email as fallback
		const finalId = receivedStudentId || (emailAddress ? emailAddress.split('@')[0] : null);
		setStudentId(finalId);
		setUserRole('student');
		localStorage.setItem('klhStudentId', finalId);
		localStorage.setItem('studentId', finalId); // Keep both for compatibility
		setView('dashboard');
	};

	const handleFacultyAuthenticated = (emailAddress, receivedFacultyId) => {
		setEmail(emailAddress || '');
		const finalId = receivedFacultyId || (emailAddress ? emailAddress.split('@')[0] : null);
		setFacultyId(finalId);
		setUserRole('faculty');
		localStorage.setItem('klhFacultyId', finalId);
		setView('faculty-dashboard');
	};

	const handleModuleSelect = (moduleKey) => {
		if (moduleKey === 'profile') {
			if (userRole === 'faculty') {
				setView('faculty-profile');
			} else {
				setView('profile');
			}
		} else if (moduleKey === 'reels') {
			setView('reels');
		} else if (moduleKey === 'academics') {
			if (userRole === 'faculty') {
				setView('faculty-academics');
			} else {
				setView('academics');
			}
		} else if (moduleKey === 'certificates') {
			if (userRole === 'faculty') {
				setView('faculty-certificates');
			} else {
				setView('certificates');
			}
		} else if (moduleKey === 'placements') {
			if (userRole === 'faculty') {
				setView('faculty-placements');
			} else {
				setView('placements');
			}
		} else if (moduleKey === 'chat') {
			if (userRole === 'faculty') {
				setView('faculty-chat');
			} else {
				setView('chat');
			}
		} else if (moduleKey === 'safety') {
			if (userRole === 'faculty') {
				setView('faculty-safety');
			} else {
				setView('safety');
			}
		} else if (moduleKey === 'discover') {
			if (userRole === 'faculty') {
				setView('faculty-discover');
			} else {
				setView('student-discover');
			}
		} else if (moduleKey === 'ai') {
			if (userRole === 'faculty') {
				setView('faculty-ai-assistant');
			} else {
				setView('ai-assistant');
			}
		} else if (moduleKey === 'events') {
			if (userRole === 'faculty') {
				setView('faculty-events-clubs');
			} else {
				setView('events-clubs');
			}
		} else if (moduleKey === 'analytics') {
			setView('analytics');
		}
	};
	const backToDashboard = () => setView('dashboard');
	const backToFacultyDashboard = () => setView('faculty-dashboard');

	if (view === 'certificate-view' && shareLink) {
		return <PublicCertificateView shareLink={shareLink} />;
	}

	if (view === 'roles') {
		return <RoleSelectionScreen onBack={returnToLanding} onSelectRole={handleRoleSelect} />;
	}

	if (view === 'auth') {
		return <AuthenticationScreen onBack={returnToRoles} onAuthenticated={handleAuthenticated} />;
	}

	if (view === 'faculty-auth') {
		return <FacultyAuthenticationScreen onBack={returnToRoles} onAuthenticated={handleFacultyAuthenticated} />;
	}

	if (view === 'dashboard') {
		return <StudentDashboard email={email} onLogout={logout} onModuleSelect={handleModuleSelect} />;
	}

	if (view === 'faculty-dashboard') {
		return <FacultyDashboard email={email} onLogout={logout} onModuleSelect={handleModuleSelect} />;
	}

	if (view === 'profile') {
		return <StudentProfile email={email} onBack={backToDashboard} />;
	}

	if (view === 'faculty-profile') {
		return <FacultyProfile email={email} onBack={backToFacultyDashboard} />;
	}

	if (view === 'reels') {
		return <ReelsAndFeed studentId={studentId} onBack={backToDashboard} />;
	}

	if (view === 'academics') {
		return <AcademicsAndLearning studentId={studentId} onBack={backToDashboard} onModuleSelect={handleModuleSelect} />;
	}

	if (view === 'faculty-academics') {
		return <FacultyAcademics email={email} onBack={backToFacultyDashboard} />;
	}

	if (view === 'certificates') {
		return <CertificatesAndAchievements studentId={studentId} onBack={backToDashboard} />;
	}

	if (view === 'faculty-certificates') {
		return <FacultyCertificates email={email} onBack={backToFacultyDashboard} />;
	}

	if (view === 'placements') {
		return <StudentPlacementsNew studentId={studentId} email={email} onBack={backToDashboard} />;
	}

	if (view === 'faculty-placements') {
		return <FacultyPlacements email={email} onBack={backToFacultyDashboard} />;
	}

	if (view === 'chat') {
		return <ChatModule email={email} onBack={backToDashboard} userRole="student" />;
	}

	if (view === 'faculty-chat') {
		return <ChatModule email={email} onBack={backToFacultyDashboard} userRole="faculty" />;
	}

	if (view === 'student-discover') {
		return <StudentDiscover email={email} onBack={backToDashboard} onChat={() => setView('chat')} />;
	}

	if (view === 'faculty-discover') {
		return <FacultyDiscover email={email} onBack={backToFacultyDashboard} onChat={() => setView('faculty-chat')} />;
	}

	if (view === 'ai-assistant') {
		return <StudentAIAssistant studentId={studentId} email={email} onBack={backToDashboard} />;
	}

	if (view === 'faculty-ai-assistant') {
		return <FacultyAIAssistant email={email} facultyId={facultyId} onBack={backToFacultyDashboard} />;
	}

	if (view === 'events-clubs') {
		return <StudentEventsClubs studentId={studentId} email={email} onBack={backToDashboard} />;
	}

	if (view === 'faculty-events-clubs') {
		return <FacultyEventsClubsCenter email={email} onBack={backToFacultyDashboard} />;
	}

	if (view === 'analytics') {
		return <Analytics studentId={studentId} email={email} onBack={backToDashboard} />;
	}

	if (view === 'safety') {
		return <StudentSafetyCenter email={email} onBack={backToDashboard} />;
	}

	if (view === 'faculty-safety') {
		return <FacultySafetyCenter email={email} onBack={backToFacultyDashboard} />;
	}

	if (view === 'student-analytics') {
		return <StudentAnalyticsEnhanced studentId={studentId} onBack={backToDashboard} />;
	}

	if (view === 'faculty-analytics') {
		return <FacultyAnalytics facultyId={facultyId} onBack={backToFacultyDashboard} />;
	}

	return (
		<div className="min-h-screen bg-white text-slate-900">
			<Navbar onSignIn={showRoleSelection} onGetStarted={showRoleSelection} />
			<main className="space-y-16 pt-6 pb-20">
				<Hero features={heroFeatures} onGetStarted={showRoleSelection} />
				<Stats items={stats} />
				<FeatureCategories categories={featureCategories} />
				<CorePillars pillars={pillars} />
				<CallToAction onSignIn={showRoleSelection} />
			</main>
			<Footer />
		</div>
	);
};

export default App;
