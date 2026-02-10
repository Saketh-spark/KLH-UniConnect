package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "counseling_sessions")
public class CounselingSession {
    @Id
    private String id;
    
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String counselorId;
    private String counselorName;
    private String counselorEmail;
    private String sessionType; // Mental Health, Career Guidance, Academic Support, General Counseling
    private String topic;
    private String description;
    private String status; // Requested, Scheduled, Completed, Cancelled
    private String bookingStatus; // Pending, Confirmed, Completed, Cancelled
    
    // Session Details
    private LocalDateTime requestedDate;
    private LocalDateTime sessionDateTime;
    private Integer durationMinutes; // 30, 60, 90 minutes
    private String sessionMode; // Online, In-Person, Phone
    private String location; // Counseling Center location/link
    
    // Notes
    private String studentNotes;
    private String counselorNotes; // Private
    private String feedbackFromStudent;
    private Integer sessionRating; // 1-5 stars
    
    // Follow-up
    private Boolean requiresFollowUp = false;
    private LocalDateTime followUpDate;
    private String recommendedActions;
    
    // Tracking
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String cancelledBy;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private List<String> attachments; // Session documents/resources

    // Constructors
    public CounselingSession() {}

    public CounselingSession(String studentId, String sessionType, String topic) {
        this.studentId = studentId;
        this.sessionType = sessionType;
        this.topic = topic;
        this.status = "Requested";
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

    public String getCounselorId() { return counselorId; }
    public void setCounselorId(String counselorId) { this.counselorId = counselorId; }

    public String getCounselorName() { return counselorName; }
    public void setCounselorName(String counselorName) { this.counselorName = counselorName; }

    public String getCounselorEmail() { return counselorEmail; }
    public void setCounselorEmail(String counselorEmail) { this.counselorEmail = counselorEmail; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public LocalDateTime getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDateTime requestedDate) { this.requestedDate = requestedDate; }

    public LocalDateTime getSessionDateTime() { return sessionDateTime; }
    public void setSessionDateTime(LocalDateTime sessionDateTime) { this.sessionDateTime = sessionDateTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getSessionMode() { return sessionMode; }
    public void setSessionMode(String sessionMode) { this.sessionMode = sessionMode; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStudentNotes() { return studentNotes; }
    public void setStudentNotes(String studentNotes) { this.studentNotes = studentNotes; }

    public String getCounselorNotes() { return counselorNotes; }
    public void setCounselorNotes(String counselorNotes) { this.counselorNotes = counselorNotes; }

    public String getFeedbackFromStudent() { return feedbackFromStudent; }
    public void setFeedbackFromStudent(String feedbackFromStudent) { this.feedbackFromStudent = feedbackFromStudent; }

    public Integer getSessionRating() { return sessionRating; }
    public void setSessionRating(Integer sessionRating) { this.sessionRating = sessionRating; }

    public Boolean getRequiresFollowUp() { return requiresFollowUp; }
    public void setRequiresFollowUp(Boolean requiresFollowUp) { this.requiresFollowUp = requiresFollowUp; }

    public LocalDateTime getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDateTime followUpDate) { this.followUpDate = followUpDate; }

    public String getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(String recommendedActions) { this.recommendedActions = recommendedActions; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public List<String> getAttachments() { return attachments; }
    public void setAttachments(List<String> attachments) { this.attachments = attachments; }
}
