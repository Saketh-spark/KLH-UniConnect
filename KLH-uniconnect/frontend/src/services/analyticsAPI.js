import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';
const API_BASE_URL = `${API_BASE}/api/analytics`;

// Student Analytics API
export const getStudentAnalytics = (studentId) => 
  axios.get(`${API_BASE_URL}/student/${studentId}`);

export const updateStudentAnalytics = (studentId, data) =>
  axios.put(`${API_BASE_URL}/update/${studentId}`, data);

export const getDepartmentAnalytics = (department) =>
  axios.get(`${API_BASE_URL}/department/${department}`);

export const getAnalyticsBySemester = (semester) =>
  axios.get(`${API_BASE_URL}/semester/${semester}`);

// Skills Analytics API
export const getStudentSkills = (studentId) =>
  axios.get(`${API_BASE_URL}/skills/student/${studentId}`);

export const addSkill = (skillData) =>
  axios.post(`${API_BASE_URL}/skills/add`, skillData);

export const updateSkillProficiency = (skillId, proficiency) =>
  axios.put(`${API_BASE_URL}/skills/update/${skillId}`, null, {
    params: { proficiency }
  });

export const endorseSkill = (skillId) =>
  axios.post(`${API_BASE_URL}/skills/${skillId}/endorse`);

export const getSkillsByCategory = (studentId, category) =>
  axios.get(`${API_BASE_URL}/skills/student/${studentId}/category/${category}`);

// Goals API
export const getStudentGoals = (studentId) =>
  axios.get(`${API_BASE_URL}/goals/student/${studentId}`);

export const getAllStudentGoals = (studentId) =>
  axios.get(`${API_BASE_URL}/goals/student/${studentId}/all`);

export const createGoal = (goalData) =>
  axios.post(`${API_BASE_URL}/goals/create`, goalData);

export const updateGoalProgress = (goalId, progress) =>
  axios.put(`${API_BASE_URL}/goals/${goalId}/progress`, null, {
    params: { progress }
  });

export const completeGoal = (goalId) =>
  axios.put(`${API_BASE_URL}/goals/${goalId}/complete`);

export const addGoalFeedback = (goalId, feedback) =>
  axios.put(`${API_BASE_URL}/goals/${goalId}/feedback`, null, {
    params: { feedback }
  });

// Reports API
export const getStudentReports = (studentId) =>
  axios.get(`${API_BASE_URL}/reports/student/${studentId}`);

export const getReportsByType = (studentId, reportType) =>
  axios.get(`${API_BASE_URL}/reports/student/${studentId}/type/${reportType}`);

export const generateReport = (reportData) =>
  axios.post(`${API_BASE_URL}/reports/generate`, reportData);

export const getPublishedReports = (studentId) =>
  axios.get(`${API_BASE_URL}/reports/student/${studentId}/published`);

export const downloadReport = (reportId) =>
  axios.get(`${API_BASE_URL}/reports/${reportId}/download`);

// Feedback API
export const getStudentFeedback = (studentId) =>
  axios.get(`${API_BASE_URL}/feedback/student/${studentId}`);

export const getUnreadFeedback = (studentId) =>
  axios.get(`${API_BASE_URL}/feedback/student/${studentId}/unread`);

export const addFeedback = (feedbackData) =>
  axios.post(`${API_BASE_URL}/feedback/add`, feedbackData);

export const markFeedbackAsRead = (feedbackId) =>
  axios.put(`${API_BASE_URL}/feedback/${feedbackId}/read`);

export const getFacultyFeedback = (facultyId) =>
  axios.get(`${API_BASE_URL}/feedback/faculty/${facultyId}`);

export const getFlaggedStudents = () =>
  axios.get(`${API_BASE_URL}/feedback/flagged`);

export const flagStudentForAttention = (feedbackId, recommendedAction) =>
  axios.put(`${API_BASE_URL}/feedback/${feedbackId}/flag`, null, {
    params: { recommendedAction }
  });

export default {
  // Student Analytics
  getStudentAnalytics,
  updateStudentAnalytics,
  getDepartmentAnalytics,
  getAnalyticsBySemester,
  
  // Skills
  getStudentSkills,
  addSkill,
  updateSkillProficiency,
  endorseSkill,
  getSkillsByCategory,
  
  // Goals
  getStudentGoals,
  getAllStudentGoals,
  createGoal,
  updateGoalProgress,
  completeGoal,
  addGoalFeedback,
  
  // Reports
  getStudentReports,
  getReportsByType,
  generateReport,
  getPublishedReports,
  downloadReport,
  
  // Feedback
  getStudentFeedback,
  getUnreadFeedback,
  addFeedback,
  markFeedbackAsRead,
  getFacultyFeedback,
  getFlaggedStudents,
  flagStudentForAttention
};
