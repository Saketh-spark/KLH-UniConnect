package com.uniconnect.repository;

import com.uniconnect.model.FollowRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRequestRepository extends MongoRepository<FollowRequest, String> {

    /** Find a specific follow request between two users */
    Optional<FollowRequest> findByFromEmailAndToEmail(String fromEmail, String toEmail);

    /** All requests sent by a user */
    List<FollowRequest> findByFromEmail(String fromEmail);

    /** All requests received by a user */
    List<FollowRequest> findByToEmail(String toEmail);

    /** Pending requests received by a user */
    List<FollowRequest> findByToEmailAndStatus(String toEmail, String status);

    /** Pending requests sent by a user */
    List<FollowRequest> findByFromEmailAndStatus(String fromEmail, String status);

    /** Check if two users are mutually connected (ACCEPTED in either direction) */
    List<FollowRequest> findByFromEmailAndToEmailAndStatus(String fromEmail, String toEmail, String status);

    /** All accepted connections involving a user (as sender) */
    List<FollowRequest> findByFromEmailAndStatusOrToEmailAndStatus(
        String fromEmail, String status1, String toEmail, String status2);

    /** Count pending requests for a user */
    long countByToEmailAndStatus(String toEmail, String status);
}
