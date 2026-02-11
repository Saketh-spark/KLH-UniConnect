package com.uniconnect.controller;

import com.uniconnect.model.CollabProject;
import com.uniconnect.model.ProjectJoinRequest;
import com.uniconnect.model.Student;
import com.uniconnect.model.Faculty;
import com.uniconnect.repository.CollabProjectRepository;
import com.uniconnect.repository.ProjectJoinRequestRepository;
import com.uniconnect.repository.StudentRepository;
import com.uniconnect.repository.FacultyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(originPatterns = "*")
public class ProjectController {

    private final CollabProjectRepository projRepo;
    private final ProjectJoinRequestRepository joinRepo;
    private final StudentRepository studentRepo;
    private final FacultyRepository facultyRepo;

    public ProjectController(CollabProjectRepository projRepo, ProjectJoinRequestRepository joinRepo,
                             StudentRepository studentRepo, FacultyRepository facultyRepo) {
        this.projRepo = projRepo;
        this.joinRepo = joinRepo;
        this.studentRepo = studentRepo;
        this.facultyRepo = facultyRepo;
    }

    /* ───────── List all projects ───────── */
    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String domain,
                                          @RequestParam(required = false) String status,
                                          @RequestParam(required = false) String email) {
        List<CollabProject> all;
        if (status != null && !status.isEmpty() && !"All".equals(status)) {
            all = projRepo.findByStatusOrderByCreatedAtDesc(status);
        } else if (domain != null && !domain.isEmpty() && !"All".equals(domain)) {
            all = projRepo.findByDomainOrderByCreatedAtDesc(domain);
        } else {
            all = projRepo.findAllByOrderByCreatedAtDesc();
        }

        return all.stream().map(p -> toMap(p, email)).collect(Collectors.toList());
    }

    /* ───────── Get single project ───────── */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable String id, @RequestParam(required = false) String email) {
        Optional<CollabProject> opt = projRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CollabProject p = opt.get();
        Map<String, Object> m = toMap(p, email);
        // Add pending join requests count for owner
        if (email != null && email.equals(p.getOwnerEmail())) {
            m.put("pendingRequests", joinRepo.countByProjectIdAndStatus(id, "PENDING"));
        }
        return ResponseEntity.ok(m);
    }

    /* ───────── Create project ───────── */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        CollabProject p = new CollabProject();
        p.setName((String) body.get("name"));
        p.setDescription((String) body.get("description"));
        p.setOwnerEmail((String) body.get("ownerEmail"));
        p.setOwnerName((String) body.getOrDefault("ownerName", ""));
        p.setDomain((String) body.getOrDefault("domain", "General"));
        @SuppressWarnings("unchecked")
        List<String> tech = (List<String>) body.getOrDefault("techStack", List.of());
        p.setTechStack(tech);
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) body.getOrDefault("rolesNeeded", List.of());
        p.setRolesNeeded(roles);
        p.setMaxMembers(body.containsKey("maxMembers") ? ((Number) body.get("maxMembers")).intValue() : 10);
        p.setRepoUrl((String) body.getOrDefault("repoUrl", ""));
        // Owner is first member — look up real name/roll
        String ownerEmail = (String) body.get("ownerEmail");
        String[] ownerInfo = lookupPerson(ownerEmail);
        p.getMembers().add(new CollabProject.Member(
            ownerEmail, ownerInfo[0], "Owner", ownerInfo[1], ownerInfo[2]
        ));
        projRepo.save(p);
        return ResponseEntity.ok(Map.of("id", p.getId(), "status", "CREATED"));
    }

    /* ───────── Request to join ───────── */
    @PostMapping("/{id}/join")
    public ResponseEntity<?> requestJoin(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<CollabProject> opt = projRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CollabProject proj = opt.get();

        String email = body.get("email");
        // Check if already a member
        boolean isMember = proj.getMembers().stream().anyMatch(m -> m.getEmail().equals(email));
        if (isMember) return ResponseEntity.ok(Map.of("status", "ALREADY_MEMBER"));

        // Check member limit
        if (proj.getMembers().size() >= proj.getMaxMembers()) {
            return ResponseEntity.ok(Map.of("status", "TEAM_FULL", "message", "This team has reached the maximum member limit"));
        }

        // Check if already requested
        Optional<ProjectJoinRequest> existing = joinRepo.findByApplicantEmailAndProjectId(email, id);
        if (existing.isPresent()) {
            String st = existing.get().getStatus();
            if ("PENDING".equals(st)) return ResponseEntity.ok(Map.of("status", "ALREADY_REQUESTED"));
            if ("ACCEPTED".equals(st)) return ResponseEntity.ok(Map.of("status", "ALREADY_MEMBER"));
        }

        ProjectJoinRequest jr = new ProjectJoinRequest();
        jr.setProjectId(id);
        jr.setProjectName(proj.getName());
        jr.setApplicantEmail(email);
        jr.setApplicantName(body.getOrDefault("name", ""));
        jr.setRole(body.getOrDefault("role", ""));
        jr.setMessage(body.getOrDefault("message", ""));
        joinRepo.save(jr);

        return ResponseEntity.ok(Map.of("status", "REQUESTED", "id", jr.getId()));
    }

    /* ───────── Get join requests for a project (owner only) ───────── */
    @GetMapping("/{id}/join-requests")
    public ResponseEntity<?> getJoinRequests(@PathVariable String id, @RequestParam String email) {
        Optional<CollabProject> opt = projRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        if (!opt.get().getOwnerEmail().equals(email)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only the project owner can view join requests"));
        }
        return ResponseEntity.ok(joinRepo.findByProjectIdAndStatus(id, "PENDING"));
    }

    /* ───────── Accept / Reject join request ───────── */
    @PutMapping("/join-request/{requestId}")
    public ResponseEntity<?> respondJoinRequest(@PathVariable String requestId, @RequestBody Map<String, String> body) {
        String action = body.get("action"); // "accept" or "reject"
        Optional<ProjectJoinRequest> opt = joinRepo.findById(requestId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        ProjectJoinRequest jr = opt.get();

        if ("accept".equalsIgnoreCase(action)) {
            // Add to project members
            Optional<CollabProject> projOpt = projRepo.findById(jr.getProjectId());
            if (projOpt.isEmpty()) return ResponseEntity.notFound().build();

            CollabProject proj = projOpt.get();
            if (proj.getMembers().size() >= proj.getMaxMembers()) {
                return ResponseEntity.ok(Map.of("status", "TEAM_FULL", "message", "Team is full, cannot accept"));
            }

            String[] memberInfo = lookupPerson(jr.getApplicantEmail());
            proj.getMembers().add(new CollabProject.Member(
                jr.getApplicantEmail(), memberInfo[0], jr.getRole(), memberInfo[1], memberInfo[2]
            ));
            // Remove the role from rolesNeeded if present
            if (jr.getRole() != null && !jr.getRole().isEmpty()) {
                proj.getRolesNeeded().remove(jr.getRole());
            }
            proj.setUpdatedAt(Instant.now());
            projRepo.save(proj);

            jr.setStatus("ACCEPTED");
        } else if ("reject".equalsIgnoreCase(action)) {
            jr.setStatus("REJECTED");
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action"));
        }
        jr.setUpdatedAt(Instant.now());
        joinRepo.save(jr);
        return ResponseEntity.ok(Map.of("status", jr.getStatus(), "id", jr.getId()));
    }

    /* ───────── My projects (that I own or am a member of) ───────── */
    @GetMapping("/mine")
    public List<Map<String, Object>> myProjects(@RequestParam String email) {
        List<CollabProject> all = projRepo.findAllByOrderByCreatedAtDesc();
        return all.stream()
            .filter(p -> p.getOwnerEmail().equals(email) || p.getMembers().stream().anyMatch(m -> m.getEmail().equals(email)))
            .map(p -> toMap(p, email))
            .collect(Collectors.toList());
    }

    /* ───────── Mentor a project (Faculty only) ───────── */
    @PostMapping("/{id}/mentor")
    public ResponseEntity<?> mentorProject(@PathVariable String id, @RequestBody Map<String, String> body) {
        String mentorEmail = body.get("email");
        String mentorName = body.getOrDefault("name", "");
        if (mentorEmail == null) return ResponseEntity.badRequest().body(Map.of("error", "email required"));

        Optional<CollabProject> opt = projRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        CollabProject proj = opt.get();
        proj.setMentorEmail(mentorEmail);
        proj.setMentorName(mentorName);
        proj.setUpdatedAt(Instant.now());
        projRepo.save(proj);
        return ResponseEntity.ok(Map.of("status", "MENTORED", "mentorEmail", mentorEmail, "mentorName", mentorName));
    }

    /* ───────── Seed mock projects ───────── */
    @PostMapping("/seed")
    public ResponseEntity<?> seed() {
        if (projRepo.count() > 0) return ResponseEntity.ok(Map.of("status", "ALREADY_SEEDED"));

        List<CollabProject> projects = List.of(
            mkProject("Smart Campus Navigator", "AR-based indoor navigation for university campus buildings. Easy wayfinding for students and visitors.",
                "phoenix@klh.edu.in", "Team Phoenix", "Mobile", List.of("React Native", "Node.js", "MongoDB", "AR"),
                List.of("UI/UX Designer", "Backend Dev"), 6),
            mkProject("AI Attendance System", "Face recognition based attendance with liveness detection and cheating prevention mechanisms.",
                "ml.club@klh.edu.in", "ML Enthusiasts", "AI/ML", List.of("Python", "TensorFlow", "OpenCV", "Django"),
                List.of("Frontend Developer"), 5),
            mkProject("Blockchain Certificates", "Tamper-proof university certificate verification system on blockchain. Secure credential management.",
                "crypto@klh.edu.in", "CryptoDevs", "Blockchain", List.of("Solidity", "React", "IPFS", "Web3"),
                List.of(), 5),
            mkProject("EcoTrack Carbon Footprint", "Track personal carbon footprint with AI-driven reduction recommendations and community engagement.",
                "green@klh.edu.in", "Green Coders", "Sustainability", List.of("Flutter", "Firebase", "ML", "Python"),
                List.of("Data Analyst", "Flutter Dev"), 5),
            mkProject("UniConnect Chat Platform", "Real-time chat platform for university students and faculty collaboration. End-to-end encrypted.",
                "devsquad@klh.edu.in", "DevSquad", "Web", List.of("React", "Spring Boot", "WebSocket", "PostgreSQL"),
                List.of("DevOps"), 6)
        );
        projRepo.saveAll(projects);
        return ResponseEntity.ok(Map.of("status", "SEEDED", "count", projects.size()));
    }

    /* ─── helpers ─── */

    /** Look up name, rollNumber, branch from student DB (or faculty). Returns [name, rollNumber, branch]. */
    private String[] lookupPerson(String email) {
        if (email == null) return new String[]{"", "", ""};
        Optional<Student> sOpt = studentRepo.findByEmail(email);
        if (sOpt.isPresent()) {
            Student s = sOpt.get();
            return new String[]{
                s.getName() != null ? s.getName() : "",
                s.getRollNumber() != null ? s.getRollNumber() : "",
                s.getBranch() != null ? s.getBranch() : ""
            };
        }
        Optional<Faculty> fOpt = facultyRepo.findByEmail(email);
        if (fOpt.isPresent()) {
            Faculty f = fOpt.get();
            return new String[]{
                f.getName() != null ? f.getName() : "",
                "",
                f.getDepartment() != null ? f.getDepartment() : ""
            };
        }
        return new String[]{"", "", ""};
    }

    /** Build enriched member maps with real names/rollNumbers from the DB. */
    private List<Map<String, Object>> enrichMembers(List<CollabProject.Member> members) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (CollabProject.Member m : members) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("email", m.getEmail());
            // Use stored name/rollNumber, falling back to DB lookup if empty
            String name = m.getName();
            String rollNumber = m.getRollNumber();
            String branch = m.getBranch();
            if ((name == null || name.isEmpty()) && m.getEmail() != null) {
                String[] info = lookupPerson(m.getEmail());
                name = info[0]; rollNumber = info[1]; branch = info[2];
            }
            map.put("name", name != null ? name : "");
            map.put("role", m.getRole());
            map.put("rollNumber", rollNumber != null ? rollNumber : "");
            map.put("branch", branch != null ? branch : "");
            map.put("joinedAt", m.getJoinedAt());
            result.add(map);
        }
        return result;
    }

    private Map<String, Object> toMap(CollabProject p, String email) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("description", p.getDescription());
        m.put("ownerEmail", p.getOwnerEmail());
        m.put("ownerName", p.getOwnerName());
        m.put("domain", p.getDomain());
        m.put("techStack", p.getTechStack());
        m.put("rolesNeeded", p.getRolesNeeded());
        m.put("maxMembers", p.getMaxMembers());
        m.put("memberCount", p.getMembers().size());
        m.put("members", enrichMembers(p.getMembers()));
        m.put("status", p.getStatus());
        m.put("repoUrl", p.getRepoUrl());
        m.put("mentorEmail", p.getMentorEmail());
        m.put("mentorName", p.getMentorName());
        m.put("createdAt", p.getCreatedAt());
        // membership flags
        boolean isMember = email != null && p.getMembers().stream().anyMatch(mem -> mem.getEmail().equals(email));
        boolean isOwner = email != null && p.getOwnerEmail().equals(email);
        m.put("isMember", isMember);
        m.put("isOwner", isOwner);
        m.put("isFull", p.getMembers().size() >= p.getMaxMembers());
        return m;
    }

    private CollabProject mkProject(String name, String desc, String ownerEmail, String ownerName, String domain,
                                     List<String> tech, List<String> roles, int maxMembers) {
        CollabProject p = new CollabProject();
        p.setName(name); p.setDescription(desc); p.setOwnerEmail(ownerEmail); p.setOwnerName(ownerName);
        p.setDomain(domain); p.setTechStack(new ArrayList<>(tech)); p.setRolesNeeded(new ArrayList<>(roles));
        p.setMaxMembers(maxMembers); p.setStatus(roles.isEmpty() ? "Completed" : "Active");
        p.getMembers().add(new CollabProject.Member(ownerEmail, ownerName, "Owner"));
        return p;
    }
}
