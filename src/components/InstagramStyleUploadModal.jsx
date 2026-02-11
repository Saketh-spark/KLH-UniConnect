import React, { useState, useRef } from 'react';
import {
  X,
  Upload as UploadIcon,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

/**
 * InstagramStyleUploadModal - Upload interface for reels with academic metadata
 * Features:
 * - Video preview
 * - Academic tagging (subject, skill, semester, year)
 * - Category selection (Projects, Events, Placements, etc.)
 * - Hashtag management
 * - Visibility settings
 * - Real-time validation
 */
const InstagramStyleUploadModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  userType = 'STUDENT', // STUDENT or FACULTY
  onSuccess 
}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Projects');
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [subject, setSubject] = useState('');
  const [skill, setSkill] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [visibility, setVisibility] = useState('PRIVATE'); // PRIVATE, CLASS, DEPARTMENT, PUBLIC
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  const categories = {
    STUDENT: ['Projects', 'Placements', 'Events & Clubs', 'Achievements', 'Learning Shorts'],
    FACULTY: ['Interview Tips', 'Project Suggestions', 'Academic Explanations', 'Career Guidance', 'Best Practices']
  };

  const subjects = ['Data Structures', 'Web Development', 'AI/ML', 'Database', 'Mobile Development', 'Cloud Computing'];
  const skills = ['Problem Solving', 'Communication', 'Leadership', 'Technical Skills', 'Creativity', 'Time Management'];
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  const years = ['First Year', 'Second Year', 'Third Year', 'Final Year'];

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate video format and size
      const validFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      const maxSize = 500 * 1024 * 1024; // 500MB

      if (!validFormats.includes(file.type)) {
        setError('Invalid video format. Please use MP4, MOV, AVI, or WebM.');
        return;
      }

      if (file.size > maxSize) {
        setError('Video size exceeds 500MB limit.');
        return;
      }

      setVideoFile(file);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput)) {
      setHashtags([...hashtags, hashtagInput]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (index) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload the video file
      const formData = new FormData();
      formData.append('video', videoFile);

      const uploadHeaders = {};
      if (userType === 'STUDENT') {
        uploadHeaders['X-Student-Id'] = userId;
      } else if (userType === 'FACULTY') {
        uploadHeaders['X-Faculty-Id'] = userId;
      }

      const uploadResponse = await fetch(`${API_BASE}/api/reels/upload`, {
        method: 'POST',
        headers: uploadHeaders,
        body: formData
      });

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Video upload failed');
      }

      const uploadData = await uploadResponse.json();
      const videoUrl = uploadData.videoUrl;

      if (!videoUrl) {
        throw new Error('No video URL returned from upload');
      }

      // Step 2: Create the reel with metadata
      const reelData = {
        title,
        description,
        videoUrl,
        thumbnailUrl: uploadData.thumbnailUrl || null,
        category,
        hashtags,
        subject: subject || null,
        skill: skill || null,
        semester: semester || null,
        clubOrEvent: null,
        placementVisibility: visibility
      };

      const createResponse = await fetch(`${API_BASE}/api/reels/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...uploadHeaders
        },
        body: JSON.stringify(reelData)
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create reel');
      }

      setSuccess('Reel uploaded successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error uploading reel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setTitle('');
    setDescription('');
    setCategory(categories[userType]?.[0] || 'Projects');
    setHashtags([]);
    setHashtagInput('');
    setSubject('');
    setSkill('');
    setSemester('');
    setYear('');
    setVisibility('PRIVATE');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-xl">Upload Reel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error & Success Messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Video Upload */}
          <div className="space-y-3">
            <label className="text-white font-semibold text-sm">Video</label>
            {videoPreview ? (
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-60 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
              >
                <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 font-medium">Click to upload video</p>
                <p className="text-gray-500 text-xs mt-1">MP4, MOV, AVI, WebM • Max 500MB</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm block">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter reel title"
              maxLength="100"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">{title.length}/100</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your reel..."
              maxLength="500"
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500">{description.length}/500</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm block">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(categories[userType] || categories.STUDENT).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm block">Hashtags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value.replace(/\s+/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                placeholder="#hashtag"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddHashtag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveHashtag(idx)}
                    className="hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Academic Fields */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-white font-semibold mb-4">Academic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm block">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select subject</option>
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm block">Skill</label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select skill</option>
                  {skills.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm block">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select semester</option>
                  {semesters.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm block">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select year</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-3">
            <label className="text-white font-semibold text-sm block">Visibility</label>
            <div className="space-y-2">
              {[
                { value: 'PRIVATE', label: 'Private', description: 'Only you can see this reel' },
                { value: 'CLASS', label: 'Class', description: 'Visible to your classmates' },
                { value: 'DEPARTMENT', label: 'Department', description: 'Visible to your department' },
                { value: 'PUBLIC', label: 'Public', description: 'Visible to everyone' }
              ].map(option => (
                <label key={option.value} className="flex items-center p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition">
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={visibility === option.value}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="text-white font-medium text-sm">{option.label}</p>
                    <p className="text-gray-400 text-xs">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Upload Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstagramStyleUploadModal;
