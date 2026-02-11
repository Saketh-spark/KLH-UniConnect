package com.uniconnect.repository;

import com.uniconnect.model.SafetyTip;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SafetyTipRepository extends MongoRepository<SafetyTip, String> {
    List<SafetyTip> findByIsPublishedTrueAndVisibleToStudentsTrueOrderByDisplayOrder();
    List<SafetyTip> findByCategory(String category);
    List<SafetyTip> findByIsFeaturedTrueAndIsPublishedTrue();
    List<SafetyTip> findByRiskLevel(String riskLevel);
    List<SafetyTip> findByIsPublishedTrue();
}
