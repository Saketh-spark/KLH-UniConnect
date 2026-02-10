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
  Download
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/**
 * InstagramStyleReelsFeed - Modern Instagram-like Reels & Feed for Student Portal
 * Features:
 * - Full-screen vertical (9:16) reel view
 * - Swipe up/down navigation
 * - Double-tap to like
 * - Long-press for options
 * - Right-side action bar
 * - Bottom user & caption overlay
 * - Infinite scroll
 * - Auto-play/pause
 * - Real-time sync with faculty feedback
 */
const InstagramStyleReelsFeed = ({ studentId, onBack, onRequireSignIn }) => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likedReels, setLikedReels] = useState(new Set());
  const [savedReels, setSavedReels] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOptions, setShowOptions] = useState(null);
  
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const lastTapRef = useRef(0);

  const categories = ['All', 'Projects', 'Placements', 'Events & Clubs', 'Achievements', 'Learning Shorts'];

  useEffect(() => {
    if (studentId) {
      loadReels();
      setupWebSocket();
    }
  }, [studentId, selectedCategory, searchQuery]);

  const loadReels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/reels`, {
        headers: { 'X-Student-Id': studentId }
      });
      const data = await response.json();
      let filtered = Array.isArray(data) ? data : [];
      
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(r => r.category === selectedCategory);
      }
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
      const ws = new WebSocket(`ws://localhost:8085/ws/reels?userId=${studentId}&role=STUDENT`);
      ws.onmessage = () => loadReels();
      return () => ws.close();
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  };

  const handleSwipe = useCallback(() => {
    const diff = touchStartY.current - touchEndY.current;
    const sensitivity = 50;

    if (Math.abs(diff) > sensitivity) {
      if (diff > 0) {
        // Swipe up - next reel
        setCurrentIndex(prev => (prev + 1) % reels.length);
      } else {
        // Swipe down - previous reel
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

  const handleDoubleClick = async () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      await handleLikeReel(reels[currentIndex].id);
      setLikedReels(new Set([...likedReels, reels[currentIndex].id]));
    }
    lastTapRef.current = now;
  };

  const handleLikeReel = async (reelId) => {
    if (!studentId) {
      onRequireSignIn();
      return;
    }

    try {
      const endpoint = likedReels.has(reelId) ? 'unlike' : 'like';
      await fetch(`${API_BASE}/api/reels/${reelId}/${endpoint}`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });
      loadReels();
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
      const endpoint = savedReels.has(reelId) ? 'unsave' : 'save';
      await fetch(`${API_BASE}/api/reels/${reelId}/${endpoint}`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });
      loadReels();
    } catch (error) {
      console.error('Error saving reel:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await fetch(`${API_BASE}/api/reels/${reels[currentIndex].id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': studentId
        },
        body: JSON.stringify({ text: commentText })
      });
      setCommentText('');
      setCommentModalOpen(false);
      loadReels();
    } catch (error) {
      console.error('Error adding comment:', error);
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
          <p className="text-white text-xl mb-4">No reels found</p>
          <p className="text-gray-400">Try a different category or search query</p>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const isLiked = likedReels.has(currentReel.id);
  const isSaved = savedReels.has(currentReel.id);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleClick}
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
            className="text-white hover:bg-gray-800 p-2 rounded-lg transition"
          >
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Search & Filter Panel */}
      {(showSearch || showFilters) && (
        <div className="absolute top-16 left-4 right-4 z-30 bg-gray-900 rounded-lg p-4 shadow-lg">
          {showSearch && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search reels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          )}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reel Video Container */}
      <div className="w-full h-full relative bg-black flex items-center justify-center">
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

        {/* Left Side - Reel Counter */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white text-sm font-medium">
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
        </div>

        {/* Right Side - Action Bar */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-6">
          {/* Like */}
          <button
            onClick={() => handleLikeReel(currentReel.id)}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-7 h-7 transition-all ${
                isLiked ? 'fill-red-500 text-red-500' : 'hover:text-gray-300'
              }`}
            />
            <span className="text-xs font-medium">{currentReel.likes || 0}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setCommentModalOpen(true)}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-7 h-7 hover:text-gray-300" />
            <span className="text-xs font-medium">{currentReel.comments || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => alert('Share functionality coming soon!')}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
          >
            <Share2 className="w-7 h-7 hover:text-gray-300" />
            <span className="text-xs font-medium">Share</span>
          </button>

          {/* Save */}
          <button
            onClick={() => handleSaveReel(currentReel.id)}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
          >
            <Bookmark
              className={`w-7 h-7 transition-all ${
                isSaved ? 'fill-yellow-400 text-yellow-400' : 'hover:text-gray-300'
              }`}
            />
            <span className="text-xs font-medium">{currentReel.saves || 0}</span>
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(showOptions === currentIndex ? null : currentIndex)}
              className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform"
            >
              <MoreVertical className="w-7 h-7" />
            </button>
            {showOptions === currentIndex && (
              <div className="absolute right-12 bottom-0 bg-gray-900 rounded-lg shadow-lg overflow-hidden min-w-max">
                <button className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
                <button className="block w-full text-left px-4 py-2 text-white hover:bg-gray-800 transition text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Overlay - User & Caption */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
          <div className="max-w-xs">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={currentReel.avatar || 'https://via.placeholder.com/40'}
                alt={currentReel.studentName}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm">{currentReel.studentName}</p>
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Student
                  </span>
                </div>
                <p className="text-gray-300 text-xs">{currentReel.department} • {currentReel.year}</p>
              </div>
            </div>

            {/* Caption */}
            <p className="text-white text-sm mb-2 line-clamp-2">{currentReel.title}</p>
            {currentReel.description && (
              <p className="text-gray-300 text-xs mb-2 line-clamp-1">{currentReel.description}</p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {currentReel.hashtags?.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-blue-400 text-xs">
                  {tag}
                </span>
              ))}
            </div>

            {/* Category */}
            {currentReel.category && (
              <div className="inline-block px-2 py-1 bg-gray-800/80 text-white text-xs rounded">
                📁 {currentReel.category}
              </div>
            )}

            {/* Faculty Feedback Badge */}
            {currentReel.facultyFeedbacks && currentReel.facultyFeedbacks.length > 0 && (
              <div className="mt-2 p-2 bg-blue-900/40 rounded text-xs text-blue-200 border border-blue-500/30">
                👨‍🏫 Faculty feedback: {currentReel.facultyFeedbacks[0].feedbackText?.substring(0, 50)}...
              </div>
            )}

            {/* Academic Score */}
            {currentReel.academicScore > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${currentReel.academicScore}%` }}
                  />
                </div>
                <span className="text-xs text-green-400 font-medium">
                  {currentReel.academicScore.toFixed(0)}
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

      {/* Comment Modal */}
      {commentModalOpen && (
        <CommentModal
          reel={currentReel}
          commentText={commentText}
          setCommentText={setCommentText}
          onSubmit={handleAddComment}
          onClose={() => setCommentModalOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * CommentModal - Bottom sheet for adding comments
 */
const CommentModal = ({ reel, commentText, setCommentText, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-gray-900 rounded-t-3xl p-6 max-h-96 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 text-sm">
          {reel.commentList?.slice(-5).map((comment, idx) => (
            <div key={idx} className="flex gap-2">
              <img
                src={comment.avatar}
                alt={comment.studentName}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex-1">
                <p className="text-white">
                  <span className="font-semibold">{comment.studentName}</span>
                  {comment.isFromFaculty && (
                    <span className="ml-2 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                      Faculty
                    </span>
                  )}
                </p>
                <p className="text-gray-300 text-xs">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
          <button
            onClick={onSubmit}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50"
            disabled={!commentText.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramStyleReelsFeed;
