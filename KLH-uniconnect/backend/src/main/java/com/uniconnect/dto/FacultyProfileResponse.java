package com.uniconnect.dto;

import java.util.List;

public record FacultyProfileResponse(
        String id,
        String email,
        String name,
        String employeeId,
        String avatarUrl,
        String coverUrl,
        String department,
        String designation,
        String phone,
        String officeLocation,
        String joiningDate,
        String bio,
        String qualification,
        String specialization,
        Integer experienceYears,
        String researchInterests,
        List<String> subjectsHandled,
        List<PublicationDto> publications,
        List<String> patents,
        List<AwardDto> awards,
        List<String> workshopsConducted,
        List<ResearchProjectDto> researchProjects,
        List<DocumentDto> documents,
        String theme,
        String language,
        String privacySettings,
        String notificationPrefs
) {
    public record PublicationDto(String title, String journal, String year, String doi) {}
    public record AwardDto(String title, String description, String date) {}
    public record ResearchProjectDto(String title, String status, String funding, String description) {}
    public record DocumentDto(String name, String type, String fileUrl, String uploadDate) {}
}
