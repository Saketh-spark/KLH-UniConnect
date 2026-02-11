package com.uniconnect.repository;

import com.uniconnect.model.Club;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ClubRepository extends MongoRepository<Club, String> {
    List<Club> findByFacultyCoordinator(String facultyId);
    List<Club> findByStatus(String status);
    List<Club> findByCategory(String category);
    
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Club> searchByName(String name);
    
    @Query("{ 'members': ?0 }")
    List<Club> findClubsByMember(String studentId);
    
    long countByStatus(String status);
    long countByFacultyCoordinator(String facultyId);
}
