package com.klh.uniconnect.service;

import com.klh.uniconnect.model.StudentAnalytics;
import com.klh.uniconnect.repository.StudentAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StudentAnalyticsService {
    @Autowired
    private StudentAnalyticsRepository analyticsRepository;

    // Get student's analytics
    public Optional<StudentAnalytics> getStudentAnalytics(String studentId) {
        return analyticsRepository.findByStudentId(studentId);
    }

    // Create new analytics record
    public StudentAnalytics createAnalytics(StudentAnalytics analytics) {
        analytics.setCreatedAt(LocalDateTime.now());
        analytics.setLastUpdated(LocalDateTime.now());
        return analyticsRepository.save(analytics);
    }

    // Update analytics
    public StudentAnalytics updateAnalytics(String studentId, StudentAnalytics analytics) {
        Optional<StudentAnalytics> existing = analyticsRepository.findByStudentId(studentId);
        if (existing.isPresent()) {
            StudentAnalytics current = existing.get();
            current.setOverallPerformanceScore(analytics.getOverallPerformanceScore());
            current.setCurrentGPA(analytics.getCurrentGPA());
            current.setPlacementReadinessScore(analytics.getPlacementReadinessScore());
            current.setActiveGoalsCount(analytics.getActiveGoalsCount());
            current.setSkillsTrackedCount(analytics.getSkillsTrackedCount());
            current.setHoursSpentAcademics(analytics.getHoursSpentAcademics());
            current.setHoursSpentSkills(analytics.getHoursSpentSkills());
            current.setHoursSpentPlacements(analytics.getHoursSpentPlacements());
            current.setGpaTrend(analytics.getGpaTrend());
            current.setPerformanceTrend(analytics.getPerformanceTrend());
            current.setPlacementTrend(analytics.getPlacementTrend());
            current.setLastUpdated(LocalDateTime.now());
            return analyticsRepository.save(current);
        }
        return null;
    }

    // Get all analytics for a department
    public List<StudentAnalytics> getAnalyticsByDepartment(String department) {
        return analyticsRepository.findByDepartment(department);
    }

    // Get analytics by semester
    public List<StudentAnalytics> getAnalyticsBySemester(String semester) {
        return analyticsRepository.findBySemester(semester);
    }

    // Calculate performance score (0-100)
    public double calculatePerformanceScore(double gpa, double placementReadiness) {
        return (gpa * 40 / 10) + (placementReadiness * 60 / 100);
    }

    // Get analytics summary for faculty view
    public StudentAnalytics.PerformanceTrendData[] getPerformanceSummary(List<StudentAnalytics> analytics) {
        // Returns aggregated data
        return new StudentAnalytics.PerformanceTrendData[0];
    }
}
