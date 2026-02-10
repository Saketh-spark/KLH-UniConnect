package com.uniconnect.repository;

import com.uniconnect.model.ComplaintMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ComplaintMessageRepository extends MongoRepository<ComplaintMessage, String> {
    List<ComplaintMessage> findByComplaintIdOrderByTimestampAsc(String complaintId);
}
