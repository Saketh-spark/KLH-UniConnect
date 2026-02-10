# Faculty Chat Module - Implementation Guide

## Overview
A real-time, production-ready chat module for the Faculty Portal with WhatsApp-like functionality, read receipts, and professional UI design.

## Features Implemented

### ✅ Frontend Features (FacultyChat.js)
1. **Real-time Messaging**
   - Send and receive messages instantly
   - Message status indicators (sent ✓, delivered ✓✓, seen ✓✓ blue)
   - Auto-scroll to latest message
   - Smooth animations

2. **Chat Interface**
   - Professional faculty-style UI with muted colors
   - Sidebar chat list with unread badges
   - Main chat window with message display
   - Responsive design (mobile & desktop)

3. **Message Display**
   - Sent messages appear on RIGHT (blue background)
   - Received messages appear on LEFT (gray background)
   - Message timestamps clearly visible
   - Read/delivery status indicators
   - Deleted message placeholder

4. **User Search & Discovery**
   - Search students by email address
   - Dynamic search results from backend
   - Click to start new conversation
   - Auto-creates chat if not exists

5. **Chat Management**
   - Chat list sorted by recent activity
   - Online/offline status indicators (green/gray dots)
   - Unread message counter badges
   - Last message preview
   - One-to-one and group chats support

6. **Message Actions**
   - Delete for self
   - Delete for everyone
   - Reply to message support
   - Hover actions on messages
   - Typing indicators

7. **Real-time Features**
   - Typing indicator ("✏️ Typing...")
   - Online/offline presence tracking
   - Read receipts in real-time
   - Message delivery confirmation

### ✅ Backend Services

#### ChatAPI Service (chatAPI.js)
Provides RESTful API endpoints:
- `searchUsers(query, role)` - Search students/faculty
- `getOrCreateChat(participantId)` - Start new conversation
- `getChatList()` - Fetch all conversations
- `getMessages(chatId, page, limit)` - Load message history
- `sendMessage(chatId, content, type)` - Send message
- `markMessageAsSeen(messageId, chatId)` - Update read status
- `deleteMessage(messageId, chatId, deleteForAll)` - Delete message
- `uploadFile(chatId, file)` - Upload attachments
- `createGroup(groupName, members)` - Create group chat
- `getUserStatus(userId)` - Check online status
- `updateUserStatus(status)` - Set user status

#### Socket Service (socketService.js)
WebSocket/polling service for real-time sync:
- `connect()` - Initialize socket connection
- `sendMessage(chatId, message)` - Send via WebSocket
- `onMessageReceived(callback)` - Listen for new messages
- `sendTypingIndicator(chatId)` - Broadcast typing
- `setOnlineStatus(status)` - Update presence
- `markMessageAsSeen(messageId, chatId)` - Read receipt
- `deleteMessage(messageId, chatId, deleteForAll)` - Delete
- `flushMessageQueue()` - Retry queued messages

### ✅ Backend Controllers & Services

#### ChatController.java
Existing endpoints that support:
- User search
- Conversation CRUD
- Message operations
- File uploads
- Group management

#### ChatService.java
Business logic for:
- User search queries
- Conversation management
- Message persistence
- File handling
- Real-time updates

### ✅ Database Models

#### Message.java
```
- id (String)
- conversationId (String)
- groupId (String)
- senderId (String)
- senderName (String)
- senderEmail (String)
- content (String)
- type (text, image, file, emoji)
- fileUrl, fileName, fileSize
- timestamp (LocalDateTime)
- read (boolean) - for read receipts
- edited (boolean)
- replyToMessageId (String)
- reactions (List<Reaction>)
```

#### Conversation.java
```
- id (String)
- participantIds (List<String>)
- participants (List<ParticipantInfo>)
- lastMessageId (String)
- lastMessage (String)
- lastMessageTime (LocalDateTime)
- createdAt, updatedAt (LocalDateTime)
- archived (boolean)
```

#### ChatGroup.java
```
- id (String)
- groupName (String)
- memberIds (List<String>)
- creatorId (String)
- createdAt (LocalDateTime)
- groupIcon/image
- description (String)
```

## UI Design Features

### Color Scheme (Faculty Style)
- Primary: Slate-700 to Slate-800 (header)
- Sent Messages: Blue-600
- Received Messages: Slate-200
- Accents: Blue-500
- Text: Slate-900 (dark)
- Background: White/Slate-50

### Typography
- Chat Header: 20px Bold (font-bold text-lg)
- Chat Names: 14px Bold (font-bold)
- Messages: 14px Regular
- Timestamps: 12px Regular
- Status: 12px Light

### Icons Used
- Send: Lucide's Send icon
- Search: Search icon
- Attach: Paperclip icon
- Info: Info icon
- Phone: Phone icon
- More: MoreVertical icon
- Delete: Trash icon

## Integration Points

### 1. FacultyDashboard.js
- "Chat" module card already exists
- Routes to 'chat' view when clicked
- OnModuleSelect handler: `onModuleSelect('chat')`

### 2. App.jsx
- Import: `import FacultyChat from './components/FacultyChat.js'`
- Route Handler:
  ```jsx
  } else if (moduleKey === 'chat') {
    if (userRole === 'faculty') {
      setView('faculty-chat');
    } else {
      setView('chat');
    }
  }
  ```
- View Condition:
  ```jsx
  if (view === 'faculty-chat') {
    return <FacultyChat email={email} onBack={backToFacultyDashboard} />;
  }
  ```

## Real-time Architecture

### Message Flow
```
Frontend Input
    ↓
FacultyChat Component
    ↓
socketService.sendMessage()
    ↓
Backend ChatController
    ↓
MongoDB Storage
    ↓
Socket.IO Broadcast
    ↓
Update Message Status (sent → delivered → seen)
    ↓
Frontend Updates
```

### Read Receipt States
1. **Sent** (✓) - Message sent to server
2. **Delivered** (✓✓) - Message stored in DB
3. **Seen** (✓✓ blue) - Recipient read message
4. **Deleted** - Message removed from view

## Search & Access Control

### Faculty Search
Faculty can search students by:
- Email address (primary)
- Student name
- Student ID

### Access Control
- Faculty ↔ Students: Allowed
- Student ↔ Faculty: Allowed
- Faculty ↔ Faculty: Allowed (within institution)
- Cross-institution: Role-based restrictions

## Message Persistence

All messages are persisted in MongoDB with:
- Full message history
- Read/unread status
- Delete tracking (soft delete for "delete for self")
- Hard delete for "delete for all"
- Timestamps for all operations
- Sender/receiver identification

## File Upload Support

Supports:
- Images (JPG, PNG, GIF, WebP)
- PDFs
- Documents (DOC, DOCX, XLS, XLSX)
- Videos (MP4, WebM)
- Max file size: 25MB

Upload flow:
1. User clicks attach
2. Select file
3. Frontend validates
4. Upload via multipart/form-data
5. Backend stores file
6. Returns file URL
7. Message includes file metadata

## Performance Optimizations

1. **Message Pagination**
   - Load 50 messages per page
   - Lazy load on scroll
   - Memory efficient

2. **Search Debouncing**
   - 300ms delay before API call
   - Prevents excessive requests
   - Local filtering fallback

3. **Auto-scroll**
   - Smooth scroll to latest message
   - Only when user at bottom

4. **Connection Pooling**
   - Socket reconnection logic
   - Message queue for offline
   - Auto-sync on reconnect

## Security Features

1. **Authentication**
   - JWT token validation
   - User role verification
   - Session management

2. **Authorization**
   - Role-based access control
   - Participant validation
   - Content sanitization

3. **Data Protection**
   - HTTPS/WSS encryption
   - MongoDB encryption at rest
   - Password hashing for users

4. **Audit Trail**
   - Deleted messages logged
   - User actions tracked
   - Timestamp on all operations

## Testing Checklist

- [ ] Send message in one-to-one chat
- [ ] Receive message with read receipts
- [ ] Search student by email
- [ ] Create new chat with search result
- [ ] Delete message for self
- [ ] Delete message for everyone
- [ ] See online/offline status
- [ ] Mark messages as seen
- [ ] See typing indicator
- [ ] Upload file attachment
- [ ] Test on mobile responsiveness
- [ ] Verify unread badges work
- [ ] Test message timestamps
- [ ] Verify chat list updates
- [ ] Test connection recovery

## Future Enhancements

1. **Voice/Video Calls** - Integrated calling
2. **Message Reactions** - Emoji reactions
3. **Message Pinning** - Important messages
4. **Group Management** - Add/remove members
5. **Message Search** - Full-text search
6. **Chat Encryption** - End-to-end encryption
7. **Message Drafts** - Save unsent messages
8. **Read Indicators** - "Someone is typing"
9. **Voice Messages** - Audio attachments
10. **Message Scheduling** - Send later

## Configuration

### Backend Port: 8085
### Frontend Port: 4173/4174
### Socket Port: 8085 (same as backend)
### Chat Upload Directory: `uploads/chat/`

## API Endpoints Summary

```
GET  /api/chat/search-users?q=email&role=student
POST /api/chat/conversations
GET  /api/chat/list
GET  /api/chat/{conversationId}/messages?page=1&limit=50
POST /api/chat/{conversationId}/messages
PUT  /api/chat/{conversationId}/messages/{messageId}/seen
DELETE /api/chat/{conversationId}/messages/{messageId}?deleteForAll=false
POST /api/chat/{conversationId}/upload
POST /api/chat/groups
GET  /api/chat/users/{userId}/status
PUT  /api/chat/users/status
```

## Troubleshooting

### Messages not sending
- Check socket connection: `socketService.isSocketConnected()`
- Verify API endpoint availability
- Check browser console for errors
- Flush message queue: `socketService.flushMessageQueue()`

### Search not working
- Ensure backend is running
- Check API endpoint: `/api/chat/search-users`
- Verify email format in search
- Check CORS settings

### Read receipts not updating
- Verify socket listener is registered
- Check message ID matches
- Ensure participant is online
- Check browser DevTools Network tab

### Real-time updates delayed
- Check WebSocket connection status
- Verify backend socket.io configuration
- Check network latency
- Monitor server logs

## Support & Documentation

For issues or questions:
1. Check browser console for errors
2. Check server logs in terminal
3. Verify all services are running
4. Check network connectivity
5. Contact development team

---
Last Updated: January 5, 2026
Faculty Chat Module v1.0
