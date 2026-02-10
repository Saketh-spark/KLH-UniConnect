package com.klh.uniconnect.controller;

import com.klh.uniconnect.model.Goal;
import com.klh.uniconnect.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/goals")
@CrossOrigin(originPatterns = "*")
public class GoalController {
    @Autowired
    private GoalService goalService;

    // Get active goals for student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentGoals(@PathVariable String studentId) {
        try {
            List<Goal> goals = goalService.getActiveGoals(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", goals.size());
            response.put("goals", goals);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get all goals (including completed) for student
    @GetMapping("/student/{studentId}/all")
    public ResponseEntity<?> getAllGoals(@PathVariable String studentId) {
        try {
            List<Goal> goals = goalService.getStudentGoals(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", goals.size());
            response.put("goals", goals);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Create a goal
    @PostMapping("/create")
    public ResponseEntity<?> createGoal(@RequestBody Goal goal) {
        try {
            Goal created = goalService.createGoal(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Goal created successfully");
                put("goal", created);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Update goal progress
    @PutMapping("/{goalId}/progress")
    public ResponseEntity<?> updateGoalProgress(@PathVariable String goalId, @RequestParam double progress) {
        try {
            Goal updated = goalService.updateGoalProgress(goalId, progress);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Goal progress updated");
                    put("goal", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Goal not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Mark goal as completed
    @PutMapping("/{goalId}/complete")
    public ResponseEntity<?> completeGoal(@PathVariable String goalId) {
        try {
            Goal updated = goalService.completeGoal(goalId);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Goal completed successfully");
                    put("goal", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Goal not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Add feedback to goal
    @PutMapping("/{goalId}/feedback")
    public ResponseEntity<?> addFeedback(@PathVariable String goalId, @RequestParam String feedback) {
        try {
            Goal updated = goalService.addFeedback(goalId, feedback);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Feedback added successfully");
                    put("goal", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Goal not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
}
