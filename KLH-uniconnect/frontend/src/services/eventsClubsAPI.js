import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/faculty';

export const eventAPI = {
  // Events
  getAllEvents: () => axios.get(`${API_BASE_URL}/events`),
  getMyEvents: (facultyId) => axios.get(`${API_BASE_URL}/events/my-events`, {
    headers: { 'Faculty-Id': facultyId }
  }),
  getEventById: (eventId) => axios.get(`${API_BASE_URL}/events/${eventId}`),
  createEvent: (eventData, facultyId) => axios.post(`${API_BASE_URL}/events`, eventData, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateEvent: (eventId, eventData) => axios.put(`${API_BASE_URL}/events/${eventId}`, eventData),
  deleteEvent: (eventId) => axios.delete(`${API_BASE_URL}/events/${eventId}`),
  publishEvent: (eventId) => axios.patch(`${API_BASE_URL}/events/${eventId}/publish`, {}),
  getStats: (facultyId) => axios.get(`${API_BASE_URL}/events/stats`, {
    headers: { 'Faculty-Id': facultyId }
  }),
  registerStudent: (eventId, studentId) => axios.post(`${API_BASE_URL}/events/${eventId}/register/${studentId}`),
  markAttendance: (eventId, attendanceData) => axios.post(`${API_BASE_URL}/events/${eventId}/attendance`, attendanceData),
  exportRegistrations: (eventId) => axios.get(`${API_BASE_URL}/events/${eventId}/registrations/export`),
  searchEvents: (query) => axios.get(`${API_BASE_URL}/events/search`, { params: { query } }),
  getEventsByType: (eventType) => axios.get(`${API_BASE_URL}/events/type/${eventType}`),
  getEventsByDateRange: (startDate, endDate) => axios.get(`${API_BASE_URL}/events/date-range`, {
    params: { startDate, endDate }
  })
};

export const clubAPI = {
  // Clubs
  getAllClubs: () => axios.get(`${API_BASE_URL}/clubs`),
  getMyClubs: (facultyId) => axios.get(`${API_BASE_URL}/clubs/my-clubs`, {
    headers: { 'Faculty-Id': facultyId }
  }),
  getClubById: (clubId) => axios.get(`${API_BASE_URL}/clubs/${clubId}`),
  createClub: (clubData, facultyId) => axios.post(`${API_BASE_URL}/clubs`, clubData, {
    headers: { 'Faculty-Id': facultyId }
  }),
  updateClub: (clubId, clubData) => axios.put(`${API_BASE_URL}/clubs/${clubId}`, clubData),
  deleteClub: (clubId) => axios.delete(`${API_BASE_URL}/clubs/${clubId}`),
  approveClub: (clubId, facultyId) => axios.patch(`${API_BASE_URL}/clubs/${clubId}/approve`, {}, {
    headers: { 'Faculty-Id': facultyId }
  }),
  rejectClub: (clubId) => axios.patch(`${API_BASE_URL}/clubs/${clubId}/reject`, {}),
  suspendClub: (clubId) => axios.patch(`${API_BASE_URL}/clubs/${clubId}/suspend`, {}),
  addMember: (clubId, studentId) => axios.post(`${API_BASE_URL}/clubs/${clubId}/members/${studentId}`),
  removeMember: (clubId, studentId) => axios.delete(`${API_BASE_URL}/clubs/${clubId}/members/${studentId}`),
  getStats: (facultyId) => axios.get(`${API_BASE_URL}/clubs/stats`, {
    headers: { 'Faculty-Id': facultyId }
  }),
  getClubsByCategory: (category) => axios.get(`${API_BASE_URL}/clubs/category/${category}`),
  searchClubs: (query) => axios.get(`${API_BASE_URL}/clubs/search`, { params: { query } })
};

export default { eventAPI, clubAPI };
