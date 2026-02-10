package com.uniconnect.repository;

import com.uniconnect.model.AssignmentSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends MongoRepository<AssignmentSubmission, String> {
    List<AssignmentSubmission> findByStudentId(String studentId);
    List<AssignmentSubmission> findByAssignmentId(String assignmentId);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(String assignmentId, String studentId);
}
