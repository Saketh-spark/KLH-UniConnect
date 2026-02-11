package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "follow_requests")
@CompoundIndexes({
    @CompoundIndex(name = "unique_follow", def = "{'fromEmail': 1, 'toEmail': 1}", unique = true)
})
public class FollowRequest {

    @Id
    private String id;

    /** Email of the user who sent the follow request */
    private String fromEmail;
    private String fromName;
    private String fromAvatarUrl;
    private String fromRole;      // "student" or "faculty"

    /** Email of the user receiving the follow request */
    private String toEmail;
    private String toName;
    private String toAvatarUrl;
    private String toRole;

    /** PENDING, ACCEPTED, REJECTED */
    private String status;

    private Instant createdAt;
    private Instant updatedAt;

    public FollowRequest() {}

    public FollowRequest(String fromEmail, String fromName, String fromAvatarUrl, String fromRole,
                         String toEmail, String toName, String toAvatarUrl, String toRole) {
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.fromAvatarUrl = fromAvatarUrl;
        this.fromRole = fromRole;
        this.toEmail = toEmail;
        this.toName = toName;
        this.toAvatarUrl = toAvatarUrl;
        this.toRole = toRole;
        this.status = "PENDING";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters & setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFromEmail() { return fromEmail; }
    public void setFromEmail(String fromEmail) { this.fromEmail = fromEmail; }

    public String getFromName() { return fromName; }
    public void setFromName(String fromName) { this.fromName = fromName; }

    public String getFromAvatarUrl() { return fromAvatarUrl; }
    public void setFromAvatarUrl(String fromAvatarUrl) { this.fromAvatarUrl = fromAvatarUrl; }

    public String getFromRole() { return fromRole; }
    public void setFromRole(String fromRole) { this.fromRole = fromRole; }

    public String getToEmail() { return toEmail; }
    public void setToEmail(String toEmail) { this.toEmail = toEmail; }

    public String getToName() { return toName; }
    public void setToName(String toName) { this.toName = toName; }

    public String getToAvatarUrl() { return toAvatarUrl; }
    public void setToAvatarUrl(String toAvatarUrl) { this.toAvatarUrl = toAvatarUrl; }

    public String getToRole() { return toRole; }
    public void setToRole(String toRole) { this.toRole = toRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; this.updatedAt = Instant.now(); }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
