package com.uniconnect.dto;

import java.util.List;

public record FacultyFeedbackRequest(
    String reelId,
    String feedbackText,
    double rating,
    List<String> tags,
    String featuredTag // GOOD_PROJECT, NEEDS_IMPROVEMENT, PLACEMENT_READY, ACADEMIC_HIGHLIGHT
) {}
