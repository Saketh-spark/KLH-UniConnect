package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.*;

@Document(collection = "feed_posts")
public class FeedPost {
    @Id private String id;
    private String authorEmail;
    private String authorName;
    private String authorAvatar;
    private String authorRole; // STUDENT, FACULTY, ADMIN
    private String topic;      // Placements, Research, Hackathons, etc.
    private String type;       // Success Stories, Project Showcases, Research, Career Tips
    private String title;
    private String content;
    private boolean isPinned;
    private Set<String> likes = new HashSet<>();      // emails who liked
    private Set<String> saves = new HashSet<>();      // emails who saved
    private int shareCount;
    private Instant createdAt;
    private Instant updatedAt;

    public FeedPost() { this.createdAt = Instant.now(); this.updatedAt = Instant.now(); }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public boolean getIsPinned() { return isPinned; }
    public void setIsPinned(boolean isPinned) { this.isPinned = isPinned; }
    public Set<String> getLikes() { return likes; }
    public void setLikes(Set<String> likes) { this.likes = likes; }
    public Set<String> getSaves() { return saves; }
    public void setSaves(Set<String> saves) { this.saves = saves; }
    public int getShareCount() { return shareCount; }
    public void setShareCount(int shareCount) { this.shareCount = shareCount; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
