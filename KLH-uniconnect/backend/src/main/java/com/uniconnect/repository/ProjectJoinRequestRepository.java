package com.uniconnect.repository;

import com.uniconnect.model.ProjectJoinRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ProjectJoinRequestRepository extends MongoRepository<ProjectJoinRequest, String> {
    Optional<ProjectJoinRequest> findByApplicantEmailAndProjectId(String applicantEmail, String projectId);
    List<ProjectJoinRequest> findByProjectIdAndStatus(String projectId, String status);
    List<ProjectJoinRequest> findByApplicantEmail(String applicantEmail);
    List<ProjectJoinRequest> findByProjectId(String projectId);
    long countByProjectIdAndStatus(String projectId, String status);
}
