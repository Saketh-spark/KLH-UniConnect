package com.uniconnect.repository;

import com.uniconnect.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findByStudentId(String studentId);
    List<Achievement> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Achievement> findByStudentIdAndCategory(String studentId, String category);
    List<Achievement> findByStudentIdAndStatus(String studentId, String status);
    List<Achievement> findByStatus(String status);
    List<Achievement> findAllByOrderByCreatedAtDesc();
    List<Achievement> findByCategory(String category);
    List<Achievement> findByDepartment(String department);
}
