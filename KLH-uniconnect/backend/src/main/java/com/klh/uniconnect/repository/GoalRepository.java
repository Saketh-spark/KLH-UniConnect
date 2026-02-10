package com.klh.uniconnect.repository;

import com.klh.uniconnect.model.Goal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends MongoRepository<Goal, String> {
    List<Goal> findByStudentId(String studentId);
    List<Goal> findByStudentIdAndStatus(String studentId, String status);
    List<Goal> findByStudentIdAndCategory(String studentId, String category);
    List<Goal> findByAssignedBy(String facultyId);
    List<Goal> findByStatus(String status);
}
