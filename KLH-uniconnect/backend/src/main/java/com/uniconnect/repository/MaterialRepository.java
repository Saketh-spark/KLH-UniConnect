package com.uniconnect.repository;

import com.uniconnect.model.Material;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends MongoRepository<Material, String> {
    List<Material> findByTitleContainingIgnoreCaseOrSubjectContainingIgnoreCase(String title, String subject);
    List<Material> findBySemester(String semester);
    List<Material> findByType(String type);
    List<Material> findBySemesterAndType(String semester, String type);
}
