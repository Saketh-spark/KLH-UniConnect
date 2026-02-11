package com.uniconnect.repository;

import com.uniconnect.model.EmergencyContact;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EmergencyContactRepository extends MongoRepository<EmergencyContact, String> {
    List<EmergencyContact> findByVisibleToStudentsTrue();
    List<EmergencyContact> findByCategory(String category);
    List<EmergencyContact> findByIsActiveTrueAndVisibleToStudentsTrueOrderByPriority();
    Optional<EmergencyContact> findByIsPrimaryTrueAndIsActiveTrue();
    List<EmergencyContact> findByIsActiveTrueOrderByPriority();
}
