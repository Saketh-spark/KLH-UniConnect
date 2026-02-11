import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Loader, Lightbulb } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const SafetyTips = ({ facultyId }) => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal',
    riskLevel: 'Medium',
    isFeatured: false,
    displayOrder: 0,
    tips: ''
  });

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const response = await safetyAPI.getAllTips();
      setTips(response.data.tips || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tips:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await safetyAPI.updateTip(editingId, formData);
      } else {
        await safetyAPI.createTip(formData, facultyId);
      }
      resetForm();
      setShowForm(false);
      fetchTips();
    } catch (error) {
      console.error('Error saving tip:', error);
    }
  };

  const handleToggleFeatured = async (id, currentValue) => {
    try {
      await safetyAPI.updateTip(id, { isFeatured: !currentValue });
      fetchTips();
    } catch (error) {
      console.error('Error updating tip:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this tip?')) {
      try {
        await safetyAPI.deleteTip(id);
        fetchTips();
      } catch (error) {
        console.error('Error deleting tip:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({title: '', content: '', category: 'Personal', riskLevel: 'Medium', isFeatured: false, displayOrder: 0, tips: ''});
    setEditingId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  const getRiskLevelColor = (level) => {
    switch(level) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Personal': 'bg-blue-100 text-blue-800',
      'Digital': 'bg-purple-100 text-purple-800',
      'Health': 'bg-green-100 text-green-800',
      'Travel': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  const featuredTips = tips.filter(t => t.isFeatured);
  const regularTips = tips.filter(t => !t.isFeatured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Safety Tips</h2>
        <button
          onClick={() => {resetForm(); setShowForm(!showForm);}}
          className="flex items-center gap-2 rounded-[12px] bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <Plus size={18} />
          New Tip
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit' : 'Create'} Safety Tip</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Tip Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2 text-sm" />
            <textarea placeholder="Tip Content/Details" required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2 text-sm" rows="4" />
            <div className="grid gap-4 md:grid-cols-4">
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm">
                <option>Personal</option>
                <option>Digital</option>
                <option>Health</option>
                <option>Travel</option>
              </select>
              <select value={formData.riskLevel} onChange={(e) => setFormData({...formData, riskLevel: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <input type="number" placeholder="Display Order" value={formData.displayOrder} onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})} className="rounded-[8px] border border-slate-200 px-4 py-2 text-sm" />
              <label className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-4 py-2 cursor-pointer hover:bg-slate-50">
                <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} />
                <span className="text-sm font-medium">Feature This</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 rounded-[8px] bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700">
                {editingId ? 'Update' : 'Create'} Tip
              </button>
              <button type="button" onClick={() => {setShowForm(false); resetForm();}} className="flex-1 rounded-[8px] border border-slate-200 py-2 text-sm font-semibold">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Featured Tips */}
      {featuredTips.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
            Featured Tips
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredTips.map((tip) => (
              <div key={tip.id} className="rounded-[16px] border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{tip.title}</h4>
                    <div className="mt-2 flex gap-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(tip.category)}`}>{tip.category}</span>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getRiskLevelColor(tip.riskLevel)}`}>{tip.riskLevel}</span>
                    </div>
                  </div>
                  <button onClick={() => handleToggleFeatured(tip.id, tip.isFeatured)} className="p-2 rounded-lg hover:bg-yellow-100">
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{tip.content}</p>
                <div className="flex gap-2">
                  <button onClick={() => {setEditingId(tip.id); setFormData(tip); setShowForm(true);}} className="flex-1 p-2 rounded-lg text-sm font-semibold hover:bg-slate-100">
                    <Edit2 size={16} className="inline mr-1" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(tip.id)} className="flex-1 p-2 rounded-lg text-sm font-semibold hover:bg-red-100 text-red-600">
                    <Trash2 size={16} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Tips */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900">{featuredTips.length > 0 ? 'Other Tips' : 'All Tips'}</h3>
        {regularTips.length === 0 && featuredTips.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
            <Lightbulb size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600">No safety tips yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {regularTips.map((tip) => (
              <div key={tip.id} className="rounded-[12px] border border-slate-200 bg-white p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{tip.title}</h4>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-1">{tip.content}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getCategoryColor(tip.category)}`}>{tip.category}</span>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getRiskLevelColor(tip.riskLevel)}`}>{tip.riskLevel}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleFeatured(tip.id, tip.isFeatured)} className="p-2 rounded-lg hover:bg-yellow-100">
                      <Star size={16} className="text-slate-400" />
                    </button>
                    <button onClick={() => {setEditingId(tip.id); setFormData(tip); setShowForm(true);}} className="p-2 rounded-lg hover:bg-slate-100">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(tip.id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyTips;
