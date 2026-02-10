package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "interviews")
public class Interview {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String studentEmail;
    private String company;
    private String jobId;
    private String interviewType; // Mock Interview, Real Interview
    private String date;
    private String time;
    private String round; // Technical Round, HR Round, Coding Round, etc.
    private Double performance;
    private String feedback;
    private String status; // Scheduled, Completed, Cancelled, No Show
    private String conductedBy; // Faculty email
    private String meetingLink;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Interview() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "Scheduled";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getRound() { return round; }
    public void setRound(String round) { this.round = round; }

    public Double getPerformance() { return performance; }
    public void setPerformance(Double performance) { this.performance = performance; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getConductedBy() { return conductedBy; }
    public void setConductedBy(String conductedBy) { this.conductedBy = conductedBy; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
