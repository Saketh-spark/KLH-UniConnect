package com.uniconnect.repository;

import com.uniconnect.model.SafetyGuide;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface SafetyGuideRepository extends MongoRepository<SafetyGuide, String> {
    List<SafetyGuide> findByIsPublishedTrueAndVisibleToStudentsTrue();
    List<SafetyGuide> findByCategory(String category);
    List<SafetyGuide> findByIsApprovedTrueAndIsPublishedTrueOrderByPublishedAtDesc();
    List<SafetyGuide> findByImportanceLevel(String importanceLevel);
    List<SafetyGuide> findByTags(String tag);
    List<SafetyGuide> findByIsPublishedFalse();
    List<SafetyGuide> findByIsApprovedFalse();
}
