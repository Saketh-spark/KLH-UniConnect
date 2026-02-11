package com.uniconnect.controller;

import com.uniconnect.model.Faculty;
import com.uniconnect.model.Job;
import com.uniconnect.model.Student;
import com.uniconnect.repository.FacultyRepository;
import com.uniconnect.repository.JobRepository;
import com.uniconnect.repository.StudentRepository;
import com.uniconnect.repository.OpportunityApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discover")
@CrossOrigin(originPatterns = "*")
public class DiscoverController {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final JobRepository jobRepository;
    private final OpportunityApplicationRepository appRepo;

    public DiscoverController(StudentRepository studentRepository,
                              FacultyRepository facultyRepository,
                              JobRepository jobRepository,
                              OpportunityApplicationRepository appRepo) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.jobRepository = jobRepository;
        this.appRepo = appRepo;
    }

    /* ───────────── PEOPLE: Students ───────────── */
    @GetMapping("/students")
    public List<Map<String, Object>> discoverStudents(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String excludeEmail) {
        List<Student> all = studentRepository.findAll();
        return all.stream()
                .filter(s -> s.getName() != null && !s.getName().trim().isEmpty())
                .filter(s -> excludeEmail == null || !excludeEmail.equalsIgnoreCase(s.getEmail()))
                .filter(s -> q == null || q.isEmpty() ||
                        (s.getName() != null && s.getName().toLowerCase().contains(q.toLowerCase())) ||
                        (s.getEmail() != null && s.getEmail().toLowerCase().contains(q.toLowerCase())) ||
                        (s.getBranch() != null && s.getBranch().toLowerCase().contains(q.toLowerCase())))
                .filter(s -> department == null || department.isEmpty() ||
                        (s.getBranch() != null && s.getBranch().toLowerCase().contains(department.toLowerCase())))
                .filter(s -> year == null || year.isEmpty() ||
                        (s.getYear() != null && s.getYear().equalsIgnoreCase(year)))
                .filter(s -> skill == null || skill.isEmpty() ||
                        (s.getSkills() != null && s.getSkills().stream()
                                .anyMatch(sk -> sk.getName() != null && sk.getName().toLowerCase().contains(skill.toLowerCase()))))
                .map(this::studentToCard)
                .collect(Collectors.toList());
    }

    /* ───────────── PEOPLE: Faculty ───────────── */
    @GetMapping("/faculty")
    public List<Map<String, Object>> discoverFaculty(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String excludeEmail) {
        List<Faculty> all = facultyRepository.findAll();
        return all.stream()
                .filter(f -> f.getName() != null && !f.getName().trim().isEmpty())
                .filter(f -> excludeEmail == null || !excludeEmail.equalsIgnoreCase(f.getEmail()))
                .filter(f -> q == null || q.isEmpty() ||
                        (f.getName() != null && f.getName().toLowerCase().contains(q.toLowerCase())) ||
                        (f.getEmail() != null && f.getEmail().toLowerCase().contains(q.toLowerCase())) ||
                        (f.getDepartment() != null && f.getDepartment().toLowerCase().contains(q.toLowerCase())))
                .filter(f -> department == null || department.isEmpty() ||
                        (f.getDepartment() != null && f.getDepartment().toLowerCase().contains(department.toLowerCase())))
                .filter(f -> specialization == null || specialization.isEmpty() ||
                        (f.getSpecialization() != null && f.getSpecialization().toLowerCase().contains(specialization.toLowerCase())))
                .map(this::facultyToCard)
                .collect(Collectors.toList());
    }

    /* ───────────── OPPORTUNITIES ───────────── */
    @GetMapping("/opportunities")
    public List<Map<String, Object>> discoverOpportunities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) String q) {
        List<Job> jobs = jobRepository.findAll();
        return jobs.stream()
                .filter(j -> q == null || q.isEmpty() ||
                        (j.getPosition() != null && j.getPosition().toLowerCase().contains(q.toLowerCase())) ||
                        (j.getCompany() != null && j.getCompany().toLowerCase().contains(q.toLowerCase())))
                .filter(j -> type == null || type.isEmpty() || "All".equalsIgnoreCase(type) ||
                        (j.getType() != null && j.getType().toLowerCase().contains(type.toLowerCase())))
                .filter(j -> domain == null || domain.isEmpty() ||
                        (j.getBranch() != null && j.getBranch().stream().anyMatch(b -> b.toLowerCase().contains(domain.toLowerCase()))))
                .map(this::jobToCard)
                .collect(Collectors.toList());
    }

    /* ───────────── FULL PROFILE: Student by email ───────────── */
    @GetMapping("/profile/student")
    public Map<String, Object> getStudentProfile(@RequestParam String email) {
        return studentRepository.findByEmail(email)
                .map(this::studentToFullProfile)
                .orElse(Map.of("error", "Student not found"));
    }

    /* ───────────── FULL PROFILE: Faculty by email ───────────── */
    @GetMapping("/profile/faculty")
    public Map<String, Object> getFacultyProfile(@RequestParam String email) {
        return facultyRepository.findByEmail(email)
                .map(this::facultyToFullProfile)
                .orElse(Map.of("error", "Faculty not found"));
    }

    /* ───────────── CREATE OPPORTUNITY (Faculty) ───────────── */
    @PostMapping("/opportunities")
    public ResponseEntity<?> createOpportunity(@RequestBody Map<String, Object> body) {
        Job job = new Job();
        job.setPosition((String) body.get("position"));
        job.setCompany((String) body.getOrDefault("company", "KLH University"));
        job.setType((String) body.getOrDefault("type", "Internship"));
        job.setSalary((String) body.getOrDefault("salary", ""));
        job.setDescription((String) body.getOrDefault("description", ""));
        job.setLocation((String) body.getOrDefault("location", ""));
        job.setDeadline((String) body.getOrDefault("deadline", ""));
        job.setExperience((String) body.getOrDefault("experience", "Fresher"));
        job.setCreatedBy((String) body.get("createdBy"));
        job.setStatus("Active");
        if (body.containsKey("minCGPA")) job.setMinCGPA(((Number) body.get("minCGPA")).doubleValue());
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) body.getOrDefault("skills", List.of());
        job.setSkills(skills);
        @SuppressWarnings("unchecked")
        List<String> branch = (List<String>) body.getOrDefault("branch", List.of());
        job.setBranch(branch);
        jobRepository.save(job);
        return ResponseEntity.ok(Map.of("id", job.getId(), "status", "CREATED"));
    }

    /* ───────────── DELETE OPPORTUNITY ───────────── */
    @DeleteMapping("/opportunities/{id}")
    public ResponseEntity<?> deleteOpportunity(@PathVariable String id, @RequestParam String email) {
        Optional<Job> opt = jobRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Job job = opt.get();
        if (!email.equals(job.getCreatedBy())) {
            return ResponseEntity.status(403).body(Map.of("error", "Only creator can delete"));
        }
        jobRepository.delete(job);
        return ResponseEntity.ok(Map.of("status", "DELETED"));
    }

    /* ───────────── GET APPLICATIONS FOR AN OPPORTUNITY ───────────── */
    @GetMapping("/opportunities/{id}/applications")
    public ResponseEntity<?> getApplications(@PathVariable String id) {
        return ResponseEntity.ok(appRepo.findByOpportunityId(id));
    }

    /* ───────────── CLEANUP: Remove unnamed records ───────────── */
    @DeleteMapping("/cleanup/unnamed")
    public ResponseEntity<?> cleanupUnnamedRecords() {
        List<Student> allStudents = studentRepository.findAll();
        List<Faculty> allFaculty = facultyRepository.findAll();
        int removedStudents = 0, removedFaculty = 0;
        for (Student s : allStudents) {
            if (s.getName() == null || s.getName().trim().isEmpty()) {
                studentRepository.delete(s);
                removedStudents++;
            }
        }
        for (Faculty f : allFaculty) {
            if (f.getName() == null || f.getName().trim().isEmpty()) {
                facultyRepository.delete(f);
                removedFaculty++;
            }
        }
        return ResponseEntity.ok(Map.of(
            "removedStudents", removedStudents,
            "removedFaculty", removedFaculty,
            "message", "Cleanup complete"
        ));
    }

    /* ───────────── STATS ───────────── */
    @GetMapping("/stats")
    public Map<String, Object> getDiscoverStats() {
        Map<String, Object> stats = new HashMap<>();
        long validStudents = studentRepository.findAll().stream()
            .filter(s -> s.getName() != null && !s.getName().trim().isEmpty()).count();
        long validFaculty = facultyRepository.findAll().stream()
            .filter(f -> f.getName() != null && !f.getName().trim().isEmpty()).count();
        stats.put("totalStudents", validStudents);
        stats.put("totalFaculty", validFaculty);
        stats.put("totalOpportunities", jobRepository.count());
        return stats;
    }

    /* ───────────── Mappers ───────────── */
    private Map<String, Object> studentToCard(Student s) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", s.getId());
        card.put("type", "student");
        card.put("name", s.getName());
        card.put("email", s.getEmail());
        card.put("rollNumber", s.getRollNumber());
        card.put("branch", s.getBranch());
        card.put("year", s.getYear());
        card.put("semester", s.getSemester());
        card.put("cgpa", s.getCgpa());
        card.put("bio", s.getBio());
        card.put("avatarUrl", s.getAvatarUrl());
        card.put("skills", s.getSkills() != null
                ? s.getSkills().stream().map(sk -> sk.getName()).filter(Objects::nonNull).collect(Collectors.toList())
                : List.of());
        card.put("projects", s.getProjects() != null ? s.getProjects().size() : 0);
        card.put("certificates", s.getCertificates() != null ? s.getCertificates().size() : 0);
        card.put("awards", s.getAwards() != null ? s.getAwards().size() : 0);
        card.put("internships", s.getInternships() != null ? s.getInternships().size() : 0);
        return card;
    }

    private Map<String, Object> facultyToCard(Faculty f) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", f.getId());
        card.put("type", "faculty");
        card.put("name", f.getName());
        card.put("email", f.getEmail());
        card.put("employeeId", f.getEmployeeId());
        card.put("department", f.getDepartment());
        card.put("designation", f.getDesignation());
        card.put("specialization", f.getSpecialization());
        card.put("qualification", f.getQualification());
        card.put("experienceYears", f.getExperienceYears());
        card.put("bio", f.getBio());
        card.put("avatarUrl", f.getAvatarUrl());
        card.put("subjectsHandled", f.getSubjectsHandled() != null ? f.getSubjectsHandled() : List.of());
        card.put("researchInterests", f.getResearchInterests() != null ? f.getResearchInterests() : List.of());
        card.put("publications", f.getPublications() != null ? f.getPublications().size() : 0);
        card.put("patents", f.getPatents() != null ? f.getPatents().size() : 0);
        return card;
    }

    private Map<String, Object> jobToCard(Job j) {
        Map<String, Object> card = new LinkedHashMap<>();
        card.put("id", j.getId());
        card.put("title", j.getPosition());
        card.put("company", j.getCompany());
        card.put("type", j.getType());
        card.put("location", j.getLocation());
        card.put("salary", j.getSalary());
        card.put("description", j.getDescription());
        card.put("status", j.getStatus());
        card.put("branch", j.getBranch());
        card.put("deadline", j.getDeadline());
        card.put("minCGPA", j.getMinCGPA());
        card.put("skillsRequired", j.getSkills());
        card.put("applicants", j.getApplicants());
        card.put("experience", j.getExperience());
        return card;
    }

    /* ───────────── Full Profile Mappers ───────────── */

    private Map<String, Object> studentToFullProfile(Student s) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("type", "student");
        p.put("id", s.getId());
        p.put("name", s.getName());
        p.put("email", s.getEmail());
        p.put("rollNumber", s.getRollNumber());
        p.put("branch", s.getBranch());
        p.put("year", s.getYear());
        p.put("semester", s.getSemester());
        p.put("course", s.getCourse());
        p.put("section", s.getSection());
        p.put("cgpa", s.getCgpa());
        p.put("bio", s.getBio());
        p.put("location", s.getLocation());
        p.put("avatarUrl", s.getAvatarUrl());
        p.put("coverUrl", s.getCoverUrl());
        p.put("gender", s.getGender());

        // Skills — full detail with name, level, progress
        p.put("skills", s.getSkills() != null ? s.getSkills().stream().map(sk -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", sk.getName());
            m.put("level", sk.getLevel());
            m.put("progress", sk.getProgress());
            m.put("endorsements", sk.getEndorsements());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        // Projects — full detail
        p.put("projects", s.getProjects() != null ? s.getProjects().stream().map(pr -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", pr.getName());
            m.put("description", pr.getDescription());
            m.put("tags", pr.getTags());
            m.put("href", pr.getHref());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        // Certificates
        p.put("certificates", s.getCertificates() != null ? s.getCertificates().stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", c.getName());
            m.put("issuer", c.getIssuer());
            m.put("issued", c.getIssued());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        // Awards
        p.put("awards", s.getAwards() != null ? s.getAwards().stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", a.getTitle());
            m.put("description", a.getDescription());
            m.put("date", a.getDate());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        // Internships
        p.put("internships", s.getInternships() != null ? s.getInternships().stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("company", i.getCompany());
            m.put("role", i.getRole());
            m.put("duration", i.getDuration());
            m.put("description", i.getDescription());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        // Socials
        p.put("socials", s.getSocials() != null ? s.getSocials().stream().map(so -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label", so.getLabel());
            m.put("url", so.getUrl());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        return p;
    }

    private Map<String, Object> facultyToFullProfile(Faculty f) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("type", "faculty");
        p.put("id", f.getId());
        p.put("name", f.getName());
        p.put("email", f.getEmail());
        p.put("employeeId", f.getEmployeeId());
        p.put("department", f.getDepartment());
        p.put("designation", f.getDesignation());
        p.put("specialization", f.getSpecialization());
        p.put("qualification", f.getQualification());
        p.put("experienceYears", f.getExperienceYears());
        p.put("bio", f.getBio());
        p.put("avatarUrl", f.getAvatarUrl());
        p.put("coverUrl", f.getCoverUrl());
        p.put("officeLocation", f.getOfficeLocation());
        p.put("researchInterests", f.getResearchInterests());
        p.put("subjectsHandled", f.getSubjectsHandled() != null ? f.getSubjectsHandled() : List.of());

        // Publications
        p.put("publications", f.getPublications() != null ? f.getPublications().stream().map(pub -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", pub.getTitle());
            m.put("journal", pub.getJournal());
            m.put("year", pub.getYear());
            m.put("doi", pub.getDoi());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        // Awards
        p.put("awards", f.getAwards() != null ? f.getAwards().stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", a.getTitle());
            m.put("description", a.getDescription());
            m.put("date", a.getDate());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        p.put("patents", f.getPatents() != null ? f.getPatents() : List.of());
        p.put("workshopsConducted", f.getWorkshopsConducted() != null ? f.getWorkshopsConducted() : List.of());

        // Research Projects
        p.put("researchProjects", f.getResearchProjects() != null ? f.getResearchProjects().stream().map(rp -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", rp.getTitle());
            m.put("status", rp.getStatus());
            m.put("funding", rp.getFunding());
            m.put("description", rp.getDescription());
            return m;
        }).collect(java.util.stream.Collectors.toList()) : List.of());

        return p;
    }
}
