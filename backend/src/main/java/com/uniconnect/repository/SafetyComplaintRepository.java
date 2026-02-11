package com.uniconnect.repository;

import com.uniconnect.model.SafetyComplaint;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SafetyComplaintRepository extends MongoRepository<SafetyComplaint, String> {
    List<SafetyComplaint> findByEmailOrderBySubmittedAtDesc(String email);
    List<SafetyComplaint> findByStatusOrderBySubmittedAtDesc(String status);
    List<SafetyComplaint> findBySeverityOrderBySubmittedAtDesc(String severity);
    List<SafetyComplaint> findByTypeOrderBySubmittedAtDesc(String type);
    List<SafetyComplaint> findAllByOrderBySubmittedAtDesc();
}
