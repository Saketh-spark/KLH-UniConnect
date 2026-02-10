package com.uniconnect.repository;

import com.uniconnect.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {
    // Use findFirst to avoid non-unique result error when duplicates exist
    Optional<Resume> findFirstByStudentId(String studentId);
    Optional<Resume> findFirstByStudentEmail(String studentEmail);
    
    // Methods to find all (for cleanup if needed)
    List<Resume> findAllByStudentId(String studentId);
    
    // Delete duplicates
    void deleteAllByStudentId(String studentId);
}
