package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "ai_conversations")
public class AIConversation {
    @Id
    private String id;
    
    private String userId;         // studentId or facultyId
    private String userRole;       // "student" or "faculty"
    private String title;
    private String category;       // "doubt", "notes", "exam-prep", "study-plan", "coding", "content-gen"
    private String subject;
    private String language;       // "en", "te", "hi"
    private List<AIMessage> messages = new ArrayList<>();
    private String uploadedContent;    // Extracted text from uploaded PDF/file
    private String uploadedFileName;   // Original name of uploaded file
    private Instant createdAt;
    private Instant updatedAt;
    private boolean active;
    
    public AIConversation() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.active = true;
        this.language = "en";
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    
    public List<AIMessage> getMessages() { return messages; }
    public void setMessages(List<AIMessage> messages) { this.messages = messages; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public String getUploadedContent() { return uploadedContent; }
    public void setUploadedContent(String uploadedContent) { this.uploadedContent = uploadedContent; }
    
    public String getUploadedFileName() { return uploadedFileName; }
    public void setUploadedFileName(String uploadedFileName) { this.uploadedFileName = uploadedFileName; }
}
