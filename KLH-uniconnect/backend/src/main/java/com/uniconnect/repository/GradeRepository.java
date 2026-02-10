package com.uniconnect.repository;

import com.uniconnect.model.Grade;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends MongoRepository<Grade, String> {
    Optional<Grade> findByStudentIdAndSubject(String studentId, String subject);
    List<Grade> findByStudentIdOrderByLastUpdatedDesc(String studentId);
    List<Grade> findBySubjectOrderByLastUpdatedDesc(String subject);
    List<Grade> findBySemesterOrderByLastUpdatedDesc(String semester);
}
