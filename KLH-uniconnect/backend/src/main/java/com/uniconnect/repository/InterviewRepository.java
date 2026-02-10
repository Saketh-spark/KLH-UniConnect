package com.uniconnect.repository;

import com.uniconnect.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {
    List<Interview> findByStudentId(String studentId);
    List<Interview> findByStudentEmail(String studentEmail);
    List<Interview> findByCompany(String company);
    List<Interview> findByStatus(String status);
    List<Interview> findByInterviewType(String interviewType);
    List<Interview> findByConductedBy(String conductedBy);
    List<Interview> findByDate(String date);
    List<Interview> findByJobId(String jobId);
    List<Interview> findByStudentIdAndStatus(String studentId, String status);
    long countByStatus(String status);
    long countByStudentIdAndStatus(String studentId, String status);
}
