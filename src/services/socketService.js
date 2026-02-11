// WebSocket Service for Real-time Chat
// This service handles WebSocket connections, message delivery, and real-time updates
class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this.messageQueue = [];
    this.isConnected = false;
    this.serverUrl = 'ws://localhost:8085/ws/chat';
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize WebSocket connection with user ID
   */
  connect(userId, serverUrl = 'ws://localhost:8085/ws/chat') {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.socket);
    }

    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        this.serverUrl = serverUrl;

        // Connect to WebSocket server
        this.socket = new WebSocket(serverUrl);
        
        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('✓ WebSocket Connected:', this.userId);
          
          // Flush queued messages
          this.flushMessageQueue();
          
          // Trigger connection listeners
          this.emit('connected', { userId: this.userId });
          resolve(this.socket);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const eventType = message.type;

      // Emit event to listeners
      if (this.listeners[eventType]) {
        this.listeners[eventType].forEach(callback => {
          try {
            callback(message);
          } catch (err) {
            console.error(`Error in listener for ${eventType}:`, err);
          }
        });
      }

      // Handle specific event types
      switch (eventType) {
        case 'message':
          this.emit('message-received', message);
          break;
        case 'message-delivered':
          this.emit('message-delivered', message);
          break;
        case 'message-seen':
          this.emit('message-seen', message);
          break;
        case 'user-typing':
          this.emit('user-typing', message);
          break;
        case 'user-stop-typing':
          this.emit('user-stop-typing', message);
          break;
        case 'user-status':
          this.emit('user-status-changed', message);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Send a message through WebSocket
   */
  sendMessage(conversationId, receiverId, content, messageType = 'text') {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      // Queue message for later delivery
      this.messageQueue.push({
        event: 'send-message',
        data: { conversationId, receiverId, content, messageType }
      });
      console.log('Message queued (offline mode)');
      return;
    }

    const message = {
      type: 'message',
      conversationId,
      receiverId,
      content,
      messageType,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(receiverId) {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'typing',
      receiverId,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Send stop typing indicator
   */
  stopTypingIndicator(receiverId) {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'stop-typing',
      receiverId,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Mark message as seen
   */
  markMessageAsSeen(messageId, senderId) {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'message-seen',
      messageId,
      senderId,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Delete a message
   */
  deleteMessage(messageId, deleteForAll = false) {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'delete-message',
      messageId,
      deleteForAll,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Set online status
   */
  setOnlineStatus(status) {
    if (!this.isConnected || this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'user-status',
      status,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Emit internal event
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 5000);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect(this.userId, this.serverUrl).catch(err => {
            console.error('Reconnection failed:', err);
          });
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection-failed');
    }
  }

  /**
   * Reconnect to WebSocket
   */
  reconnect() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      this.socket.close();
    }
    this.reconnectAttempts = 0;
    return this.connect(this.userId, this.serverUrl);
  }

  /**
   * Flush message queue when connection is restored
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift();
      
      if (event === 'send-message') {
        this.sendMessage(data.conversationId, data.receiverId, data.content, data.messageType);
      }
    }
  }

  /**
   * Check connection status
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get socket ID (for compatibility, return userId)
   */
  getSocketId() {
    return this.userId;
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.isConnected = false;
      this.listeners = {};
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
