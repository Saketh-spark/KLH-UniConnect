import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Search, Send, Paperclip, Smile, Users, 
  X, Plus, Image, FileText, UserPlus, ArrowLeft, Check,
  CheckCheck, MoreVertical, Trash2
} from 'lucide-react';

const Chat = ({ studentId, email, onBack }) => {
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'groups'
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_BASE = 'http://localhost:8085';

  // Get actual studentId from props or localStorage with logging
  const actualStudentId = studentId || localStorage.getItem('klhStudentId') || localStorage.getItem('studentId');
  
  useEffect(() => {
    console.log('=== CHAT COMPONENT INITIALIZED ===');
    console.log('studentId prop:', studentId);
    console.log('email prop:', email);
    console.log('klhStudentId from localStorage:', localStorage.getItem('klhStudentId'));
    console.log('studentId from localStorage:', localStorage.getItem('studentId'));
    console.log('actualStudentId:', actualStudentId);
    
    if (!actualStudentId) {
      console.error('ERROR: No studentId available!');
      alert('Error: Student ID not found. Please login again.');
      if (onBack) onBack();
    }
  }, []);

  // Emoji list for picker
  const emojis = ['😀', '😂', '😍', '😢', '😡', '👍', '👎', '❤️', '🎉', '🔥', '✨', '💯'];

  useEffect(() => {
    if (actualStudentId) {
      loadConversations();
      loadGroups();
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        if (selectedChat) {
          loadMessages();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [actualStudentId, selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/conversations/${actualStudentId}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadGroups = async () => {
    try {
      console.log('Loading groups for studentId:', actualStudentId);
      const response = await fetch(`${API_BASE}/api/groups/user/${actualStudentId}`);
      console.log('Load groups response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Groups loaded:', data);
        console.log('Number of groups:', data.length);
        setGroups(data);
      } else {
        const errorText = await response.text();
        console.error('Failed to load groups, status:', response.status, 'error:', errorText);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const loadMessages = async () => {
    if (!selectedChat) return;
    
    try {
      const url = selectedChat.type === 'group' 
        ? `${API_BASE}/api/groups/${selectedChat.id}/messages`
        : `${API_BASE}/api/chat/conversations/${selectedChat.id}/messages`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        if (selectedChat.type === 'group') {
          await fetch(`${API_BASE}/api/groups/${selectedChat.id}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: actualStudentId })
          });
        } else {
          await fetch(`${API_BASE}/api/chat/conversations/${selectedChat.id}/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: actualStudentId })
          });
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const searchUsers = async (term) => {
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/chat/users/search?email=${term}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.filter(u => u.id !== studentId));
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const startConversation = async (userId) => {
    console.log('Starting conversation with userId:', userId);
    console.log('Current actualStudentId:', actualStudentId);
    
    try {
      const payload = { userId1: actualStudentId, userId2: userId };
      console.log('Creating conversation with payload:', payload);
      
      const response = await fetch(`${API_BASE}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const conversation = await response.json();
        console.log('Conversation created:', conversation);
        
        setSelectedChat({ 
          id: conversation.id, 
          type: 'conversation',
          name: conversation.otherUserName,
          email: conversation.otherUserEmail
        });
        setShowUserSearch(false);
        setSearchTerm('');
        setSearchResults([]);
        await loadConversations();
        // Load messages for the new conversation
        setTimeout(() => loadMessages(), 500);
      } else {
        const errorText = await response.text();
        console.error('Failed to create conversation:', errorText);
        alert('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Error starting conversation: ' + error.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return;
    
    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      
      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch(`${API_BASE}/api/chat/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.url;
          fileName = uploadData.filename;
          fileSize = parseInt(uploadData.size);
        }
      }
      
      const messageData = {
        senderId: actualStudentId,
        content: newMessage || fileName || 'File',
        type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
        fileUrl: fileUrl,
        fileName: fileName,
        fileSize: fileSize
      };
      
      let response;
      if (selectedChat.type === 'group') {
        response = await fetch(`${API_BASE}/api/groups/${selectedChat.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
      } else {
        response = await fetch(`${API_BASE}/api/chat/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...messageData, conversationId: selectedChat.id })
        });
      }
      
      if (response.ok) {
        setNewMessage('');
        setSelectedFile(null);
        await loadMessages();
        await loadConversations();
        await loadGroups();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await fetch(`${API_BASE}/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: actualStudentId, emoji })
      });
      loadMessages();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const selectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  const searchMembers = async (term) => {
    if (term.length < 3) {
      setMemberSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/chat/users/search?email=${term}`);
      if (response.ok) {
        const data = await response.json();
        setMemberSearchResults(data.filter(u => u.id !== actualStudentId));
      }
    } catch (error) {
      console.error('Failed to search members:', error);
    }
  };

  const toggleMemberSelection = (user) => {
    if (selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers(selectedMembers.filter(m => m.id !== user.id));
    } else {
      setSelectedMembers([...selectedMembers, user]);
    }
  };

  const createGroup = async () => {
    console.log('=== CREATE GROUP ===');
    console.log('Group name:', groupName);
    console.log('Selected members:', selectedMembers);
    console.log('actualStudentId:', actualStudentId);
    
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }

    try {
      const payload = {
        name: groupName,
        description: groupDescription || 'No description',
        createdBy: actualStudentId,
        memberIds: selectedMembers.map(m => m.id)
      };
      
      console.log('Creating group with payload:', payload);
      
      const response = await fetch(`${API_BASE}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const group = await response.json();
        console.log('Group created:', group);
        
        setShowGroupModal(false);
        setGroupName('');
        setGroupDescription('');
        setSelectedMembers([]);
        setMemberSearchTerm('');
        setMemberSearchResults([]);
        await loadGroups();
        setActiveTab('groups');
        alert('Group created successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to create group:', errorText);
        alert('Failed to create group: ' + errorText);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <MessageCircle className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-800">Chat</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUserSearch(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>New Chat</span>
              </button>
              <button
                onClick={() => setShowGroupModal(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Users className="w-5 h-5" />
                <span>New Group</span>
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'chats'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'groups'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden">
          <div className="flex h-[600px]">
            {/* Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'chats' && conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectChat({ 
                      id: conv.id, 
                      type: 'conversation',
                      name: conv.otherUserName,
                      email: conv.otherUserEmail
                    })}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedChat?.id === conv.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">{conv.otherUserName}</h3>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                        <p className="text-xs text-gray-400 mt-1">{conv.lastMessageTime}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {activeTab === 'groups' && groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => selectChat({ 
                      id: group.id, 
                      type: 'group',
                      name: group.name,
                      memberCount: group.memberCount
                    })}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedChat?.id === group.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-gray-500" />
                          <h3 className="font-semibold text-gray-800">{group.name}</h3>
                          {group.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {group.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{group.lastMessage || 'No messages yet'}</p>
                        <p className="text-xs text-gray-400 mt-1">{group.memberCount} members · {group.lastMessageTime}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {activeTab === 'chats' && conversations.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new chat to get started</p>
                  </div>
                )}

                {activeTab === 'groups' && groups.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No groups yet</p>
                    <p className="text-sm">Create a group to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden text-gray-600 hover:text-gray-800"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </button>
                      {selectedChat.type === 'group' && <Users className="w-6 h-6 text-gray-600" />}
                      <div>
                        <h3 className="font-semibold text-gray-800">{selectedChat.name}</h3>
                        {selectedChat.type === 'conversation' && (
                          <p className="text-sm text-gray-500">{selectedChat.email}</p>
                        )}
                        {selectedChat.type === 'group' && (
                          <p className="text-sm text-gray-500">{selectedChat.memberCount} members</p>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-600 hover:text-gray-800">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === studentId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${msg.senderId === studentId ? 'order-2' : 'order-1'}`}>
                          {msg.senderId !== studentId && (
                            <p className="text-xs text-gray-500 mb-1">{msg.senderName}</p>
                          )}
                          <div className={`rounded-lg p-3 ${
                            msg.senderId === studentId
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}>
                            {msg.type === 'image' && msg.fileUrl && (
                              <img
                                src={`${API_BASE}${msg.fileUrl}`}
                                alt="Shared"
                                className="rounded mb-2 max-w-full"
                              />
                            )}
                            {msg.type === 'file' && msg.fileUrl && (
                              <a
                                href={`${API_BASE}${msg.fileUrl}`}
                                download={msg.fileName}
                                className="flex items-center space-x-2 text-sm hover:underline"
                              >
                                <FileText className="w-4 h-4" />
                                <span>{msg.fileName}</span>
                              </a>
                            )}
                            <p className="break-words">{msg.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs opacity-75">{msg.timestamp}</p>
                              {msg.senderId === studentId && (
                                <span>
                                  {msg.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Reactions */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {msg.reactions.map((reaction, idx) => (
                                <span key={idx} className="text-sm bg-white rounded-full px-2 py-1 shadow">
                                  {reaction.emoji}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {selectedFile && (
                      <div className="mb-2 p-2 bg-white rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {selectedFile.type.startsWith('image/') ? (
                            <Image className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600" />
                          )}
                          <span className="text-sm text-gray-600">{selectedFile.name}</span>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() && !selectedFile}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    {showEmojiPicker && (
                      <div className="mt-2 p-2 bg-white rounded-lg shadow-lg flex flex-wrap gap-2">
                        {emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setNewMessage(newMessage + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-gray-100 p-1 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Create New Group</h3>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName('');
                  setGroupDescription('');
                  setSelectedMembers([]);
                  setMemberSearchTerm('');
                  setMemberSearchResults([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="Enter group description..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Members *</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={memberSearchTerm}
                      onChange={(e) => {
                        setMemberSearchTerm(e.target.value);
                        searchMembers(e.target.value);
                      }}
                      placeholder="Search by email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  {selectedMembers.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {selectedMembers.map((member) => (
                        <span
                          key={member.id}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{member.name}</span>
                          <button
                            onClick={() => toggleMemberSelection(member)}
                            className="hover:text-green-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {memberSearchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleMemberSelection(user)}
                        className={`p-3 rounded-lg cursor-pointer transition ${
                          selectedMembers.find(m => m.id === user.id)
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <p className="font-medium text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    ))}
                    {memberSearchTerm.length >= 3 && memberSearchResults.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No users found</p>
                    )}
                    {memberSearchTerm.length < 3 && (
                      <p className="text-center text-gray-500 py-4">Type at least 3 characters to search</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName('');
                  setGroupDescription('');
                  setSelectedMembers([]);
                  setMemberSearchTerm('');
                  setMemberSearchResults([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedMembers.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">New Chat</h3>
              <button
                onClick={() => {
                  setShowUserSearch(false);
                  setSearchTerm('');
                  setSearchResults([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search by email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startConversation(user.id)}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                  >
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                ))}
                {searchTerm.length >= 3 && searchResults.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                )}
                {searchTerm.length < 3 && (
                  <p className="text-center text-gray-500 py-4">Type at least 3 characters to search</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
