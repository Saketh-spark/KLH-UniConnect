package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "safety_complaints")
public class SafetyComplaint {
    @Id
    private String id;

    private String email;
    private String type; // Ragging, Harassment, Bullying, Misconduct, Violence, etc.
    private String severity; // Low, Medium, High, Critical
    private String description;
    private Boolean anonymous;
    private String status; // Submitted, Under Review, Action Taken, Closed
    private String assignedTo;
    private String assignedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private String updatedBy;

    public SafetyComplaint() {}

    public SafetyComplaint(String email, String type, String severity, String description, Boolean anonymous) {
        this.email = email;
        this.type = type;
        this.severity = severity;
        this.description = description;
        this.anonymous = anonymous;
        this.status = "Submitted";
        this.submittedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getAnonymous() { return anonymous; }
    public void setAnonymous(Boolean anonymous) { this.anonymous = anonymous; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
