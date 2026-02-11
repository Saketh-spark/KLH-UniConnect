package com.uniconnect.dto;

import java.time.Instant;

public record ReelCommentResponse(
    String id,
    String studentId,
    String studentName,
    String avatar,
    String text,
    Instant createdAt,
    int likes
) {}
