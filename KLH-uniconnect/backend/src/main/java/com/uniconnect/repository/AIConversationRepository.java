package com.uniconnect.repository;

import com.uniconnect.model.AIConversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIConversationRepository extends MongoRepository<AIConversation, String> {
    List<AIConversation> findByUserIdOrderByUpdatedAtDesc(String userId);
    List<AIConversation> findByUserIdAndCategoryOrderByUpdatedAtDesc(String userId, String category);
    List<AIConversation> findByUserIdAndActiveOrderByUpdatedAtDesc(String userId, boolean active);
    long countByUserId(String userId);
    long countByUserIdAndCategory(String userId, String category);
}
