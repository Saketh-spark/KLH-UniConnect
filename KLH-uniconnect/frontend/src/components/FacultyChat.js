import React, { useState, useEffect, useRef } from 'react';
import { Plus, Send, Search, Phone, Info, MoreVertical, Paperclip, Smile, X } from 'lucide-react';

const API_BASE = 'http://localhost:8085';

const FacultyChat = ({ email = '', onBack = () => {} }) => {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const facultyId = email?.split('@')[0] || localStorage.getItem('klhFacultyId') || '';

  // Load conversations and groups from backend
  useEffect(() => {
    if (!facultyId) return;
    loadConversations();
    loadGroups();
  }, [facultyId]);

  // Poll for new messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle search with backend API
  useEffect(() => {
    if (searchQuery.trim().length < 3) { setSearchResults([]); return; }
    const searchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/chat/users/search?email=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.filter(u => u.id !== facultyId));
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };
    searchUsers();
  }, [searchQuery]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/conversations/${facultyId}`);
      if (response.ok) {
        const data = await response.json();
        setChats(prev => {
          const groups = prev.filter(c => c.type === 'group');
          const convos = data.map(c => ({
            id: c.id,
            type: 'individual',
            participantName: c.otherUserName || c.otherUserEmail || 'User',
            participantEmail: c.otherUserEmail || '',
            participantId: c.otherUserId || '',
            avatar: (c.otherUserName || 'U').substring(0, 2).toUpperCase(),
            lastMessage: c.lastMessage || '',
            timestamp: c.lastMessageTime || c.updatedAt || '',
            unreadCount: c.unreadCount || 0,
            onlineStatus: false
          }));
          return [...convos, ...groups];
        });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/groups/user/${facultyId}`);
      if (response.ok) {
        const data = await response.json();
        setChats(prev => {
          const individuals = prev.filter(c => c.type !== 'group');
          const groups = data.map(g => ({
            id: g.id,
            type: 'group',
            participantName: g.name || 'Group',
            participants: g.memberCount || g.members?.length || 0,
            avatar: (g.name || 'G').substring(0, 3).toUpperCase(),
            lastMessage: g.lastMessage || '',
            timestamp: g.lastMessageTime || g.updatedAt || '',
            unreadCount: g.unreadCount || 0,
            onlineStatus: null
          }));
          return [...individuals, ...groups];
        });
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
        const readUrl = selectedChat.type === 'group'
          ? `${API_BASE}/api/groups/${selectedChat.id}/read`
          : `${API_BASE}/api/chat/conversations/${selectedChat.id}/read`;
        await fetch(readUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: facultyId })
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() && !selectedFile) return;
    if (!selectedChat) return;

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await fetch(`${API_BASE}/api/chat/upload`, { method: 'POST', body: formData });
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.url;
          fileName = uploadData.filename;
          fileSize = parseInt(uploadData.size);
        }
      }

      const messageData = {
        senderId: facultyId,
        content: messageInput.trim() || fileName || 'File',
        type: selectedFile ? (selectedFile.type?.startsWith('image/') ? 'image' : 'file') : 'text',
        fileUrl, fileName, fileSize
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
        setMessageInput('');
        setSelectedFile(null);
        await loadMessages();
        await loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (value) => {
    setMessageInput(value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  const startNewChat = async (user) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId1: facultyId, userId2: user.id })
      });
      if (response.ok) {
        const conversation = await response.json();
        setSelectedChat({
          id: conversation.id,
          type: 'individual',
          participantName: conversation.otherUserName || user.name || user.email,
          participantEmail: conversation.otherUserEmail || user.email,
          avatar: (user.name || user.email || 'U').substring(0, 2).toUpperCase()
        });
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        await loadConversations();
        setTimeout(() => loadMessages(), 500);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!selectedChat) return;
    try {
      await fetch(`${API_BASE}/api/chat/messages/${messageId}`, { method: 'DELETE' });
      await loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-xs text-gray-400">✓</span>;
      case 'delivered':
        return <span className="text-xs text-gray-400">✓✓</span>;
      case 'seen':
      case 'read':
        return <span className="text-xs text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  const currentChat = selectedChat;
  const currentMessages = messages;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Chat List Sidebar */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-200 bg-white`}>
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-700 to-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="text-slate-300 hover:text-white">←</button>
              <h1 className="text-xl font-black text-white">Messages</h1>
            </div>
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
              title="New chat"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Search Results */}
        {showSearch && searchResults.length > 0 && (
          <div className="border-b border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xs font-bold uppercase text-slate-600">Search Results</h3>
              <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            {searchResults.map(user => (
              <button
                key={user.id}
                onClick={() => startNewChat(user)}
                className="w-full rounded-lg p-2 text-left transition hover:bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="truncate text-xs text-slate-600">{user.email}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => {
                setSelectedChat(chat);
                setChats(chats.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
              }}
              className={`w-full border-b border-slate-100 p-3 text-left transition ${
                selectedChat?.id === chat.id ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-bold text-white">
                    {chat.avatar}
                  </div>
                  {chat.onlineStatus === true && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{chat.participantName}</h3>
                    <p className="text-xs text-slate-500">{chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                  <p className="truncate text-xs text-slate-600">{chat.lastMessage}</p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selectedChat && (
        <div className="flex flex-1 flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-700 to-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="md:hidden text-white">←</button>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedChat.participantName}</h2>
                  {selectedChat.type === 'individual' && (
                    <>
                      <p className="text-xs text-slate-300">{selectedChat.participantEmail}</p>
                      <p className="text-xs text-slate-300">
                        {selectedChat.onlineStatus ? '🟢 Online' : '⚪ Offline'}
                      </p>
                    </>
                  )}
                  {selectedChat.type === 'group' && (
                    <p className="text-xs text-slate-300">{selectedChat.participants} members</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700">
                  <Info className="h-5 w-5" />
                </button>
                <button className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-slate-500">
                  <p className="text-2xl mb-2">👋</p>
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              currentMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.senderId === facultyId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group relative max-w-xs rounded-lg px-4 py-2 ${
                      msg.senderId === facultyId
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    {msg.type === 'deleted' ? (
                      <p className="text-xs italic opacity-70">This message was deleted</p>
                    ) : msg.type === 'image' ? (
                      <img 
                        src={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${API_BASE}${msg.fileUrl}`} 
                        alt="shared" 
                        className="max-w-full rounded cursor-pointer" 
                        onClick={() => window.open(msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${API_BASE}${msg.fileUrl}`, '_blank')}
                      />
                    ) : msg.type === 'file' ? (
                      <a href={msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${API_BASE}${msg.fileUrl}`} target="_blank" rel="noreferrer" className="underline text-sm">
                        📎 {msg.fileName || msg.content}
                      </a>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <div className={`flex items-center justify-between gap-1 mt-1 text-xs ${
                      msg.senderId === facultyId ? 'text-blue-100' : 'text-slate-600'
                    }`}>
                      <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      {msg.senderId === facultyId && renderMessageStatus(msg.status)}
                    </div>

                    {/* Message Actions */}
                    {msg.type !== 'deleted' && (
                      <div className={`absolute bottom-full right-0 mb-2 hidden gap-1 rounded-lg ${
                        msg.senderId === facultyId ? 'bg-slate-800' : 'bg-slate-700'
                      } p-1 group-hover:flex`}>
                        {msg.senderId === facultyId && (
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
                            title="Delete"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-3">
              <button className="text-slate-400 transition hover:text-slate-600">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!messageInput.trim()}
                className="rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {isTyping && <p className="mt-2 text-xs text-slate-500">✏️ Typing...</p>}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedChat && (
        <div className="hidden flex-1 items-center justify-center bg-slate-50 md:flex">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a chat to start messaging</h2>
            <p className="text-slate-600 mb-6">Search for students by email to start a new conversation</p>
            <button
              onClick={() => setShowSearch(true)}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              New Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyChat;
