package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "clubs")
public class Club {
    @Id
    private String id;
    
    private String name;
    private String description;
    private String category; // Technical, Cultural, Sports, Academic, Social, Professional, Arts
    private String iconUrl;
    private String bannerUrl;
    private String facultyCoordinator; // Faculty ID
    private String clubPresident; // Student ID
    private List<String> members = new ArrayList<>();
    private Integer memberCount = 0;
    private List<String> eventsHeld = new ArrayList<>();
    private String status; // Active, Pending, Suspended, Inactive
    private String approvedBy; // Admin/Faculty ID
    private Instant approvedAt;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getIconUrl() { return iconUrl; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getFacultyCoordinator() { return facultyCoordinator; }
    public void setFacultyCoordinator(String facultyCoordinator) { this.facultyCoordinator = facultyCoordinator; }

    public String getClubPresident() { return clubPresident; }
    public void setClubPresident(String clubPresident) { this.clubPresident = clubPresident; }

    public List<String> getMembers() { return members; }
    public void setMembers(List<String> members) { this.members = members; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public List<String> getEventsHeld() { return eventsHeld; }
    public void setEventsHeld(List<String> eventsHeld) { this.eventsHeld = eventsHeld; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
