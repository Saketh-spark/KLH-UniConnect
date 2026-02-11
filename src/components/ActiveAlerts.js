import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader, AlertTriangle } from 'lucide-react';
import { safetyAPI } from '../services/safetyAPI';

const ActiveAlerts = ({ facultyId }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Safety Warning',
    severity: 'Info',
    location: 'Campus-wide',
    expiryTime: ''
  });

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await safetyAPI.getAllAlerts();
      setAlerts(response.data.alerts || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await safetyAPI.updateAlert(editingId, formData);
      } else {
        await safetyAPI.createAlert(formData, facultyId);
      }
      setFormData({title: '', description: '', type: 'Safety Warning', severity: 'Info', location: 'Campus-wide', expiryTime: ''});
      setEditingId(null);
      setShowForm(false);
      fetchAlerts();
    } catch (error) {
      console.error('Error saving alert:', error);
    }
  };

  const handleClose = async (id, reason) => {
    try {
      await safetyAPI.closeAlert(id, reason, facultyId);
      fetchAlerts();
    } catch (error) {
      console.error('Error closing alert:', error);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'from-red-100 to-red-50 border-red-300';
      case 'Warning': return 'from-yellow-100 to-yellow-50 border-yellow-300';
      default: return 'from-blue-100 to-blue-50 border-blue-300';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader size={40} className="animate-spin text-blue-600" /></div>;
  }

  const activeAlerts = alerts.filter(a => a.isActive);

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 rounded-[12px] bg-yellow-600 px-6 py-3 text-sm font-semibold text-white hover:bg-yellow-700"
      >
        <Plus size={18} />
        Create Alert
      </button>

      {/* Form */}
      {showForm && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit' : 'Create New'} Alert</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Alert Title" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2" />
            <textarea placeholder="Description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-[8px] border border-slate-200 px-4 py-2" rows="3" />
            <div className="grid gap-4 md:grid-cols-2">
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2">
                <option>Maintenance Work</option>
                <option>Safety Warning</option>
                <option>Lost Items</option>
                <option>Cyber Alert</option>
              </select>
              <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2">
                <option>Info</option>
                <option>Warning</option>
                <option>Critical</option>
              </select>
              <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2" />
              <input type="datetime-local" placeholder="Expiry Time" value={formData.expiryTime} onChange={(e) => setFormData({...formData, expiryTime: e.target.value})} className="rounded-[8px] border border-slate-200 px-4 py-2" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="flex-1 rounded-[8px] bg-yellow-600 py-2 text-sm font-semibold text-white hover:bg-yellow-700">
                {editingId ? 'Update' : 'Create'} Alert
              </button>
              <button type="button" onClick={() => {setShowForm(false); setEditingId(null);}} className="flex-1 rounded-[8px] border border-slate-200 py-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Alerts */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Active Alerts ({activeAlerts.length})</h3>
        {activeAlerts.length === 0 ? (
          <div className="rounded-[16px] border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No active alerts</p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div key={alert.id} className={`rounded-[16px] border-2 bg-gradient-to-br p-6 shadow-sm hover:shadow-md transition ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="mt-1">
                    {alert.severity === 'Critical' ? <AlertTriangle size={24} className="text-red-600" /> :
                     alert.severity === 'Warning' ? <AlertTriangle size={24} className="text-yellow-600" /> :
                     <AlertTriangle size={24} className="text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{alert.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{alert.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <span className="text-slate-600"><strong>Type:</strong> {alert.type}</span>
                      {alert.location && <span className="text-slate-600"><strong>Location:</strong> {alert.location}</span>}
                      <span className="text-slate-600"><strong>Views:</strong> {alert.viewCount || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {setEditingId(alert.id); setFormData(alert); setShowForm(true);}} className="p-2 rounded-lg hover:bg-white/50">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleClose(alert.id, 'Closed by faculty')} className="p-2 rounded-lg hover:bg-red-100 text-red-600">
                    <X size={18} />
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

export default ActiveAlerts;
