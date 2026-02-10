package com.uniconnect.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Handler for real-time chat messaging
 * Handles connection, disconnection, and message routing
 */
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Store active connections: userId -> Set of WebSocketSessions
    private static final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    
    // Store online users: userId -> true
    private static final Map<String, Boolean> onlineUsers = new ConcurrentHashMap<>();

    public ChatWebSocketHandler() {
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Try to get userId from session attributes first, then from query parameter
        String userId = (String) session.getAttributes().get("userId");
        
        if (userId == null) {
            // Extract userId from query parameter: /ws/chat?userId=xxx
            URI uri = session.getUri();
            if (uri != null && uri.getQuery() != null) {
                Map<String, String> params = UriComponentsBuilder.fromUri(uri).build().getQueryParams().toSingleValueMap();
                userId = params.get("userId");
            }
        }
        
        if (userId != null) {
            // Store userId in session attributes for later use
            session.getAttributes().put("userId", userId);
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
            onlineUsers.put(userId, true);
            
            // Broadcast user online status
            broadcastOnlineStatus(userId, true);
            
            // Send the user the current online users list
            sendMessageToUser(userId, new TextMessage(objectMapper.writeValueAsString(
                Map.of(
                    "type", "online-users",
                    "users", new ArrayList<>(onlineUsers.keySet()),
                    "timestamp", System.currentTimeMillis()
                )
            )));
            
            System.out.println("✓ Chat user connected: " + userId + " (Session: " + session.getId() + ")");
        } else {
            System.out.println("✗ Chat connection without userId, closing session");
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            String userId = (String) session.getAttributes().get("userId");
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            
            String eventType = jsonNode.get("type").asText();
            
            switch (eventType) {
                case "message":
                    handleChatMessage(userId, jsonNode, session);
                    break;
                case "group-message":
                    handleGroupMessage(userId, jsonNode, session);
                    break;
                case "typing":
                    handleTypingIndicator(userId, jsonNode);
                    break;
                case "stop-typing":
                    handleStopTyping(userId, jsonNode);
                    break;
                case "group-typing":
                    handleGroupTyping(userId, jsonNode);
                    break;
                case "group-stop-typing":
                    handleGroupStopTyping(userId, jsonNode);
                    break;
                case "message-seen":
                    handleMessageSeen(userId, jsonNode);
                    break;
                case "message-deleted":
                    handleMessageDeleted(userId, jsonNode);
                    break;
                case "message-edited":
                    handleMessageEdited(userId, jsonNode);
                    break;
                case "call-offer":
                case "call-answer":
                case "call-reject":
                case "call-end":
                case "ice-candidate":
                    handleCallSignaling(userId, eventType, jsonNode);
                    break;
                default:
                    System.out.println("Unknown event type: " + eventType);
            }
        } catch (Exception e) {
            System.err.println("Error handling WebSocket message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleChatMessage(String senderId, JsonNode data, WebSocketSession session) throws IOException {
        String conversationId = data.get("conversationId").asText();
        String receiverId = data.get("receiverId").asText();
        String content = data.get("content").asText();
        String messageType = data.has("messageType") ? data.get("messageType").asText() : "text";
        
        // Save message to database
        // var message = chatService.saveMessage(conversationId, senderId, content, messageType);
        
        // Send to receiver
        sendMessageToUser(receiverId, new TextMessage(objectMapper.writeValueAsString(
            Map.of(
                "type", "message",
                "senderId", senderId,
                "conversationId", conversationId,
                "content", content,
                "messageType", messageType,
                "timestamp", System.currentTimeMillis()
            )
        )));
        
        // Send delivery confirmation back to sender
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
            Map.of(
                "type", "message-delivered",
                "conversationId", conversationId,
                "timestamp", System.currentTimeMillis()
            )
        )));
    }

    private void handleTypingIndicator(String userId, JsonNode data) throws IOException {
        String receiverId = data.get("receiverId").asText();
        
        sendMessageToUser(receiverId, new TextMessage(objectMapper.writeValueAsString(
            Map.of(
                "type", "user-typing",
                "userId", userId,
                "timestamp", System.currentTimeMillis()
            )
        )));
    }

    private void handleStopTyping(String userId, JsonNode data) throws IOException {
        String receiverId = data.get("receiverId").asText();
        
        sendMessageToUser(receiverId, new TextMessage(objectMapper.writeValueAsString(
            Map.of(
                "type", "user-stop-typing",
                "userId", userId,
                "timestamp", System.currentTimeMillis()
            )
        )));
    }

    private void handleMessageSeen(String userId, JsonNode data) throws IOException {
        String messageId = data.get("messageId").asText();
        String senderId = data.get("senderId").asText();
        
        // Update message status in database
        // chatService.markMessageAsSeen(messageId);
        
        // Notify sender
        sendMessageToUser(senderId, new TextMessage(objectMapper.writeValueAsString(
            Map.of(
                "type", "message-seen",
                "messageId", messageId,
                "timestamp", System.currentTimeMillis()
            )
        )));
    }

    private void handleGroupMessage(String senderId, JsonNode data, WebSocketSession session) throws IOException {
        String groupId = data.get("groupId").asText();
        String content = data.get("content").asText();
        
        // Send to all group members who are online (the frontend handles who's in the group)
        if (data.has("memberIds")) {
            for (JsonNode memberId : data.get("memberIds")) {
                String id = memberId.asText();
                if (!id.equals(senderId)) {
                    sendMessageToUser(id, new TextMessage(objectMapper.writeValueAsString(
                        Map.of(
                            "type", "group-message",
                            "senderId", senderId,
                            "groupId", groupId,
                            "content", content,
                            "timestamp", System.currentTimeMillis()
                        )
                    )));
                }
            }
        }
    }

    private void handleGroupTyping(String userId, JsonNode data) throws IOException {
        String groupId = data.get("groupId").asText();
        if (data.has("memberIds")) {
            for (JsonNode memberId : data.get("memberIds")) {
                String id = memberId.asText();
                if (!id.equals(userId)) {
                    sendMessageToUser(id, new TextMessage(objectMapper.writeValueAsString(
                        Map.of("type", "group-typing", "userId", userId, "groupId", groupId, "timestamp", System.currentTimeMillis())
                    )));
                }
            }
        }
    }

    private void handleGroupStopTyping(String userId, JsonNode data) throws IOException {
        String groupId = data.get("groupId").asText();
        if (data.has("memberIds")) {
            for (JsonNode memberId : data.get("memberIds")) {
                String id = memberId.asText();
                if (!id.equals(userId)) {
                    sendMessageToUser(id, new TextMessage(objectMapper.writeValueAsString(
                        Map.of("type", "group-stop-typing", "userId", userId, "groupId", groupId, "timestamp", System.currentTimeMillis())
                    )));
                }
            }
        }
    }

    private void handleMessageDeleted(String userId, JsonNode data) throws IOException {
        String messageId = data.get("messageId").asText();
        String receiverId = data.has("receiverId") ? data.get("receiverId").asText() : null;
        
        if (receiverId != null) {
            sendMessageToUser(receiverId, new TextMessage(objectMapper.writeValueAsString(
                Map.of("type", "message-deleted", "messageId", messageId, "userId", userId, "timestamp", System.currentTimeMillis())
            )));
        }
    }

    private void handleMessageEdited(String userId, JsonNode data) throws IOException {
        String messageId = data.get("messageId").asText();
        String content = data.get("content").asText();
        String receiverId = data.has("receiverId") ? data.get("receiverId").asText() : null;
        
        if (receiverId != null) {
            sendMessageToUser(receiverId, new TextMessage(objectMapper.writeValueAsString(
                Map.of("type", "message-edited", "messageId", messageId, "content", content, "userId", userId, "timestamp", System.currentTimeMillis())
            )));
        }
    }

    // Handle WebRTC call signaling - forward call events between peers
    private void handleCallSignaling(String senderId, String eventType, JsonNode data) throws IOException {
        String receiverId = data.has("receiverId") ? data.get("receiverId").asText() : null;
        if (receiverId == null) return;

        // Build the signaling message to forward
        Map<String, Object> signalingMsg = new HashMap<>();
        signalingMsg.put("type", eventType);
        signalingMsg.put("senderId", senderId);
        signalingMsg.put("timestamp", System.currentTimeMillis());

        // Forward relevant fields based on event type
        if (data.has("callType")) signalingMsg.put("callType", data.get("callType").asText());
        if (data.has("callerName")) signalingMsg.put("callerName", data.get("callerName").asText());
        if (data.has("offer")) signalingMsg.put("offer", data.get("offer"));
        if (data.has("answer")) signalingMsg.put("answer", data.get("answer"));
        if (data.has("candidate")) signalingMsg.put("candidate", data.get("candidate"));

        sendMessageToUser(receiverId, new TextMessage(objectMapper.writeValueAsString(signalingMsg)));
    }

    private void sendMessageToUser(String userId, TextMessage message) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.forEach(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(message);
                    }
                } catch (IOException e) {
                    System.err.println("Error sending message to user " + userId + ": " + e.getMessage());
                }
            });
        }
    }

    private void broadcastOnlineStatus(String userId, boolean isOnline) throws IOException {
        TextMessage statusMessage = new TextMessage(objectMapper.writeValueAsString(
            Map.of(
                "type", "user-status",
                "userId", userId,
                "status", isOnline ? "online" : "offline",
                "timestamp", System.currentTimeMillis()
            )
        ));
        
        // Broadcast to all connected users
        userSessions.forEach((id, sessions) -> {
            sessions.forEach(session -> {
                try {
                    if (session.isOpen() && !id.equals(userId)) {
                        session.sendMessage(statusMessage);
                    }
                } catch (IOException e) {
                    System.err.println("Error broadcasting status: " + e.getMessage());
                }
            });
        });
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        
        if (userId != null) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                    onlineUsers.remove(userId);
                    
                    // Broadcast user offline status
                    broadcastOnlineStatus(userId, false);
                }
            }
            
            System.out.println("✓ User disconnected: " + userId + " (Session: " + session.getId() + ")");
        }
    }

    /**
     * Get list of all online users
     */
    public static List<String> getOnlineUsers() {
        return new ArrayList<>(onlineUsers.keySet());
    }

    /**
     * Check if user is online
     */
    public static boolean isUserOnline(String userId) {
        return onlineUsers.containsKey(userId) && onlineUsers.get(userId);
    }
}
