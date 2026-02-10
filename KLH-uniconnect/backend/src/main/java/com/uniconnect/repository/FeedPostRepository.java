package com.uniconnect.repository;

import com.uniconnect.model.FeedPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FeedPostRepository extends MongoRepository<FeedPost, String> {
    List<FeedPost> findAllByOrderByIsPinnedDescCreatedAtDesc();
    List<FeedPost> findByTypeOrderByCreatedAtDesc(String type);
    List<FeedPost> findByTopicOrderByCreatedAtDesc(String topic);
    List<FeedPost> findByAuthorEmailOrderByCreatedAtDesc(String authorEmail);
}
