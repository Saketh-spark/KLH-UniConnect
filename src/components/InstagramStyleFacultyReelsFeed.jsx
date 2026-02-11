import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Search,
  Filter,
  ArrowLeft,
  X,
  Send,
  Flag,
  Download,
  CheckCircle,
  AlertCircle,
  User,
  TrendingUp,
  Eye
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/**
 * InstagramStyleFacultyReelsFeed - Faculty version with verification, feedback, and analytics
 * Features:
 * - Full-screen vertical (9:16) reel view
 * - Faculty verification & feedback controls
 * - Academic status management (PENDING, APPROVED, FLAGGED)
 * - Placement readiness marking
 * - Filter by department, subject, skill, year
 * - Faculty guidance reels upload
 * - Real-time sync with student portals
 * - Analytics dashboard integration
 */
const InstagramStyleFacultyReelsFeed = ({ facultyId, onBack, onRequireSignIn }) => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('review'); // 'review', 'all', 'guidance'
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(7);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOptions, setShowOptions] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    department: '',
    subject: '',
    skill: '',
    year: ''
  });

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);

  const departments = ['All Departments', 'CS', 'EC', 'ME', 'CE', 'EE'];
  const subjects = ['All Subjects', 'Data Structures', 'Web Dev', 'AI/ML', 'Database', 'Mobile Dev'];
  const skills = ['All Skills', 'Problem Solving', 'Communication', 'Leadership', 'Technical', 'Creativity'];
  const years = ['All Years', 'First Year', 'Second Year', 'Third Year', 'Final Year'];

  useEffect(() => {
    if (facultyId) {
      loadReels();
      setupWebSocket();
    }
  }, [facultyId, activeTab, filterCriteria, searchQuery]);

  const loadReels = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/reels';

      if (activeTab === 'review') {
        endpoint = '/api/reels/faculty/review-queue';
      } else if (activeTab === 'guidance') {
        endpoint = '/api/reels/faculty/guidance-reels';
      } else {
        endpoint = '/api/reels/faculty/filter';
      }

      const params = new URLSearchParams();
      if (filterCriteria.department && filterCriteria.department !== 'All Departments') {
        params.append('department', filterCriteria.department);
      }
      if (filterCriteria.subject && filterCriteria.subject !== 'All Subjects') {
        params.append('subject', filterCriteria.subject);
      }
      if (filterCriteria.skill && filterCriteria.skill !== 'All Skills') {
        params.append('skill', filterCriteria.skill);
      }
      if (filterCriteria.year && filterCriteria.year !== 'All Years') {
        params.append('year', filterCriteria.year);
      }

      const url = params.toString() ? `${API_BASE}${endpoint}?${params}` : `${API_BASE}${endpoint}`;

      const response = await fetch(url, {
        headers: { 'X-Faculty-Id': facultyId }
      });
      const data = await response.json();
      let filtered = Array.isArray(data) ? data : [];

      if (searchQuery) {
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.studentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setReels(filtered);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading reels:', error);
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const ws = new WebSocket(`ws://localhost:8085/ws/reels?userId=${facultyId}&role=FACULTY`);
      ws.onmessage = () => loadReels();
      return () => ws.close();
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  };

  const handleSwipe = useCallback(() => {
    const diff = touchStartY.current - touchEndY.current;
    const sensitivity = 50;

    if (Math.isAbsolute(diff) > sensitivity) {
      if (diff > 0) {
        setCurrentIndex(prev => (prev + 1) % reels.length);
      } else {
        setCurrentIndex(prev => (prev - 1 + reels.length) % reels.length);
      }
    }
  }, [reels.length]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].screenY;
    handleSwipe();
  };

  const handleApproveReel = async () => {
    try {
      await fetch(`${API_BASE}/api/reels/${reels[currentIndex].id}/academic-status?status=APPROVED`, {
        method: 'POST',
        headers: { 'X-Faculty-Id': facultyId }
      });
      loadReels();
    } catch (error) {
      console.error('Error approving reel:', error);
    }
  };

  const handleFlagReel = async () => {
    try {
      await fetch(`${API_BASE}/api/reels/${reels[currentIndex].id}/academic-status?status=FLAGGED`, {
        method: 'POST',
        headers: { 'X-Faculty-Id': facultyId }
      });
      loadReels();
    } catch (error) {
      console.error('Error flagging reel:', error);
    }
  };

  const handleMarkPlacementReady = async () => {
    try {
      await fetch(`${API_BASE}/api/reels/${reels[currentIndex].id}/placement-ready?isPlacementReady=true`, {
        method: 'POST',
        headers: { 'X-Faculty-Id': facultyId }
      });
      loadReels();
    } catch (error) {
      console.error('Error marking placement ready:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;

    try {
      await fetch(`${API_BASE}/api/reels/${reels[currentIndex].id}/faculty-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Faculty-Id': facultyId
        },
        body: JSON.stringify({
          feedbackText,
          rating: feedbackRating,
          tags: [],
          featuredTag: feedbackRating >= 8 ? 'GOOD_PROJECT' : 'NONE'
        })
      });
      setFeedbackText('');
      setFeedbackRating(7);
      setFeedbackModalOpen(false);
      loadReels();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-white hover:bg-gray-800 p-2 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-white text-xl mb-4">No reels to review</p>
          <p className="text-gray-400">Switch tabs to see all reels or uploaded guidance</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black to-transparent p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-white hover:bg-gray-800 p-2 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-white hover:bg-gray-800 p-2 rounded-lg transition"
          >
            <Search className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-white hover:bg-gray-800 p-2 rounded-lg transition relative"
          >
            <Filter className="w-6 h-6" />
            {Object.values(filterCriteria).some(v => v && v !== 'All Departments' && v !== 'All Subjects' && v !== 'All Skills' && v !== 'All Years') && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="absolute top-16 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur flex gap-2 px-4 py-3 border-b border-gray-700">
        {[
          { id: 'review', label: 'Review Queue' },
          { id: 'all', label: 'All Reels' },
          { id: 'guidance', label: 'My Guidance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Panel */}
      {(showSearch || showFilters) && (
        <div className="absolute top-32 left-4 right-4 z-30 bg-gray-900 rounded-lg p-4 shadow-lg max-h-64 overflow-y-auto">
          {showSearch && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by student name or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>
          )}
          {showFilters && (
            <div className="space-y-3">
              {[
                { label: 'Department', key: 'department', options: departments },
                { label: 'Subject', key: 'subject', options: subjects },
                { label: 'Skill', key: 'skill', options: skills },
                { label: 'Year', key: 'year', options: years }
              ].map(filter => (
                <div key={filter.key}>
                  <label className="text-xs text-gray-400 font-medium">{filter.label}</label>
                  <select
                    value={filterCriteria[filter.key]}
                    onChange={(e) =>
                      setFilterCriteria({ ...filterCriteria, [filter.key]: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 bg-gray-800 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filter.options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reel Video Container */}
      <div className="w-full h-full relative bg-black flex items-center justify-center pt-32">
        <video
          ref={videoRef}
          src={currentReel.videoUrl}
          className="w-full h-full object-cover"
          autoPlay={isPlaying}
          loop
          onClick={() => setIsPlaying(!isPlaying)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Left Side - Reel Counter & Status */}
        <div className="absolute left-4 top-32 z-20 text-white text-sm font-medium">
          <div className="flex flex-col gap-1">
            {reels.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 w-1 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white scale-150' : 'bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Status Badge */}
          <div className="mt-4 space-y-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              currentReel.academicStatus === 'APPROVED'
                ? 'bg-green-600'
                : currentReel.academicStatus === 'FLAGGED'
                ? 'bg-red-600'
                : 'bg-yellow-600'
            }`}>
              {currentReel.academicStatus || 'PENDING'}
            </div>
            {currentReel.placementReady && (
              <div className="px-2 py-1 bg-blue-600 rounded text-xs font-medium">
                ✓ Placement Ready
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Faculty Action Bar */}
        <div className="absolute right-4 top-40 z-20 flex flex-col gap-4">
          {/* Approve */}
          <button
            onClick={handleApproveReel}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              currentReel.academicStatus === 'APPROVED'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-white hover:bg-green-600'
            }`}
            title="Approve reel"
          >
            <CheckCircle className="w-6 h-6" />
            <span className="text-xs">Approve</span>
          </button>

          {/* Flag */}
          <button
            onClick={handleFlagReel}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              currentReel.academicStatus === 'FLAGGED'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white hover:bg-red-600'
            }`}
            title="Flag for review"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs">Flag</span>
          </button>

          {/* Feedback */}
          <button
            onClick={() => setFeedbackModalOpen(true)}
            className="flex flex-col items-center gap-1 text-white bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-all"
            title="Add feedback"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs">Feedback</span>
          </button>

          {/* Mark Placement Ready */}
          <button
            onClick={handleMarkPlacementReady}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              currentReel.placementReady
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-white hover:bg-blue-600'
            }`}
            title="Mark as placement ready"
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Placement</span>
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(showOptions === currentIndex ? null : currentIndex)}
              className="flex flex-col items-center gap-1 text-white bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-all"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
            {showOptions === currentIndex && (
              <div className="absolute right-12 bottom-0 bg-gray-900 rounded-lg shadow-lg overflow-hidden min-w-max">
                <button className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share with Class
                </button>
                <button className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share with Department
                </button>
                <button className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Overlay - Student & Reel Info */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
          <div className="max-w-xs">
            {/* Student Info */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={currentReel.avatar || 'https://via.placeholder.com/40'}
                alt={currentReel.studentName}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{currentReel.studentName}</p>
                  <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                    Student
                  </span>
                </div>
                <p className="text-gray-300 text-xs">{currentReel.department} • {currentReel.year}</p>
              </div>
            </div>

            {/* Reel Info */}
            <p className="text-white text-sm mb-2 font-semibold">{currentReel.title}</p>
            {currentReel.description && (
              <p className="text-gray-300 text-xs mb-2 line-clamp-2">{currentReel.description}</p>
            )}

            {/* Engagement Stats */}
            <div className="flex gap-4 text-xs text-gray-300 mb-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {currentReel.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {currentReel.likes || 0} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {currentReel.comments || 0} comments
              </span>
            </div>

            {/* Tags */}
            {currentReel.hashtags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {currentReel.hashtags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-blue-400 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Academic Score */}
            {currentReel.academicScore > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${currentReel.academicScore}%` }}
                  />
                </div>
                <span className="text-xs text-green-400 font-medium">
                  {currentReel.academicScore.toFixed(0)}/100
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Play/Pause Indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <div className="bg-white/20 rounded-full p-3 backdrop-blur">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <FeedbackModal
          feedbackText={feedbackText}
          setFeedbackText={setFeedbackText}
          feedbackRating={feedbackRating}
          setFeedbackRating={setFeedbackRating}
          onSubmit={handleSubmitFeedback}
          onClose={() => setFeedbackModalOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * FeedbackModal - Faculty feedback submission interface
 */
const FeedbackModal = ({ feedbackText, setFeedbackText, feedbackRating, setFeedbackRating, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-gray-900 rounded-t-3xl p-6 max-h-96 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold">Faculty Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Rating Slider */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium">Rating (0-10)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="10"
              value={feedbackRating}
              onChange={(e) => setFeedbackRating(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white font-bold text-lg min-w-fit">{feedbackRating}/10</span>
          </div>
        </div>

        {/* Feedback Text */}
        <div className="space-y-2">
          <label className="text-xs text-gray-400 font-medium">Feedback</label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Provide constructive feedback..."
            className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none h-20"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={!feedbackText.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default InstagramStyleFacultyReelsFeed;
