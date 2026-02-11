package com.uniconnect.controller;

import com.uniconnect.model.CounselingSession;
import com.uniconnect.service.CounselingSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/safety/counseling-sessions")
@CrossOrigin(originPatterns = "*")
public class CounselingSessionController {
    private final CounselingSessionService sessionService;

    public CounselingSessionController(CounselingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public ResponseEntity<List<CounselingSession>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<CounselingSession>> getPendingSessions() {
        return ResponseEntity.ok(sessionService.getSessionsByStatus("Requested"));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<CounselingSession> assignCounselor(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(sessionService.assignCounselor(id, body.get("counselorId"), body.get("counselorName")));
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<CounselingSession> scheduleSession(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(sessionService.scheduleSession(id, (String) body.get("sessionDateTime")));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Void> closeSession(@PathVariable String id, @RequestBody Map<String, String> body) {
        sessionService.closeSession(id, body.get("notes"));
        return ResponseEntity.ok().build();
    }
}
