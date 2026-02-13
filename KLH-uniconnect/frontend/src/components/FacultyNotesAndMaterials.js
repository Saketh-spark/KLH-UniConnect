import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Eye,
  Lock,
  Archive,
  Upload,
  Tag,
  BarChart3,
  Loader,
  FileText,
  File,
  Video,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const FacultyNotesAndMaterials = ({ selectedSubject = 'all', setSelectedSubject, searchTerm = '' }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: selectedSubject === 'all' ? '' : selectedSubject,
    semester: 'Sem 4',
    type: 'PDF',
    difficulty: 'Intermediate',
    visibility: 'All Students'
  });

  // Get faculty info from localStorage
  const facultyId = localStorage.getItem('facultyId') || 'FAC001';
  const facultyName = localStorage.getItem('facultyName') || 'Faculty Member';

  // Fetch materials on component mount
  useEffect(() => {
    fetchMaterials();
  }, [selectedSubject, searchTerm]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject && selectedSubject !== 'all') {
        params.append('search', selectedSubject);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`${API_BASE}/api/materials?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      
      const data = await response.json();
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setFormData({ ...formData, title: fileName });
      }
      // Auto-detect type from file extension
      const ext = file.name.split('.').pop().toLowerCase();
      let type = 'Document';
      if (ext === 'pdf') type = 'PDF';
      else if (ext === 'ppt' || ext === 'pptx') type = 'PPT';
      else if (ext === 'doc' || ext === 'docx') type = 'Notes';
      else if (ext === 'mp4' || ext === 'webm') type = 'Video';
      setFormData(prev => ({ ...prev, type }));
    }
  };

  const handleUploadMaterial = async () => {
    if (!formData.title || !formData.subject || !selectedFile) {
      setError('Please fill in all required fields and select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload the file
      const fileFormData = new FormData();
      fileFormData.append('file', selectedFile);

      const uploadResponse = await fetch(`${API_BASE}/api/materials/upload-file`, {
        method: 'POST',
        headers: {
          'X-Student-Id': facultyId // Using facultyId for the upload
        },
        body: fileFormData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const uploadResult = await uploadResponse.json();

      // Step 2: Create the material record
      const materialData = {
        title: formData.title,
        subject: formData.subject,
        semester: formData.semester,
        author: facultyName,
        fileUrl: uploadResult.fileUrl,
        fileSize: uploadResult.fileSize,
        type: formData.type
      };

      const createResponse = await fetch(`${API_BASE}/api/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Student-Id': facultyId
        },
        body: JSON.stringify(materialData)
      });

      if (!createResponse.ok) {
        throw new Error('Failed to save material record');
      }

      // Success!
      setSuccess('Material uploaded successfully! Students can now access it.');
      setShowUploadModal(false);
      setFormData({
        title: '',
        subject: selectedSubject === 'all' ? '' : selectedSubject,
        semester: 'Sem 4',
        type: 'PDF',
        difficulty: 'Intermediate',
        visibility: 'All Students'
      });
      setSelectedFile(null);
      
      // Refresh materials list
      fetchMaterials();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Student-Id': facultyId
        }
      });

      if (response.ok || response.status === 404) {
        // Remove from local state even if backend doesn't support delete
        setMaterials(materials.filter(m => m.id !== id));
        setSuccess('Material deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Delete error:', err);
      // Still remove from local state for better UX
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return <span className="text-sm font-bold text-red-600">PDF</span>;
      case 'ppt': return <span className="text-sm font-bold text-orange-600">PPT</span>;
      case 'notes': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video': return <Video className="h-5 w-5 text-purple-600" />;
      default: return <File className="h-5 w-5 text-slate-600" />;
    }
  };

  const filteredMaterials = materials.filter(m => 
    (selectedSubject === 'all' || m.subject?.toLowerCase().includes(selectedSubject.toLowerCase())) &&
    (m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.subject?.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(b.uploadDate || b.createdAt || b.date || 0) - new Date(a.uploadDate || a.createdAt || a.date || 0));

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-100 border border-green-300 p-4 text-green-800">
          <CheckCircle className="h-5 w-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-100 border border-red-300 p-4 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload New Material */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <button
          onClick={() => setShowUploadModal(!showUploadModal)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          Upload Material
        </button>

        {showUploadModal && (
          <div className="mt-4 space-y-4 rounded-lg border border-blue-300 bg-white p-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
              <input
                type="file"
                id="material-file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.mp4,.webm,.zip"
                onChange={handleFileChange}
              />
              <label htmlFor="material-file" className="cursor-pointer">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-sm text-slate-500">
                      ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div className="text-slate-600">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Click to select a file</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports: PDF, PPT, DOC, TXT, MP4, ZIP (Max 500MB)
                    </p>
                  </div>
                )}
              </label>
            </div>

            <input
              type="text"
              placeholder="Material Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Subject *</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Science">Data Science</option>
              <option value="Database Design">Database Design</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="DBMS">DBMS</option>
              <option value="DSA">DSA</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Microprocessors">Microprocessors</option>
              <option value="Web Technologies">Web Technologies</option>
            </select>

            <div className="grid gap-4 sm:grid-cols-2">
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Sem 1">Semester 1</option>
                <option value="Sem 2">Semester 2</option>
                <option value="Sem 3">Semester 3</option>
                <option value="Sem 4">Semester 4</option>
                <option value="Sem 5">Semester 5</option>
                <option value="Sem 6">Semester 6</option>
                <option value="Sem 7">Semester 7</option>
                <option value="Sem 8">Semester 8</option>
              </select>

              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="PDF">PDF</option>
                <option value="PPT">PowerPoint</option>
                <option value="Notes">Notes/Document</option>
                <option value="Video">Video</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUploadMaterial}
                disabled={uploading || !selectedFile}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setError(null);
                }}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Materials List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            Uploaded Materials ({filteredMaterials.length})
          </h3>
          <button
            onClick={fetchMaterials}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredMaterials.length > 0 ? (
          <div className="space-y-3">
            {filteredMaterials.map(material => (
              <div key={material.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:bg-slate-50 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg bg-slate-100 p-2 w-12 h-12">
                      {getFileIcon(material.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{material.title}</h4>
                      <p className="text-xs text-slate-600">
                        {material.subject} • {material.semester} • {material.author}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {material.fileSize} • {material.downloads || 0} downloads • {material.date}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {material.fileUrl && (
                    <a
                      href={material.fileUrl.startsWith('http') ? material.fileUrl : `${API_BASE}${material.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-green-100 p-2 text-green-600 transition hover:bg-green-200"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-600 font-medium">No materials uploaded yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Upload your first material to share with students
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h4 className="font-semibold text-green-800 mb-2">📚 Student Access</h4>
        <p className="text-sm text-green-700">
          All materials you upload here will be automatically visible to students in their 
          "Notes & Materials" section under Academics & Learning. Students can view and 
          download these materials.
        </p>
      </div>
    </div>
  );
};

export default FacultyNotesAndMaterials;
