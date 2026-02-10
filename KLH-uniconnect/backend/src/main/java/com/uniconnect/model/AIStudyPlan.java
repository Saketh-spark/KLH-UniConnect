package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "ai_study_plans")
public class AIStudyPlan {
    @Id
    private String id;
    
    private String studentId;
    private String title;
    private String type;          // "daily", "revision", "exam-countdown"
    private List<String> weakSubjects = new ArrayList<>();
    private List<Map<String, Object>> schedule = new ArrayList<>();  // [{day, subject, topics, duration, priority}]
    private Map<String, Object> examInfo;     // {examName, examDate, daysLeft}
    private double readinessScore;
    private List<String> motivationTips = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;
    private boolean active;
    
    public AIStudyPlan() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.active = true;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public List<String> getWeakSubjects() { return weakSubjects; }
    public void setWeakSubjects(List<String> weakSubjects) { this.weakSubjects = weakSubjects; }
    
    public List<Map<String, Object>> getSchedule() { return schedule; }
    public void setSchedule(List<Map<String, Object>> schedule) { this.schedule = schedule; }
    
    public Map<String, Object> getExamInfo() { return examInfo; }
    public void setExamInfo(Map<String, Object> examInfo) { this.examInfo = examInfo; }
    
    public double getReadinessScore() { return readinessScore; }
    public void setReadinessScore(double readinessScore) { this.readinessScore = readinessScore; }
    
    public List<String> getMotivationTips() { return motivationTips; }
    public void setMotivationTips(List<String> motivationTips) { this.motivationTips = motivationTips; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
