package com.klh.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "student_analytics")
public class StudentAnalytics {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String email;
    private String department;
    private String semester;

    // Performance Metrics
    private double overallPerformanceScore; // 0-100
    private double currentGPA;
    private double gpaTarget;
    private double placementReadinessScore; // 0-100
    private int activeGoalsCount;
    private int skillsTrackedCount;

    // Time Investment (in hours)
    private double hoursSpentAcademics;
    private double hoursSpentSkills;
    private double hoursSpentPlacements;

    // Trends
    private List<GpaTrendData> gpaTrend; // weekly/monthly data points
    private List<PerformanceTrendData> performanceTrend;
    private List<PlacementTrendData> placementTrend;

    // Last Updated
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;

    // Constructors
    public StudentAnalytics() {}

    public StudentAnalytics(String studentId, String studentName) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.createdAt = LocalDateTime.now();
        this.overallPerformanceScore = 0;
        this.placementReadinessScore = 0;
        this.activeGoalsCount = 0;
        this.skillsTrackedCount = 0;
    }

    // Inner classes for trend data
    public static class GpaTrendData {
        public String week;
        public double gpa;
        public LocalDateTime date;

        public GpaTrendData(String week, double gpa, LocalDateTime date) {
            this.week = week;
            this.gpa = gpa;
            this.date = date;
        }
    }

    public static class PerformanceTrendData {
        public String category; // "Academics", "Skills", "Placements"
        public double score;
        public LocalDateTime date;

        public PerformanceTrendData(String category, double score, LocalDateTime date) {
            this.category = category;
            this.score = score;
            this.date = date;
        }
    }

    public static class PlacementTrendData {
        public String metric; // "Interview Calls", "Offers", "Applications"
        public int count;
        public LocalDateTime date;

        public PlacementTrendData(String metric, int count, LocalDateTime date) {
            this.metric = metric;
            this.count = count;
            this.date = date;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public double getOverallPerformanceScore() { return overallPerformanceScore; }
    public void setOverallPerformanceScore(double overallPerformanceScore) { this.overallPerformanceScore = overallPerformanceScore; }

    public double getCurrentGPA() { return currentGPA; }
    public void setCurrentGPA(double currentGPA) { this.currentGPA = currentGPA; }

    public double getGpaTarget() { return gpaTarget; }
    public void setGpaTarget(double gpaTarget) { this.gpaTarget = gpaTarget; }

    public double getPlacementReadinessScore() { return placementReadinessScore; }
    public void setPlacementReadinessScore(double placementReadinessScore) { this.placementReadinessScore = placementReadinessScore; }

    public int getActiveGoalsCount() { return activeGoalsCount; }
    public void setActiveGoalsCount(int activeGoalsCount) { this.activeGoalsCount = activeGoalsCount; }

    public int getSkillsTrackedCount() { return skillsTrackedCount; }
    public void setSkillsTrackedCount(int skillsTrackedCount) { this.skillsTrackedCount = skillsTrackedCount; }

    public double getHoursSpentAcademics() { return hoursSpentAcademics; }
    public void setHoursSpentAcademics(double hoursSpentAcademics) { this.hoursSpentAcademics = hoursSpentAcademics; }

    public double getHoursSpentSkills() { return hoursSpentSkills; }
    public void setHoursSpentSkills(double hoursSpentSkills) { this.hoursSpentSkills = hoursSpentSkills; }

    public double getHoursSpentPlacements() { return hoursSpentPlacements; }
    public void setHoursSpentPlacements(double hoursSpentPlacements) { this.hoursSpentPlacements = hoursSpentPlacements; }

    public List<GpaTrendData> getGpaTrend() { return gpaTrend; }
    public void setGpaTrend(List<GpaTrendData> gpaTrend) { this.gpaTrend = gpaTrend; }

    public List<PerformanceTrendData> getPerformanceTrend() { return performanceTrend; }
    public void setPerformanceTrend(List<PerformanceTrendData> performanceTrend) { this.performanceTrend = performanceTrend; }

    public List<PlacementTrendData> getPlacementTrend() { return placementTrend; }
    public void setPlacementTrend(List<PlacementTrendData> placementTrend) { this.placementTrend = placementTrend; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
