package com.uniconnect.dto;

import java.time.Instant;
import java.util.List;

public record ReelResponse(
    String id,
    String studentId,
    String studentName,
    String department,
    String year,
    String avatar,
    String uploaderRole,  // "STUDENT" or "FACULTY"
    String title,
    String description,
    String videoUrl,
    String thumbnailUrl,
    String category,
    Instant createdAt,
    int views,
    int likes,
    int comments,
    int saves,
    boolean verified,
    boolean safe,
    List<String> hashtags,
    List<ReelCommentResponse> commentList,
    boolean isLiked,
    boolean isSaved
) {}
