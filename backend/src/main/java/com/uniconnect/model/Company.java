package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "companies")
public class Company {
    @Id
    private String id;
    private String name;
    private String industry;
    private String website;
    private String logo;
    private String description;
    private String headquarters;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String status; // Active, Inactive, Blacklisted
    private List<String> hiringFor = new ArrayList<>(); // Roles they typically hire
    private int totalHired;
    private int activeJobs;
    private double averagePackage;
    private List<Visit> visits = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Company() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "Active";
        this.totalHired = 0;
        this.activeJobs = 0;
    }

    public static class Visit {
        private String date;
        private String purpose;
        private int studentsInterviewed;
        private int offers;
        private String notes;

        public Visit() {}

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getPurpose() { return purpose; }
        public void setPurpose(String purpose) { this.purpose = purpose; }
        public int getStudentsInterviewed() { return studentsInterviewed; }
        public void setStudentsInterviewed(int studentsInterviewed) { this.studentsInterviewed = studentsInterviewed; }
        public int getOffers() { return offers; }
        public void setOffers(int offers) { this.offers = offers; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getLogo() { return logo; }
    public void setLogo(String logo) { this.logo = logo; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHeadquarters() { return headquarters; }
    public void setHeadquarters(String headquarters) { this.headquarters = headquarters; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getHiringFor() { return hiringFor; }
    public void setHiringFor(List<String> hiringFor) { this.hiringFor = hiringFor; }

    public int getTotalHired() { return totalHired; }
    public void setTotalHired(int totalHired) { this.totalHired = totalHired; }

    public int getActiveJobs() { return activeJobs; }
    public void setActiveJobs(int activeJobs) { this.activeJobs = activeJobs; }

    public double getAveragePackage() { return averagePackage; }
    public void setAveragePackage(double averagePackage) { this.averagePackage = averagePackage; }

    public List<Visit> getVisits() { return visits; }
    public void setVisits(List<Visit> visits) { this.visits = visits; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
