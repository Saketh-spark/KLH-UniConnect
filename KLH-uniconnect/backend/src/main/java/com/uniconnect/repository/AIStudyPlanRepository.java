package com.uniconnect.repository;

import com.uniconnect.model.AIStudyPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIStudyPlanRepository extends MongoRepository<AIStudyPlan, String> {
    List<AIStudyPlan> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<AIStudyPlan> findByStudentIdAndTypeOrderByCreatedAtDesc(String studentId, String type);
    List<AIStudyPlan> findByStudentIdAndActiveOrderByCreatedAtDesc(String studentId, boolean active);
}
