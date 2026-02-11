package com.uniconnect.controller;

import com.uniconnect.model.SafetyResource;
import com.uniconnect.service.SafetyResourceService;
import com.uniconnect.service.EmergencyContactService;
import com.uniconnect.service.SafetyAlertService;
import com.uniconnect.service.IncidentReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/safety")
@CrossOrigin(originPatterns = "*")
public class FacultySafetyDashboardController {
    private final SafetyResourceService safetyResourceService;
    private final EmergencyContactService emergencyContactService;
    private final SafetyAlertService safetyAlertService;
    private final IncidentReportService incidentReportService;

    public FacultySafetyDashboardController(
            SafetyResourceService safetyResourceService,
            EmergencyContactService emergencyContactService,
            SafetyAlertService safetyAlertService,
            IncidentReportService incidentReportService
    ) {
        this.safetyResourceService = safetyResourceService;
        this.emergencyContactService = emergencyContactService;
        this.safetyAlertService = safetyAlertService;
        this.incidentReportService = incidentReportService;
    }

    // Dashboard Overview
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardOverview() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalResources", safetyResourceService.getTotalResources());
        dashboard.put("activeResources", safetyResourceService.getActiveResourceCount());
        dashboard.put("emergencyContacts", emergencyContactService.getTotalContacts());
        dashboard.put("activeAlerts", safetyAlertService.getActiveAlertCount());
        dashboard.put("pendingReports", incidentReportService.getPendingReportCount());
        dashboard.put("recentAlerts", safetyAlertService.getActiveAlerts());
        return ResponseEntity.ok(dashboard);
    }

    // Safety Resources Management
    @GetMapping("/resources")
    public ResponseEntity<List<SafetyResource>> getAllResources() {
        return ResponseEntity.ok(safetyResourceService.getAllResources());
    }

    @PostMapping("/resources")
    public ResponseEntity<SafetyResource> createResource(@RequestBody SafetyResource resource, @RequestHeader("Faculty-Id") String facultyId) {
        SafetyResource created = safetyResourceService.createResource(resource, facultyId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/resources/{id}")
    public ResponseEntity<SafetyResource> updateResource(@PathVariable String id, @RequestBody SafetyResource updates, @RequestHeader("Faculty-Id") String facultyId) {
        SafetyResource updated = safetyResourceService.updateResource(id, updates, facultyId);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        safetyResourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/resources/{id}/visibility")
    public ResponseEntity<Void> toggleResourceVisibility(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        safetyResourceService.toggleResourceVisibility(id, body.get("visible"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/resources/{id}/disable")
    public ResponseEntity<Void> disableResource(@PathVariable String id) {
        safetyResourceService.disableResource(id);
        return ResponseEntity.ok().build();
    }

    // Emergency Contacts Management
    @GetMapping("/emergency-contacts")
    public ResponseEntity<Map<String, Object>> getEmergencyContacts() {
        Map<String, Object> response = new HashMap<>();
        response.put("contacts", emergencyContactService.getAllContacts());
        response.put("primaryContact", emergencyContactService.getPrimaryContact());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/emergency-contacts")
    public ResponseEntity<Map<String, Object>> createEmergencyContact(@RequestBody Map<String, Object> body, @RequestHeader("Faculty-Id") String facultyId) {
        // This will be properly implemented in the service
        return ResponseEntity.ok(body);
    }

    @PutMapping("/emergency-contacts/{id}")
    public ResponseEntity<Map<String, Object>> updateEmergencyContact(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(updates);
    }

    @PutMapping("/emergency-contacts/{id}/primary")
    public ResponseEntity<Void> setPrimaryContact(@PathVariable String id) {
        emergencyContactService.setPrimaryContact(id);
        return ResponseEntity.ok().build();
    }

    // Safety Alerts Management
    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getAllAlerts() {
        Map<String, Object> response = new HashMap<>();
        response.put("alerts", safetyAlertService.getAllAlerts());
        response.put("activeCount", safetyAlertService.getActiveAlertCount());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/alerts")
    public ResponseEntity<Map<String, Object>> createAlert(@RequestBody Map<String, Object> body, @RequestHeader("Faculty-Id") String facultyId) {
        return ResponseEntity.ok(body);
    }

    @PutMapping("/alerts/{id}")
    public ResponseEntity<Map<String, Object>> updateAlert(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(updates);
    }

    @PutMapping("/alerts/{id}/close")
    public ResponseEntity<Void> closeAlert(@PathVariable String id, @RequestBody Map<String, String> body, @RequestHeader("Faculty-Id") String facultyId) {
        safetyAlertService.closeAlert(id, facultyId, body.get("reason"));
        return ResponseEntity.ok().build();
    }

    // Sync endpoint for real-time updates
    @GetMapping("/sync")
    public ResponseEntity<Map<String, Object>> getSyncData() {
        Map<String, Object> syncData = new HashMap<>();
        syncData.put("resources", safetyResourceService.getVisibleResources());
        syncData.put("emergencyContacts", emergencyContactService.getVisibleContacts());
        syncData.put("alerts", safetyAlertService.getVisibleAlerts());
        syncData.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(syncData);
    }
}
