package com.klh.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "skill_analytics")
public class SkillAnalytics {
    @Id
    private String id;
    private String studentId;
    private String skillName;
    private double proficiencyPercentage; // 0-100
    private String proficiencyLevel; // Beginner, Intermediate, Expert
    private int endorsementsCount;
    private String category; // Technical, Soft Skills, Domain-Specific
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    private String status; // Active, Inactive

    // Constructors
    public SkillAnalytics() {}

    public SkillAnalytics(String studentId, String skillName, String category) {
        this.studentId = studentId;
        this.skillName = skillName;
        this.category = category;
        this.proficiencyPercentage = 0;
        this.proficiencyLevel = "Beginner";
        this.endorsementsCount = 0;
        this.status = "Active";
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public double getProficiencyPercentage() { return proficiencyPercentage; }
    public void setProficiencyPercentage(double proficiencyPercentage) {
        this.proficiencyPercentage = proficiencyPercentage;
        updateProficiencyLevel();
    }

    public String getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public int getEndorsementsCount() { return endorsementsCount; }
    public void setEndorsementsCount(int endorsementsCount) { this.endorsementsCount = endorsementsCount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    private void updateProficiencyLevel() {
        if (proficiencyPercentage < 40) {
            this.proficiencyLevel = "Beginner";
        } else if (proficiencyPercentage < 70) {
            this.proficiencyLevel = "Intermediate";
        } else {
            this.proficiencyLevel = "Expert";
        }
    }
}
