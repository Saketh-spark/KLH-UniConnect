package com.uniconnect.repository;

import com.uniconnect.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends MongoRepository<Exam, String> {
    List<Exam> findByFacultyIdOrderByCreatedAtDesc(String facultyId);
    List<Exam> findBySubjectOrderByCreatedAtDesc(String subject);
    List<Exam> findByStatus(String status);
    List<Exam> findByStatusAndStartTimeBetween(String status, Instant startTime, Instant endTime);
    List<Exam> findByEnrolledStudentsIdsContaining(String studentId);
    List<Exam> findByStatusAndEndTimeAfter(String status, Instant endTime);
}
