import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';
const API_BASE_URL = `${API_BASE}/api/faculty/safety`;

export const safetyAPI = {
  // Dashboard
  getDashboard: () => axios.get(`${API_BASE_URL}/dashboard`),
  getSyncData: () => axios.get(`${API_BASE_URL}/sync`),

  // Safety Resources
  getAllResources: () => axios.get(`${API_BASE_URL}/resources`),
  createResource: (data, facultyId) => axios.post(`${API_BASE_URL}/resources`, data, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateResource: (id, data, facultyId) => axios.put(`${API_BASE_URL}/resources/${id}`, data, {
    headers: { 'Faculty-Id': facultyId }
  }),
  deleteResource: (id) => axios.delete(`${API_BASE_URL}/resources/${id}`),
  toggleResourceVisibility: (id, visible) => axios.put(`${API_BASE_URL}/resources/${id}/visibility`, { visible }),
  disableResource: (id) => axios.put(`${API_BASE_URL}/resources/${id}/disable`),

  // Emergency Contacts
  getEmergencyContacts: () => axios.get(`${API_BASE_URL}/emergency-contacts`),
  createEmergencyContact: (data, facultyId) => axios.post(`${API_BASE_URL}/emergency-contacts`, data, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateEmergencyContact: (id, data) => axios.put(`${API_BASE_URL}/emergency-contacts/${id}`, data),
  deleteEmergencyContact: (id) => axios.delete(`${API_BASE_URL}/emergency-contacts/${id}`),
  setPrimaryContact: (id) => axios.put(`${API_BASE_URL}/emergency-contacts/${id}/primary`),

  // Safety Alerts
  getAllAlerts: () => axios.get(`${API_BASE_URL}/alerts`),
  createAlert: (data, facultyId) => axios.post(`${API_BASE_URL}/alerts`, data, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateAlert: (id, data) => axios.put(`${API_BASE_URL}/alerts/${id}`, data),
  deleteAlert: (id) => axios.delete(`${API_BASE_URL}/alerts/${id}`),
  closeAlert: (id, reason, facultyId) => axios.put(`${API_BASE_URL}/alerts/${id}/close`, { reason }, {
    headers: { 'Faculty-Id': facultyId }
  }),

  // Incident Reports
  getIncidentReports: () => axios.get(`${API_BASE_URL}/incident-reports`),
  getIncidentReport: (id) => axios.get(`${API_BASE_URL}/incident-reports/${id}`),
  updateIncidentReport: (id, data) => axios.put(`${API_BASE_URL}/incident-reports/${id}`, data),
  assignIncidentReport: (id, data) => axios.put(`${API_BASE_URL}/incident-reports/${id}/assign`, data),
  resolveIncidentReport: (id, data) => axios.put(`${API_BASE_URL}/incident-reports/${id}/resolve`, data),

  // Safety Guides
  getSafetyGuides: () => axios.get(`${API_BASE_URL}/guides`),
  createGuide: (data, facultyId) => axios.post(`${API_BASE_URL}/guides`, data, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateGuide: (id, data) => axios.put(`${API_BASE_URL}/guides/${id}`, data),
  publishGuide: (id) => axios.put(`${API_BASE_URL}/guides/${id}/publish`),
  approveGuide: (id) => axios.put(`${API_BASE_URL}/guides/${id}/approve`),

  // Safety Tips
  getSafetyTips: () => axios.get(`${API_BASE_URL}/tips`),
  createTip: (data, facultyId) => axios.post(`${API_BASE_URL}/tips`, data, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateTip: (id, data) => axios.put(`${API_BASE_URL}/tips/${id}`, data),
  featureTip: (id) => axios.put(`${API_BASE_URL}/tips/${id}/feature`),

  // Counseling Sessions
  getCounselingRequests: () => axios.get(`${API_BASE_URL}/counseling-sessions`),
  assignCounselor: (id, counselorId) => axios.put(`${API_BASE_URL}/counseling-sessions/${id}/assign`, { counselorId }),
  scheduleSession: (id, dateTime) => axios.put(`${API_BASE_URL}/counseling-sessions/${id}/schedule`, { sessionDateTime: dateTime }),
  closeSession: (id) => axios.put(`${API_BASE_URL}/counseling-sessions/${id}/close`)
};
