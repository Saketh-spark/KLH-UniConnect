import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Search, Plus, Send, Paperclip, Smile, Phone, Video, Info,
  MoreVertical, Check, CheckCheck, Clock, Users, X, Edit3, Trash2,
  Reply, Copy, Star, Pin, Image, FileText, Download, ChevronDown,
  MessageCircle, UserPlus, Settings, Bell, Shield, LogOut, Hash,
  PhoneOff, VideoOff, Mic, MicOff, PhoneCall
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8085';
const WS_URL = 'ws://localhost:8085/ws/chat';

// ─── Emoji picker data ───
const EMOJI_LIST = ['😀','😂','😍','🤔','😎','👍','❤️','🔥','🎉','👏','😊','🙌','💯','✨','🚀','😢','😡','🤗','🥳','😴','🤝','💪','🙏','⭐','💡','📚','✅','❌','⚡','🎯'];

// ICE servers for WebRTC
const ICE_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

// ─── Unified Chat Module ───
export default function ChatModule({ email, onBack, userRole = 'student', openWithEmail = null }) {
  // ─── State ───
  const [activeTab, setActiveTab] = useState('chats'); // chats | groups
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // { type: 'conversation'|'group', data: {...} }
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // { conversationId/groupId: [userIds] }
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { messageId, x, y }
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);

  // ─── Call State ───
  const [callState, setCallState] = useState(null); // null | { status: 'calling'|'ringing'|'connected'|'ended', callType: 'audio'|'video', remoteName, remoteEmail, isCaller }
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callTimerRef = useRef(null);
  const ringtoneRef = useRef(null);

  const userId = email; // Use email as the user identifier

  // ─── WebSocket Connection ───
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollRef.current) clearInterval(pollRef.current);
      cleanupCall();
    };
  }, [email]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}?userId=${encodeURIComponent(email)}`);

    ws.onopen = () => {
      console.log('✓ Chat WebSocket connected');
      wsRef.current = ws;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWSMessage(data);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onclose = () => {
      console.log('Chat WebSocket disconnected, reconnecting in 3s...');
      wsRef.current = null;
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [email]);

  const handleWSMessage = useCallback((data) => {
    switch (data.type) {
      case 'online-users':
        setOnlineUsers(new Set(data.users || []));
        break;
      case 'user-status':
        setOnlineUsers(prev => {
          const next = new Set(prev);
          if (data.status === 'online') next.add(data.userId);
          else next.delete(data.userId);
          return next;
        });
        break;
      case 'message':
        // Real-time incoming message for 1:1
        setMessages(prev => {
          if (prev.some(m => m.id === data.messageId)) return prev;
          return [...prev, {
            id: data.messageId || `ws-${Date.now()}`,
            conversationId: data.conversationId,
            senderId: data.senderId,
            senderName: data.senderName || data.senderId,
            content: data.content,
            type: data.messageType || 'text',
            timestamp: new Date(data.timestamp).toLocaleString(),
            read: false,
            reactions: []
          }];
        });
        // Refresh conversation list
        loadConversations();
        break;
      case 'group-message':
        setMessages(prev => [...prev, {
          id: `ws-${Date.now()}`,
          groupId: data.groupId,
          senderId: data.senderId,
          content: data.content,
          type: 'text',
          timestamp: new Date(data.timestamp).toLocaleString(),
          read: false,
          reactions: []
        }]);
        loadGroups();
        break;
      case 'message-delivered':
        break;
      case 'message-seen':
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, read: true } : m));
        break;
      case 'user-typing':
        setTypingUsers(prev => {
          const key = data.conversationId || data.groupId || data.userId;
          const existing = prev[key] || [];
          if (!existing.includes(data.userId)) return { ...prev, [key]: [...existing, data.userId] };
          return prev;
        });
        setTimeout(() => {
          setTypingUsers(prev => {
            const key = data.conversationId || data.groupId || data.userId;
            return { ...prev, [key]: (prev[key] || []).filter(u => u !== data.userId) };
          });
        }, 3000);
        break;
      case 'user-stop-typing':
        setTypingUsers(prev => {
          const key = data.conversationId || data.groupId || data.userId;
          return { ...prev, [key]: (prev[key] || []).filter(u => u !== data.userId) };
        });
        break;
      case 'group-typing':
        setTypingUsers(prev => {
          const key = data.groupId;
          const existing = prev[key] || [];
          if (!existing.includes(data.userId)) return { ...prev, [key]: [...existing, data.userId] };
          return prev;
        });
        setTimeout(() => {
          setTypingUsers(prev => ({ ...prev, [data.groupId]: (prev[data.groupId] || []).filter(u => u !== data.userId) }));
        }, 3000);
        break;
      case 'message-deleted':
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
        break;
      case 'message-edited':
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, content: data.content, edited: true } : m));
        break;
      case 'call-offer':
        handleIncomingCall(data);
        break;
      case 'call-answer':
        handleCallAnswer(data);
        break;
      case 'call-reject':
        endCall('rejected');
        break;
      case 'call-end':
        endCall('ended');
        break;
      case 'ice-candidate':
        handleRemoteICECandidate(data);
        break;
      default:
        break;
    }
  }, []);

  // ─── Data Loading ───
  useEffect(() => {
    loadConversations();
    loadGroups();
    // Poll for new data every 8s as fallback
    pollRef.current = setInterval(() => {
      loadConversations();
      loadGroups();
    }, 8000);
    return () => clearInterval(pollRef.current);
  }, [email]);

  // ─── Auto-open conversation from Discover ───
  const openWithEmailRef = useRef(openWithEmail);
  openWithEmailRef.current = openWithEmail;
  const [autoOpenDone, setAutoOpenDone] = useState(false);

  useEffect(() => {
    if (!openWithEmailRef.current || autoOpenDone) return;
    const targetEmail = openWithEmailRef.current;

    const autoOpen = async () => {
      try {
        // Check mutual follow first
        const checkRes = await fetch(`${API_BASE}/api/chat/can-chat?email1=${encodeURIComponent(email)}&email2=${encodeURIComponent(targetEmail)}`);
        if (checkRes.ok) {
          const { canChat } = await checkRes.json();
          if (!canChat) {
            alert('You can start chatting once both users follow each other.');
            setAutoOpenDone(true);
            return;
          }
        }
        // Create or get conversation
        const res = await fetch(`${API_BASE}/api/chat/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId1: email, userId2: targetEmail })
        });
        if (res.ok) {
          const conversation = await res.json();
          await loadConversations();
          selectChat('conversation', conversation);
        } else if (res.status === 403) {
          alert('You can start chatting once both users follow each other.');
        }
      } catch (err) {
        console.error('Auto-open chat failed:', err);
      }
      setAutoOpenDone(true);
    };

    // Small delay to let conversations load first
    const timer = setTimeout(autoOpen, 500);
    return () => clearTimeout(timer);
  }, [email, autoOpenDone]);

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/conversations/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/groups/user/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  };

  const loadMessages = async (chatType, chatId) => {
    setMsgLoading(true);
    try {
      const endpoint = chatType === 'conversation'
        ? `${API_BASE}/api/chat/conversations/${chatId}/messages`
        : `${API_BASE}/api/groups/${chatId}/messages`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMsgLoading(false);
    }
  };

  // ─── Auto-scroll ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Select Chat ───
  const selectChat = (type, data) => {
    setSelectedChat({ type, data });
    setMessages([]);
    setReplyingTo(null);
    setEditingMessage(null);
    setShowChatInfo(false);
    const chatId = type === 'conversation' ? data.id : data.id;
    loadMessages(type, chatId);

    // Mark as read
    if (type === 'conversation') {
      fetch(`${API_BASE}/api/chat/conversations/${data.id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email })
      }).catch(() => {});
    } else {
      fetch(`${API_BASE}/api/groups/${data.id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email })
      }).catch(() => {});
    }
  };

  // ─── Search Users ───
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/users/search?email=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.filter(u => u.email !== email));
        }
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, email]);

  // ─── Start Conversation ───
  const startConversation = async (otherUser) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId1: email, userId2: otherUser.email || otherUser.id })
      });
      if (res.ok) {
        const conversation = await res.json();
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
        await loadConversations();
        selectChat('conversation', conversation);
      } else if (res.status === 403) {
        alert('You can start chatting once both users follow each other.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Send Message ───
  const handleSendMessage = async () => {
    const text = inputMessage.trim();
    if (!text || !selectedChat) return;

    // If editing
    if (editingMessage) {
      try {
        const res = await fetch(`${API_BASE}/api/chat/messages/${editingMessage.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: email, content: text })
        });
        if (res.ok) {
          const updated = await res.json();
          setMessages(prev => prev.map(m => m.id === editingMessage.id ? updated : m));
          // Notify via WS
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const receiverId = selectedChat.type === 'conversation' ? (selectedChat.data.otherUserEmail || selectedChat.data.otherUserId) : null;
            wsRef.current.send(JSON.stringify({
              type: 'message-edited',
              messageId: editingMessage.id,
              content: text,
              receiverId
            }));
          }
        }
      } catch (err) { console.error(err); }
      setEditingMessage(null);
      setInputMessage('');
      return;
    }

    const chatType = selectedChat.type;
    const chatId = selectedChat.data.id;

    try {
      let res;
      if (chatType === 'conversation') {
        res = await fetch(`${API_BASE}/api/chat/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: chatId,
            senderId: email,
            content: text,
            type: 'text',
            replyToMessageId: replyingTo?.id || null
          })
        });
      } else {
        res = await fetch(`${API_BASE}/api/groups/${chatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: email,
            content: text,
            type: 'text'
          })
        });
      }

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');
        setReplyingTo(null);

        // Send via WebSocket for real-time delivery
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          if (chatType === 'conversation') {
            const receiverId = selectedChat.data.otherUserEmail || selectedChat.data.otherUserId;
            wsRef.current.send(JSON.stringify({
              type: 'message',
              conversationId: chatId,
              receiverId,
              content: text,
              messageType: 'text',
              messageId: newMsg.id,
              senderName: email.split('@')[0]
            }));
          } else {
            const memberIds = (selectedChat.data.members || []).map(m => m.email || m.userId);
            wsRef.current.send(JSON.stringify({
              type: 'group-message',
              groupId: chatId,
              content: text,
              memberIds
            }));
          }
        }
        loadConversations();
        loadGroups();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // ─── File Upload ───
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch(`${API_BASE}/api/chat/upload`, {
        method: 'POST',
        body: formData
      });

      if (uploadRes.ok) {
        const { url, filename, size } = await uploadRes.json();
        const chatType = selectedChat.type;
        const chatId = selectedChat.data.id;
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';

        let res;
        if (chatType === 'conversation') {
          res = await fetch(`${API_BASE}/api/chat/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: chatId,
              senderId: email,
              content: filename,
              type: fileType,
              fileUrl: url,
              fileName: filename,
              fileSize: parseInt(size)
            })
          });
        } else {
          res = await fetch(`${API_BASE}/api/groups/${chatId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderId: email,
              content: filename,
              type: fileType,
              fileUrl: url,
              fileName: filename,
              fileSize: parseInt(size)
            })
          });
        }

        if (res.ok) {
          const newMsg = await res.json();
          setMessages(prev => [...prev, newMsg]);
          loadConversations();
        }
      }
    } catch (err) {
      console.error('File upload failed:', err);
    }
    setShowAttachMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Typing Indicator ───
  const handleTyping = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !selectedChat) return;

    if (selectedChat.type === 'conversation') {
      const receiverId = selectedChat.data.otherUserEmail || selectedChat.data.otherUserId;
      wsRef.current.send(JSON.stringify({ type: 'typing', receiverId }));
    } else {
      const memberIds = (selectedChat.data.members || []).map(m => m.email || m.userId);
      wsRef.current.send(JSON.stringify({ type: 'group-typing', groupId: selectedChat.data.id, memberIds }));
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !selectedChat) return;
      if (selectedChat.type === 'conversation') {
        const receiverId = selectedChat.data.otherUserEmail || selectedChat.data.otherUserId;
        wsRef.current.send(JSON.stringify({ type: 'stop-typing', receiverId }));
      } else {
        const memberIds = (selectedChat.data.members || []).map(m => m.email || m.userId);
        wsRef.current.send(JSON.stringify({ type: 'group-stop-typing', groupId: selectedChat.data.id, memberIds }));
      }
    }, 2000);
  };

  // ─── Reactions ───
  const addReaction = async (messageId, emoji) => {
    try {
      await fetch(`${API_BASE}/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: email, emoji })
      });
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const reactions = [...(m.reactions || [])];
          const existing = reactions.findIndex(r => r.userId === email && r.emoji === emoji);
          if (existing >= 0) reactions.splice(existing, 1);
          else reactions.push({ userId: email, emoji });
          return { ...m, reactions };
        }
        return m;
      }));
    } catch (err) { console.error(err); }
    setContextMenu(null);
  };

  // ─── Delete Message ───
  const deleteMessage = async (messageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/messages/${messageId}?userId=${encodeURIComponent(email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== messageId));
        if (wsRef.current?.readyState === WebSocket.OPEN && selectedChat?.type === 'conversation') {
          const receiverId = selectedChat.data.otherUserEmail || selectedChat.data.otherUserId;
          wsRef.current.send(JSON.stringify({ type: 'message-deleted', messageId, receiverId }));
        }
      }
    } catch (err) { console.error(err); }
    setContextMenu(null);
  };

  // ─── Create Group ───
  const handleCreateGroup = async () => {
    if (!groupName.trim() || groupMembers.length === 0) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: groupDesc,
          createdBy: email,
          memberIds: groupMembers.map(m => m.email || m.id)
        })
      });
      if (res.ok) {
        const group = await res.json();
        setShowNewGroup(false);
        setGroupName('');
        setGroupDesc('');
        setGroupMembers([]);
        await loadGroups();
        selectChat('group', group);
        setActiveTab('groups');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ─── Member search for group creation ───
  useEffect(() => {
    if (memberSearchQuery.length < 2) { setMemberSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/users/search?email=${encodeURIComponent(memberSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setMemberSearchResults(data.filter(u => u.email !== email && !groupMembers.some(m => m.email === u.email)));
        }
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [memberSearchQuery, email, groupMembers]);

  // ─── Typing indicator text ───
  const getTypingText = () => {
    if (!selectedChat) return null;
    const key = selectedChat.type === 'conversation'
      ? (selectedChat.data.otherUserEmail || selectedChat.data.otherUserId)
      : selectedChat.data.id;
    const typers = typingUsers[key] || [];
    if (typers.length === 0) return null;
    if (typers.length === 1) return `${typers[0].split('@')[0]} is typing...`;
    return `${typers.length} people are typing...`;
  };

  // ─── Call Functions ───
  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const startCall = async (callType) => {
    if (!selectedChat || selectedChat.type !== 'conversation') return;
    const remoteEmail = selectedChat.data.otherUserEmail || selectedChat.data.otherUserId;
    const remoteName = selectedChat.data.otherUserName || remoteEmail?.split('@')[0] || 'Unknown';

    try {
      // Get local media
      const constraints = callType === 'video' ? { audio: true, video: true } : { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      // Create peer connection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Handle remote stream
      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            receiverId: remoteEmail,
            candidate: event.candidate
          }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setCallState(prev => prev ? { ...prev, status: 'connected' } : prev);
          callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          endCall('ended');
        }
      };

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'call-offer',
          receiverId: remoteEmail,
          callType,
          callerName: email.split('@')[0],
          offer: { type: offer.type, sdp: offer.sdp }
        }));
      }

      setCallState({ status: 'calling', callType, remoteName, remoteEmail, isCaller: true });

      // Set local video
      if (callType === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      cleanupCall();
      alert('Could not access microphone/camera. Please allow permissions.');
    }
  };

  const handleIncomingCall = async (data) => {
    const callerName = data.callerName || data.senderId?.split('@')[0] || 'Unknown';
    setCallState({ status: 'ringing', callType: data.callType || 'audio', remoteName: callerName, remoteEmail: data.senderId, isCaller: false, offer: data.offer });
  };

  const acceptCall = async () => {
    if (!callState || callState.status !== 'ringing') return;
    try {
      const constraints = callState.callType === 'video' ? { audio: true, video: true } : { audio: true, video: false };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            receiverId: callState.remoteEmail,
            candidate: event.candidate
          }));
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setCallState(prev => prev ? { ...prev, status: 'connected' } : prev);
          callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
        }
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          endCall('ended');
        }
      };

      // Set remote description from offer
      await pc.setRemoteDescription(new RTCSessionDescription(callState.offer));

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'call-answer',
          receiverId: callState.remoteEmail,
          answer: { type: answer.type, sdp: answer.sdp }
        }));
      }

      setCallState(prev => ({ ...prev, status: 'connected' }));

      if (callState.callType === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Failed to accept call:', err);
      cleanupCall();
      setCallState(null);
      alert('Could not access microphone/camera. Please allow permissions.');
    }
  };

  const handleCallAnswer = async (data) => {
    if (peerConnectionRef.current && data.answer) {
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      } catch (err) {
        console.error('Failed to set remote description:', err);
      }
    }
  };

  const handleRemoteICECandidate = async (data) => {
    if (peerConnectionRef.current && data.candidate) {
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error('Failed to add ICE candidate:', err);
      }
    }
  };

  const endCall = (reason = 'ended') => {
    if (callState && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'call-end',
        receiverId: callState.remoteEmail
      }));
    }
    cleanupCall();
    setCallState(prev => prev ? { ...prev, status: 'ended' } : null);
    setTimeout(() => setCallState(null), 2000);
  };

  const rejectCall = () => {
    if (callState && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'call-reject',
        receiverId: callState.remoteEmail
      }));
    }
    cleanupCall();
    setCallState(null);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(t => { t.enabled = !t.enabled; });
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatCallDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── Helper: format file size ───
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ─── Helper: get initials ───
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (str) => {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // ─── RENDER: Left Panel ───
  const renderLeftPanel = () => (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-bold text-slate-900">Messages</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSearch(true); setShowNewGroup(false); }}
              className="p-2 hover:bg-slate-100 rounded-full transition"
              title="New conversation"
            >
              <Plus className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Search Results Overlay */}
      {showSearch && searchQuery.length >= 2 && (
        <div className="border-b border-slate-200 bg-white max-h-60 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs font-semibold text-slate-500 px-2 mb-1">SEARCH RESULTS</p>
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-400 px-2 py-3 text-center">No users found</p>
            ) : (
              searchResults.map((user, i) => (
                <button
                  key={i}
                  onClick={() => startConversation(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-lg transition"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: getAvatarColor(user.email) }}
                  >
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'Faculty' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role || 'Student'}
                  </span>
                </button>
              ))
            )}
          </div>
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 border-t border-slate-100">
            Close search
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'chats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MessageCircle className="h-4 w-4 inline mr-1" /> Chats
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Users className="h-4 w-4 inline mr-1" /> Groups
        </button>
      </div>

      {/* Chat / Group List */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No conversations yet</p>
              <p className="text-xs text-slate-400 mt-1">Search for users to start chatting</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = selectedChat?.type === 'conversation' && selectedChat?.data?.id === conv.id;
              const isOnline = onlineUsers.has(conv.otherUserEmail) || onlineUsers.has(conv.otherUserId);
              return (
                <button
                  key={conv.id}
                  onClick={() => selectChat('conversation', conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: getAvatarColor(conv.otherUserEmail) }}
                    >
                      {getInitials(conv.otherUserName)}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 truncate">{conv.otherUserName || conv.otherUserEmail?.split('@')[0]}</p>
                      {conv.lastMessageTime && (
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                          {conv.lastMessageTime.split(' ').pop()?.replace(/:\d{2}\s/, ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-bold flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )
        ) : (
          <>
            {/* Create Group Button */}
            <button
              onClick={() => setShowNewGroup(true)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition border-b border-slate-200"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-blue-600">Create New Group</p>
            </button>
            {groups.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No groups yet</p>
                <p className="text-xs text-slate-400 mt-1">Create a group to start collaborating</p>
              </div>
            ) : (
              groups.map(group => {
                const isActive = selectedChat?.type === 'group' && selectedChat?.data?.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => selectChat('group', group)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition border-b border-slate-100 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {getInitials(group.name)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900 truncate">{group.name}</p>
                        {group.lastMessageTime && (
                          <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                            {group.lastMessageTime.split(' ').pop()?.replace(/:\d{2}\s/, ' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 truncate">
                          {group.lastMessage || `${group.memberCount || 0} members`}
                        </p>
                        {group.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-bold flex-shrink-0">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </>
        )}
      </div>
    </div>
  );

  // ─── RENDER: Message Bubble ───
  const renderMessage = (msg, idx) => {
    const isMine = msg.senderId === email || msg.senderEmail === email;
    const showAvatar = !isMine && (idx === 0 || messages[idx - 1]?.senderId !== msg.senderId);
    const replyMsg = msg.replyToMessageId ? messages.find(m => m.id === msg.replyToMessageId) : null;

    return (
      <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1 group px-4`}>
        {!isMine && (
          <div className="w-8 mr-2 flex-shrink-0">
            {showAvatar && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: getAvatarColor(msg.senderEmail || msg.senderId) }}
              >
                {getInitials(msg.senderName || msg.senderId)}
              </div>
            )}
          </div>
        )}
        <div className={`max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>
          {/* Sender name for group messages */}
          {!isMine && showAvatar && selectedChat?.type === 'group' && (
            <p className="text-xs font-semibold text-slate-500 mb-0.5 ml-1">
              {msg.senderName || msg.senderId?.split('@')[0]}
            </p>
          )}

          {/* Reply preview */}
          {replyMsg && (
            <div className={`text-xs px-3 py-1.5 rounded-t-lg border-l-2 ${isMine ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-slate-100 border-slate-400 text-slate-700'}`}>
              <span className="font-semibold">{replyMsg.senderName || 'Unknown'}</span>
              <p className="truncate">{replyMsg.content}</p>
            </div>
          )}

          {/* Message content */}
          <div
            className={`relative px-4 py-2 rounded-2xl transition ${
              isMine
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-slate-100 text-slate-900 rounded-bl-md'
            } ${replyMsg ? 'rounded-t-md' : ''}`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ messageId: msg.id, msg, x: e.clientX, y: e.clientY });
            }}
          >
            {/* File/Image content */}
            {msg.type === 'image' && msg.fileUrl && (
              <div className="mb-2">
                <img
                  src={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${API_BASE}${msg.fileUrl}`}
                  alt={msg.fileName || 'Image'}
                  className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer"
                  onClick={() => window.open(msg.fileUrl.startsWith('http') ? msg.fileUrl : `${API_BASE}${msg.fileUrl}`, '_blank')}
                />
              </div>
            )}
            {msg.type === 'file' && msg.fileUrl && (
              <a
                href={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${API_BASE}${msg.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 mb-1 px-3 py-2 rounded-lg ${isMine ? 'bg-blue-700/50' : 'bg-white'}`}
              >
                <FileText className="h-5 w-5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{msg.fileName || 'File'}</p>
                  {msg.fileSize && <p className="text-xs opacity-70">{formatFileSize(msg.fileSize)}</p>}
                </div>
                <Download className="h-4 w-4 flex-shrink-0 ml-auto" />
              </a>
            )}

            {/* Text */}
            {(msg.type === 'text' || !msg.type) && (
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
            )}

            {/* Timestamp & status */}
            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
              <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp ? msg.timestamp.split(' ').pop()?.replace(/:\d{2}\s/, ' ') : ''}
              </span>
              {msg.edited && (
                <span className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>(edited)</span>
              )}
              {isMine && (
                msg.read
                  ? <CheckCheck className="h-3 w-3 text-blue-200" />
                  : <Check className="h-3 w-3 text-blue-300" />
              )}
            </div>
          </div>

          {/* Reactions */}
          {msg.reactions && msg.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(
                msg.reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded-full text-xs cursor-pointer hover:bg-slate-50"
                  onClick={() => addReaction(msg.id, emoji)}
                >
                  {emoji} {count > 1 && <span className="text-slate-500">{count}</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hover actions - show for all messages */}
        <div className="hidden group-hover:flex items-center gap-1 ml-1 self-center">
          <button onClick={(e) => { e.stopPropagation(); setContextMenu({ messageId: msg.id, msg, x: e.clientX || e.pageX, y: e.clientY || e.pageY }); }} className="p-1 hover:bg-slate-200 rounded-full transition">
            <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER: Context Menu ───
  const renderContextMenu = () => {
    if (!contextMenu) return null;
    const msg = contextMenu.msg;
    const isMine = msg?.senderId === email || msg?.senderEmail === email;

    return (
      <>
        <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)} />
        <div
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-2 min-w-[180px]"
          style={{
            top: Math.min(contextMenu.y || 200, window.innerHeight - 280),
            left: Math.min(contextMenu.x || 200, window.innerWidth - 200)
          }}
        >
          {/* Quick Reaction */}
          <div className="flex gap-1 px-3 py-2 border-b border-slate-100">
            {['👍', '❤️', '😂', '🔥', '😢', '👏'].map(emoji => (
              <button
                key={emoji}
                onClick={() => addReaction(msg.id, emoji)}
                className="text-lg hover:scale-125 transition"
              >
                {emoji}
              </button>
            ))}
          </div>
          <button onClick={() => { setReplyingTo(msg); setContextMenu(null); inputRef.current?.focus(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
            <Reply className="h-4 w-4" /> Reply
          </button>
          <button onClick={() => { navigator.clipboard.writeText(msg.content); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
            <Copy className="h-4 w-4" /> Copy
          </button>
          {isMine && (
            <>
              <button onClick={() => { setEditingMessage(msg); setInputMessage(msg.content); setContextMenu(null); inputRef.current?.focus(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition">
                <Edit3 className="h-4 w-4" /> Edit
              </button>
              <button onClick={() => deleteMessage(msg.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      </>
    );
  };

  // ─── RENDER: Chat Header ───
  const renderChatHeader = () => {
    if (!selectedChat) return null;
    const isConv = selectedChat.type === 'conversation';
    const name = isConv
      ? (selectedChat.data.otherUserName || selectedChat.data.otherUserEmail?.split('@')[0] || 'Unknown')
      : selectedChat.data.name;
    const sub = isConv
      ? selectedChat.data.otherUserEmail
      : `${selectedChat.data.memberCount || selectedChat.data.members?.length || 0} members`;
    const isOnline = isConv && (onlineUsers.has(selectedChat.data.otherUserEmail) || onlineUsers.has(selectedChat.data.otherUserId));
    const typingText = getTypingText();

    return (
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4">
        {/* Back button on mobile */}
        <button onClick={() => setSelectedChat(null)} className="md:hidden p-1 hover:bg-slate-100 rounded">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="relative flex-shrink-0">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${
              !isConv ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : ''
            }`}
            style={isConv ? { backgroundColor: getAvatarColor(selectedChat.data.otherUserEmail) } : {}}
          >
            {getInitials(name)}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-slate-900 truncate">{name}</h2>
          {typingText ? (
            <p className="text-xs text-green-600 font-medium animate-pulse">{typingText}</p>
          ) : (
            <p className="text-xs text-slate-500 truncate">
              {isConv ? (isOnline ? '● Online' : sub) : sub}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedChat?.type === 'conversation' && (
            <>
              <button onClick={() => startCall('audio')} className="p-2 hover:bg-slate-100 rounded-full transition" title="Voice Call">
                <Phone className="h-5 w-5 text-slate-600" />
              </button>
              <button onClick={() => startCall('video')} className="p-2 hover:bg-slate-100 rounded-full transition" title="Video Call">
                <Video className="h-5 w-5 text-slate-600" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowChatInfo(!showChatInfo)}
            className="p-2 hover:bg-slate-100 rounded-full transition"
            title="Info"
          >
            <Info className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER: Chat Info Panel ───
  const renderChatInfoPanel = () => {
    if (!showChatInfo || !selectedChat) return null;
    const isConv = selectedChat.type === 'conversation';

    return (
      <div className="w-72 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-6 text-center border-b border-slate-200">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3 ${
              !isConv ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : ''
            }`}
            style={isConv ? { backgroundColor: getAvatarColor(selectedChat.data.otherUserEmail) } : {}}
          >
            {getInitials(isConv ? selectedChat.data.otherUserName : selectedChat.data.name)}
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {isConv ? selectedChat.data.otherUserName : selectedChat.data.name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isConv ? selectedChat.data.otherUserEmail : selectedChat.data.description}
          </p>
        </div>

        {!isConv && selectedChat.data.members && (
          <div className="p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Members ({selectedChat.data.members.length})
            </h4>
            <div className="space-y-2">
              {selectedChat.data.members.map((member, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: getAvatarColor(member.email) }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                  </div>
                  {member.role === 'admin' && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── RENDER: New Group Modal ───
  const renderNewGroupModal = () => {
    if (!showNewGroup) return null;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNewGroup(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Create New Group</h3>
              <button onClick={() => setShowNewGroup(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g., CSE Batch 2024 - Class"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                value={groupDesc}
                onChange={e => setGroupDesc(e.target.value)}
                placeholder="What's this group about?"
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Add Members ({groupMembers.length} selected)
              </label>
              {/* Selected Members */}
              {groupMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {groupMembers.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {m.name || m.email?.split('@')[0]}
                      <button onClick={() => setGroupMembers(prev => prev.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={e => setMemberSearchQuery(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {memberSearchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                  {memberSearchResults.map((user, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setGroupMembers(prev => [...prev, user]);
                        setMemberSearchQuery('');
                        setMemberSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left border-b border-slate-100 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getAvatarColor(user.email) }}>
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${user.role === 'Faculty' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 flex gap-3">
            <button onClick={() => setShowNewGroup(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition">
              Cancel
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || groupMembers.length === 0 || loading}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER: Right Panel (Messages Area) ───
  const renderChatArea = () => {
    if (!selectedChat) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to Messages</h2>
            <p className="text-sm text-slate-500 max-w-xs">
              Select a conversation or search for a user to start chatting
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
        {/* Chat Header */}
        {renderChatHeader()}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1" onClick={() => setContextMenu(null)}>
          {msgLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No messages yet. Say hello! 👋</p>
            </div>
          ) : (
            messages.map((msg, idx) => renderMessage(msg, idx))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply / Edit Bar */}
        {(replyingTo || editingMessage) && (
          <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center gap-3">
            <div className="w-1 h-10 bg-blue-500 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-600">
                {editingMessage ? 'Editing message' : `Replying to ${replyingTo.senderName || 'Unknown'}`}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {editingMessage ? editingMessage.content : replyingTo.content}
              </p>
            </div>
            <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setInputMessage(''); }}
              className="p-1 hover:bg-slate-100 rounded">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-slate-200 px-4 py-3">
          <div className="flex items-end gap-2">
            {/* Attach */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-500"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              {showAttachMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
                  <div className="absolute bottom-14 left-0 z-20 bg-white rounded-xl shadow-xl border border-slate-200 py-2 min-w-[160px]">
                    <button onClick={() => { fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <Image className="h-4 w-4 text-green-600" /> Photo / Image
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FileText className="h-4 w-4 text-blue-600" /> Document
                    </button>
                  </div>
                </>
              )}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept="*/*" />
            </div>

            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => { setInputMessage(e.target.value); handleTyping(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Type a message..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
              />
            </div>

            {/* Emoji */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-500"
              >
                <Smile className="h-5 w-5" />
              </button>
              {showEmojiPicker && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                  <div className="absolute bottom-14 right-0 z-20 bg-white rounded-xl shadow-xl border border-slate-200 p-3 grid grid-cols-6 gap-1 w-56">
                    {EMOJI_LIST.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => { setInputMessage(prev => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                        className="text-xl p-1.5 hover:bg-slate-100 rounded-lg transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Send */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER: Call UI ───
  const renderCallUI = () => {
    if (!callState) return null;
    const isVideo = callState.callType === 'video';
    const isRinging = callState.status === 'ringing';
    const isCalling = callState.status === 'calling';
    const isConnected = callState.status === 'connected';
    const isEnded = callState.status === 'ended';

    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
        {/* Video elements (hidden if audio only) */}
        {isVideo && isConnected && (
          <>
            <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-4 right-4 w-36 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-slate-900">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
            </div>
          </>
        )}

        {/* Audio call or pre-connected state */}
        {(!isVideo || !isConnected) && (
          <div className="text-center z-10">
            {/* Avatar */}
            <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 ${
              isRinging ? 'animate-pulse ring-4 ring-green-400/50' : isCalling ? 'animate-pulse ring-4 ring-blue-400/50' : ''
            }`} style={{ backgroundColor: getAvatarColor(callState.remoteEmail) }}>
              {getInitials(callState.remoteName)}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{callState.remoteName}</h2>
            <p className="text-sm text-slate-400 mb-2">{callState.remoteEmail}</p>
            {isCalling && <p className="text-blue-400 animate-pulse text-sm">Calling...</p>}
            {isRinging && <p className="text-green-400 animate-pulse text-sm">Incoming {isVideo ? 'Video' : 'Voice'} Call...</p>}
            {isConnected && <p className="text-green-400 text-lg font-mono">{formatCallDuration(callDuration)}</p>}
            {isEnded && <p className="text-red-400 text-sm">Call Ended</p>}
          </div>
        )}

        {/* Connected overlay info for video */}
        {isVideo && isConnected && (
          <div className="absolute top-4 left-4 z-10 text-white">
            <p className="text-lg font-bold">{callState.remoteName}</p>
            <p className="text-green-400 font-mono text-sm">{formatCallDuration(callDuration)}</p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-4 z-10">
          {/* Incoming call: Accept / Reject */}
          {isRinging && (
            <>
              <button onClick={rejectCall} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg transition transform hover:scale-105" title="Decline">
                <PhoneOff className="h-7 w-7" />
              </button>
              <button onClick={acceptCall} className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-white shadow-lg transition transform hover:scale-105 animate-bounce" title="Accept">
                <PhoneCall className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Active call controls */}
          {(isCalling || isConnected) && (
            <>
              <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-700'}`} title={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              {isVideo && (
                <button onClick={toggleVideo} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-600 hover:bg-slate-700'}`} title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}>
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>
              )}
              <button onClick={() => endCall('ended')} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white shadow-lg transition transform hover:scale-105" title="End Call">
                <PhoneOff className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ───
  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {renderLeftPanel()}
      {renderChatArea()}
      {renderChatInfoPanel()}
      {renderContextMenu()}
      {renderNewGroupModal()}
      {renderCallUI()}
    </div>
  );
}
