package com.uniconnect.repository;

import com.uniconnect.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Student> findByEmailContainingIgnoreCase(String email);
}
