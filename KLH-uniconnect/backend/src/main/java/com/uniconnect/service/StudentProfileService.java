package com.uniconnect.service;

import com.uniconnect.dto.StudentProfileResponse;
import com.uniconnect.dto.StudentProfileUpdateRequest;
import com.uniconnect.model.Student;
import com.uniconnect.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class StudentProfileService {
    private final StudentRepository studentRepository;

    public StudentProfileService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public StudentProfileResponse getProfileByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        
        // Initialize profile fields with empty values if not set
        if (student.getName() == null) student.setName("");
        if (student.getBranch() == null) student.setBranch("");
        if (student.getPhone() == null) student.setPhone("");
        if (student.getLocation() == null) student.setLocation("");
        if (student.getJoinedDate() == null) student.setJoinedDate("");
        if (student.getBio() == null) student.setBio("");
        if (student.getAvatarUrl() == null) student.setAvatarUrl("");
        if (student.getCoverUrl() == null) student.setCoverUrl("");
        if (student.getRollNumber() == null) student.setRollNumber("");
        if (student.getYear() == null) student.setYear("");
        
        return toResponse(student);
    }

    public StudentProfileResponse updateProfile(StudentProfileUpdateRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (request.name() != null) student.setName(request.name());
        if (request.branch() != null) student.setBranch(request.branch());
        if (request.phone() != null) student.setPhone(request.phone());
        if (request.location() != null) student.setLocation(request.location());
        if (request.joinedDate() != null) student.setJoinedDate(request.joinedDate());
        if (request.bio() != null) student.setBio(request.bio());
        if (request.avatarUrl() != null) student.setAvatarUrl(request.avatarUrl());
        if (request.coverUrl() != null) student.setCoverUrl(request.coverUrl());
        if (request.rollNumber() != null) student.setRollNumber(request.rollNumber());
        if (request.year() != null) student.setYear(request.year());
        if (request.gender() != null) student.setGender(request.gender());
        if (request.dateOfBirth() != null) student.setDateOfBirth(request.dateOfBirth());
        if (request.address() != null) student.setAddress(request.address());
        if (request.parentName() != null) student.setParentName(request.parentName());
        if (request.parentPhone() != null) student.setParentPhone(request.parentPhone());
        if (request.bloodGroup() != null) student.setBloodGroup(request.bloodGroup());
        if (request.section() != null) student.setSection(request.section());
        if (request.admissionDate() != null) student.setAdmissionDate(request.admissionDate());
        if (request.course() != null) student.setCourse(request.course());
        if (request.semester() != null) student.setSemester(request.semester());
        if (request.cgpa() != null) student.setCgpa(request.cgpa());
        if (request.attendanceSummary() != null) student.setAttendanceSummary(request.attendanceSummary());
        if (request.resume() != null) student.setResume(request.resume());
        if (request.theme() != null) student.setTheme(request.theme());
        if (request.language() != null) student.setLanguage(request.language());
        if (request.privacySettings() != null) student.setPrivacySettings(request.privacySettings());
        if (request.notificationPrefs() != null) student.setNotificationPrefs(request.notificationPrefs());

        if (request.stats() != null) student.setStats(mapStats(request.stats()));
        if (request.socials() != null) student.setSocials(mapSocials(request.socials()));
        if (request.skills() != null) student.setSkills(mapSkills(request.skills()));
        if (request.certificates() != null) student.setCertificates(mapCertificates(request.certificates()));
        if (request.awards() != null) student.setAwards(mapAwards(request.awards()));
        if (request.projects() != null) student.setProjects(mapProjects(request.projects()));
        if (request.documents() != null) student.setDocuments(mapDocuments(request.documents()));
        if (request.internships() != null) student.setInternships(mapInternships(request.internships()));

        Student saved = studentRepository.save(student);
        return toResponse(saved);
    }

    private StudentProfileResponse toResponse(Student student) {
        return new StudentProfileResponse(
                student.getId(),
                student.getName(),
                student.getBranch(),
                student.getEmail(),
                student.getPhone(),
                student.getLocation(),
                student.getJoinedDate(),
                student.getBio(),
                student.getAvatarUrl(),
                student.getCoverUrl(),
                student.getRollNumber(),
                student.getYear(),
                student.getGender(),
                student.getDateOfBirth(),
                student.getAddress(),
                student.getParentName(),
                student.getParentPhone(),
                student.getBloodGroup(),
                student.getSection(),
                student.getAdmissionDate(),
                student.getCourse(),
                student.getSemester(),
                student.getCgpa(),
                student.getAttendanceSummary(),
                student.getResume(),
                student.getTheme(),
                student.getLanguage(),
                student.getPrivacySettings(),
                student.getNotificationPrefs(),
                toStatDtos(student.getStats()),
                toSocialDtos(student.getSocials()),
                toSkillDtos(student.getSkills()),
                toCertificateDtos(student.getCertificates()),
                toAwardDtos(student.getAwards()),
                toProjectDtos(student.getProjects()),
                toDocumentDtos(student.getDocuments()),
                toInternshipDtos(student.getInternships())
        );
    }

    private List<Student.Stat> mapStats(List<StudentProfileUpdateRequest.StatDto> stats) {
        return Optional.ofNullable(stats)
                .orElse(Collections.emptyList())
                .stream()
                .map(s -> new Student.Stat(s.label(), s.value()))
                .toList();
    }

    private List<Student.SocialLink> mapSocials(List<StudentProfileUpdateRequest.SocialLinkDto> socials) {
        return Optional.ofNullable(socials)
                .orElse(Collections.emptyList())
                .stream()
                .map(s -> new Student.SocialLink(s.label(), s.url()))
                .toList();
    }

    private List<Student.Skill> mapSkills(List<StudentProfileUpdateRequest.SkillDto> skills) {
        return Optional.ofNullable(skills)
                .orElse(Collections.emptyList())
                .stream()
                .map(s -> new Student.Skill(s.name(), s.level(), s.progress(), s.endorsements(), s.color()))
                .toList();
    }

    private List<Student.Certificate> mapCertificates(List<StudentProfileUpdateRequest.CertificateDto> certificates) {
        return Optional.ofNullable(certificates)
                .orElse(Collections.emptyList())
                .stream()
                .map(c -> new Student.Certificate(c.name(), c.issuer(), c.issued(), c.expires(), c.banner()))
                .toList();
    }

    private List<Student.Award> mapAwards(List<StudentProfileUpdateRequest.AwardDto> awards) {
        return Optional.ofNullable(awards)
                .orElse(Collections.emptyList())
                .stream()
                .map(a -> new Student.Award(a.title(), a.description(), a.date()))
                .toList();
    }

    private List<Student.Project> mapProjects(List<StudentProfileUpdateRequest.ProjectDto> projects) {
        return Optional.ofNullable(projects)
                .orElse(Collections.emptyList())
                .stream()
                .map(p -> new Student.Project(p.name(), p.description(), p.banner(), p.tags(), p.href()))
                .toList();
    }

    private List<StudentProfileResponse.StatDto> toStatDtos(List<Student.Stat> stats) {
        return Optional.ofNullable(stats)
                .orElse(Collections.emptyList())
                .stream()
                .map(s -> new StudentProfileResponse.StatDto(s.getLabel(), s.getValue()))
                .toList();
    }

    private List<StudentProfileResponse.SocialLinkDto> toSocialDtos(List<Student.SocialLink> socials) {
        return Optional.ofNullable(socials)
                .orElse(Collections.emptyList())
                .stream()
                .map(s -> new StudentProfileResponse.SocialLinkDto(s.getLabel(), s.getUrl()))
                .toList();
    }

    private List<StudentProfileResponse.SkillDto> toSkillDtos(List<Student.Skill> skills) {
        return Optional.ofNullable(skills)
                .orElse(Collections.emptyList())
                .stream()
                .map(s -> new StudentProfileResponse.SkillDto(s.getName(), s.getLevel(), s.getProgress(), s.getEndorsements(), s.getColor()))
                .toList();
    }

    private List<StudentProfileResponse.CertificateDto> toCertificateDtos(List<Student.Certificate> certificates) {
        return Optional.ofNullable(certificates)
                .orElse(Collections.emptyList())
                .stream()
                .map(c -> new StudentProfileResponse.CertificateDto(c.getName(), c.getIssuer(), c.getIssued(), c.getExpires(), c.getBanner()))
                .toList();
    }

    private List<StudentProfileResponse.AwardDto> toAwardDtos(List<Student.Award> awards) {
        return Optional.ofNullable(awards)
                .orElse(Collections.emptyList())
                .stream()
                .map(a -> new StudentProfileResponse.AwardDto(a.getTitle(), a.getDescription(), a.getDate()))
                .toList();
    }

    private List<StudentProfileResponse.ProjectDto> toProjectDtos(List<Student.Project> projects) {
        return Optional.ofNullable(projects)
                .orElse(Collections.emptyList())
                .stream()
                .map(p -> new StudentProfileResponse.ProjectDto(p.getName(), p.getDescription(), p.getBanner(), p.getTags(), p.getHref()))
                .toList();
    }

    private List<Student.ProfileDocument> mapDocuments(List<StudentProfileUpdateRequest.DocumentDto> docs) {
        return Optional.ofNullable(docs).orElse(Collections.emptyList()).stream()
                .map(d -> new Student.ProfileDocument(d.name(), d.type(), d.fileUrl(), d.uploadDate(), d.verified()))
                .toList();
    }

    private List<Student.Internship> mapInternships(List<StudentProfileUpdateRequest.InternshipDto> internships) {
        return Optional.ofNullable(internships).orElse(Collections.emptyList()).stream()
                .map(i -> new Student.Internship(i.company(), i.role(), i.duration(), i.description()))
                .toList();
    }

    private List<StudentProfileResponse.DocumentDto> toDocumentDtos(List<Student.ProfileDocument> docs) {
        return Optional.ofNullable(docs).orElse(Collections.emptyList()).stream()
                .map(d -> new StudentProfileResponse.DocumentDto(d.getName(), d.getType(), d.getFileUrl(), d.getUploadDate(), d.isVerified()))
                .toList();
    }

    private List<StudentProfileResponse.InternshipDto> toInternshipDtos(List<Student.Internship> internships) {
        return Optional.ofNullable(internships).orElse(Collections.emptyList()).stream()
                .map(i -> new StudentProfileResponse.InternshipDto(i.getCompany(), i.getRole(), i.getDuration(), i.getDescription()))
                .toList();
    }
}
