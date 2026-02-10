# Faculty Chat Module - Real-Time Testing Guide

## ✅ Implementation Complete

The Faculty Chat Module has been successfully implemented with the following components:

### Backend Components
1. **Socket.IO Server Configuration** (`SocketIOConfig.java`)
   - Port: 8085 (same as backend)
   - WebSocket + Polling support
   - Max buffer size: 32MB for file uploads
   - Auto-reconnection logic

2. **Socket.IO Event Listener** (`SocketIOEventListener.java`)
   - Connection/Disconnection handling
   - Real-time message broadcasting
   - Typing indicators
   - Read receipts (message-seen)
   - Online/Offline status tracking
   - Message deletion (soft/hard delete)

3. **Socket.IO Server Runner** (`SocketIOServerRunner.java`)
   - Automatic server startup on application context refresh
   - Lifecycle management

4. **ChatService & ChatController** (Existing)
   - User search
   - Conversation CRUD
   - Message persistence
   - File uploads

### Frontend Components
1. **SocketService** (`socketService.js`)
   - Socket.IO client wrapper
   - Event listeners for real-time updates
   - Message queuing for offline mode
   - Automatic reconnection

2. **ChatAPI Service** (`chatAPI.js`)
   - REST API endpoints for chat operations
   - User search
   - File uploads
   - Conversation management

3. **FacultyChat Component** (`FacultyChat.js`)
   - Professional faculty portal UI
   - Real-time message display
   - Search functionality
   - Message status indicators
   - Delete message options
   - Online/offline indicators

4. **Socket.IO Client** (Installed via npm)
   - Client-side WebSocket library
   - Automatic fallback to polling

## 📋 Pre-Testing Checklist

Before testing, ensure:

- [ ] Backend is running: `mvn spring-boot:run` (Java 24, Spring Boot 3.4.0)
- [ ] Frontend is running: `npm run dev` (Vite on port 4174)
- [ ] MongoDB Atlas connection is active
- [ ] Socket.IO dependency installed in pom.xml
- [ ] socket.io-client installed in frontend: `npm install socket.io-client`
- [ ] Two separate browser windows/tabs for faculty-student testing

## 🧪 Test Scenarios

### Test 1: Socket.IO Connection & Online Status

**Objective:** Verify Socket.IO server connects and tracks online status

**Steps:**
1. Open browser console (F12)
2. Log in as Faculty
3. Check for message: "✓ Socket.IO Connected: [socket-id]"
4. In console, verify: `socketService.isSocketConnected()` returns `true`
5. In separate window, log in as Student
6. Faculty window should show Student as "Online" (green dot)

**Expected Result:**
- Both users connect to Socket.IO server
- Online status updates in real-time
- No console errors

---

### Test 2: Send Message & Real-Time Delivery

**Objective:** Verify messages send and deliver in real-time

**Setup:**
- Faculty logged in on one window
- Student logged in on another window

**Steps:**
1. Faculty opens chat with Student
2. Faculty types: "Hello from faculty"
3. Click "Send" button
4. Check console for: `Message acknowledged: {success: true}`
5. Observe message status: ✓ → ✓✓ → ✓✓ (blue)
6. Student window should receive message instantly
7. Message should appear on Student's screen in real-time

**Expected Result:**
- Message appears immediately with "sent" status
- Status changes to "delivered" within 300ms
- Status changes to "seen" within 1000ms
- Student receives message via socket event
- No API delay (real WebSocket)

---

### Test 3: Read Receipt (Message Seen)

**Objective:** Verify read receipts work

**Steps:**
1. Faculty sends message to Student
2. Message shows ✓✓ (delivered) status
3. Student sees message in their window
4. Faculty's message should change to ✓✓ blue (seen)
5. Check console: `Message seen by receiver`

**Expected Result:**
- Sender's message shows double tick (✓✓)
- Ticks turn blue when recipient reads
- Real-time status update via socket
- No refresh needed

---

### Test 4: Typing Indicator

**Objective:** Verify typing indicators work

**Steps:**
1. Faculty opens chat with Student
2. Faculty starts typing in message input
3. Student window should show "✏️ Typing..."
4. Faculty stops typing (3 second timeout)
5. Typing indicator disappears

**Expected Result:**
- "Typing..." appears on receiver's side while typing
- Disappears automatically after 3 seconds of no activity
- Works instantly via WebSocket

---

### Test 5: Online/Offline Status

**Objective:** Verify online status tracking

**Steps:**
1. Faculty and Student both logged in
2. Check chat list - Student shows green dot (online)
3. Close Student window (disconnect)
4. Faculty window should update - green dot becomes gray
5. Reopen Student window
6. Green dot appears again

**Expected Result:**
- Online status updates in real-time
- Disconnect triggers offline status
- Reconnect restores online status
- Visual indicators update without page refresh

---

### Test 6: Delete Message (Self)

**Objective:** Verify delete for self works

**Steps:**
1. Faculty sends message: "Delete this message"
2. Message appears in chat
3. Hover over message
4. Click delete icon
5. Select "Delete for me"
6. Message disappears from Faculty's view
7. Message still appears in Student's view

**Expected Result:**
- Message removes from sender's chat history
- Receiver still sees message
- No API errors in console

---

### Test 7: Delete Message (For Everyone)

**Objective:** Verify delete for everyone works

**Steps:**
1. Faculty sends message: "Delete for everyone"
2. Hover over message
3. Click delete icon
4. Select "Delete for everyone"
5. Message changes to "[This message was deleted]"
6. In Student window, same message also shows "[This message was deleted]"

**Expected Result:**
- Message deleted for all participants
- Synchronized update via Socket.IO
- Original content no longer visible

---

### Test 8: Search & New Chat

**Objective:** Verify user search and creating new chats

**Steps:**
1. Faculty clicks "+" button (New Chat)
2. Search field appears
3. Type "raj" (search query minimum 3 chars)
4. Click search icon
5. See list of students matching "raj"
6. Click on a student
7. New chat opens with that student

**Expected Result:**
- Search results appear from backend
- Clicking result creates new conversation
- Chat opens with correct student
- Empty message history (first conversation)

---

### Test 9: Message Persistence (Reload Test)

**Objective:** Verify messages persist in database

**Steps:**
1. Faculty sends message: "Test persistence"
2. Wait for delivery
3. Refresh Faculty browser (Ctrl+R)
4. Re-login if needed
5. Open same conversation
6. Old messages still visible
7. New message is there

**Expected Result:**
- Messages survive page refresh
- Message history loads from MongoDB
- No data loss
- Conversation order preserved

---

### Test 10: Offline Message Queuing

**Objective:** Verify messages queue when offline

**Steps:**
1. Faculty and Student connected
2. Close backend server (Ctrl+C)
3. Faculty tries to send message
4. Message queued in socketService
5. Restart backend server
6. Message should automatically send
7. Check console: "Flushing [X] queued messages"

**Expected Result:**
- Messages don't fail when server down
- Messages queue locally
- Auto-send when connection restored
- Queue flushes in order

---

### Test 11: Group Chat (If Implemented)

**Objective:** Verify group chat functionality

**Steps:**
1. Faculty clicks "New Group"
2. Enter group name: "CSE Batch 2024"
3. Search and add multiple students
4. Create group
5. Send message to group
6. All students receive message

**Expected Result:**
- Group chat created with multiple members
- Messages broadcast to all members
- Member list shows all participants
- Add/remove members works

---

### Test 12: File Upload

**Objective:** Verify file upload functionality

**Steps:**
1. Open chat
2. Click paperclip icon
3. Select file (image, PDF, or document)
4. Upload completes
5. File appears in chat as attachment
6. Other user can download

**Expected Result:**
- File uploads to `/uploads/chat/` directory
- File link appears in chat
- File downloadable from other end
- File size limit enforced (25MB)

---

## 🔍 Console Debugging

### Watch Socket Connection
```javascript
// In browser console:
socketService.isSocketConnected()  // true/false
socketService.getSocketId()        // Socket ID
```

### Monitor Socket Events
```javascript
// Enable verbose logging:
socketService.socket.onAny((event, ...args) => {
  console.log(event, args);
});
```

### Check Message Queue
```javascript
// View queued messages (offline):
socketService.messageQueue
```

### Test Send Message Manually
```javascript
// In browser console:
socketService.sendMessage('chat-1', 'student-id', 'Test message', 'text');
```

---

## 🐛 Troubleshooting

### Issue: Socket Connection Failed

**Symptoms:**
- Console shows: "Socket.IO Connection Error"
- Online indicators don't work
- Messages send via REST only

**Solution:**
1. Verify backend is running on port 8085
2. Check Socket.IO server started: `Socket.IO Server Started Successfully`
3. Check firewall allows port 8085
4. Verify socket.io-client installed: `npm list socket.io-client`
5. Clear browser cache and reload

---

### Issue: Messages Not Delivering Real-Time

**Symptoms:**
- Messages take long time to appear
- Need to refresh to see new messages
- Status shows "sent" but never "delivered"

**Solution:**
1. Check if Socket.IO connected: `socketService.isSocketConnected()`
2. If false, check connection error in console
3. Verify receiverId is correct (not null)
4. Check browser DevTools Network tab - look for Socket.IO traffic
5. Fallback: System will use REST API (slower)

---

### Issue: Typing Indicator Not Working

**Symptoms:**
- "Typing..." never appears
- No visual feedback while typing

**Solution:**
1. Verify socket is connected
2. Check console for typing events
3. Verify typing listener is registered: `socketService.listeners.userTyping`
4. Confirm 3-second timeout is working

---

### Issue: Read Receipts Not Updating

**Symptoms:**
- Message stays at ✓ or ✓✓ (not blue)
- Never changes to seen status

**Solution:**
1. Verify message-seen event listener is registered
2. Check that messageId matches correctly
3. Verify receiverId is correct
4. Check Socket.IO backend event handler: `onMessageSeen`
5. Check MongoDB: `message.read` field updated

---

### Issue: Messages Lost on Refresh

**Symptoms:**
- Refreshing page loses messages
- Chat history empty after reload

**Solution:**
1. Check MongoDB connection is active
2. Verify ChatService.getConversationMessages() working
3. Check API endpoint `/api/chat/conversations/{id}/messages` returns data
4. Verify message timestamps are consistent
5. Check message query includes all participants

---

## 📊 Performance Monitoring

### Socket Connection Time
- Target: < 1 second
- Check: Time from page load to "✓ Socket.IO Connected"

### Message Delivery Time  
- Target: < 300ms
- Measure: Time from send to "message-delivered" event

### Read Receipt Time
- Target: < 1 second  
- Measure: Time from receive to "✓✓ blue"

### Search Response Time
- Target: < 500ms
- Check: Network tab for `/api/chat/search-users` call

### Page Load Time
- Target: < 2 seconds
- Includes: Socket connection + initial chat load

---

## 📈 Load Testing

### Test with Multiple Messages
1. Send 100 messages in rapid succession
2. Verify all messages appear
3. Check memory usage in DevTools
4. Verify message order preserved

### Test with Large Files
1. Upload 20MB file
2. Verify upload completes
3. Check `/uploads/chat/` directory
4. Verify download works

### Test Concurrent Users
1. Open chat with 5 different students
2. Send messages in all chats simultaneously
3. Verify messages don't cross conversations
4. Check for race conditions

---

## ✅ Final Verification Checklist

Before considering implementation complete, verify:

- [ ] Socket.IO server starts without errors
- [ ] Faculty and Student can exchange messages
- [ ] Messages persist after page refresh
- [ ] Read receipts work in real-time
- [ ] Typing indicators display
- [ ] Online/offline status updates
- [ ] Delete message functionality works
- [ ] Search finds students
- [ ] New chats create successfully
- [ ] File uploads work
- [ ] No console errors
- [ ] No network errors
- [ ] Mobile UI is responsive
- [ ] Unread badges update correctly
- [ ] Chat list sorts by recent activity

---

## 📞 Support & Next Steps

### If Issues Arise:
1. Check this troubleshooting guide
2. Review console logs for error messages
3. Check MongoDB Atlas connection
4. Verify all services running
5. Check network tab for API failures

### Future Enhancements:
- [ ] Voice/Video calling integration
- [ ] Message reactions (emoji)
- [ ] Message pinning
- [ ] Group management UI
- [ ] Full-text message search
- [ ] Chat encryption
- [ ] Message drafts

### Documentation Files:
- `FACULTY_CHAT_MODULE.md` - Complete module documentation
- This file - Testing and troubleshooting guide
- `socketService.js` - Socket.IO client implementation
- `SocketIOEventListener.java` - Backend event handler
- `SocketIOConfig.java` - Socket.IO server configuration

---

**Last Updated:** January 5, 2026
**Status:** Ready for Testing ✅
