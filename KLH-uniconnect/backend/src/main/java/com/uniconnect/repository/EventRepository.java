package com.uniconnect.repository;

import com.uniconnect.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.Instant;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    List<Event> findByCreatedBy(String facultyId);
    List<Event> findByClubId(String clubId);
    List<Event> findByStatus(String status);
    List<Event> findByEventType(String eventType);
    List<Event> findByDateTimeBetween(Instant startDate, Instant endDate);
    List<Event> findByDepartmentId(String departmentId);
    
    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    List<Event> searchByTitle(String title);
    
    @Query("{ 'createdBy': ?0, 'status': ?1 }")
    List<Event> findByCreatedByAndStatus(String facultyId, String status);
    
    long countByStatus(String status);
    long countByCreatedBy(String facultyId);
}
