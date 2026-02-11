import React, { useState } from 'react';
import {
  X,
  Upload,
  Loader,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Hash
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const UploadReelModal = ({
  isOpen,
  onClose,
  studentId,
  onSuccess = () => {},
  showLoginPrompt = false,
  onRequireLogin = () => {}
}) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Project');
  const [hashtags, setHashtags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Tutorial', 'Event', 'Hackathon', 'Sports', 'Performance', 'Project'];
  const requiresAuthentication = showLoginPrompt || !studentId;

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('Video size must be less than 500MB');
        return;
      }
      if (!['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'].includes(file.type)) {
        setError('Please upload a valid video format (MP4, MOV, AVI, MPEG)');
        return;
      }
      setVideoFile(file);
      setError('');
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please upload a valid image format (JPG, PNG, WebP)');
        return;
      }
      setThumbnailFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!studentId) {
      setError('Please sign in before uploading your reel.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      // Step 1: Upload files
      const formData = new FormData();
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const uploadResponse = await fetch(`${API_BASE}/api/reels/upload`, {
        method: 'POST',
        headers: {
          'X-Student-Id': studentId
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const uploadedFiles = await uploadResponse.json();
      setUploadProgress(50);

      // Step 2: Create reel record
      const hashtagsList = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const createReelResponse = await fetch(`${API_BASE}/api/reels/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': studentId
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          videoUrl: uploadedFiles.videoUrl,
          thumbnailUrl: uploadedFiles.thumbnailUrl || 'https://via.placeholder.com/400/0066cc/ffffff?text=' + encodeURIComponent(title),
          category: category,
          hashtags: hashtagsList
        })
      });

      if (!createReelResponse.ok) {
        throw new Error('Failed to create reel record');
      }

      setUploadProgress(100);
      setSuccess(true);

      // Reset form
      setTimeout(() => {
        setVideoFile(null);
        setThumbnailFile(null);
        setTitle('');
        setDescription('');
        setCategory('Project');
        setHashtags('');
        setSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Share Your Story</h2>
            <p className="text-sm text-slate-500 mt-1">Upload a reel and connect with your community</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600 hover:shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {success && (
            <div className="mb-6 rounded-[16px] border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 animate-fadeIn">
              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Reel uploaded successfully!</p>
                <p className="text-xs text-emerald-700 mt-0.5">It'll appear in the feed shortly</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-[16px] border border-red-200 bg-red-50 p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          {requiresAuthentication && (
            <div className="mb-6 rounded-[16px] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-amber-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Sign in to upload</p>
                  <p className="text-xs text-slate-600 mt-1">Your reel stays tied to your KLH profile so everyone knows it's from you.</p>
                  <button
                    type="button"
                    onClick={onRequireLogin}
                    className="mt-3 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:from-sky-700 hover:to-blue-700 shadow-sm"
                  >
                    Sign In Now
                  </button>
                </div>
              </div>
            </div>
          )}

          <fieldset disabled={requiresAuthentication} className="space-y-6">
            {/* Video Upload */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500 block mb-4">
                Video File
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={uploading || requiresAuthentication}
                  className="sr-only"
                  id="video-input"
                />
                <label
                  htmlFor="video-input"
                  className={`block cursor-pointer rounded-[16px] border-2 border-dashed p-10 text-center transition ${
                    videoFile
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50'
                  } ${uploading || requiresAuthentication ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <Video size={40} className={`mx-auto mb-3 ${videoFile ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <p className="font-semibold text-slate-900">
                    {videoFile ? videoFile.name : 'Choose video or drag here'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">MP4, MOV, AVI • up to 500MB</p>
                </label>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500 block mb-4">
                Thumbnail <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={uploading || requiresAuthentication}
                  className="sr-only"
                  id="thumbnail-input"
                />
                <label
                  htmlFor="thumbnail-input"
                  className={`block cursor-pointer rounded-[16px] border-2 border-dashed p-8 text-center transition ${
                    thumbnailFile
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50'
                  } ${uploading || requiresAuthentication ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <ImageIcon size={32} className={`mx-auto mb-3 ${thumbnailFile ? 'text-blue-600' : 'text-slate-400'}`} />
                  <p className="font-semibold text-slate-900">
                    {thumbnailFile ? thumbnailFile.name : 'Add cover image'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP</p>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500 block mb-3">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading || requiresAuthentication}
                placeholder="What's your reel about?"
                maxLength={100}
                className="w-full rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-2">{title.length} / 100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500 block mb-3">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading || requiresAuthentication}
                placeholder="Tell us more about your reel..."
                maxLength={500}
                rows={4}
                className="w-full rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">{description.length} / 500 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500 block mb-3">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={uploading || requiresAuthentication}
                className="w-full rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Hashtags */}
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.5em] text-slate-500 block mb-3">
                Hashtags <span className="text-slate-400 font-normal">(comma separated)</span>
              </label>
              <div className="flex gap-2">
                <Hash size={18} className="text-slate-400 mt-3 flex-shrink-0" />
                <input
                  type="text"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  disabled={uploading || requiresAuthentication}
                  placeholder="#coding, #tutorial, #webdev"
                  className="flex-1 rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="bg-sky-50 rounded-[12px] p-4">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-600">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !videoFile || requiresAuthentication}
              className="w-full rounded-[12px] bg-gradient-to-r from-sky-600 to-blue-600 py-3 font-semibold text-white transition hover:from-sky-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {uploading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Uploading your reel...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Reel
                </>
              )}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default UploadReelModal;
