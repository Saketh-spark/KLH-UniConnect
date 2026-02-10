package com.uniconnect.service;

import com.uniconnect.dto.FacultyProfileResponse;
import com.uniconnect.dto.FacultyProfileUpdateRequest;
import com.uniconnect.model.Faculty;
import com.uniconnect.repository.FacultyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class FacultyProfileService {
    private final FacultyRepository facultyRepository;

    public FacultyProfileService(FacultyRepository facultyRepository) {
        this.facultyRepository = facultyRepository;
    }

    public FacultyProfileResponse getProfileByEmail(String email) {
        Faculty f = facultyRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found"));
        return toResponse(f);
    }

    public FacultyProfileResponse updateProfile(FacultyProfileUpdateRequest req) {
        Faculty f = facultyRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found"));

        if (req.name() != null) f.setName(req.name());
        if (req.employeeId() != null) f.setEmployeeId(req.employeeId());
        if (req.avatarUrl() != null) f.setAvatarUrl(req.avatarUrl());
        if (req.coverUrl() != null) f.setCoverUrl(req.coverUrl());
        if (req.department() != null) f.setDepartment(req.department());
        if (req.designation() != null) f.setDesignation(req.designation());
        if (req.phone() != null) f.setPhone(req.phone());
        if (req.officeLocation() != null) f.setOfficeLocation(req.officeLocation());
        if (req.joiningDate() != null) f.setJoiningDate(req.joiningDate());
        if (req.bio() != null) f.setBio(req.bio());
        if (req.qualification() != null) f.setQualification(req.qualification());
        if (req.specialization() != null) f.setSpecialization(req.specialization());
        if (req.experienceYears() != null) f.setExperienceYears(req.experienceYears());
        if (req.researchInterests() != null) f.setResearchInterests(req.researchInterests());
        if (req.subjectsHandled() != null) f.setSubjectsHandled(req.subjectsHandled());
        if (req.patents() != null) f.setPatents(req.patents());
        if (req.workshopsConducted() != null) f.setWorkshopsConducted(req.workshopsConducted());
        if (req.theme() != null) f.setTheme(req.theme());
        if (req.language() != null) f.setLanguage(req.language());
        if (req.privacySettings() != null) f.setPrivacySettings(req.privacySettings());
        if (req.notificationPrefs() != null) f.setNotificationPrefs(req.notificationPrefs());

        if (req.publications() != null) f.setPublications(req.publications().stream()
                .map(p -> new Faculty.Publication(p.title(), p.journal(), p.year(), p.doi())).toList());
        if (req.awards() != null) f.setAwards(req.awards().stream()
                .map(a -> new Faculty.FacultyAward(a.title(), a.description(), a.date())).toList());
        if (req.researchProjects() != null) f.setResearchProjects(req.researchProjects().stream()
                .map(r -> new Faculty.ResearchProject(r.title(), r.status(), r.funding(), r.description())).toList());
        if (req.documents() != null) f.setDocuments(req.documents().stream()
                .map(d -> new Faculty.FacultyDocument(d.name(), d.type(), d.fileUrl(), d.uploadDate())).toList());

        Faculty saved = facultyRepository.save(f);
        return toResponse(saved);
    }

    private FacultyProfileResponse toResponse(Faculty f) {
        return new FacultyProfileResponse(
                f.getId(), f.getEmail(), f.getName(), f.getEmployeeId(),
                f.getAvatarUrl(), f.getCoverUrl(), f.getDepartment(), f.getDesignation(),
                f.getPhone(), f.getOfficeLocation(), f.getJoiningDate(), f.getBio(),
                f.getQualification(), f.getSpecialization(), f.getExperienceYears(),
                f.getResearchInterests(),
                Optional.ofNullable(f.getSubjectsHandled()).orElse(Collections.emptyList()),
                Optional.ofNullable(f.getPublications()).orElse(Collections.emptyList()).stream()
                        .map(p -> new FacultyProfileResponse.PublicationDto(p.getTitle(), p.getJournal(), p.getYear(), p.getDoi())).toList(),
                Optional.ofNullable(f.getPatents()).orElse(Collections.emptyList()),
                Optional.ofNullable(f.getAwards()).orElse(Collections.emptyList()).stream()
                        .map(a -> new FacultyProfileResponse.AwardDto(a.getTitle(), a.getDescription(), a.getDate())).toList(),
                Optional.ofNullable(f.getWorkshopsConducted()).orElse(Collections.emptyList()),
                Optional.ofNullable(f.getResearchProjects()).orElse(Collections.emptyList()).stream()
                        .map(r -> new FacultyProfileResponse.ResearchProjectDto(r.getTitle(), r.getStatus(), r.getFunding(), r.getDescription())).toList(),
                Optional.ofNullable(f.getDocuments()).orElse(Collections.emptyList()).stream()
                        .map(d -> new FacultyProfileResponse.DocumentDto(d.getName(), d.getType(), d.getFileUrl(), d.getUploadDate())).toList(),
                f.getTheme(), f.getLanguage(), f.getPrivacySettings(), f.getNotificationPrefs()
        );
    }
}
