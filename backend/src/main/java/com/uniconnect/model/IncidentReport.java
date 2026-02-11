package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "incident_reports")
public class IncidentReport {
    @Id
    private String id;
    
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String title;
    private String description;
    private String incidentType; // Harassment, Theft, Safety Concern, Health Issue, etc.
    private String location;
    private LocalDateTime incidentDateTime;
    private String status; // New, Under Review, Resolved, Closed
    private Boolean isConfidential = true; // Hide reporter identity
    private String reporterVisibility; // Anonymous, Name Hidden, Visible
    
    // Assignment
    private String assignedTo; // Security, Counseling, Admin
    private String assignedPersonId;
    private String assignedPersonName;
    
    // Investigation
    private String severity; // Low, Medium, High, Critical
    private String resolutionSummary;
    private String internalNotes;
    private LocalDateTime resolvedAt;
    private String resolvedBy;
    private String resolutionAction;
    
    // Tracking
    private Integer updateCount = 0;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean deletedSoft = false;
    private String attachmentUrl;
    private String evidencePhotos; // JSON array of URLs

    // Constructors
    public IncidentReport() {}

    public IncidentReport(String studentId, String title, String incidentType) {
        this.studentId = studentId;
        this.title = title;
        this.incidentType = incidentType;
        this.status = "New";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIncidentType() { return incidentType; }
    public void setIncidentType(String incidentType) { this.incidentType = incidentType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getIncidentDateTime() { return incidentDateTime; }
    public void setIncidentDateTime(LocalDateTime incidentDateTime) { this.incidentDateTime = incidentDateTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsConfidential() { return isConfidential; }
    public void setIsConfidential(Boolean isConfidential) { this.isConfidential = isConfidential; }

    public String getReporterVisibility() { return reporterVisibility; }
    public void setReporterVisibility(String reporterVisibility) { this.reporterVisibility = reporterVisibility; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getAssignedPersonId() { return assignedPersonId; }
    public void setAssignedPersonId(String assignedPersonId) { this.assignedPersonId = assignedPersonId; }

    public String getAssignedPersonName() { return assignedPersonName; }
    public void setAssignedPersonName(String assignedPersonName) { this.assignedPersonName = assignedPersonName; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getResolutionSummary() { return resolutionSummary; }
    public void setResolutionSummary(String resolutionSummary) { this.resolutionSummary = resolutionSummary; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public String getResolutionAction() { return resolutionAction; }
    public void setResolutionAction(String resolutionAction) { this.resolutionAction = resolutionAction; }

    public Integer getUpdateCount() { return updateCount; }
    public void setUpdateCount(Integer updateCount) { this.updateCount = updateCount; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getDeletedSoft() { return deletedSoft; }
    public void setDeletedSoft(Boolean deletedSoft) { this.deletedSoft = deletedSoft; }

    public String getAttachmentUrl() { return attachmentUrl; }
    public void setAttachmentUrl(String attachmentUrl) { this.attachmentUrl = attachmentUrl; }

    public String getEvidencePhotos() { return evidencePhotos; }
    public void setEvidencePhotos(String evidencePhotos) { this.evidencePhotos = evidencePhotos; }
}
