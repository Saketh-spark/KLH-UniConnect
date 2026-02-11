import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader, Search } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const SafetyResources = ({ facultyId }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'Medical Emergency',
    phone: '',
    email: '',
    availability: '24/7',
    priorityLevel: 'High',
    description: '',
    address: '',
    website: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await safetyAPI.getAllResources();
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await safetyAPI.updateResource(editingId, formData, facultyId);
      } else {
        await safetyAPI.createResource(formData, facultyId);
      }
      setFormData({
        title: '', type: 'Medical Emergency', phone: '', email: '',
        availability: '24/7', priorityLevel: 'High', description: '',
        address: '', website: ''
      });
      setEditingId(null);
      setShowForm(false);
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[12px] border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-[12px] bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={18} />
          Add Resource
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit' : 'Add New'} Resource</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" placeholder="Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-200" />
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2">
                <option>Medical Emergency</option>
                <option>Counseling Center</option>
                <option>Women Safety</option>
                <option>Mental Health Support</option>
              </select>
              <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2" />
              <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2" />
              <select value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2">
                <option>24/7</option>
                <option>Specific Timings</option>
              </select>
              <select value={formData.priorityLevel} onChange={(e) => setFormData({...formData, priorityLevel: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2" rows="3" />
            <div className="flex gap-4">
              <button type="submit" className="flex-1 rounded-[8px] bg-sky-600 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                {editingId ? 'Update' : 'Create'} Resource
              </button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null);}} className="flex-1 rounded-[8px] border border-slate-200 py-2 text-sm font-semibold hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid gap-4">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{resource.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{resource.description}</p>
                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                  {resource.phone && <div>📞 {resource.phone}</div>}
                  {resource.email && <div>📧 {resource.email}</div>}
                  {resource.availability && <div>⏰ {resource.availability}</div>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{resource.type}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    resource.priorityLevel === 'High' ? 'bg-red-100 text-red-700' :
                    resource.priorityLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>{resource.priorityLevel} Priority</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => safetyAPI.toggleResourceVisibility(resource.id, !resource.visibleToStudents)} className="p-2 rounded-lg hover:bg-slate-100">
                  {resource.visibleToStudents ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => {setEditingId(resource.id); setFormData(resource); setShowForm(true);}} className="p-2 rounded-lg hover:bg-slate-100">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => safetyAPI.deleteResource(resource.id).then(fetchResources)} className="p-2 rounded-lg hover:bg-red-100 text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyResources;
