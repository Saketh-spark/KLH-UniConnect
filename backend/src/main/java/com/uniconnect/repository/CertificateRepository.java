package com.uniconnect.repository;

import com.uniconnect.model.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends MongoRepository<Certificate, String> {
    List<Certificate> findByStudentId(String studentId);
    List<Certificate> findByStudentIdAndStatus(String studentId, String status);
    List<Certificate> findByStudentIdAndCategory(String studentId, String category);
    Optional<Certificate> findByShareLink(String shareLink);
    Optional<Certificate> findByVerificationCode(String verificationCode);
    List<Certificate> findByStudentIdOrderByUploadDateDesc(String studentId);
    List<Certificate> findByStatus(String status);
    List<Certificate> findAllByOrderByUploadDateDesc();
    List<Certificate> findByStudentIdAndUniversityIssued(String studentId, boolean universityIssued);
    List<Certificate> findByDepartment(String department);
    List<Certificate> findByCategory(String category);
    List<Certificate> findByUniversityIssued(boolean universityIssued);
    List<Certificate> findByStudentIdAndType(String studentId, String type);
}
