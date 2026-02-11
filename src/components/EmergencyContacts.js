import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Loader, Phone } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const EmergencyContacts = ({ facultyId }) => {
  const [contacts, setContacts] = useState([]);
  const [primaryContact, setPrimaryContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    phone: '',
    email: '',
    category: 'Campus Security',
    availabilityStatus: 'Always Available',
    description: '',
    location: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await safetyAPI.getEmergencyContacts();
      setContacts(response.data.contacts || []);
      setPrimaryContact(response.data.primaryContact);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await safetyAPI.updateEmergencyContact(editingId, formData);
      } else {
        await safetyAPI.createEmergencyContact(formData, facultyId);
      }
      setFormData({title: '', phone: '', email: '', category: 'Campus Security', availabilityStatus: 'Always Available', description: '', location: ''});
      setEditingId(null);
      setShowForm(false);
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const categories = ['Campus Security', 'Police', 'Ambulance', 'Fire', 'Mental Health', 'Medical'];

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 rounded-[12px] bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700"
      >
        <Plus size={18} />
        Add Emergency Contact
      </button>

      {/* Form */}
      {showForm && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit' : 'Add New'} Emergency Contact</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input type="text" placeholder="Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2 focus:border-red-500" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2">
                {categories.map(cat => <option key={cat}>{cat}</option>)}
              </select>
              <input type="tel" placeholder="Phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2" />
              <input type="email" placeholder="Email (Optional)" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2" />
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2" rows="2" />
            <div className="flex gap-4">
              <button type="submit" className="flex-1 rounded-[8px] bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">
                {editingId ? 'Update' : 'Add'} Contact
              </button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null);}} className="flex-1 rounded-[8px] border border-slate-200 py-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Primary Contact Highlight */}
      {primaryContact && (
        <div className="rounded-[16px] border-2 border-red-300 bg-gradient-to-br from-red-50 to-pink-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
              <Phone size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">🚨 Primary Emergency Contact</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{primaryContact.title}</h3>
              <p className="mt-2 text-lg font-semibold text-red-600">{primaryContact.phone}</p>
              <p className="mt-1 text-sm text-slate-600">{primaryContact.description}</p>
            </div>
            <Star size={24} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">All Emergency Contacts</h3>
        {contacts.map((contact) => (
          <div key={contact.id} className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{contact.title}</h3>
                  {contact.isPrimary && <Star size={18} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="mt-1 text-sm text-slate-600">{contact.description}</p>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="font-semibold text-slate-900">📞 {contact.phone}</div>
                  {contact.email && <div className="text-slate-600">📧 {contact.email}</div>}
                  <div className="text-slate-600">{contact.category}</div>
                </div>
                <span className="mt-3 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">{contact.category}</span>
              </div>
              <div className="flex gap-2">
                {!contact.isPrimary && (
                  <button onClick={() => safetyAPI.setPrimaryContact(contact.id).then(fetchContacts)} className="p-2 rounded-lg hover:bg-yellow-100" title="Set as primary">
                    <Star size={18} className="text-slate-400" />
                  </button>
                )}
                <button onClick={() => {setEditingId(contact.id); setFormData(contact); setShowForm(true);}} className="p-2 rounded-lg hover:bg-slate-100">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => safetyAPI.deleteResource(contact.id).then(fetchContacts)} className="p-2 rounded-lg hover:bg-red-100 text-red-600">
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

export default EmergencyContacts;
