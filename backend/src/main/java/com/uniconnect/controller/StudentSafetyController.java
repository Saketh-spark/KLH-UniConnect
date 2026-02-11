package com.uniconnect.controller;

import com.uniconnect.model.*;
import com.uniconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/safety")
@CrossOrigin(origins = "*")
public class StudentSafetyController {

    @Autowired private SosAlertRepository sosAlertRepo;
    @Autowired private SafetyComplaintRepository complaintRepo;
    @Autowired private ComplaintMessageRepository messageRepo;
    @Autowired private ComplaintLogRepository logRepo;
    @Autowired private CounselingSessionRepository counselingRepo;
    @Autowired private SafetyAlertRepository alertRepo;
    @Autowired private SafetyResourceRepository resourceRepo;
    @Autowired private EmergencyContactRepository contactRepo;
    @Autowired private SafetyGuideRepository guideRepo;

    /* ═══════════════ SOS ENDPOINTS ═══════════════ */

    @PostMapping("/sos/trigger")
    public ResponseEntity<?> triggerSos(@RequestBody Map<String, Object> body) {
        SosAlert sos = new SosAlert();
        sos.setEmail((String) body.get("email"));
        sos.setStudentName((String) body.get("studentName"));
        sos.setLatitude(body.get("latitude") != null ? ((Number) body.get("latitude")).doubleValue() : null);
        sos.setLongitude(body.get("longitude") != null ? ((Number) body.get("longitude")).doubleValue() : null);
        sos.setStatus("ACTIVE");
        sos.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(sosAlertRepo.save(sos));
    }

    @GetMapping("/sos/history")
    public ResponseEntity<?> getSosHistory(@RequestParam String email) {
        return ResponseEntity.ok(sosAlertRepo.findByEmailOrderByTimestampDesc(email));
    }

    @PutMapping("/sos/{id}/cancel")
    public ResponseEntity<?> cancelSos(@PathVariable String id) {
        return sosAlertRepo.findById(id).map(sos -> {
            sos.setStatus("CANCELLED");
            return ResponseEntity.ok(sosAlertRepo.save(sos));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sos/active")
    public ResponseEntity<?> getActiveSos() {
        return ResponseEntity.ok(sosAlertRepo.findAllByOrderByTimestampDesc());
    }

    @PutMapping("/sos/{id}/respond")
    public ResponseEntity<?> respondToSos(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return sosAlertRepo.findById(id).map(sos -> {
            String status = (String) body.get("status");
            sos.setStatus(status);
            sos.setRespondedBy((String) body.get("respondedBy"));
            sos.setNotes((String) body.get("notes"));
            if ("RESPONDING".equals(status)) {
                sos.setRespondedAt(LocalDateTime.now());
            } else if ("RESOLVED".equals(status)) {
                sos.setResolvedAt(LocalDateTime.now());
            }
            return ResponseEntity.ok(sosAlertRepo.save(sos));
        }).orElse(ResponseEntity.notFound().build());
    }

    /* ═══════════════ COMPLAINT ENDPOINTS ═══════════════ */

    @PostMapping("/complaints")
    public ResponseEntity<?> submitComplaint(@RequestBody Map<String, Object> body) {
        SafetyComplaint c = new SafetyComplaint();
        c.setEmail((String) body.get("email"));
        c.setType((String) body.get("type"));
        c.setSeverity((String) body.get("severity"));
        c.setDescription((String) body.get("description"));
        c.setAnonymous(Boolean.TRUE.equals(body.get("anonymous")));
        c.setStatus("Submitted");
        c.setSubmittedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(complaintRepo.save(c));
    }

    @GetMapping("/complaints")
    public ResponseEntity<?> getComplaintsByEmail(@RequestParam String email) {
        return ResponseEntity.ok(complaintRepo.findByEmailOrderBySubmittedAtDesc(email));
    }

    @GetMapping("/complaints/all")
    public ResponseEntity<?> getAllComplaints() {
        return ResponseEntity.ok(complaintRepo.findAllByOrderBySubmittedAtDesc());
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return complaintRepo.findById(id).map(c -> {
            c.setStatus((String) body.get("status"));
            c.setUpdatedBy((String) body.get("updatedBy"));
            c.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(complaintRepo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<?> assignComplaint(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return complaintRepo.findById(id).map(c -> {
            c.setAssignedTo((String) body.get("assignedTo"));
            c.setAssignedBy((String) body.get("assignedBy"));
            c.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(complaintRepo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/complaints/{id}/messages")
    public ResponseEntity<?> getComplaintMessages(@PathVariable String id) {
        return ResponseEntity.ok(messageRepo.findByComplaintIdOrderByTimestampAsc(id));
    }

    @PostMapping("/complaints/{id}/messages")
    public ResponseEntity<?> sendComplaintMessage(@PathVariable String id, @RequestBody Map<String, Object> body) {
        ComplaintMessage msg = new ComplaintMessage();
        msg.setComplaintId(id);
        msg.setEmail((String) body.get("email"));
        msg.setContent((String) body.get("content"));
        msg.setFromStudent(Boolean.TRUE.equals(body.get("fromStudent")));
        msg.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(messageRepo.save(msg));
    }

    @PostMapping("/complaints/{id}/logs")
    public ResponseEntity<?> addComplaintLog(@PathVariable String id, @RequestBody Map<String, Object> body) {
        ComplaintLog log = new ComplaintLog();
        log.setComplaintId(id);
        log.setContent((String) body.get("content"));
        log.setAuthor((String) body.get("author"));
        log.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(logRepo.save(log));
    }

    /* ═══════════════ COUNSELING ENDPOINTS ═══════════════ */

    @PostMapping("/counseling")
    public ResponseEntity<?> bookCounseling(@RequestBody Map<String, Object> body) {
        CounselingSession s = new CounselingSession();
        s.setStudentEmail((String) body.get("email"));
        s.setSessionType((String) body.get("type"));
        s.setTopic((String) body.get("reason"));
        s.setDescription((String) body.get("reason"));
        s.setStatus("Pending");
        s.setBookingStatus("Pending");
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        // Map urgency to description (no urgency field on model)
        String urgency = (String) body.get("urgency");
        if (urgency != null) {
            s.setStudentNotes("Urgency: " + urgency);
        }
        String preferredDate = (String) body.get("preferredDate");
        if (preferredDate != null) {
            try { s.setRequestedDate(LocalDateTime.parse(preferredDate + "T09:00:00")); } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(counselingRepo.save(s));
    }

    @GetMapping("/counseling")
    public ResponseEntity<?> getCounselingByEmail(@RequestParam String email) {
        // Map studentEmail to email param
        List<CounselingSession> all = counselingRepo.findAll();
        List<CounselingSession> filtered = all.stream()
                .filter(s -> email.equals(s.getStudentEmail()))
                .sorted(Comparator.comparing(CounselingSession::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/counseling/all")
    public ResponseEntity<?> getAllCounseling() {
        return ResponseEntity.ok(counselingRepo.findAll());
    }

    @PutMapping("/counseling/{id}/update")
    public ResponseEntity<?> updateCounseling(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return counselingRepo.findById(id).map(s -> {
            if (body.containsKey("status")) s.setStatus((String) body.get("status"));
            if (body.containsKey("assignedCounselor")) s.setCounselorEmail((String) body.get("assignedCounselor"));
            s.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(counselingRepo.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    /* ═══════════════ ALERT ENDPOINTS ═══════════════ */

    @GetMapping("/alerts/student")
    public ResponseEntity<?> getStudentAlerts() {
        return ResponseEntity.ok(alertRepo.findByVisibleToStudentsTrueAndIsActiveTrueOrderByCreatedAtDesc());
    }

    @PutMapping("/alerts/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeAlert(@PathVariable String id) {
        return alertRepo.findById(id).map(a -> {
            a.setViewCount(a.getViewCount() != null ? a.getViewCount() + 1 : 1);
            return ResponseEntity.ok(alertRepo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alerts/all")
    public ResponseEntity<?> getAllAlerts() {
        return ResponseEntity.ok(alertRepo.findAll());
    }

    @PostMapping("/alerts/broadcast")
    public ResponseEntity<?> broadcastAlert(@RequestBody Map<String, Object> body) {
        SafetyAlert alert = new SafetyAlert();
        alert.setTitle((String) body.get("title"));
        alert.setDescription((String) body.get("description"));
        alert.setType((String) body.get("type"));
        alert.setSeverity((String) body.get("severity"));
        alert.setLocation((String) body.get("location"));
        alert.setCreatedBy((String) body.get("createdBy"));
        alert.setIsActive(true);
        alert.setVisibleToStudents(true);
        alert.setCreatedAt(LocalDateTime.now());
        alert.setUpdatedAt(LocalDateTime.now());
        // Set color based on severity
        String severity = (String) body.get("severity");
        if ("critical".equalsIgnoreCase(severity)) alert.setColor("red");
        else if ("high".equalsIgnoreCase(severity)) alert.setColor("yellow");
        else alert.setColor("blue");
        // Handle affected departments
        @SuppressWarnings("unchecked")
        List<String> departments = (List<String>) body.get("departments");
        if (departments != null && !departments.isEmpty()) {
            alert.setAffectedDepartments(departments);
        }
        return ResponseEntity.ok(alertRepo.save(alert));
    }

    /* ═══════════════ RESOURCES & CONTACTS ═══════════════ */

    @GetMapping("/resources/student")
    public ResponseEntity<?> getStudentResources() {
        return ResponseEntity.ok(resourceRepo.findByVisibleToStudentsTrue());
    }

    @GetMapping("/contacts/student")
    public ResponseEntity<?> getStudentContacts() {
        return ResponseEntity.ok(contactRepo.findByIsActiveTrueAndVisibleToStudentsTrueOrderByPriority());
    }

    /* ═══════════════ ANALYTICS ═══════════════ */

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        List<SafetyComplaint> allComplaints = complaintRepo.findAll();
        List<SosAlert> allSos = sosAlertRepo.findAll();

        long totalIncidents = allComplaints.size() + allSos.size();
        long resolved = allComplaints.stream().filter(c -> "Closed".equals(c.getStatus())).count()
                + allSos.stream().filter(s -> "RESOLVED".equals(s.getStatus())).count();
        long pending = allComplaints.stream().filter(c -> !"Closed".equals(c.getStatus())).count()
                + allSos.stream().filter(s -> "ACTIVE".equals(s.getStatus()) || "RESPONDING".equals(s.getStatus())).count();

        // Incidents by type
        Map<String, Long> byType = allComplaints.stream()
                .collect(Collectors.groupingBy(c -> c.getType() != null ? c.getType() : "Other", Collectors.counting()));
        List<Map<String, Object>> byTypeList = byType.entrySet().stream()
                .map(e -> { Map<String, Object> m = new HashMap<>(); m.put("type", e.getKey()); m.put("count", e.getValue()); return m; })
                .collect(Collectors.toList());

        // High-risk zones placeholder
        List<String> highRiskZones = List.of("Hostel Block A", "Parking Lot", "Library Backside");

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalIncidents", totalIncidents);
        analytics.put("resolvedCount", resolved);
        analytics.put("pendingCount", pending);
        analytics.put("avgResponseTime", "2h");
        analytics.put("byType", byTypeList);
        analytics.put("byLocation", List.of());
        analytics.put("monthlyTrend", List.of());
        analytics.put("highRiskZones", highRiskZones);
        analytics.put("repeatComplaints", 0);

        return ResponseEntity.ok(analytics);
    }
}
