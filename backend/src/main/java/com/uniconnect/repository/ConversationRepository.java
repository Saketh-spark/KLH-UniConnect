package com.uniconnect.repository;

import com.uniconnect.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByParticipantIdsContainingOrderByLastMessageTimeDesc(String userId);
    Optional<Conversation> findByParticipantIdsContainingAllIgnoreCase(List<String> participantIds);
}
