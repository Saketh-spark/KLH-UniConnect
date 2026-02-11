package com.uniconnect.repository;

import com.uniconnect.model.ChatGroup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatGroupRepository extends MongoRepository<ChatGroup, String> {
    @Query("{'members.userId': ?0}")
    List<ChatGroup> findByMembersUserId(String userId);
    
    List<ChatGroup> findByCreatedByOrderByCreatedAtDesc(String createdBy);
}
