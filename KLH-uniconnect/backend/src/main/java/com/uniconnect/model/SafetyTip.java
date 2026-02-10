package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "safety_tips")
public class SafetyTip {
    @Id
    private String id;
    
    private String title;
    private String content;
    private String category; // Personal, Digital, Health, Travel
    private String riskLevel; // High, Medium, Low
    private Boolean isFeatured = false;
    private Boolean isPublished = true;
    private Boolean visibleToStudents = true;
    private Integer displayOrder; // for ordering
    private LocalDateTime scheduledDate; // When to show the tip
    private Integer viewCount = 0;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String emoji; // for visual representation
    private String relatedGuideId; // Link to SafetyGuide

    // Constructors
    public SafetyTip() {}

    public SafetyTip(String title, String content, String category) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public Boolean getVisibleToStudents() { return visibleToStudents; }
    public void setVisibleToStudents(Boolean visibleToStudents) { this.visibleToStudents = visibleToStudents; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public LocalDateTime getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public String getRelatedGuideId() { return relatedGuideId; }
    public void setRelatedGuideId(String relatedGuideId) { this.relatedGuideId = relatedGuideId; }
}
