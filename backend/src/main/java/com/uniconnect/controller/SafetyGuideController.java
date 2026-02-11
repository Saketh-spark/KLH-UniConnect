package com.uniconnect.controller;

import com.uniconnect.model.SafetyGuide;
import com.uniconnect.service.SafetyGuideService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/faculty/safety/guides")
@CrossOrigin(originPatterns = "*")
public class SafetyGuideController {
    private final SafetyGuideService guideService;

    public SafetyGuideController(SafetyGuideService guideService) {
        this.guideService = guideService;
    }

    @GetMapping
    public ResponseEntity<List<SafetyGuide>> getAllGuides() {
        return ResponseEntity.ok(guideService.getAllGuides());
    }

    @PostMapping
    public ResponseEntity<SafetyGuide> createGuide(@RequestBody SafetyGuide guide, @RequestHeader("Faculty-Id") String facultyId) {
        return ResponseEntity.ok(guideService.createGuide(guide, facultyId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SafetyGuide> updateGuide(@PathVariable String id, @RequestBody SafetyGuide updates) {
        return ResponseEntity.ok(guideService.updateGuide(id, updates));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<SafetyGuide> approveGuide(@PathVariable String id, @RequestHeader("Faculty-Id") String facultyId) {
        return ResponseEntity.ok(guideService.approveGuide(id, facultyId));
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<SafetyGuide> publishGuide(@PathVariable String id) {
        return ResponseEntity.ok(guideService.publishGuide(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable String id) {
        guideService.deleteGuide(id);
        return ResponseEntity.noContent().build();
    }
}
