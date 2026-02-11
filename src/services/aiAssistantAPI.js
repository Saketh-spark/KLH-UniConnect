import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8085';
const AI_API = `${API_BASE}/api/ai-assistant`;

// ============ CONVERSATIONS ============

export const createConversation = async (userId, userRole, title, category, subject, language = 'en') => {
  const res = await axios.post(`${AI_API}/conversations`, {
    userId, userRole, title, category, subject, language
  });
  return res.data;
};

export const getConversation = async (conversationId) => {
  const res = await axios.get(`${AI_API}/conversations/${conversationId}`);
  return res.data;
};

export const getUserConversations = async (userId) => {
  const res = await axios.get(`${AI_API}/conversations/user/${userId}`);
  return res.data;
};

export const getUserConversationsByCategory = async (userId, category) => {
  const res = await axios.get(`${AI_API}/conversations/user/${userId}/category/${category}`);
  return res.data;
};

export const sendMessage = async (conversationId, content, type = 'text', attachments = null) => {
  const res = await axios.post(`${AI_API}/conversations/${conversationId}/messages`, {
    content, type, attachments
  });
  return res.data;
};

export const deleteConversation = async (conversationId) => {
  const res = await axios.delete(`${AI_API}/conversations/${conversationId}`);
  return res.data;
};

// ============ FILE UPLOAD ============

export const uploadFile = async (conversationId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post(`${AI_API}/conversations/${conversationId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60s for large files
  });
  return res.data;
};

// ============ QUICK CHAT ============

export const quickChat = async (userId, message, category = 'doubt', subject = null, language = 'en') => {
  const res = await axios.post(`${AI_API}/quick-chat`, {
    userId, message, category, subject, language
  });
  return res.data;
};

// ============ STUDY PLANS ============

export const generateStudyPlan = async (studentId, type = 'daily', subjects = []) => {
  const res = await axios.post(`${AI_API}/study-plans`, {
    studentId, type, subjects
  });
  return res.data;
};

export const getStudentStudyPlans = async (studentId) => {
  const res = await axios.get(`${AI_API}/study-plans/student/${studentId}`);
  return res.data;
};

export const deleteStudyPlan = async (planId) => {
  const res = await axios.delete(`${AI_API}/study-plans/${planId}`);
  return res.data;
};

// ============ QUIZZES ============

export const generateQuiz = async (studentId, subject, quizType = 'mcq', numQuestions = 10, difficulty = 'medium') => {
  const res = await axios.post(`${AI_API}/quizzes/generate`, {
    studentId, subject, quizType, numQuestions, difficulty
  });
  return res.data;
};

export const submitQuiz = async (quizId, answers) => {
  const res = await axios.post(`${AI_API}/quizzes/${quizId}/submit`, answers);
  return res.data;
};

export const getStudentQuizResults = async (studentId) => {
  const res = await axios.get(`${AI_API}/quizzes/student/${studentId}`);
  return res.data;
};

// ============ SYLLABUS CONFIG (FACULTY) ============

export const saveSyllabusConfig = async (config) => {
  const res = await axios.post(`${AI_API}/syllabus-config`, config);
  return res.data;
};

export const getFacultySyllabusConfigs = async (facultyId) => {
  const res = await axios.get(`${AI_API}/syllabus-config/faculty/${facultyId}`);
  return res.data;
};

export const deleteSyllabusConfig = async (configId) => {
  const res = await axios.delete(`${AI_API}/syllabus-config/${configId}`);
  return res.data;
};

// ============ ANALYTICS ============

export const getFacultyAIAnalytics = async (facultyId) => {
  const res = await axios.get(`${AI_API}/analytics/faculty/${facultyId}`);
  return res.data;
};

export const getStudentAIAnalytics = async (studentId) => {
  const res = await axios.get(`${AI_API}/analytics/student/${studentId}`);
  return res.data;
};

export default {
  createConversation,
  getConversation,
  getUserConversations,
  getUserConversationsByCategory,
  sendMessage,
  deleteConversation,
  uploadFile,
  quickChat,
  generateStudyPlan,
  getStudentStudyPlans,
  deleteStudyPlan,
  generateQuiz,
  submitQuiz,
  getStudentQuizResults,
  saveSyllabusConfig,
  getFacultySyllabusConfigs,
  deleteSyllabusConfig,
  getFacultyAIAnalytics,
  getStudentAIAnalytics
};
