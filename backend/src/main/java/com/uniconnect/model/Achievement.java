package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "achievements")
public class Achievement {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String department;
    private String year;
    private String title;
    private String category; // Academic Rank, Hackathon Win, Sports Medal, Research Paper, Patent, Cultural, Community Service, Other
    private String description;
    private LocalDateTime date;
    private String level; // University, State, National, International
    private String position; // 1st, 2nd, 3rd, Participant, Winner, Runner-up
    private String proofUrl; // file URL for supporting document
    private String originalFileName;
    private int points;
    private String status; // pending, verified, rejected
    private String reviewedBy;
    private String reviewNote;
    private LocalDateTime createdAt;

    public Achievement() {
        this.createdAt = LocalDateTime.now();
        this.status = "pending";
        this.points = 0;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public String getProofUrl() { return proofUrl; }
    public void setProofUrl(String proofUrl) { this.proofUrl = proofUrl; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
