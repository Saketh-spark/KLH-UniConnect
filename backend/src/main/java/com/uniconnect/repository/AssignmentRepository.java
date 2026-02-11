package com.uniconnect.repository;

import com.uniconnect.model.Assignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findBySubject(String subject);
    List<Assignment> findByDueDateBefore(LocalDateTime date);
    List<Assignment> findByDueDateAfter(LocalDateTime date);
}
