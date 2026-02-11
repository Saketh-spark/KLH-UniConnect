// Chat API Service
// Handles all backend API calls for chat functionality

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api';

const chatAPI = {
  // Search users by email
  searchUsers: async (query, role = 'student') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/search-users`, {
        params: { q: query, role }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get or create chat
  getOrCreateChat: async (participantId, type = 'individual') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/get-or-create`, {
        participantId,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error getting/creating chat:', error);
      throw error;
    }
  },

  // Get chat list
  getChatList: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/list`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat list:', error);
      throw error;
    }
  },

  // Get messages for a chat
  getMessages: async (chatId, page = 1, limit = 50) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${chatId}/messages`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (chatId, content, type = 'text', replyTo = null) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/messages`, {
        content,
        type,
        replyTo,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark message as seen
  markMessageAsSeen: async (messageId, chatId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/chat/${chatId}/messages/${messageId}/seen`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as seen:', error);
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId, chatId, deleteForAll = false) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/chat/${chatId}/messages/${messageId}`, {
        params: { deleteForAll }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // Upload file
  uploadFile: async (chatId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Create group
  createGroup: async (groupName, members) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/groups`, {
        groupName,
        members
      });
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Get user online status
  getUserStatus: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/users/${userId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user status:', error);
      throw error;
    }
  },

  // Update user online status
  updateUserStatus: async (status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/chat/users/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
};

export default chatAPI;
