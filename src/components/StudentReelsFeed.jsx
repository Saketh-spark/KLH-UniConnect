import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Search as SearchIcon,
  Filter,
  Upload,
  CheckCircle,
  AlertCircle,
  Trophy,
  Star,
  TrendingUp,
  Calendar,
  User,
  Tag,
  BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/**
 * StudentReelsFeed - Enhanced Reels & Feed Module for Student Portal
 * Features:
 * - Real-time sync with Faculty Portal
 * - Academic categorization (Projects, Placements, Events, Achievements, Learning)
 * - Faculty feedback and validation
 * - Placement readiness tracking
 * - Smart notifications
 */
const StudentReelsFeed = ({ studentId, onRequireSignIn }) => {
  const [reels, setReels] = useState([]);
  const [filteredReels, setFilteredReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('feed'); // feed, my-reels, saved
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    subject: '',
    skill: '',
    semester: '',
    academicOnly: false,
    placementReady: false
  });

  const categories = [
    { id: 'All', label: 'All', icon: '📺' },
    { id: 'Projects', label: 'Projects', icon: '🛠️' },
    { id: 'Placements', label: 'Placements', icon: '💼' },
    { id: 'Events & Clubs', label: 'Events & Clubs', icon: '🎉' },
    { id: 'Achievements', label: 'Achievements', icon: '🏆' },
    { id: 'Learning Shorts', label: 'Learning Shorts', icon: '📚' }
  ];

  const skills = ['DSA', 'Web Development', 'AI/ML', 'Core Subject', 'Mobile Dev', 'DevOps'];
  const subjects = ['Mathematics', 'Data Structures', 'Web Dev', 'Database', 'AI/ML', 'System Design'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  useEffect(() => {
    if (studentId) {
      loadReels();
      setupWebSocket();
    }
  }, [studentId, activeTab]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reels, selectedCategory, searchQuery, sortBy, filters]);

  const loadReels = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'my-reels' ? '/api/reels/my-reels' : '/api/reels';
      const response = await fetch(endpoint, {
        headers: { 'X-Student-Id': studentId }
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
      const ws = new WebSocket(`ws://localhost:8085/ws/reels?userId=${studentId}&role=STUDENT`);
      
      ws.onopen = () => {
        console.log('Connected to Reel WebSocket');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => ws.close();
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  };

  const handleWebSocketMessage = (message) => {
    if (message.type === 'NOTIFICATION') {
      showNotification(message);
    } else if (message.type === 'REEL_UPDATE') {
      loadReels(); // Refresh reels on any update
    }
  };

  const showNotification = (notification) => {
    const notificationMap = {
      'REEL_FEEDBACK_ADDED': `Faculty provided feedback on your reel: "${notification.title}"`,
      'REEL_APPROVED': `Your reel has been approved: "${notification.title}"`,
      'PLACEMENT_READY': `Your reel is marked as placement-ready!`,
      'FACULTY_COMMENT': `Faculty commented on your reel`
    };

    alert(notificationMap[notification.notificationType] || notification.message);
  };

  const applyFiltersAndSort = () => {
    let filtered = reels;

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    if (filters.semester) {
      filtered = filtered.filter(r => r.semester === filters.semester);
    }
    if (filters.academicOnly) {
      filtered = filtered.filter(r => r.academicStatus === 'APPROVED');
    }
    if (filters.placementReady) {
      filtered = filtered.filter(r => r.placementReady);
    }

    // Sort
    if (sortBy === 'trending') {
      filtered.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredReels(filtered);
  };

  const handleLikeReel = async (reelId) => {
    if (!studentId) {
      onRequireSignIn();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/reels/${reelId}/like`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });
      if (response.ok) {
        loadReels();
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleSaveReel = async (reelId) => {
    if (!studentId) {
      onRequireSignIn();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/reels/${reelId}/save`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });
      if (response.ok) {
        loadReels();
      }
    } catch (error) {
      console.error('Error saving reel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Reels & Feed</h1>
            </div>
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => onRequireSignIn()}
            >
              <Upload className="w-4 h-4" />
              Upload Reel
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reels, subjects, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg mb-4">
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
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded text-sm"
              >
                <option value="">All Semesters</option>
                {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.placementReady}
                  onChange={(e) => setFilters({ ...filters, placementReady: e.target.checked })}
                  className="rounded"
                />
                <span>Placement Ready</span>
              </label>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200">
            {['feed', 'my-reels', 'saved'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'feed' ? 'Feed' : tab === 'my-reels' ? 'My Reels' : 'Saved'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 overflow-x-auto">
          <div className="flex gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reels...</p>
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No reels found. Try adjusting your filters!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReels.map(reel => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onLike={handleLikeReel}
                onSave={handleSaveReel}
                studentId={studentId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ReelCard - Individual reel card component with academic features
 */
const ReelCard = ({ reel, onLike, onSave, studentId }) => {
  const [liked, setLiked] = useState(reel.isLiked || false);
  const [saved, setSaved] = useState(reel.isSaved || false);

  const handleLike = () => {
    setLiked(!liked);
    onLike(reel.id);
  };

  const handleSave = () => {
    setSaved(!saved);
    onSave(reel.id);
  };

  const getAcademicBadge = () => {
    if (reel.placementReady) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1"><Trophy className="w-3 h-3" /> Placement Ready</span>;
    }
    if (reel.academicStatus === 'APPROVED') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>;
    }
    if (reel.academicStatus === 'PENDING') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending Review</span>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-200 flex items-center justify-center overflow-hidden group">
        <img
          src={reel.thumbnailUrl || 'https://via.placeholder.com/300x200'}
          alt={reel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {reel.placementReady && (
          <div className="absolute top-2 right-2">
            <Trophy className="w-5 h-5 text-green-500 bg-white rounded-full p-1" />
          </div>
        )}
        {reel.academicStatus === 'FLAGGED' && (
          <div className="absolute top-2 right-2">
            <AlertCircle className="w-5 h-5 text-red-500 bg-white rounded-full p-1" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Academic Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {reel.subject && <Tag className="w-3 h-3 text-gray-500 inline" />}
          {reel.subject && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{reel.subject}</span>}
          {reel.skill && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{reel.skill}</span>}
          {reel.semester && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{reel.semester}</span>}
        </div>

        {/* Badge */}
        <div className="mb-2">
          {getAcademicBadge()}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{reel.title}</h3>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={reel.avatar}
            alt={reel.studentName}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{reel.studentName}</p>
            <p className="text-xs text-gray-500">{reel.department} • {reel.year}</p>
          </div>
        </div>

        {/* Faculty Feedback */}
        {reel.facultyFeedbacks && reel.facultyFeedbacks.length > 0 && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
            <p className="font-medium text-blue-900">Faculty Feedback:</p>
            <p className="text-blue-800 line-clamp-2">{reel.facultyFeedbacks[0].feedbackText}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-blue-800">{reel.facultyFeedbacks[0].rating}/10</span>
            </div>
          </div>
        )}

        {/* Academic Score */}
        {reel.academicScore > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${reel.academicScore}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{reel.academicScore.toFixed(1)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
          <span>{reel.views} views</span>
          <span>{reel.comments} comments</span>
          <span>{reel.saves} saves</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
              liked
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {reel.likes}
          </button>
          <button
            onClick={() => {}}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <MessageCircle className="w-4 h-4" />
            Reply
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
              saved
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentReelsFeed;
