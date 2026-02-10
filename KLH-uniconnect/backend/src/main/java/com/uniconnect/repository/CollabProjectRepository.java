package com.uniconnect.repository;

import com.uniconnect.model.CollabProject;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CollabProjectRepository extends MongoRepository<CollabProject, String> {
    List<CollabProject> findAllByOrderByCreatedAtDesc();
    List<CollabProject> findByOwnerEmailOrderByCreatedAtDesc(String ownerEmail);
    List<CollabProject> findByStatusOrderByCreatedAtDesc(String status);
    List<CollabProject> findByDomainOrderByCreatedAtDesc(String domain);
}
