package com.klh.uniconnect.controller;

import com.klh.uniconnect.model.SkillAnalytics;
import com.klh.uniconnect.service.SkillAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics/skills")
@CrossOrigin(originPatterns = "*")
public class SkillAnalyticsController {
    @Autowired
    private SkillAnalyticsService skillService;

    // Get all skills for a student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentSkills(@PathVariable String studentId) {
        try {
            List<SkillAnalytics> skills = skillService.getStudentSkills(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", skills.size());
            response.put("skills", skills);
            response.put("averageProficiency", skillService.getAverageSkillProficiency(studentId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Add a new skill
    @PostMapping("/add")
    public ResponseEntity<?> addSkill(@RequestBody SkillAnalytics skill) {
        try {
            SkillAnalytics created = skillService.addSkill(skill);
            return ResponseEntity.status(HttpStatus.CREATED).body(new HashMap<String, Object>() {{
                put("success", true);
                put("message", "Skill added successfully");
                put("skill", created);
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Update skill proficiency
    @PutMapping("/update/{skillId}")
    public ResponseEntity<?> updateSkillProficiency(@PathVariable String skillId, @RequestParam double proficiency) {
        try {
            SkillAnalytics updated = skillService.updateSkillProficiency(skillId, proficiency);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Skill updated successfully");
                    put("skill", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Skill not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Endorse a skill
    @PostMapping("/{skillId}/endorse")
    public ResponseEntity<?> endorseSkill(@PathVariable String skillId) {
        try {
            SkillAnalytics updated = skillService.endorseSkill(skillId);
            if (updated != null) {
                return ResponseEntity.ok(new HashMap<String, Object>() {{
                    put("success", true);
                    put("message", "Skill endorsed successfully");
                    put("skill", updated);
                }});
            }
            return ResponseEntity.status(404).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", "Skill not found");
            }});
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }

    // Get skills by category
    @GetMapping("/student/{studentId}/category/{category}")
    public ResponseEntity<?> getSkillsByCategory(@PathVariable String studentId, @PathVariable String category) {
        try {
            List<SkillAnalytics> skills = skillService.getSkillsByCategory(studentId, category);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", skills.size());
            response.put("skills", skills);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new HashMap<String, Object>() {{
                put("success", false);
                put("message", e.getMessage());
            }});
        }
    }
}
