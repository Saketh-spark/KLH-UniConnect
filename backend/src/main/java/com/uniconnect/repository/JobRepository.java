package com.uniconnect.repository;

import com.uniconnect.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findByStatus(String status);
    List<Job> findByCompany(String company);
    List<Job> findByCreatedBy(String createdBy);
    List<Job> findByStatusIn(List<String> statuses);
    List<Job> findByBranchContaining(String branch);
    List<Job> findByMinCGPALessThanEqual(double cgpa);
    List<Job> findByStatusAndBranchContaining(String status, String branch);
    long countByStatus(String status);
    long countByCompany(String company);
}
