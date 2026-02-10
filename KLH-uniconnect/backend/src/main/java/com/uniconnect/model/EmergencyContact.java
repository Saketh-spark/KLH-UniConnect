package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "emergency_contacts")
public class EmergencyContact {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String phone;
    private String email;
    private String category; // Campus Security, Police, Ambulance, Fire, Mental Health, etc.
    private String location;
    private Boolean isPrimary = false;
    private Boolean isActive = true;
    private Boolean visibleToStudents = true;
    private String availabilityStatus; // Always Available, Timings, etc.
    private Integer priority; // 1 = highest, for ordering
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String icon; // emoji

    // Constructors
    public EmergencyContact() {}

    public EmergencyContact(String title, String phone, String category) {
        this.title = title;
        this.phone = phone;
        this.category = category;
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

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getVisibleToStudents() { return visibleToStudents; }
    public void setVisibleToStudents(Boolean visibleToStudents) { this.visibleToStudents = visibleToStudents; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
