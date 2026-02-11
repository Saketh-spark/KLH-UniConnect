package com.uniconnect.service;

import com.uniconnect.model.IncidentReport;
import com.uniconnect.repository.IncidentReportRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class IncidentReportService {
    private final IncidentReportRepository repository;

    public IncidentReportService(IncidentReportRepository repository) {
        this.repository = repository;
    }

    public IncidentReport createReport(IncidentReport report, String userId) {
        report.setCreatedBy(userId);
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        report.setStatus("New");
        return repository.save(report);
    }

    public IncidentReport submitStudentReport(IncidentReport report) {
        report.setStatus("New");
        report.setCreatedAt(LocalDateTime.now());
        report.setUpdatedAt(LocalDateTime.now());
        return repository.save(report);
    }

    public IncidentReport updateReport(String id, IncidentReport updates) {
        Optional<IncidentReport> existing = repository.findById(id);
        if (existing.isPresent()) {
            IncidentReport report = existing.get();
            if (updates.getTitle() != null) report.setTitle(updates.getTitle());
            if (updates.getDescription() != null) report.setDescription(updates.getDescription());
            if (updates.getStatus() != null) report.setStatus(updates.getStatus());
            if (updates.getAssignedTo() != null) report.setAssignedTo(updates.getAssignedTo());
            if (updates.getInternalNotes() != null) report.setInternalNotes(updates.getInternalNotes());
            if (updates.getSeverity() != null) report.setSeverity(updates.getSeverity());
            report.setUpdatedAt(LocalDateTime.now());
            report.setUpdateCount(report.getUpdateCount() + 1);
            return repository.save(report);
        }
        return null;
    }

    public void assignReport(String id, String assignedTo, String assignedPersonId, String assignedPersonName) {
        Optional<IncidentReport> report = repository.findById(id);
        if (report.isPresent()) {
            report.get().setAssignedTo(assignedTo);
            report.get().setAssignedPersonId(assignedPersonId);
            report.get().setAssignedPersonName(assignedPersonName);
            report.get().setStatus("Under Review");
            report.get().setUpdatedAt(LocalDateTime.now());
            repository.save(report.get());
        }
    }

    public void resolveReport(String id, String summary, String action, String resolvedBy) {
        Optional<IncidentReport> report = repository.findById(id);
        if (report.isPresent()) {
            report.get().setStatus("Resolved");
            report.get().setResolutionSummary(summary);
            report.get().setResolutionAction(action);
            report.get().setResolvedAt(LocalDateTime.now());
            report.get().setResolvedBy(resolvedBy);
            report.get().setUpdatedAt(LocalDateTime.now());
            repository.save(report.get());
        }
    }

    public void softDeleteReport(String id) {
        Optional<IncidentReport> report = repository.findById(id);
        if (report.isPresent()) {
            report.get().setDeletedSoft(true);
            repository.save(report.get());
        }
    }

    public Optional<IncidentReport> getReportById(String id) {
        return repository.findById(id);
    }

    public List<IncidentReport> getAllReports() {
        return repository.findByDeletedSoftFalseOrderByCreatedAtDesc();
    }

    public List<IncidentReport> getStudentReports(String studentId) {
        return repository.findByStudentId(studentId);
    }

    public List<IncidentReport> getReportsByStatus(String status) {
        return repository.findByDeletedSoftFalseAndStatusOrderByCreatedAtDesc(status);
    }

    public List<IncidentReport> getReportsAssignedTo(String assignedPersonId) {
        return repository.findByAssignedPersonId(assignedPersonId);
    }

    public long getTotalReports() {
        return repository.findByDeletedSoftFalseOrderByCreatedAtDesc().size();
    }

    public long getPendingReportCount() {
        return repository.findByDeletedSoftFalseAndStatusOrderByCreatedAtDesc("New").size();
    }

    public long getResolvedReportCount() {
        return repository.findByDeletedSoftFalseAndStatusOrderByCreatedAtDesc("Resolved").size();
    }
}
