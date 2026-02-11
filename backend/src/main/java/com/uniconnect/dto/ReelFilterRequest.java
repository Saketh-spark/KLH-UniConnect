package com.uniconnect.dto;

import java.util.List;

public record ReelFilterRequest(
    String category,
    String subject,
    String skill,
    String semester,
    String year,
    String clubOrEvent,
    String sortBy, // recent, trending, topRated
    boolean academicOnly,
    String placementCategory // PENDING, APPROVED, FLAGGED
) {}
