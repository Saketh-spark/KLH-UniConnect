package com.uniconnect.repository;

import com.uniconnect.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
    List<Message> findByGroupIdOrderByTimestampAsc(String groupId);
    List<Message> findByConversationIdAndReadFalseAndSenderIdNot(String conversationId, String senderId);
    List<Message> findByGroupIdAndReadFalseAndSenderIdNot(String groupId, String senderId);
    long countByConversationIdAndReadFalseAndSenderIdNot(String conversationId, String senderId);
    long countByGroupIdAndReadFalseAndSenderIdNot(String groupId, String senderId);
}
