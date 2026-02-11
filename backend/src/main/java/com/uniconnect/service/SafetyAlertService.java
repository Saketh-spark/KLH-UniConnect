package com.uniconnect.service;

import com.uniconnect.model.SafetyAlert;
import com.uniconnect.repository.SafetyAlertRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SafetyAlertService {
    private final SafetyAlertRepository repository;

    public SafetyAlertService(SafetyAlertRepository repository) {
        this.repository = repository;
    }

    public SafetyAlert createAlert(SafetyAlert alert, String userId) {
        alert.setCreatedBy(userId);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setUpdatedAt(LocalDateTime.now());
        alert.setIsActive(true);
        alert.setIsExpired(false);
        return repository.save(alert);
    }

    public SafetyAlert updateAlert(String id, SafetyAlert updates, String userId) {
        Optional<SafetyAlert> existing = repository.findById(id);
        if (existing.isPresent()) {
            SafetyAlert alert = existing.get();
            if (updates.getTitle() != null) alert.setTitle(updates.getTitle());
            if (updates.getDescription() != null) alert.setDescription(updates.getDescription());
            if (updates.getType() != null) alert.setType(updates.getType());
            if (updates.getSeverity() != null) alert.setSeverity(updates.getSeverity());
            if (updates.getLocation() != null) alert.setLocation(updates.getLocation());
            if (updates.getExpiryTime() != null) alert.setExpiryTime(updates.getExpiryTime());
            if (updates.getVisibleToStudents() != null) alert.setVisibleToStudents(updates.getVisibleToStudents());
            alert.setUpdatedAt(LocalDateTime.now());
            return repository.save(alert);
        }
        return null;
    }

    public void closeAlert(String id, String closedBy, String reason) {
        Optional<SafetyAlert> alert = repository.findById(id);
        if (alert.isPresent()) {
            alert.get().setIsActive(false);
            alert.get().setClosedBy(closedBy);
            alert.get().setClosedAt(LocalDateTime.now());
            alert.get().setClosureReason(reason);
            repository.save(alert.get());
        }
    }

    public void deleteAlert(String id) {
        repository.deleteById(id);
    }

    public Optional<SafetyAlert> getAlertById(String id) {
        return repository.findById(id);
    }

    public List<SafetyAlert> getAllAlerts() {
        return repository.findAll();
    }

    public List<SafetyAlert> getVisibleAlerts() {
        return repository.findByVisibleToStudentsTrueAndIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<SafetyAlert> getAlertsByType(String type) {
        return repository.findByType(type);
    }

    public List<SafetyAlert> getAlertsBySeverity(String severity) {
        return repository.findBySeverity(severity);
    }

    public List<SafetyAlert> getActiveAlerts() {
        return repository.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public void expireAlert(String id) {
        Optional<SafetyAlert> alert = repository.findById(id);
        if (alert.isPresent()) {
            alert.get().setIsExpired(true);
            alert.get().setIsActive(false);
            repository.save(alert.get());
        }
    }

    public void checkAndExpireAlerts() {
        LocalDateTime now = LocalDateTime.now();
        List<SafetyAlert> activeAlerts = repository.findByIsActiveTrueOrderByCreatedAtDesc();
        
        for (SafetyAlert alert : activeAlerts) {
            if (alert.getExpiryTime() != null && alert.getExpiryTime().isBefore(now)) {
                expireAlert(alert.getId());
            }
        }
    }

    public long getTotalAlerts() {
        return repository.count();
    }

    public long getActiveAlertCount() {
        return repository.findByIsActiveTrueOrderByCreatedAtDesc().size();
    }

    public void incrementViewCount(String id) {
        Optional<SafetyAlert> alert = repository.findById(id);
        if (alert.isPresent()) {
            alert.get().setViewCount(alert.get().getViewCount() + 1);
            repository.save(alert.get());
        }
    }
}
