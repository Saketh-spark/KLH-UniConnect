package com.uniconnect.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Handler for real-time Reels & Feed synchronization
 * Handles real-time notifications for faculty feedback, reel approvals, and placement updates
 */
@Component
public class ReelWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Store active connections: userId/facultyId -> Set of WebSocketSessions
    private static final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    // Store subscriptions: reelId -> Set of subscriber IDs
    private static final Map<String, Set<String>> reelSubscribers = new ConcurrentHashMap<>();

    // Store online users
    private static final Map<String, String> userType = new ConcurrentHashMap<>(); // userId -> STUDENT|FACULTY

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        String role = (String) session.getAttributes().get("role");

        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
            userType.put(userId, role != null ? role : "STUDENT");
            System.out.println("✓ User connected to Reel WebSocket: " + userId + " (" + role + ")");
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            String action = jsonNode.get("action").asText();
            String userId = (String) session.getAttributes().get("userId");

            switch (action) {
                case "SUBSCRIBE_REEL":
                    handleSubscribeReel(userId, jsonNode, session);
                    break;
                case "UNSUBSCRIBE_REEL":
                    handleUnsubscribeReel(userId, jsonNode);
                    break;
                case "REEL_FEEDBACK_ADDED":
                    broadcastReelUpdate(jsonNode, "FEEDBACK_ADDED");
                    break;
                case "REEL_APPROVED":
                    broadcastReelUpdate(jsonNode, "STATUS_CHANGED");
                    break;
                case "PLACEMENT_READY":
                    broadcastReelUpdate(jsonNode, "PLACEMENT_STATUS_CHANGED");
                    break;
                case "FACULTY_COMMENT":
                    broadcastReelUpdate(jsonNode, "NEW_COMMENT");
                    break;
                case "NOTIFICATION":
                    broadcastNotification(jsonNode);
                    break;
                default:
                    System.out.println("Unknown action: " + action);
            }
        } catch (Exception e) {
            System.err.println("Error handling WebSocket message: " + e.getMessage());
        }
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
                    userType.remove(userId);
                }
            }
            System.out.println("✓ User disconnected from Reel WebSocket: " + userId);
        }
    }

    // Subscribe user to reel updates
    private void handleSubscribeReel(String userId, JsonNode jsonNode, WebSocketSession session) {
        String reelId = jsonNode.get("reelId").asText();
        reelSubscribers.computeIfAbsent(reelId, k -> ConcurrentHashMap.newKeySet()).add(userId);
        
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                Map.of("type", "SUBSCRIPTION_CONFIRMED", "reelId", reelId)
            )));
        } catch (IOException e) {
            System.err.println("Error confirming subscription: " + e.getMessage());
        }
    }

    // Unsubscribe user from reel updates
    private void handleUnsubscribeReel(String userId, JsonNode jsonNode) {
        String reelId = jsonNode.get("reelId").asText();
        Set<String> subscribers = reelSubscribers.get(reelId);
        if (subscribers != null) {
            subscribers.remove(userId);
            if (subscribers.isEmpty()) {
                reelSubscribers.remove(reelId);
            }
        }
    }

    // Broadcast reel update to all subscribers
    private void broadcastReelUpdate(JsonNode updateData, String updateType) {
        String reelId = updateData.get("reelId").asText();
        Set<String> subscribers = reelSubscribers.get(reelId);

        if (subscribers != null) {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "REEL_UPDATE");
            message.put("updateType", updateType);
            message.put("reelId", reelId);
            message.put("data", updateData);

            subscribers.forEach(userId -> sendToUser(userId, message));
        }
    }

    // Broadcast notification to specific user
    private void broadcastNotification(JsonNode notification) {
        String studentId = notification.get("studentId").asText();
        String type = notification.get("type").asText();

        Map<String, Object> message = new HashMap<>();
        message.put("type", "NOTIFICATION");
        message.put("notificationType", type);
        message.put("title", notification.get("title").asText());
        message.put("message", notification.get("message").asText());
        message.put("timestamp", System.currentTimeMillis());

        sendToUser(studentId, message);
    }

    // Send message to specific user's all sessions
    private void sendToUser(String userId, Map<String, Object> message) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            try {
                String payload = objectMapper.writeValueAsString(message);
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(payload));
                    }
                }
            } catch (IOException e) {
                System.err.println("Error sending message to user " + userId + ": " + e.getMessage());
            }
        }
    }

    // Send notification to all faculty members
    public static void broadcastToFaculty(Map<String, Object> message) {
        try {
            String payload = new ObjectMapper().writeValueAsString(message);
            userType.forEach((userId, type) -> {
                if ("FACULTY".equals(type)) {
                    Set<WebSocketSession> sessions = userSessions.get(userId);
                    if (sessions != null) {
                        for (WebSocketSession session : sessions) {
                            if (session.isOpen()) {
                                try {
                                    session.sendMessage(new TextMessage(payload));
                                } catch (IOException e) {
                                    System.err.println("Error sending to faculty: " + e.getMessage());
                                }
                            }
                        }
                    }
                }
            });
        } catch (IOException e) {
            System.err.println("Error broadcasting to faculty: " + e.getMessage());
        }
    }
}
