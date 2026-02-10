package com.uniconnect.dto;

import java.time.Instant;
import java.util.List;

public record ExamResponse(
    String id,
    String title,
    String subject,
    String facultyId,
    String facultyName,
    String class_,
    long durationMinutes,
    int totalMarks,
    String description,
    String instructions,
    Instant startTime,
    Instant endTime,
    String status,
    boolean autoSubmitOnTimeout,
    boolean negativeMark,
    boolean shuffleQuestions,
    boolean shuffleOptions,
    int questionCount,
    boolean resultsPublished,
    int totalAttempts,
    int totalSubmitted,
    double averageScore,
    Instant createdAt,
    List<String> enrolledStudentsIds
) {}
