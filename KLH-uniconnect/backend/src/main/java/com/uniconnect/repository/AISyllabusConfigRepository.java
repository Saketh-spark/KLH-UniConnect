package com.uniconnect.repository;

import com.uniconnect.model.AISyllabusConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AISyllabusConfigRepository extends MongoRepository<AISyllabusConfig, String> {
    List<AISyllabusConfig> findByFacultyIdOrderByUpdatedAtDesc(String facultyId);
    Optional<AISyllabusConfig> findByFacultyIdAndSubject(String facultyId, String subject);
    List<AISyllabusConfig> findBySubject(String subject);
    List<AISyllabusConfig> findByDepartment(String department);
}
