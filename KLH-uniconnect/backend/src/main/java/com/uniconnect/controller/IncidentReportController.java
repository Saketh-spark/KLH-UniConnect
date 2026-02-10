package com.uniconnect.controller;

import com.uniconnect.model.IncidentReport;
import com.uniconnect.service.IncidentReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/safety/incident-reports")
@CrossOrigin(originPatterns = "*")
public class IncidentReportController {
    private final IncidentReportService reportService;

    public IncidentReportController(IncidentReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentReport>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentReport> getReportById(@PathVariable String id) {
        return reportService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<IncidentReport>> getStudentReports(@PathVariable String studentId) {
        return ResponseEntity.ok(reportService.getStudentReports(studentId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IncidentReport>> getReportsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reportService.getReportsByStatus(status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentReport> updateReport(@PathVariable String id, @RequestBody IncidentReport updates) {
        return ResponseEntity.ok(reportService.updateReport(id, updates));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Void> assignReport(@PathVariable String id, @RequestBody Map<String, String> body) {
        reportService.assignReport(id, body.get("assignedTo"), body.get("assignedPersonId"), body.get("assignedPersonName"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveReport(@PathVariable String id, @RequestBody Map<String, String> body) {
        reportService.resolveReport(id, body.get("summary"), body.get("action"), body.get("resolvedBy"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable String id) {
        reportService.softDeleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
