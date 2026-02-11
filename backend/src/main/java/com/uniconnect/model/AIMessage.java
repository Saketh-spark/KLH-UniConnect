package com.uniconnect.model;

import java.time.Instant;
import java.util.List;

public class AIMessage {
    private String id;
    private String role;       // "user" or "assistant"
    private String content;
    private String type;       // "text", "code", "image", "pdf", "flashcard", "quiz", "study-plan"
    private List<String> attachments;  // URLs to uploaded files
    private Instant timestamp;
    
    public AIMessage() {
        this.timestamp = Instant.now();
        this.type = "text";
    }
    
    public AIMessage(String role, String content, String type) {
        this.role = role;
        this.content = content;
        this.type = type;
        this.timestamp = Instant.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }
    
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
