package com.uniconnect.dto;

import java.time.Instant;
import java.util.List;

public record CreateReelRequest(
    String title,
    String description,
    String videoUrl,
    String thumbnailUrl,
    String category,
    List<String> hashtags,
    // NEW: Academic fields
    String subject,
    String skill,
    String semester,
    String clubOrEvent,
    String placementVisibility
) {}
