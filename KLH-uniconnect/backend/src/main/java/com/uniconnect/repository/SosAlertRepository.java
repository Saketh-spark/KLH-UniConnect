package com.uniconnect.repository;

import com.uniconnect.model.SosAlert;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SosAlertRepository extends MongoRepository<SosAlert, String> {
    List<SosAlert> findByEmailOrderByTimestampDesc(String email);
    List<SosAlert> findByStatusInOrderByTimestampDesc(List<String> statuses);
    List<SosAlert> findByStatusOrderByTimestampDesc(String status);
    List<SosAlert> findAllByOrderByTimestampDesc();
}
