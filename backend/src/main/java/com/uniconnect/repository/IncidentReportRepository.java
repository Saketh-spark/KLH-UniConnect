package com.uniconnect.repository;

import com.uniconnect.model.IncidentReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface IncidentReportRepository extends MongoRepository<IncidentReport, String> {
    List<IncidentReport> findByStudentId(String studentId);
    List<IncidentReport> findByDeletedSoftFalseOrderByCreatedAtDesc();
    List<IncidentReport> findByStatus(String status);
    List<IncidentReport> findByAssignedTo(String assignedTo);
    List<IncidentReport> findByAssignedPersonId(String assignedPersonId);
    List<IncidentReport> findByDeletedSoftFalseAndStatusOrderByCreatedAtDesc(String status);
    List<IncidentReport> findBySeverity(String severity);
}
