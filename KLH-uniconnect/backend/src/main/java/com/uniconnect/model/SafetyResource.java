package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "safety_resources")
public class SafetyResource {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String type; // Medical Emergency, Counseling Center, Women Safety, Mental Health Support
    private String phone;
    private String email;
    private String address;
    private String website;
    private String availability; // 24/7, Specific timings
    private String availabilityDetails; // e.g., "9 AM - 5 PM"
    private String priorityLevel; // High, Medium, Low
    private Boolean isActive = true;
    private Boolean visibleToStudents = true;
    private List<String> tags; // e.g., ["emergency", "counseling", "women"]
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime updatedBy;
    private String icon; // emoji or icon identifier

    // Constructors
    public SafetyResource() {}

    public SafetyResource(String title, String type, String phone, String email) {
        this.title = title;
        this.type = type;
        this.phone = phone;
        this.email = email;
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

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }

    public String getAvailabilityDetails() { return availabilityDetails; }
    public void setAvailabilityDetails(String availabilityDetails) { this.availabilityDetails = availabilityDetails; }

    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getVisibleToStudents() { return visibleToStudents; }
    public void setVisibleToStudents(Boolean visibleToStudents) { this.visibleToStudents = visibleToStudents; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(LocalDateTime updatedBy) { this.updatedBy = updatedBy; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
