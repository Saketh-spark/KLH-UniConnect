package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    private String company;
    private String position;
    private String salary;
    private String deadline;
    private double minCGPA;
    private List<String> branch = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private int maxBacklogs;
    private int applicants;
    private int shortlisted;
    private String status; // Active, Closing Soon, Closed
    private String visibility; // All Students, 3rd Year Students, 4th Year Students
    private String description;
    private String location;
    private String type; // Full-time, Internship, Part-time
    private String experience; // Fresher, 1-2 years, etc.
    private String createdBy; // Faculty email
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Job() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "Active";
        this.applicants = 0;
        this.shortlisted = 0;
        this.maxBacklogs = 0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getSalary() { return salary; }
    public void setSalary(String salary) { this.salary = salary; }

    public String getDeadline() { return deadline; }
    public void setDeadline(String deadline) { this.deadline = deadline; }

    public double getMinCGPA() { return minCGPA; }
    public void setMinCGPA(double minCGPA) { this.minCGPA = minCGPA; }

    public List<String> getBranch() { return branch; }
    public void setBranch(List<String> branch) { this.branch = branch; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public int getMaxBacklogs() { return maxBacklogs; }
    public void setMaxBacklogs(int maxBacklogs) { this.maxBacklogs = maxBacklogs; }

    public int getApplicants() { return applicants; }
    public void setApplicants(int applicants) { this.applicants = applicants; }

    public int getShortlisted() { return shortlisted; }
    public void setShortlisted(int shortlisted) { this.shortlisted = shortlisted; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
