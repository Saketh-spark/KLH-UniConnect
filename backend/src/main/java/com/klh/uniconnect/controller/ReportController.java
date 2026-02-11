package com.klh.uniconnect.controller;

import com.klh.uniconnect.model.AnalyticsReport;
import com.klh.uniconnect.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/reports")
@CrossOrigin(originPatterns = "*")
public class ReportController {
    @Autowired
    private ReportService reportService;

    // Get all reports for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentReports(@PathVariable String studentId) {
        try {
            List<AnalyticsReport> reports = reportService.getStudentReports(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", reports.size());
            response.put("reports", reports);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get specific type of report
    @GetMapping("/student/{studentId}/type/{reportType}")
    public ResponseEntity<?> getReportsByType(@PathVariable String studentId, @PathVariable String reportType) {
        try {
            List<AnalyticsReport> reports = reportService.getReportsByType(studentId, reportType);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", reports.size());
            response.put("reports", reports);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Generate a report
    @PostMapping("/generate")
    public ResponseEntity<?> generateReport(@RequestBody AnalyticsReport report) {
        try {
            AnalyticsReport generated = reportService.generateReport(report);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Report generated successfully");
                put("report", generated);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get published reports
    @GetMapping("/student/{studentId}/published")
    public ResponseEntity<?> getPublishedReports(@PathVariable String studentId) {
        try {
            List<AnalyticsReport> reports = reportService.getPublishedReports(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", reports.size());
            response.put("reports", reports);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Download report (placeholder)
    @GetMapping("/{reportId}/download")
    public ResponseEntity<?> downloadReport(@PathVariable String reportId) {
        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("success", true);
            put("message", "Report download initiated");
            put("reportId", reportId);
        }});
    }
}
