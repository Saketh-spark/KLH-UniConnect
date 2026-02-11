package com.klh.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "analytics_reports")
public class AnalyticsReport {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String reportType; // Monthly Academic Report, Skills Development Report, Placement Readiness Report
    private String generatedBy; // System or Faculty
    private LocalDateTime generatedAt;
    private String content; // Report content (HTML or JSON)
    private String status; // Draft, Published, Archived
    private String month; // For monthly reports
    private String year;
    private double performanceScore;
    private double improvementScore;
    private String recommendations;
    private String fileUrl; // For downloadable reports

    // Constructors
    public AnalyticsReport() {}

    public AnalyticsReport(String studentId, String reportType) {
        this.studentId = studentId;
        this.reportType = reportType;
        this.status = "Draft";
        this.generatedAt = LocalDateTime.now();
        this.generatedBy = "System";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public double getPerformanceScore() { return performanceScore; }
    public void setPerformanceScore(double performanceScore) { this.performanceScore = performanceScore; }

    public double getImprovementScore() { return improvementScore; }
    public void setImprovementScore(double improvementScore) { this.improvementScore = improvementScore; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
