package com.klh.uniconnect.service;

import com.klh.uniconnect.model.SkillAnalytics;
import com.klh.uniconnect.repository.SkillAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SkillAnalyticsService {
    @Autowired
    private SkillAnalyticsRepository skillRepository;

    // Get all skills for a student
    public List<SkillAnalytics> getStudentSkills(String studentId) {
        return skillRepository.findByStudentIdAndStatus(studentId, "Active");
    }

    // Add a new skill
    public SkillAnalytics addSkill(SkillAnalytics skill) {
        skill.setLastUpdated(LocalDateTime.now());
        return skillRepository.save(skill);
    }

    // Update skill proficiency
    public SkillAnalytics updateSkillProficiency(String skillId, double proficiency) {
        SkillAnalytics skill = skillRepository.findById(skillId).orElse(null);
        if (skill != null) {
            skill.setProficiencyPercentage(proficiency);
            skill.setLastUpdated(LocalDateTime.now());
            return skillRepository.save(skill);
        }
        return null;
    }

    // Endorse a skill
    public SkillAnalytics endorseSkill(String skillId) {
        SkillAnalytics skill = skillRepository.findById(skillId).orElse(null);
        if (skill != null) {
            skill.setEndorsementsCount(skill.getEndorsementsCount() + 1);
            skill.setLastUpdated(LocalDateTime.now());
            return skillRepository.save(skill);
        }
        return null;
    }

    // Get skills by category
    public List<SkillAnalytics> getSkillsByCategory(String studentId, String category) {
        return skillRepository.findByStudentIdAndCategory(studentId, category);
    }

    // Get overall skill proficiency
    public double getAverageSkillProficiency(String studentId) {
        List<SkillAnalytics> skills = getStudentSkills(studentId);
        if (skills.isEmpty()) return 0;
        return skills.stream()
                .mapToDouble(SkillAnalytics::getProficiencyPercentage)
                .average()
                .orElse(0);
    }
}
