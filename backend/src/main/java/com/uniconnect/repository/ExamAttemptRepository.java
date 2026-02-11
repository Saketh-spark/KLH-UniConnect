package com.uniconnect.repository;

import com.uniconnect.model.ExamAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends MongoRepository<ExamAttempt, String> {
    Optional<ExamAttempt> findByExamIdAndStudentId(String examId, String studentId);
    List<ExamAttempt> findByExamIdOrderBySubmittedAtDesc(String examId);
    List<ExamAttempt> findByStudentIdOrderBySubmittedAtDesc(String studentId);
    List<ExamAttempt> findByStudentIdAndStatus(String studentId, String status);
    List<ExamAttempt> findByExamIdAndStatus(String examId, String status);
    List<ExamAttempt> findByStatusAndAllAnswersEvaluatedFalse(String status);
    int countByExamIdAndStatus(String examId, String status);
}
