package com.uniconnect.repository;

import com.uniconnect.model.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {
    Optional<Company> findByName(String name);
    List<Company> findByStatus(String status);
    List<Company> findByIndustry(String industry);
    List<Company> findByHiringForContaining(String role);
    long countByStatus(String status);
}
