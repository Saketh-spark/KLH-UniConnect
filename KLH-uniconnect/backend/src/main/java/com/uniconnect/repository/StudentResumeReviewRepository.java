package com.uniconnect.repository;

import com.uniconnect.model.StudentResumeReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentResumeReviewRepository extends MongoRepository<StudentResumeReview, String> {
    Optional<StudentResumeReview> findFirstByStudentId(String studentId);
    List<StudentResumeReview> findAll();
    List<StudentResumeReview> findByReadinessStatus(String readinessStatus);
}
