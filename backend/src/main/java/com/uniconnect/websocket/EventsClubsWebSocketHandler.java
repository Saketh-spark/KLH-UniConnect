package com.uniconnect.websocket;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class EventsClubsWebSocketHandler extends TextWebSocketHandler {
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        sendMessage(session, Map.of("type", "connection", "message", "Connected to Events & Clubs live updates"));
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            Map<String, Object> data = objectMapper.readValue(message.getPayload(), Map.class);
            String messageType = (String) data.get("type");

            switch (messageType) {
                case "subscribe":
                    String subscribedFacultyId = (String) data.get("facultyId");
                    session.getAttributes().put("facultyId", subscribedFacultyId);
                    broadcastToFaculty(subscribedFacultyId, Map.of(
                            "type", "subscribed",
                            "message", "Subscribed to live updates for faculty: " + subscribedFacultyId
                    ));
                    break;

                case "event_created":
                    broadcastEvent(data.get("facultyId"), Map.of(
                            "type", "event_created",
                            "event", data.get("event"),
                            "timestamp", System.currentTimeMillis()
                    ));
                    break;

                case "event_updated":
                    broadcastEvent(data.get("facultyId"), Map.of(
                            "type", "event_updated",
                            "event", data.get("event"),
                            "timestamp", System.currentTimeMillis()
                    ));
                    break;

                case "club_approved":
                    broadcastEvent(data.get("facultyId"), Map.of(
                            "type", "club_approved",
                            "club", data.get("club"),
                            "timestamp", System.currentTimeMillis()
                    ));
                    break;

                case "registration":
                    broadcastEvent(data.get("facultyId"), Map.of(
                            "type", "registration",
                            "eventId", data.get("eventId"),
                            "studentId", data.get("studentId"),
                            "timestamp", System.currentTimeMillis()
                    ));
                    break;

                case "attendance_marked":
                    broadcastEvent(data.get("facultyId"), Map.of(
                            "type", "attendance_marked",
                            "eventId", data.get("eventId"),
                            "studentId", data.get("studentId"),
                            "timestamp", System.currentTimeMillis()
                    ));
                    break;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.remove(session.getId());
    }

    private void sendMessage(WebSocketSession session, Map<String, Object> data) throws Exception {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(data)));
        }
    }

    private void broadcastEvent(Object facultyId, Map<String, Object> data) throws Exception {
        String facultyIdStr = facultyId != null ? facultyId.toString() : null;
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                String sessionFacultyId = (String) session.getAttributes().get("facultyId");
                if (sessionFacultyId != null && sessionFacultyId.equals(facultyIdStr)) {
                    sendMessage(session, data);
                }
            }
        }
    }

    private void broadcastToFaculty(String facultyId, Map<String, Object> data) throws Exception {
        for (WebSocketSession session : sessions.values()) {
            if (session.isOpen()) {
                String sessionFacultyId = (String) session.getAttributes().get("facultyId");
                if (sessionFacultyId != null && sessionFacultyId.equals(facultyId)) {
                    sendMessage(session, data);
                }
            }
        }
    }

    public void notifyEventCreated(String facultyId, Map<String, Object> eventData) throws Exception {
        broadcastToFaculty(facultyId, Map.of(
                "type", "event_created",
                "event", eventData,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public void notifyEventUpdated(String facultyId, Map<String, Object> eventData) throws Exception {
        broadcastToFaculty(facultyId, Map.of(
                "type", "event_updated",
                "event", eventData,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public void notifyClubApproved(String facultyId, Map<String, Object> clubData) throws Exception {
        broadcastToFaculty(facultyId, Map.of(
                "type", "club_approved",
                "club", clubData,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public void notifyNewRegistration(String facultyId, String eventId, String studentId) throws Exception {
        broadcastToFaculty(facultyId, Map.of(
                "type", "registration",
                "eventId", eventId,
                "studentId", studentId,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public void notifyAttendanceMarked(String facultyId, String eventId, String studentId) throws Exception {
        broadcastToFaculty(facultyId, Map.of(
                "type", "attendance_marked",
                "eventId", eventId,
                "studentId", studentId,
                "timestamp", System.currentTimeMillis()
        ));
    }
}
