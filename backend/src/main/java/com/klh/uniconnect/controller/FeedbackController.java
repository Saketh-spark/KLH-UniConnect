package com.klh.uniconnect.controller;

import com.klh.uniconnect.model.AnalyticsFeedback;
import com.klh.uniconnect.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/feedback")
@CrossOrigin(originPatterns = "*")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

    // Get all feedback for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentFeedback(@PathVariable String studentId) {
        try {
            List<AnalyticsFeedback> feedback = feedbackService.getStudentFeedback(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", feedback.size());
            response.put("feedback", feedback);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get unread feedback for a student
    @GetMapping("/student/{studentId}/unread")
    public ResponseEntity<?> getUnreadFeedback(@PathVariable String studentId) {
        try {
            List<AnalyticsFeedback> feedback = feedbackService.getUnreadFeedback(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", feedback.size());
            response.put("feedback", feedback);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Add feedback from faculty
    @PostMapping("/add")
    public ResponseEntity<?> addFeedback(@RequestBody AnalyticsFeedback feedback) {
        try {
            AnalyticsFeedback created = feedbackService.addFeedback(feedback);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Feedback added successfully");
                put("feedback", created);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Mark feedback as read
    @PutMapping("/{feedbackId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String feedbackId) {
        try {
            AnalyticsFeedback updated = feedbackService.markAsRead(feedbackId);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Feedback marked as read");
                    put("feedback", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Feedback not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get all feedback from a faculty
    @GetMapping("/faculty/{facultyId}")
    public ResponseEntity<?> getFacultyFeedback(@PathVariable String facultyId) {
        try {
            List<AnalyticsFeedback> feedback = feedbackService.getFacultyFeedback(facultyId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", feedback.size());
            response.put("feedback", feedback);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get flagged students
    @GetMapping("/flagged")
    public ResponseEntity<?> getFlaggedStudents() {
        try {
            List<AnalyticsFeedback> flagged = feedbackService.getFlaggedStudents();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", flagged.size());
            response.put("flaggedStudents", flagged);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Flag a student for attention
    @PutMapping("/{feedbackId}/flag")
    public ResponseEntity<?> flagStudentForAttention(@PathVariable String feedbackId, @RequestParam String recommendedAction) {
        try {
            AnalyticsFeedback updated = feedbackService.flagStudentForAttention(feedbackId, recommendedAction);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Student flagged for attention");
                    put("feedback", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Feedback not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
}
