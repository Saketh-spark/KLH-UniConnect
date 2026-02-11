package com.klh.uniconnect.service;

import com.klh.uniconnect.model.AnalyticsReport;
import com.klh.uniconnect.repository.AnalyticsReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {
    @Autowired
    private AnalyticsReportRepository reportRepository;

    // Get all reports for a student
    public List<AnalyticsReport> getStudentReports(String studentId) {
        return reportRepository.findByStudentId(studentId);
    }

    // Get specific type of report
    public List<AnalyticsReport> getReportsByType(String studentId, String reportType) {
        return reportRepository.findByStudentIdAndReportType(studentId, reportType);
    }

    // Generate a new report
    public AnalyticsReport generateReport(AnalyticsReport report) {
        report.setGeneratedAt(LocalDateTime.now());
        report.setStatus("Published");
        return reportRepository.save(report);
    }

    // Get published reports
    public List<AnalyticsReport> getPublishedReports(String studentId) {
        List<AnalyticsReport> allReports = reportRepository.findByStudentId(studentId);
        return allReports.stream()
                .filter(r -> "Published".equals(r.getStatus()))
                .toList();
    }

    // Archive a report
    public AnalyticsReport archiveReport(String reportId) {
        Optional<AnalyticsReport> report = reportRepository.findById(reportId);
        if (report.isPresent()) {
            AnalyticsReport r = report.get();
            r.setStatus("Archived");
            return reportRepository.save(r);
        }
        return null;
    }

    // Get monthly reports
    public List<AnalyticsReport> getMonthlyReports(String month, String year) {
        return reportRepository.findByMonthAndYear(month, year);
    }
}
