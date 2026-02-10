package com.uniconnect.repository;

import com.uniconnect.model.ExamQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamQuestionRepository extends MongoRepository<ExamQuestion, String> {
    List<ExamQuestion> findByCreatedByAndSubject(String createdBy, String subject);
    List<ExamQuestion> findBySubject(String subject);
    List<ExamQuestion> findBySubjectAndDifficulty(String subject, String difficulty);
    List<ExamQuestion> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    List<ExamQuestion> findByIsActiveTrueOrderByCreatedAtDesc();
}
