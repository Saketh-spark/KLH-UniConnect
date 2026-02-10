import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, FileText, Loader } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const SafetyGuides = ({ facultyId }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General Safety',
    importanceLevel: 'Medium',
    readTimeMinutes: 5,
    tags: ''
  });

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const response = await safetyAPI.getAllGuides();
      setGuides(response.data.guides || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await safetyAPI.updateGuide(editingId, formData);
      } else {
        await safetyAPI.createGuide(formData, facultyId);
      }
      resetForm();
      setShowForm(false);
      fetchGuides();
    } catch (error) {
      console.error('Error saving guide:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await safetyAPI.approveGuide(id, facultyId);
      fetchGuides();
    } catch (error) {
      console.error('Error approving guide:', error);
    }
  };

  const handlePublish = async (id) => {
    try {
      await safetyAPI.publishGuide(id, facultyId);
      fetchGuides();
    } catch (error) {
      console.error('Error publishing guide:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this guide?')) {
      try {
        await safetyAPI.deleteGuide(id);
        fetchGuides();
      } catch (error) {
        console.error('Error deleting guide:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({title: '', content: '', category: 'General Safety', importanceLevel: 'Medium', readTimeMinutes: 5, tags: ''});
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  const filteredGuides = filterStatus === 'all' ? guides :
    filterStatus === 'draft' ? guides.filter(g => !g.isApproved) :
    filterStatus === 'approved' ? guides.filter(g => g.isApproved && !g.isPublished) :
    guides.filter(g => g.isPublished);

  const getStatusBadge = (guide) => {
    if (guide.isPublished) return <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Published</span>;
    if (guide.isApproved) return <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Approved</span>;
    return <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">Draft</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Safety Guides</h2>
        <button
          onClick={() => {resetForm(); setShowForm(!showForm);}}
          className="flex items-center gap-2 rounded-[12px] bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New Guide
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit' : 'Create'} Safety Guide</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Guide Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2 text-sm" />
            <textarea placeholder="Guide Content" required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2 text-sm" rows="6" />
            <div className="grid gap-4 md:grid-cols-4">
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm">
                <option>General Safety</option>
                <option>Cybersecurity</option>
                <option>Health & Wellness</option>
                <option>Campus Safety</option>
              </select>
              <select value={formData.importanceLevel} onChange={(e) => setFormData({...formData, importanceLevel: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
              <input type="number" placeholder="Read Time (min)" min="1" value={formData.readTimeMinutes} onChange={(e) => setFormData({...formData, readTimeMinutes: parseInt(e.target.value)})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm" />
              <input type="text" placeholder="Tags (comma-separated)" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 rounded-[8px] bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {editingId ? 'Update' : 'Create'} Guide
              </button>
              <button type="button" onClick={() => {setShowForm(false); resetForm();}} className="flex-1 rounded-[8px] border border-slate-200 py-2 text-sm font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'draft', 'approved', 'published'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Guides List */}
      <div className="space-y-4">
        {filteredGuides.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
            <FileText size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No guides found</p>
          </div>
        ) : (
          filteredGuides.map((guide) => (
            <div key={guide.id} className="rounded-[16px] border border-slate-200 bg-white p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{guide.title}</h3>
                    {getStatusBadge(guide)}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{guide.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>Category: {guide.category}</span>
                    <span>Read Time: {guide.readTimeMinutes} min</span>
                    <span>Importance: <span className={guide.importanceLevel === 'Critical' ? 'text-red-600 font-bold' : guide.importanceLevel === 'High' ? 'text-orange-600 font-bold' : 'text-slate-600'}>{guide.importanceLevel}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!guide.isApproved && (
                    <button onClick={() => handleApprove(guide.id)} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                      <Check size={18} />
                    </button>
                  )}
                  {guide.isApproved && !guide.isPublished && (
                    <button onClick={() => handlePublish(guide.id)} className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">
                      <Check size={18} />
                    </button>
                  )}
                  <button onClick={() => {setEditingId(guide.id); setFormData(guide); setShowForm(true);}} className="p-2 rounded-lg hover:bg-slate-100">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(guide.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SafetyGuides;
