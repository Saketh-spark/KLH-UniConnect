package com.uniconnect.repository;

import com.uniconnect.model.Reel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReelRepository extends MongoRepository<Reel, String> {
    List<Reel> findByStudentIdOrderByCreatedAtDesc(String studentId);
    
    List<Reel> findByCategoryOrderByCreatedAtDesc(String category);
    
    List<Reel> findByOrderByCreatedAtDesc();
    
    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    List<Reel> findByTitleContainingIgnoreCase(String title);
    
    @Query("{ $text: { $search: ?0 } }")
    List<Reel> searchReels(String query);
}
