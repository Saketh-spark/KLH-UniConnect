package com.klh.uniconnect.repository;

import com.klh.uniconnect.model.SkillAnalytics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillAnalyticsRepository extends MongoRepository<SkillAnalytics, String> {
    List<SkillAnalytics> findByStudentId(String studentId);
    List<SkillAnalytics> findByStudentIdAndStatus(String studentId, String status);
    List<SkillAnalytics> findByStudentIdAndCategory(String studentId, String category);
    List<SkillAnalytics> findByCategory(String category);
}
