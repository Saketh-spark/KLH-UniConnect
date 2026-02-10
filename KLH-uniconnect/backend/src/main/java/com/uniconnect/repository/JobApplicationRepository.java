package com.uniconnect.repository;

import com.uniconnect.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends MongoRepository<JobApplication, String> {
    List<JobApplication> findByStudentId(String studentId);
    Optional<JobApplication> findByStudentIdAndJobId(String studentId, String jobId);
    List<JobApplication> findByJobId(String jobId);
    List<JobApplication> findByStatus(String status);
}
