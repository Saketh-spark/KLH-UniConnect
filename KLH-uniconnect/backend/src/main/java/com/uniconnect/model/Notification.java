package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;

    private String studentId;
    private String type; // NEW_JOB_POSTED, SHORTLISTED, INTERVIEW_SCHEDULED, REEL_FEEDBACK, REEL_APPROVED, etc.
    private String title;
    private String message;
    private String relatedEntityId; // Job ID, Reel ID, Interview ID, etc.
    private String relatedEntityType; // JOB, REEL, INTERVIEW, APPLICATION, etc.

    @Indexed
    private Instant createdAt;
    private boolean read;
    private String actionUrl; // URL to navigate to when clicked

    public Notification() {
    }

    public Notification(String studentId, String type, String title, String message, String relatedEntityId, String relatedEntityType) {
        this.studentId = studentId;
        this.type = type;
        this.title = title;
        this.message = message;
        this.relatedEntityId = relatedEntityId;
        this.relatedEntityType = relatedEntityType;
        this.createdAt = Instant.now();
        this.read = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
}
