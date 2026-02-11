package com.klh.uniconnect.controller;

import com.klh.uniconnect.model.StudentAnalytics;
import com.klh.uniconnect.service.StudentAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(originPatterns = "*")
public class AnalyticsController {
    @Autowired
    private StudentAnalyticsService analyticsService;

    // Get student's own analytics
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentAnalytics(@PathVariable String studentId) {
        try {
            Optional<StudentAnalytics> analytics = analyticsService.getStudentAnalytics(studentId);
            if (analytics.isPresent()) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("analytics", analytics.get());
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Analytics not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get analytics for a department (faculty view)
    @GetMapping("/department/{department}")
    public ResponseEntity<?> getDepartmentAnalytics(@PathVariable String department) {
        try {
            List<StudentAnalytics> analytics = analyticsService.getAnalyticsByDepartment(department);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", analytics.size());
            response.put("analytics", analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Create analytics for a student
    @PostMapping("/create")
    public ResponseEntity<?> createAnalytics(@RequestBody StudentAnalytics analytics) {
        try {
            StudentAnalytics created = analyticsService.createAnalytics(analytics);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Analytics created successfully");
                put("analytics", created);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Update analytics
    @PutMapping("/update/{studentId}")
    public ResponseEntity<?> updateAnalytics(@PathVariable String studentId, @RequestBody StudentAnalytics analytics) {
        try {
            StudentAnalytics updated = analyticsService.updateAnalytics(studentId, analytics);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Analytics updated successfully");
                    put("analytics", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Analytics not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get analytics by semester (faculty view)
    @GetMapping("/semester/{semester}")
    public ResponseEntity<?> getAnalyticsBySemester(@PathVariable String semester) {
        try {
            List<StudentAnalytics> analytics = analyticsService.getAnalyticsBySemester(semester);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", analytics.size());
            response.put("analytics", analytics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
}
