package com.uniconnect.repository;

import com.uniconnect.model.TrainingSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingSessionRepository extends MongoRepository<TrainingSession, String> {
    List<TrainingSession> findByStatus(String status);
    List<TrainingSession> findByCreatedBy(String createdBy);
    List<TrainingSession> findAllByOrderByCreatedAtDesc();
}
