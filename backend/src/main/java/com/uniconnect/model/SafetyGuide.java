package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "safety_guides")
public class SafetyGuide {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String content; // Rich text / Markdown
    private String category; // Campus Safety, Digital Safety, Mental Health, Travel Safety
    private String type; // PDF, Markdown, Rich Text
    private String fileUrl; // For PDF storage
    private Integer readTimeMinutes;
    private List<String> tags;
    private String importanceLevel; // High, Medium, Low
    private Boolean isApproved = false;
    private Boolean isPublished = false;
    private Boolean visibleToStudents = true;
    private Integer viewCount = 0;
    private Integer downloadCount = 0;
    private String author;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime publishedAt;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> affectedDepartments; // null = all
    private List<String> affectedYears; // null = all

    // Constructors
    public SafetyGuide() {}

    public SafetyGuide(String title, String category, String content) {
        this.title = title;
        this.category = category;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Integer getReadTimeMinutes() { return readTimeMinutes; }
    public void setReadTimeMinutes(Integer readTimeMinutes) { this.readTimeMinutes = readTimeMinutes; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getImportanceLevel() { return importanceLevel; }
    public void setImportanceLevel(String importanceLevel) { this.importanceLevel = importanceLevel; }

    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }

    public Boolean getIsPublished() { return isPublished; }
    public void setIsPublished(Boolean isPublished) { this.isPublished = isPublished; }

    public Boolean getVisibleToStudents() { return visibleToStudents; }
    public void setVisibleToStudents(Boolean visibleToStudents) { this.visibleToStudents = visibleToStudents; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<String> getAffectedDepartments() { return affectedDepartments; }
    public void setAffectedDepartments(List<String> affectedDepartments) { this.affectedDepartments = affectedDepartments; }

    public List<String> getAffectedYears() { return affectedYears; }
    public void setAffectedYears(List<String> affectedYears) { this.affectedYears = affectedYears; }
}
