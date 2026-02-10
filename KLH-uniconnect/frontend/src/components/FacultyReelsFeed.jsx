import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Upload,
  CheckCircle,
  AlertCircle,
  Trophy,
  Star,
  TrendingUp,
  BarChart3,
  Send,
  Search as SearchIcon,
  Eye,
  Users,
  Target,
  BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/**
 * FacultyReelsFeed - Reels & Feed Module for Faculty Portal
 * Features:
 * - View and evaluate student reels
 * - Provide official feedback and ratings
 * - Mark reels as placement-ready
 * - Share excellent reels with class/department
 * - Create faculty-instructional reels
 * - Analytics on student participation
 */
const FacultyReelsFeed = ({ facultyId, department, onRequireSignIn }) => {
  const [reels, setReels] = useState([]);
  const [filteredReels, setFilteredReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review-queue'); // review-queue, all-reels, my-reels, analytics
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  
  // Filter states
  const [filters, setFilters] = useState({
    subject: '',
    skill: '',
    year: '',
    semester: '',
    academicStatus: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const // Open feedback modal
  const [feedbackModal, setFeedbackModal] = useState({ open: false, reel: null });
  const [feedbackForm, setFeedbackForm] = useState({
    text: '',
    rating: 5,
    tags: [],
    featuredTag: 'NONE'
  });

  const subjects = ['Mathematics', 'Data Structures', 'Web Dev', 'Database', 'AI/ML', 'System Design'];
  const skills = ['DSA', 'Web Development', 'AI/ML', 'Core Subject', 'Mobile Dev', 'DevOps'];
  const years = ['1st', '2nd', '3rd', '4th'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  const feedbackTags = [
    { id: 'Excellent', label: 'Excellent', color: 'green' },
    { id: 'Good', label: 'Good', color: 'blue' },
    { id: 'Needs Improvement', label: 'Needs Improvement', color: 'yellow' },
    { id: 'Incomplete', label: 'Incomplete', color: 'red' }
  ];
  const featuredTags = [
    { id: 'NONE', label: 'No Tag' },
    { id: 'GOOD_PROJECT', label: 'Good Project' },
    { id: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement' },
    { id: 'PLACEMENT_READY', label: 'Placement Ready' },
    { id: 'ACADEMIC_HIGHLIGHT', label: 'Academic Highlight' }
  ];

  useEffect(() => {
    if (facultyId) {
      loadReels();
      setupWebSocket();
    }
  }, [facultyId, activeTab]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reels, searchQuery, sortBy, filters]);

  const loadReels = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/reels/faculty/review-queue';
      
      if (activeTab === 'all-reels') {
        endpoint = '/api/reels/faculty/filter';
      } else if (activeTab === 'my-reels') {
        endpoint = '/api/reels/faculty/my-reels';
      }

      const response = await fetch(endpoint, {
        headers: { 'X-Faculty-Id': facultyId }
      });
      const data = await response.json();
      setReels(Array.isArray(data) ? data : []);
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
      
      ws.onopen = () => {
        console.log('Connected to Reel WebSocket as Faculty');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'REEL_UPDATE') {
          loadReels();
        }
      };

      return () => ws.close();
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = reels;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Academic filters
    if (filters.subject) {
      filtered = filtered.filter(r => r.subject === filters.subject);
    }
    if (filters.skill) {
      filtered = filtered.filter(r => r.skill === filters.skill);
    }
    if (filters.year) {
      filtered = filtered.filter(r => r.year === filters.year);
    }
    if (filters.semester) {
      filtered = filtered.filter(r => r.semester === filters.semester);
    }
    if (filters.academicStatus) {
      filtered = filtered.filter(r => r.academicStatus === filters.academicStatus);
    }

    // Sort
    if (sortBy === 'trending') {
      filtered.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.academicScore - a.academicScore);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredReels(filtered);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModal.reel) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/reels/${feedbackModal.reel.id}/faculty-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Faculty-Id': facultyId
          },
          body: JSON.stringify({
            feedbackText: feedbackForm.text,
            rating: feedbackForm.rating,
            tags: feedbackForm.tags,
            featuredTag: feedbackForm.featuredTag
          })
        }
      );

      if (response.ok) {
        setFeedbackModal({ open: false, reel: null });
        setFeedbackForm({ text: '', rating: 5, tags: [], featuredTag: 'NONE' });
        loadReels();
        alert('Feedback submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  const handleMarkPlacementReady = async (reel) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reels/${reel.id}/placement-ready?isPlacementReady=true`,
        {
          method: 'POST',
          headers: { 'X-Faculty-Id': facultyId }
        }
      );

      if (response.ok) {
        loadReels();
        alert('Reel marked as placement-ready!');
      }
    } catch (error) {
      console.error('Error marking placement ready:', error);
    }
  };

  const handleShareReel = async (reel, audience) => {
    // audience: CLASS, DEPARTMENT, PLACEMENT_CELL
    try {
      const response = await fetch(
        `${API_BASE}/api/reels/${reel.id}/share?audience=${audience}`,
        {
          method: 'POST',
          headers: { 'X-Faculty-Id': facultyId }
        }
      );

      if (response.ok) {
        alert(`Reel shared to ${audience}!`);
        loadReels();
      }
    } catch (error) {
      console.error('Error sharing reel:', error);
    }
  };

  const handleLikeReel = async (reel) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reels/${reel.id}/faculty-like`,
        {
          method: 'POST',
          headers: { 'X-Faculty-Id': facultyId }
        }
      );

      if (response.ok) {
        loadReels();
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Reels & Feed Analytics</h1>
            </div>
            <button
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              onClick={() => alert('Upload faculty reel')}
            >
              <Upload className="w-4 h-4" />
              Create Reel
            </button>
          </div>

          {/* Search & Controls */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reels, students, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="recent">Recent</option>
              <option value="rating">Highest Rated</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg mb-4">
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="">All Skills</option>
                {skills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="">All Semesters</option>
                {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>

              <select
                value={filters.academicStatus}
                onChange={(e) => setFilters({ ...filters, academicStatus: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="FLAGGED">Flagged</option>
              </select>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            {['review-queue', 'all-reels', 'my-reels', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'review-queue' ? '📋 Review Queue' :
                 tab === 'all-reels' ? '📺 All Reels' :
                 tab === 'my-reels' ? '👨‍🏫 My Reels' :
                 '📊 Analytics'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reels...</p>
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard reels={filteredReels} />
        ) : filteredReels.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reels found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredReels.map(reel => (
              <FacultyReelCard
                key={reel.id}
                reel={reel}
                onOpenFeedback={() => setFeedbackModal({ open: true, reel })}
                onMarkPlacementReady={handleMarkPlacementReady}
                onShare={handleShareReel}
                onLike={handleLikeReel}
              />
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal.open && feedbackModal.reel && (
        <FeedbackModal
          reel={feedbackModal.reel}
          form={feedbackForm}
          setForm={setFeedbackForm}
          feedbackTags={feedbackTags}
          featuredTags={featuredTags}
          onSubmit={handleSubmitFeedback}
          onClose={() => setFeedbackModal({ open: false, reel: null })}
        />
      )}
    </div>
  );
};

/**
 * FacultyReelCard - Faculty view reel card with evaluation tools
 */
const FacultyReelCard = ({ reel, onOpenFeedback, onMarkPlacementReady, onShare, onLike }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        <img
          src={reel.thumbnailUrl || 'https://via.placeholder.com/300x200'}
          alt={reel.title}
          className="w-full h-full object-cover"
        />
        {reel.academicStatus && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
              reel.academicStatus === 'APPROVED' ? 'bg-green-500' :
              reel.academicStatus === 'PENDING' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}>
              {reel.academicStatus}
            </span>
          </div>
        )}
        {reel.placementReady && (
          <div className="absolute top-2 right-2">
            <Trophy className="w-6 h-6 text-green-500 bg-white rounded-full p-1" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Student Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src={reel.avatar}
              alt={reel.studentName}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{reel.studentName}</p>
              <p className="text-xs text-gray-500">{reel.year}</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onMarkPlacementReady(reel);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  ✓ Mark Placement Ready
                </button>
                <button
                  onClick={() => {
                    onShare(reel, 'CLASS');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  📚 Share with Class
                </button>
                <button
                  onClick={() => {
                    onShare(reel, 'DEPARTMENT');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  🏢 Share with Department
                </button>
                <button
                  onClick={() => {
                    onShare(reel, 'PLACEMENT_CELL');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  💼 Share with Placement Cell
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Academic Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {reel.subject && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{reel.subject}</span>}
          {reel.skill && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{reel.skill}</span>}
          {reel.semester && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{reel.semester}</span>}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{reel.title}</h3>

        {/* Academic Score */}
        {reel.academicScore > 0 && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700">Academic Score</span>
              <span className="text-sm font-bold text-gray-900">{reel.academicScore.toFixed(1)}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${reel.academicScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Faculty Feedback Count */}
        {reel.facultyFeedbacks && reel.facultyFeedbacks.length > 0 && (
          <div className="mb-3 text-xs text-gray-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {reel.facultyFeedbacks.length} faculty feedback(s)
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
          <span>{reel.views} views</span>
          <span>{reel.comments} comments</span>
          <span>{reel.facultyLikes} faculty likes</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onOpenFeedback()}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 font-medium text-sm"
          >
            <Send className="w-4 h-4" />
            Feedback
          </button>
          <button
            onClick={() => onLike(reel)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <Heart className="w-4 h-4" />
            Like
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * FeedbackModal - Modal for faculty to provide feedback
 */
const FeedbackModal = ({ reel, form, setForm, feedbackTags, featuredTags, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Provide Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Reel Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <p className="font-bold text-gray-900 mb-1">{reel.title}</p>
            <p className="text-sm text-gray-600">By {reel.studentName} • {reel.year}</p>
          </div>

          {/* Feedback Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Provide constructive feedback..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="4"
            />
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-10)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
                className="flex-1"
              />
              <span className="text-lg font-bold text-purple-600 w-12 text-center">{form.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Feedback Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {feedbackTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => {
                    if (form.tags.includes(tag.id)) {
                      setForm({ ...form, tags: form.tags.filter(t => t !== tag.id) });
                    } else {
                      setForm({ ...form, tags: [...form.tags, tag.id] });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    form.tags.includes(tag.id)
                      ? `bg-${tag.color}-500 text-white`
                      : `bg-${tag.color}-100 text-${tag.color}-800 hover:bg-${tag.color}-200`
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Tag */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mark As</label>
            <select
              value={form.featuredTag}
              onChange={(e) => setForm({ ...form, featuredTag: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {featuredTags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * AnalyticsDashboard - Analytics view for faculty
 */
const AnalyticsDashboard = ({ reels }) => {
  const stats = {
    totalReels: reels.length,
    averageScore: reels.length > 0 ? (reels.reduce((sum, r) => sum + r.academicScore, 0) / reels.length).toFixed(1) : 0,
    placementReady: reels.filter(r => r.placementReady).length,
    needsReview: reels.filter(r => r.academicStatus === 'PENDING').length
  };

  const skillBreakdown = {};
  reels.forEach(reel => {
    if (reel.skill) {
      skillBreakdown[reel.skill] = (skillBreakdown[reel.skill] || 0) + 1;
    }
  });

  const categoryBreakdown = {};
  reels.forEach(reel => {
    if (reel.category) {
      categoryBreakdown[reel.category] = (categoryBreakdown[reel.category] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<BookOpen className="w-6 h-6" />} title="Total Reels" value={stats.totalReels} color="blue" />
        <MetricCard icon={<Star className="w-6 h-6" />} title="Avg Score" value={`${stats.averageScore}/100`} color="yellow" />
        <MetricCard icon={<Trophy className="w-6 h-6" />} title="Placement Ready" value={stats.placementReady} color="green" />
        <MetricCard icon={<AlertCircle className="w-6 h-6" />} title="Needs Review" value={stats.needsReview} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Reels by Skill" data={skillBreakdown} />
        <ChartCard title="Reels by Category" data={categoryBreakdown} />
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Students</h3>
        <div className="space-y-3">
          {reels
            .sort((a, b) => b.academicScore - a.academicScore)
            .slice(0, 5)
            .map((reel, idx) => (
              <div key={reel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-purple-600">#{idx + 1}</span>
                  <div>
                    <p className="font-medium text-gray-900">{reel.studentName}</p>
                    <p className="text-sm text-gray-600">{reel.title}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">{reel.academicScore.toFixed(1)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

/**
 * MetricCard - Displays a key metric
 */
const MetricCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="opacity-25">{icon}</div>
      </div>
    </div>
  );
};

/**
 * ChartCard - Simple bar chart visualization
 */
const ChartCard = ({ title, data }) => {
  const maxValue = Math.max(...Object.values(data), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{key}</span>
              <span className="text-sm font-bold text-gray-900">{value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyReelsFeed;
