package com.uniconnect.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record StudentProfileUpdateRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,
        String name,
        String branch,
        String phone,
        String location,
        String joinedDate,
        String bio,
        String avatarUrl,
        String coverUrl,
        String rollNumber,
        String year,
        String gender,
        String dateOfBirth,
        String address,
        String parentName,
        String parentPhone,
        String bloodGroup,
        String section,
        String admissionDate,
        String course,
        String semester,
        Double cgpa,
        String attendanceSummary,
        String resume,
        String theme,
        String language,
        String privacySettings,
        String notificationPrefs,
        List<StatDto> stats,
        List<SocialLinkDto> socials,
        List<SkillDto> skills,
        List<CertificateDto> certificates,
        List<AwardDto> awards,
        List<ProjectDto> projects,
        List<DocumentDto> documents,
        List<InternshipDto> internships
) {
    public record StatDto(String label, Integer value) {}
    public record SocialLinkDto(String label, String url) {}
    public record SkillDto(String name, String level, Integer progress, Integer endorsements, String color) {}
    public record CertificateDto(String name, String issuer, String issued, String expires, String banner) {}
    public record AwardDto(String title, String description, String date) {}
    public record ProjectDto(String name, String description, String banner, List<String> tags, String href) {}
    public record DocumentDto(String name, String type, String fileUrl, String uploadDate, boolean verified) {}
    public record InternshipDto(String company, String role, String duration, String description) {}
}
