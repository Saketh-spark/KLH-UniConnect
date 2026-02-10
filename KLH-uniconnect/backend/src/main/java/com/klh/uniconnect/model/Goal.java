package com.klh.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "goals")
public class Goal {
    @Id
    private String id;
    private String studentId;
    private String title;
    private String description;
    private String category; // Academic, Skill Development, Placement, Personal
    private String status; // Active, Completed, Paused, Cancelled
    private double progressPercentage; // 0-100
    private LocalDateTime createdAt;
    private LocalDateTime targetDate;
    private LocalDateTime completedDate;
    private String assignedBy; // Faculty ID or System
    private List<String> milestones;
    private int completedMilestones;
    private String priority; // High, Medium, Low
    private String feedback; // Faculty feedback
    private LocalDateTime lastUpdated;

    // Constructors
    public Goal() {}

    public Goal(String studentId, String title, String category) {
        this.studentId = studentId;
        this.title = title;
        this.category = category;
        this.status = "Active";
        this.progressPercentage = 0;
        this.priority = "Medium";
        this.completedMilestones = 0;
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) { this.progressPercentage = progressPercentage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDateTime targetDate) { this.targetDate = targetDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }

    public String getAssignedBy() { return assignedBy; }
    public void setAssignedBy(String assignedBy) { this.assignedBy = assignedBy; }

    public List<String> getMilestones() { return milestones; }
    public void setMilestones(List<String> milestones) { this.milestones = milestones; }

    public int getCompletedMilestones() { return completedMilestones; }
    public void setCompletedMilestones(int completedMilestones) { this.completedMilestones = completedMilestones; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
