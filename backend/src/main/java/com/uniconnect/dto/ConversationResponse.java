package com.uniconnect.dto;

import java.util.List;

public class ConversationResponse {
    private String id;
    private List<ParticipantInfo> participants;
    private String lastMessage;
    private String lastMessageTime;
    private int unreadCount;
    private String otherUserName;
    private String otherUserEmail;
    private String otherUserId;

    public static class ParticipantInfo {
        private String userId;
        private String name;
        private String email;
        private int unreadCount;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public int getUnreadCount() { return unreadCount; }
        public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public List<ParticipantInfo> getParticipants() { return participants; }
    public void setParticipants(List<ParticipantInfo> participants) { this.participants = participants; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public String getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(String lastMessageTime) { this.lastMessageTime = lastMessageTime; }

    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }

    public String getOtherUserName() { return otherUserName; }
    public void setOtherUserName(String otherUserName) { this.otherUserName = otherUserName; }

    public String getOtherUserEmail() { return otherUserEmail; }
    public void setOtherUserEmail(String otherUserEmail) { this.otherUserEmail = otherUserEmail; }

    public String getOtherUserId() { return otherUserId; }
    public void setOtherUserId(String otherUserId) { this.otherUserId = otherUserId; }
}
