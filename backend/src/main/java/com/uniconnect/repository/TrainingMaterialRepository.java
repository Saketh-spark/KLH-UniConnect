package com.uniconnect.repository;

import com.uniconnect.model.TrainingMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingMaterialRepository extends MongoRepository<TrainingMaterial, String> {
    List<TrainingMaterial> findByCategory(String category);
    List<TrainingMaterial> findByUploadedBy(String uploadedBy);
    List<TrainingMaterial> findAllByOrderByCreatedAtDesc();
}
