package com.uniconnect.repository;

import com.uniconnect.model.SafetyResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface SafetyResourceRepository extends MongoRepository<SafetyResource, String> {
    List<SafetyResource> findByVisibleToStudentsTrue();
    List<SafetyResource> findByType(String type);
    List<SafetyResource> findByIsActiveTrueAndVisibleToStudentsTrue();
    List<SafetyResource> findByPriorityLevel(String priorityLevel);
    List<SafetyResource> findByTags(String tag);
    List<SafetyResource> findByVisibleToStudentsTrueOrderByPriorityLevelDesc();
}
