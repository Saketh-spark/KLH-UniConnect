package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "safety_alerts")
public class SafetyAlert {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String type; // Maintenance Work, Safety Warning, Lost Items, Cyber Alert
    private String severity; // Info, Warning, Critical
    private String location; // Campus location
    private String color; // blue, yellow, red (for UI)
    private Boolean isActive = true;
    private Boolean visibleToStudents = true;
    private LocalDateTime expiryTime;
    private Boolean isExpired = false;
    private List<String> affectedDepartments; // null = all students
    private List<String> affectedYears; // null = all years
    private Integer viewCount = 0;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String closedBy;
    private LocalDateTime closedAt;
    private String closureReason;
    private String imageUrl;
    private String attachmentUrl;

    // Constructors
    public SafetyAlert() {}

    public SafetyAlert(String title, String type, String severity) {
        this.title = title;
        this.type = type;
        this.severity = severity;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.setSeverityColor();
    }

    private void setSeverityColor() {
        switch(this.severity) {
            case "Info": this.color = "blue"; break;
            case "Warning": this.color = "yellow"; break;
            case "Critical": this.color = "red"; break;
            default: this.color = "blue";
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { 
        this.severity = severity;
        this.setSeverityColor();
    }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getVisibleToStudents() { return visibleToStudents; }
    public void setVisibleToStudents(Boolean visibleToStudents) { this.visibleToStudents = visibleToStudents; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public Boolean getIsExpired() { return isExpired; }
    public void setIsExpired(Boolean isExpired) { this.isExpired = isExpired; }

    public List<String> getAffectedDepartments() { return affectedDepartments; }
    public void setAffectedDepartments(List<String> affectedDepartments) { this.affectedDepartments = affectedDepartments; }

    public List<String> getAffectedYears() { return affectedYears; }
    public void setAffectedYears(List<String> affectedYears) { this.affectedYears = affectedYears; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getClosedBy() { return closedBy; }
    public void setClosedBy(String closedBy) { this.closedBy = closedBy; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public String getClosureReason() { return closureReason; }
    public void setClosureReason(String closureReason) { this.closureReason = closureReason; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }
}
