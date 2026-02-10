package com.uniconnect.repository;

import com.uniconnect.model.SafetyAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface SafetyAlertRepository extends MongoRepository<SafetyAlert, String> {
    List<SafetyAlert> findByVisibleToStudentsTrueAndIsActiveTrueOrderByCreatedAtDesc();
    List<SafetyAlert> findBySeverity(String severity);
    List<SafetyAlert> findByType(String type);
    List<SafetyAlert> findByIsActiveTrue();
    List<SafetyAlert> findByIsActiveTrueOrderByCreatedAtDesc();
    List<SafetyAlert> findByIsExpiredFalseAndVisibleToStudentsTrue();
    List<SafetyAlert> findByLocation(String location);
}
