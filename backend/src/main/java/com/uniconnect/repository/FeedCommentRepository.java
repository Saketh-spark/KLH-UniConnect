package com.uniconnect.repository;

import com.uniconnect.model.FeedComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FeedCommentRepository extends MongoRepository<FeedComment, String> {
    List<FeedComment> findByPostIdOrderByCreatedAtAsc(String postId);
    long countByPostId(String postId);
}
