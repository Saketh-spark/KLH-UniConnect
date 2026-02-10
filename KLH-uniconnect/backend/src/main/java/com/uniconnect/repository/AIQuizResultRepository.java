package com.uniconnect.repository;

import com.uniconnect.model.AIQuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIQuizResultRepository extends MongoRepository<AIQuizResult, String> {
    List<AIQuizResult> findByStudentIdOrderByCompletedAtDesc(String studentId);
    List<AIQuizResult> findByStudentIdAndSubjectOrderByCompletedAtDesc(String studentId, String subject);
    long countByStudentId(String studentId);
}
