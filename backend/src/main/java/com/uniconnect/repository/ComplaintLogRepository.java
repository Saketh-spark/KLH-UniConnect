package com.uniconnect.repository;

import com.uniconnect.model.ComplaintLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ComplaintLogRepository extends MongoRepository<ComplaintLog, String> {
    List<ComplaintLog> findByComplaintIdOrderByTimestampDesc(String complaintId);
}
