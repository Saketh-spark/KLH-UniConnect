import React, { useState, useEffect, useRef } from 'react';
import { Plus, Send, Search, Phone, Info, MoreVertical, Paperclip, Smile, X } from 'lucide-react';
import chatAPI from '../services/chatAPI.js';
import socketService from '../services/socketService.js';

const FacultyChat = ({ email = '', onBack = () => {} }) => {
  const [chats, setChats] = useState([
    {
      id: 1,
      type: 'individual',
      participantName: 'Rahul Kumar',
      participantEmail: 'rahul@student.com',
      participantRole: 'Student',
      participantId: 'RAK001',
      avatar: 'RK',
      lastMessage: 'Thank you for the assignment feedback',
      timestamp: '2026-01-05 10:30',
      unreadCount: 2,
      onlineStatus: true
    },
    {
      id: 2,
      type: 'individual',
      participantName: 'Priya Singh',
      participantEmail: 'priya@student.com',
      participantRole: 'Student',
      participantId: 'PRS002',
      avatar: 'PS',
      lastMessage: 'Can we schedule office hours?',
      timestamp: '2026-01-04 15:45',
      unreadCount: 0,
      onlineStatus: false
    },
    {
      id: 3,
      type: 'group',
      participantName: 'CSE Batch 2024 - Class',
      participants: 45,
      avatar: 'CSE',
      lastMessage: 'Dr. Sharma: Final project submission deadline extended',
      timestamp: '2026-01-05 09:15',
      unreadCount: 5,
      onlineStatus: null
    }
  ]);

  const [messages, setMessages] = useState({
    1: [
      { id: 1, senderId: email, content: 'Hi Rahul, I reviewed your assignment', type: 'text', status: 'seen', timestamp: '2026-01-05 10:15' },
      { id: 2, senderId: 'rahul@student.com', content: 'Thank you! Can you share feedback?', type: 'text', status: 'seen', timestamp: '2026-01-05 10:20' },
      { id: 3, senderId: email, content: 'Check your email for detailed feedback', type: 'text', status: 'seen', timestamp: '2026-01-05 10:25' },
      { id: 4, senderId: 'rahul@student.com', content: 'Thank you for the assignment feedback', type: 'text', status: 'delivered', timestamp: '2026-01-05 10:30' }
    ],
    2: [
      { id: 1, senderId: 'priya@student.com', content: 'Can we schedule office hours?', type: 'text', status: 'seen', timestamp: '2026-01-04 15:45' }
    ],
    3: [
      { id: 1, senderId: 'dr-sharma@faculty.com', content: 'Final project submission deadline extended', type: 'text', status: 'seen', timestamp: '2026-01-05 09:15' }
    ]
  });

  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize Socket.IO connection and real-time listeners
  useEffect(() => {
    if (!email) return;

    // Connect to Socket.IO server with faculty email as userId
    socketService.connect(email)
      .then(() => {
        console.log('Socket.IO connected for faculty:', email);
        setSocketConnected(true);

        // Set user as online
        socketService.setOnlineStatus('online');

        // Register listener for new messages
        socketService.on('messageReceived', (data) => {
          console.log('New message received:', data);
          setMessages(prev => ({
            ...prev,
            [data.conversationId]: [...(prev[data.conversationId] || []), {
              id: data.id,
              senderId: data.senderId,
              content: data.content,
              type: data.type,
              status: 'delivered',
              timestamp: new Date(data.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }]
          }));
          
          // Auto-mark as seen if chat is open
          if (selectedChat?.id === data.conversationId) {
            socketService.markMessageAsSeen(data.id, data.senderId);
          }
        });

        // Register listener for message delivery status
        socketService.on('messageDelivered', (data) => {
          console.log('Message delivered:', data);
          setMessages(prev => ({
            ...prev,
            [selectedChat?.id]: (prev[selectedChat?.id] || []).map(msg =>
              msg.id === data.messageId ? { ...msg, status: 'delivered' } : msg
            )
          }));
        });

        // Register listener for message seen status
        socketService.on('messageSeen', (data) => {
          console.log('Message seen by receiver:', data);
          setMessages(prev => ({
            ...prev,
            [selectedChat?.id]: (prev[selectedChat?.id] || []).map(msg =>
              msg.id === data.messageId ? { ...msg, status: 'seen' } : msg
            )
          }));
        });

        // Register listener for typing indicators
        socketService.on('userTyping', (data) => {
          console.log('User typing:', data);
          if (data.isTyping) {
            setIsTyping(true);
          } else {
            setIsTyping(false);
          }
        });

        // Register listener for user status changes
        socketService.on('userStatusChanged', (data) => {
          console.log('User status changed:', data);
          setChats(prev => prev.map(chat =>
            chat.participantId === data.userId ? 
            { ...chat, onlineStatus: data.isOnline } : chat
          ));
        });

      })
      .catch(error => {
        console.error('Failed to connect Socket.IO:', error);
        // Fallback to REST API mode
      });

    return () => {
      // Cleanup on unmount
      socketService.setOnlineStatus('offline');
    };
  }, [email]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat, messages]);

  // Handle search with backend API
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      // Call backend API to search students
      chatAPI.searchUsers(searchQuery, 'student')
        .then(results => setSearchResults(results))
        .catch(error => {
          console.error('Search error:', error);
          // Fallback to local search if API fails
          const results = [
            { id: 'STU001', name: 'Aman Kumar', email: 'aman@student.com', role: 'Student', avatar: 'AK' },
            { id: 'STU002', name: 'Anjali Verma', email: 'anjali@student.com', role: 'Student', avatar: 'AV' },
            { id: 'STU003', name: 'Aditya Singh', email: 'aditya@student.com', role: 'Student', avatar: 'AS' }
          ].filter(user =>
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(results);
        });
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      senderId: email,
      content: messageInput.trim(),
      type: 'text',
      status: 'sent',
      timestamp: new Date().toLocaleString('en-IN', { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute: '2-digit' 
      })
    };

    // Add message to chat optimistically
    setMessages({
      ...messages,
      [selectedChat]: [...(messages[selectedChat] || []), newMessage]
    });

    // Update chat list
    setChats(chats.map(chat =>
      chat.id === selectedChat
        ? { ...chat, lastMessage: messageInput, timestamp: newMessage.timestamp, unreadCount: 0 }
        : chat
    ));

    setMessageInput('');

    // Send to backend via socket service
    try {
      const receiverId = selectedChat.type === 'individual' ? selectedChat.participantId : null;
      await socketService.sendMessage(
        selectedChat.id.toString(),
        receiverId,
        messageInput.trim(),
        'text'
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // Simulate message delivery and read receipt (socket will handle real updates)
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id]?.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ) || []
      }));
    }, 500);

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [selectedChat.id]: prev[selectedChat.id]?.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'seen' } : msg
        ) || []
      }));
    }, 1500);
  };

  const handleTyping = (value) => {
    setMessageInput(value);
    
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing indicator
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const startNewChat = (user) => {
    // Check if chat already exists
    const existingChat = chats.find(
      chat => chat.type === 'individual' && chat.participantEmail === user.email
    );

    if (existingChat) {
      setSelectedChat(existingChat.id);
    } else {
      // Create new chat
      const newChat = {
        id: Math.max(...chats.map(c => c.id), 0) + 1,
        type: 'individual',
        participantName: user.name,
        participantEmail: user.email,
        participantRole: user.role,
        participantId: user.id,
        avatar: user.avatar,
        lastMessage: '',
        timestamp: '',
        unreadCount: 0,
        onlineStatus: true
      };
      setChats([newChat, ...chats]);
      setMessages({ ...messages, [newChat.id]: [] });
      setSelectedChat(newChat.id);
    }

    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const deleteMessage = (messageId, deleteForAll = false) => {
    if (!selectedChat) return;

    setMessages({
      ...messages,
      [selectedChat]: messages[selectedChat].map(msg =>
        msg.id === messageId
          ? { ...msg, content: 'This message was deleted', type: 'deleted', status: deleteForAll ? 'deleted-everyone' : 'deleted-self' }
          : msg
      )
    });
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-xs text-gray-400">✓</span>;
      case 'delivered':
        return <span className="text-xs text-gray-400">✓✓</span>;
      case 'seen':
        return <span className="text-xs text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  const currentChat = selectedChat ? chats.find(c => c.id === selectedChat) : null;
  const currentMessages = selectedChat ? messages[selectedChat] || [] : [];

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
                setSelectedChat(chat.id);
                // Mark as read
                setChats(chats.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
              }}
              className={`w-full border-b border-slate-100 p-3 text-left transition ${
                selectedChat === chat.id ? 'bg-blue-50' : 'hover:bg-slate-50'
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
                    <h3 className="text-sm font-bold text-slate-900">{chat.participantName || chat.participantName}</h3>
                    <p className="text-xs text-slate-500">{chat.timestamp.split(' ')[1]}</p>
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
      {selectedChat && currentChat && (
        <div className="flex flex-1 flex-col bg-white">
          {/* Chat Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-slate-700 to-slate-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="md:hidden text-white">←</button>
                <div>
                  <h2 className="text-lg font-bold text-white">{currentChat.participantName}</h2>
                  {currentChat.type === 'individual' && (
                    <>
                      <p className="text-xs text-slate-300">{currentChat.participantEmail}</p>
                      <p className="text-xs text-slate-300">
                        {currentChat.onlineStatus ? '🟢 Online' : '⚪ Offline'}
                      </p>
                    </>
                  )}
                  {currentChat.type === 'group' && (
                    <p className="text-xs text-slate-300">{currentChat.participants} members</p>
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
                  className={`flex gap-2 ${msg.senderId === email ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`group relative max-w-xs rounded-lg px-4 py-2 ${
                      msg.senderId === email
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    {msg.type === 'deleted' ? (
                      <p className="text-xs italic opacity-70">This message was deleted</p>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    <div className={`flex items-center justify-between gap-1 mt-1 text-xs ${
                      msg.senderId === email ? 'text-blue-100' : 'text-slate-600'
                    }`}>
                      <span>{msg.timestamp.split(' ')[1]}</span>
                      {msg.senderId === email && renderMessageStatus(msg.status)}
                    </div>

                    {/* Message Actions */}
                    {msg.type !== 'deleted' && (
                      <div className={`absolute bottom-full right-0 mb-2 hidden gap-1 rounded-lg ${
                        msg.senderId === email ? 'bg-slate-800' : 'bg-slate-700'
                      } p-1 group-hover:flex`}>
                        {msg.senderId === email && (
                          <>
                            <button
                              onClick={() => deleteMessage(msg.id, false)}
                              className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
                              title="Delete for me"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => deleteMessage(msg.id, true)}
                              className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-600"
                              title="Delete for all"
                            >
                              Delete All
                            </button>
                          </>
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
