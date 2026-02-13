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
  Upload as UploadIcon
} from 'lucide-react';
import InstagramStyleUploadModal from './InstagramStyleUploadModal';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';
const WS_BASE = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8085';

/**
 * ReelsAndFeed - Instagram-Style Reels & Feed for Student Portal
 * Full-screen vertical reel view with swipe navigation, academic features, and real-time sync
 */
const ReelsAndFeed = ({ studentId, onBack, onRequireSignIn }) => {
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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);
  
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
  }, [studentId]);

  // Debounced search/filter reload
  useEffect(() => {
    if (reels.length > 0) {
      setCurrentIndex(0);
    }
  }, [selectedCategory, searchQuery]);

  const normalizeVideoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const loadReels = async () => {
    try {
      setLoading(true);
      
      // Use provided studentId or get from localStorage as fallback
      const actualStudentId = studentId || localStorage.getItem('klhStudentId') || localStorage.getItem('studentId');
      console.log('Loading reels for studentId:', actualStudentId, 'from prop:', studentId);
      
      if (!actualStudentId) {
        console.warn('No studentId available, using mock data');
        throw new Error('No student ID available');
      }
      
      const response = await fetch(`${API_BASE}/api/reels`, {
        headers: { 'X-Student-Id': actualStudentId }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      let filtered = Array.isArray(data) ? data : [];
      
      console.log(`Fetched ${filtered.length} reels from API`);
      
      // Map reels to ensure videoUrl is properly set
      filtered = filtered.map(reel => ({
        ...reel,
        videoUrl: normalizeVideoUrl(reel.videoUrl || reel.video || reel.videoPath || `/uploads/reels/${reel.id}.mp4`),
        likes: reel.likes || 0,
        comments: reel.comments || 0,
        saves: reel.saves || 0,
        views: reel.views || 0,
        studentName: reel.studentName || 'Unknown User',
        department: reel.department || 'Department',
        year: reel.year || '',
        avatar: reel.avatar || reel.profileImage || 'https://via.placeholder.com/40',
        uploaderRole: reel.uploaderRole || 'STUDENT',
        category: reel.category || 'Projects',
        commentList: reel.commentList || [],
        hashtags: reel.hashtags || []
      }));
      
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(r => r.category === selectedCategory);
      }
      if (searchQuery) {
        filtered = filtered.filter(r =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.studentName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      console.log('Loaded and filtered reels:', filtered.length);
      setReels(filtered);
      
      // Sync liked/saved state from API response
      const likedSet = new Set(filtered.filter(r => r.isLiked).map(r => r.id));
      const savedSet = new Set(filtered.filter(r => r.isSaved).map(r => r.id));
      setLikedReels(likedSet);
      setSavedReels(savedSet);
      
      setCurrentIndex(0);
      setVideoError(null);
      setVideoLoading(true);
    } catch (error) {
      console.error('Error loading reels from API:', error);
      // Use mock data for testing
      const mockReels = [
        {
          id: 'mock-1',
          title: 'Building a React Project',
          description: 'Complete guide to building a modern React application',
          studentName: 'Saketh Reddy',
          department: 'Computer Science',
          year: 'Third Year',
          avatar: 'https://via.placeholder.com/40?text=SR',
          uploaderRole: 'STUDENT',
          category: 'Projects',
          videoUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4',
          likes: 45,
          comments: 12,
          saves: 8,
          views: 234,
          hashtags: ['#react', '#webdev', '#project'],
          academicScore: 85,
          facultyFeedbacks: []
        }
      ];
      setReels(mockReels);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/reels?userId=${studentId}&role=STUDENT`);
      ws.onmessage = () => loadReels();
      return () => ws.close();
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  };

  const goNextReel = useCallback(() => {
    if (reels.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % reels.length);
    setVideoLoading(true);
  }, [reels.length]);

  const goPreviousReel = useCallback(() => {
    if (reels.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + reels.length) % reels.length);
    setVideoLoading(true);
  }, [reels.length]);

  const handleSwipe = useCallback(() => {
    const diff = touchStartY.current - touchEndY.current;
    const sensitivity = 50;

    if (Math.abs(diff) > sensitivity) {
      if (diff > 0) {
        goNextReel();
      } else {
        goPreviousReel();
      }
    }
  }, [goNextReel, goPreviousReel]);

  useEffect(() => {
    setVideoError(null);
    setVideoLoading(true);
  }, [currentIndex]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.changedTouches[0].screenY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].screenY;
  };

  const handleTouchEnd = (e) => {
    touchEndY.current = e.changedTouches[0].screenY;
    handleSwipe();
  };

  // Attach wheel listener with { passive: false } so preventDefault() works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      if (e.deltaY > 0) {
        goNextReel();
      } else {
        goPreviousReel();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [goNextReel, goPreviousReel]);

  const handleVideoClick = (e) => {
    // Don't pause if clicking on buttons
    if (e.target.closest('button') || e.target.closest('[role="button"]')) {
      return;
    }
    const now = Date.now();
    const timeSinceLastClick = now - lastTapRef.current;
    
    // Double click to like
    if (timeSinceLastClick < 300) {
      handleLikeReel(reels[currentIndex].id);
      setLikedReels(new Set([...likedReels, reels[currentIndex].id]));
      return;
    }
    
    // Single click to play/pause
    lastTapRef.current = now;
    setIsPlaying(!isPlaying);
  };

  const handleLikeReel = async (reelId) => {
    if (!studentId) {
      onRequireSignIn?.();
      return;
    }

    const wasLiked = likedReels.has(reelId);
    const endpoint = wasLiked ? 'unlike' : 'like';
    
    // Optimistic update - update UI immediately
    const newLikedReels = new Set(likedReels);
    if (wasLiked) {
      newLikedReels.delete(reelId);
    } else {
      newLikedReels.add(reelId);
    }
    setLikedReels(newLikedReels);
    
    // Update like count in reels array
    setReels(prevReels => prevReels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          likes: wasLiked ? Math.max(0, reel.likes - 1) : reel.likes + 1,
          isLiked: !wasLiked
        };
      }
      return reel;
    }));

    try {
      const response = await fetch(`${API_BASE}/api/reels/${reelId}/${endpoint}`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      
      // Get updated reel data from response
      const updatedReel = await response.json();
      setReels(prevReels => prevReels.map(reel => 
        reel.id === reelId ? { ...reel, likes: updatedReel.likes, isLiked: updatedReel.isLiked } : reel
      ));
    } catch (error) {
      console.error('Error liking reel:', error);
      // Revert optimistic update on error
      setLikedReels(likedReels);
      setReels(prevReels => prevReels.map(reel => {
        if (reel.id === reelId) {
          return {
            ...reel,
            likes: wasLiked ? reel.likes + 1 : Math.max(0, reel.likes - 1),
            isLiked: wasLiked
          };
        }
        return reel;
      }));
    }
  };

  const handleSaveReel = async (reelId) => {
    if (!studentId) {
      onRequireSignIn?.();
      return;
    }

    const wasSaved = savedReels.has(reelId);
    const endpoint = wasSaved ? 'unsave' : 'save';
    
    // Optimistic update
    const newSavedReels = new Set(savedReels);
    if (wasSaved) {
      newSavedReels.delete(reelId);
    } else {
      newSavedReels.add(reelId);
    }
    setSavedReels(newSavedReels);
    
    // Update save count in reels array
    setReels(prevReels => prevReels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          saves: wasSaved ? Math.max(0, reel.saves - 1) : reel.saves + 1,
          isSaved: !wasSaved
        };
      }
      return reel;
    }));

    try {
      const response = await fetch(`${API_BASE}/api/reels/${reelId}/${endpoint}`, {
        method: 'POST',
        headers: { 'X-Student-Id': studentId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update save');
      }
      
      const updatedReel = await response.json();
      setReels(prevReels => prevReels.map(reel => 
        reel.id === reelId ? { ...reel, saves: updatedReel.saves, isSaved: updatedReel.isSaved } : reel
      ));
    } catch (error) {
      console.error('Error saving reel:', error);
      // Revert optimistic update
      setSavedReels(savedReels);
      setReels(prevReels => prevReels.map(reel => {
        if (reel.id === reelId) {
          return {
            ...reel,
            saves: wasSaved ? reel.saves + 1 : Math.max(0, reel.saves - 1),
            isSaved: wasSaved
          };
        }
        return reel;
      }));
    }
  };

  const handleShareReel = async (reel) => {
    const shareUrl = `${window.location.origin}/reels/${reel.id}`;
    const shareData = {
      title: reel.title || 'Check out this reel!',
      text: reel.description || `${reel.studentName} shared a reel on KLH UniConnect`,
      url: shareUrl
    };

    try {
      // Try native Web Share API first (mobile-friendly)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log('Shared successfully via Web Share API');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        // Final fallback
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        } catch (clipboardError) {
          alert(`Share this link: ${shareUrl}`);
        }
      }
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !studentId) return;

    const currentReelId = reels[currentIndex]?.id;
    if (!currentReelId) return;

    const newCommentText = commentText.trim();
    
    // Optimistic update - add comment immediately to UI
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      studentId: studentId,
      studentName: 'You',
      avatar: 'https://via.placeholder.com/40',
      text: newCommentText,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    setReels(prevReels => prevReels.map(reel => {
      if (reel.id === currentReelId) {
        return {
          ...reel,
          comments: (reel.comments || 0) + 1,
          commentList: [...(reel.commentList || []), optimisticComment]
        };
      }
      return reel;
    }));
    
    setCommentText('');

    try {
      const response = await fetch(`${API_BASE}/api/reels/${currentReelId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': studentId
        },
        body: JSON.stringify({ text: newCommentText })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Get updated reel data from response
      const updatedReel = await response.json();
      setReels(prevReels => prevReels.map(reel => 
        reel.id === currentReelId ? { 
          ...reel, 
          comments: updatedReel.comments,
          commentList: updatedReel.commentList || reel.commentList
        } : reel
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revert optimistic update on error
      setReels(prevReels => prevReels.map(reel => {
        if (reel.id === currentReelId) {
          return {
            ...reel,
            comments: Math.max(0, (reel.comments || 0) - 1),
            commentList: (reel.commentList || []).filter(c => c.id !== optimisticComment.id)
          };
        }
        return reel;
      }));
      alert('Failed to add comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white mb-2">Loading reels...</p>
          <p className="text-gray-400 text-sm">studentId: {studentId || 'not provided'}</p>
          <p className="text-gray-500 text-xs mt-2">API: {API_BASE}/api/reels</p>
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
          <p className="text-gray-400 mb-6">Try a different category or upload one!</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Upload Reel
          </button>
          <p className="text-gray-500 text-xs mt-4">Debugging: Make sure reels exist in the database</p>
        </div>

        {/* Upload Modal for empty state */}
        {uploadModalOpen && (
          <InstagramStyleUploadModal
            isOpen={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            userId={studentId}
            userType="STUDENT"
            onSuccess={() => {
              loadReels();
              setUploadModalOpen(false);
            }}
          />
        )}
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
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black to-transparent p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-white hover:bg-gray-800 p-2 rounded-lg transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          📚 Reels & Feed
        </h2>

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
          <button
            onClick={() => setUploadModalOpen(true)}
            className="text-white bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition font-medium flex items-center gap-1"
            title="Upload Reel"
          >
            <UploadIcon className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">Upload</span>
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
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
            <div className="text-center text-white">
              <p className="text-lg mb-2">Unable to play video</p>
              <p className="text-sm text-gray-400 mb-4">{videoError}</p>
              <p className="text-xs text-gray-500">URL: {currentReel.videoUrl}</p>
              <button
                onClick={() => {
                  setVideoError(null);
                  setVideoLoading(true);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        <video
          key={currentReel.id}
          ref={videoRef}
          src={currentReel.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          autoPlay={isPlaying}
          loop
          muted
          onClick={handleVideoClick}
          onPlay={() => {
            setIsPlaying(true);
            setVideoLoading(false);
          }}
          onPause={() => setIsPlaying(false)}
          onLoadStart={() => setVideoLoading(true)}
          onCanPlay={() => setVideoLoading(false)}
          onError={(e) => {
            console.error('Video playback error:', e);
            console.error('Video URL attempted:', currentReel.videoUrl);
            setVideoError(`Failed to load: ${currentReel.videoUrl}`);
            setVideoLoading(false);
          }}
          controlsList="nodownload"
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
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-3">
          {/* Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLikeReel(currentReel.id);
            }}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform p-2 rounded-lg hover:bg-white/10 active:scale-95"
            title="Like"
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
            onClick={(e) => {
              e.stopPropagation();
              setCommentModalOpen(true);
            }}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform p-2 rounded-lg hover:bg-white/10 active:scale-95"
            title="Comment"
          >
            <MessageCircle className="w-7 h-7 hover:text-gray-300" />
            <span className="text-xs font-medium">{currentReel.comments || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShareReel(currentReel);
            }}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform p-2 rounded-lg hover:bg-white/10 active:scale-95"
            title="Share"
          >
            <Share2 className="w-7 h-7 hover:text-gray-300" />
            <span className="text-xs font-medium">Share</span>
          </button>

          {/* Save */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveReel(currentReel.id);
            }}
            className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform p-2 rounded-lg hover:bg-white/10 active:scale-95"
            title="Save"
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
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(showOptions === currentIndex ? null : currentIndex);
              }}
              className="flex flex-col items-center gap-1 text-white hover:scale-110 transition-transform p-2 rounded-lg hover:bg-white/10 active:scale-95"
              title="More"
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
                  <span className={`px-2 py-1 text-white text-xs rounded-full ${currentReel.uploaderRole === 'FACULTY' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {currentReel.uploaderRole === 'FACULTY' ? 'Faculty' : 'Student'}
                  </span>
                </div>
                <p className="text-gray-300 text-xs">
                  {currentReel.department}{currentReel.year ? ` • ${currentReel.year}` : ''}
                </p>
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

        {/* Video Loading Indicator */}
        {videoLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-white text-sm">Loading video...</p>
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

      {/* Upload Modal - High z-index for visibility */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full sm:w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <InstagramStyleUploadModal
              isOpen={uploadModalOpen}
              onClose={() => setUploadModalOpen(false)}
              userId={studentId}
              userType="STUDENT"
              onSuccess={() => {
                loadReels();
                setUploadModalOpen(false);
              }}
            />
          </div>
        </div>
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

export default ReelsAndFeed;
