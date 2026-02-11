package com.klh.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "analytics_feedback")
public class AnalyticsFeedback {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String facultyId;
    private String facultyName;
    private String feedbackType; // Goal Feedback, Performance Feedback, Skill Feedback, General
    private String content;
    private String category; // Academics, Skills, Placements
    private String sentiment; // Positive, Neutral, Needs Improvement
    private boolean flaggedAsNeedsAttention;
    private String recommendedAction;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isRead;

    // Constructors
    public AnalyticsFeedback() {}

    public AnalyticsFeedback(String studentId, String facultyId, String feedbackType) {
        this.studentId = studentId;
        this.facultyId = facultyId;
        this.feedbackType = feedbackType;
        this.sentiment = "Neutral";
        this.flaggedAsNeedsAttention = false;
        this.isRead = false;
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

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getFeedbackType() { return feedbackType; }
    public void setFeedbackType(String feedbackType) { this.feedbackType = feedbackType; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public boolean isFlaggedAsNeedsAttention() { return flaggedAsNeedsAttention; }
    public void setFlaggedAsNeedsAttention(boolean flaggedAsNeedsAttention) { this.flaggedAsNeedsAttention = flaggedAsNeedsAttention; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}
