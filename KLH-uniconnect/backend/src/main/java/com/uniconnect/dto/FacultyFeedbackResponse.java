package com.uniconnect.dto;

import java.time.Instant;
import java.util.List;

public record FacultyFeedbackResponse(
    String id,
    String facultyId,
    String facultyName,
    String feedbackText,
    double rating,
    List<String> tags,
    Instant createdAt
) {}
