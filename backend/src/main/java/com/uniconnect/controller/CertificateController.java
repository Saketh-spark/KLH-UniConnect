package com.uniconnect.controller;

import com.uniconnect.dto.CertificateResponse;
import com.uniconnect.model.Achievement;
import com.uniconnect.repository.AchievementRepository;
import com.uniconnect.service.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000"})
public class CertificateController {

    private final CertificateService certificateService;
    private final AchievementRepository achievementRepository;
    private static final String ACHIEVEMENT_UPLOAD_DIR = new File("uploads/certificates").getAbsolutePath();

    public CertificateController(CertificateService certificateService, AchievementRepository achievementRepository) {
        this.certificateService = certificateService;
        this.achievementRepository = achievementRepository;
    }

    // ============ STUDENT CERTIFICATE ENDPOINTS ============

    @PostMapping("/upload")
    public ResponseEntity<?> uploadCertificate(
            @RequestHeader("X-Student-Id") String studentId,
            @RequestParam("title") String title,
            @RequestParam("issuer") String issuer,
            @RequestParam(value = "category", required = false, defaultValue = "Professional") String category,
            @RequestParam(value = "issueDate", required = false) String issueDate,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "credentialId", required = false) String credentialId,
            @RequestParam(value = "credentialUrl", required = false) String credentialUrl,
            @RequestParam("file") MultipartFile file) {
        try {
            CertificateResponse response = certificateService.uploadCertificate(
                    studentId, title, issuer, category, issueDate, description,
                    credentialId, credentialUrl, file);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<CertificateResponse>> getCertificates(
            @RequestHeader("X-Student-Id") String studentId,
            @RequestParam(value = "category", required = false) String category) {
        return ResponseEntity.ok(certificateService.getCertificatesByStudentIdAndCategory(studentId, category));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CertificateResponse>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponse> getCertificateById(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(certificateService.getCertificateById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<?> startVerification(@PathVariable("id") String id) {
        try {
            return ResponseEntity.ok(certificateService.startVerification(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> createShareLink(@PathVariable("id") String id) {
        try {
            CertificateResponse certificate = certificateService.createShareLink(id);
            return ResponseEntity.ok(Map.of("shareLink", certificate.getShareLink(),
                    "fullUrl", "http://localhost:4173/certificate/" + certificate.getShareLink()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/shared/{shareLink}")
    public ResponseEntity<CertificateResponse> getCertificateByShareLink(@PathVariable("shareLink") String shareLink) {
        try {
            return ResponseEntity.ok(certificateService.getCertificateByShareLink(shareLink));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/verify/{verificationCode}")
    public ResponseEntity<CertificateResponse> verifyCertificate(@PathVariable("verificationCode") String verificationCode) {
        try {
            return ResponseEntity.ok(certificateService.verifyCertificate(verificationCode));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCertificateStats(@RequestHeader("X-Student-Id") String studentId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", certificateService.getTotalCount(studentId));
        stats.put("verified", certificateService.getVerifiedCount(studentId));
        stats.put("pending", certificateService.getPendingCount(studentId));
        stats.put("achievements", (long) achievementRepository.findByStudentId(studentId).size());
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCertificate(
            @PathVariable("id") String id,
            @RequestHeader("X-Student-Id") String studentId) {
        try {
            certificateService.deleteCertificate(id, studentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/university")
    public ResponseEntity<List<CertificateResponse>> getUniversityCertificates(
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(certificateService.getUniversityCertificates(studentId));
    }

    @GetMapping("/portfolio/{studentId}")
    public ResponseEntity<Map<String, Object>> getPortfolio(@PathVariable("studentId") String studentId) {
        Map<String, Object> portfolio = new HashMap<>();
        portfolio.put("certificates", certificateService.getStudentPortfolio(studentId));
        portfolio.put("achievements", achievementRepository.findByStudentIdAndStatus(studentId, "verified"));
        portfolio.put("stats", Map.of(
            "totalCerts", certificateService.getTotalCount(studentId),
            "verifiedCerts", certificateService.getVerifiedCount(studentId),
            "totalAchievements", (long) achievementRepository.findByStudentId(studentId).size()
        ));
        return ResponseEntity.ok(portfolio);
    }

    // ============ FACULTY CERTIFICATE ENDPOINTS ============

    @GetMapping("/faculty/pending")
    public ResponseEntity<List<CertificateResponse>> getPendingCertificates() {
        return ResponseEntity.ok(certificateService.getPendingCertificates());
    }

    @GetMapping("/faculty/all")
    public ResponseEntity<List<CertificateResponse>> getFacultyAllCertificates(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "category", required = false) String category) {
        List<CertificateResponse> all = certificateService.getAllCertificates();
        if (status != null && !status.equals("All")) {
            all = all.stream().filter(c -> status.equals(c.getStatus())).collect(Collectors.toList());
        }
        if (category != null && !category.equals("All")) {
            all = all.stream().filter(c -> category.equals(c.getCategory())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(all);
    }

    @PutMapping("/faculty/{id}/approve")
    public ResponseEntity<?> approveCertificate(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        try {
            String facultyEmail = body.getOrDefault("facultyEmail", "faculty");
            String note = body.getOrDefault("note", "");
            return ResponseEntity.ok(certificateService.approveCertificate(id, facultyEmail, note));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/faculty/{id}/reject")
    public ResponseEntity<?> rejectCertificate(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        try {
            String facultyEmail = body.getOrDefault("facultyEmail", "faculty");
            String reason = body.getOrDefault("reason", "No reason provided");
            return ResponseEntity.ok(certificateService.rejectCertificate(id, facultyEmail, reason));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/faculty/generate")
    public ResponseEntity<?> generateUniversityCertificate(@RequestBody Map<String, String> body) {
        try {
            String studentId = body.get("studentId");
            String studentName = body.getOrDefault("studentName", "");
            String title = body.get("title");
            String eventName = body.getOrDefault("eventName", "");
            String templateName = body.getOrDefault("templateName", "Standard");
            String signature = body.getOrDefault("signature", "");
            String facultyEmail = body.getOrDefault("facultyEmail", "faculty");
            String department = body.getOrDefault("department", "");
            CertificateResponse cert = certificateService.generateUniversityCertificate(
                    studentId, studentName, title, eventName, templateName, signature, facultyEmail, department);
            return ResponseEntity.ok(cert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/faculty/analytics")
    public ResponseEntity<Map<String, Object>> getFacultyAnalytics() {
        List<CertificateResponse> all = certificateService.getAllCertificates();
        long total = all.size();
        long pending = all.stream().filter(c -> "pending".equals(c.getStatus())).count();
        long approved = all.stream().filter(c -> "approved".equals(c.getStatus()) || "verified".equals(c.getStatus())).count();
        long rejected = all.stream().filter(c -> "rejected".equals(c.getStatus())).count();
        long universityIssued = all.stream().filter(CertificateResponse::isUniversityIssued).count();

        Map<String, Long> byCategory = all.stream()
                .filter(c -> c.getCategory() != null)
                .collect(Collectors.groupingBy(CertificateResponse::getCategory, Collectors.counting()));

        Map<String, Long> byDepartment = all.stream()
                .filter(c -> c.getDepartment() != null)
                .collect(Collectors.groupingBy(CertificateResponse::getDepartment, Collectors.counting()));

        // Top students (by count of approved certs)
        Map<String, Long> byStudent = all.stream()
                .filter(c -> "approved".equals(c.getStatus()) || "verified".equals(c.getStatus()))
                .filter(c -> c.getStudentId() != null)
                .collect(Collectors.groupingBy(CertificateResponse::getStudentId, Collectors.counting()));

        List<Map<String, Object>> topStudents = byStudent.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("studentId", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());

        List<Achievement> allAchievements = achievementRepository.findAll();
        long totalAchievements = allAchievements.size();
        long verifiedAchievements = allAchievements.stream().filter(a -> "verified".equals(a.getStatus())).count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalCertificates", total);
        analytics.put("pending", pending);
        analytics.put("approved", approved);
        analytics.put("rejected", rejected);
        analytics.put("universityIssued", universityIssued);
        analytics.put("byCategory", byCategory);
        analytics.put("byDepartment", byDepartment);
        analytics.put("topStudents", topStudents);
        analytics.put("totalAchievements", totalAchievements);
        analytics.put("verifiedAchievements", verifiedAchievements);
        return ResponseEntity.ok(analytics);
    }

    // ============ ACHIEVEMENT ENDPOINTS ============

    @GetMapping("/achievements")
    public ResponseEntity<List<Achievement>> getAchievements(@RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(achievementRepository.findByStudentIdOrderByCreatedAtDesc(studentId));
    }

    @PostMapping("/achievements")
    public ResponseEntity<?> createAchievement(
            @RequestHeader("X-Student-Id") String studentId,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "level", required = false) String level,
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Achievement achievement = new Achievement();
            achievement.setStudentId(studentId);
            achievement.setTitle(title);
            achievement.setCategory(category);
            achievement.setDescription(description);
            achievement.setLevel(level != null ? level : "University");
            achievement.setPosition(position);

            // Points based on level
            int points = 10;
            if ("International".equals(level)) points = 50;
            else if ("National".equals(level)) points = 40;
            else if ("State".equals(level)) points = 25;
            achievement.setPoints(points);

            if (date != null && !date.isEmpty()) {
                try { achievement.setDate(LocalDateTime.parse(date + "T00:00:00")); } catch (Exception ignored) {}
            }

            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                achievement.setOriginalFileName(originalFilename);
                String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".pdf";
                String filename = UUID.randomUUID().toString() + extension;
                File dest = new File(ACHIEVEMENT_UPLOAD_DIR + "/" + filename);
                file.transferTo(dest);
                achievement.setProofUrl("/uploads/certificates/" + filename);
            }

            achievement = achievementRepository.save(achievement);
            return ResponseEntity.ok(achievement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/achievements/{id}")
    public ResponseEntity<Void> deleteAchievement(
            @PathVariable("id") String id,
            @RequestHeader("X-Student-Id") String studentId) {
        Achievement achievement = achievementRepository.findById(id).orElse(null);
        if (achievement == null || !achievement.getStudentId().equals(studentId)) {
            return ResponseEntity.notFound().build();
        }
        achievementRepository.delete(achievement);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/achievements/stats")
    public ResponseEntity<Map<String, Object>> getAchievementStats(@RequestHeader("X-Student-Id") String studentId) {
        List<Achievement> all = achievementRepository.findByStudentId(studentId);
        long total = all.size();
        long verified = all.stream().filter(a -> "verified".equals(a.getStatus())).count();
        int totalPoints = all.stream().mapToInt(Achievement::getPoints).sum();
        Map<String, Long> byCategory = all.stream()
                .filter(a -> a.getCategory() != null)
                .collect(Collectors.groupingBy(Achievement::getCategory, Collectors.counting()));
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("verified", verified);
        stats.put("totalPoints", totalPoints);
        stats.put("byCategory", byCategory);
        return ResponseEntity.ok(stats);
    }

    // Faculty achievement endpoints
    @GetMapping("/achievements/faculty/all")
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        return ResponseEntity.ok(achievementRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/achievements/faculty/{id}/verify")
    public ResponseEntity<?> verifyAchievement(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        Achievement achievement = achievementRepository.findById(id).orElse(null);
        if (achievement == null) return ResponseEntity.notFound().build();
        achievement.setStatus("verified");
        achievement.setReviewedBy(body.getOrDefault("facultyEmail", "faculty"));
        achievement.setReviewNote(body.getOrDefault("note", ""));
        achievementRepository.save(achievement);
        return ResponseEntity.ok(achievement);
    }

    @PutMapping("/achievements/faculty/{id}/reject")
    public ResponseEntity<?> rejectAchievement(
            @PathVariable("id") String id,
            @RequestBody Map<String, String> body) {
        Achievement achievement = achievementRepository.findById(id).orElse(null);
        if (achievement == null) return ResponseEntity.notFound().build();
        achievement.setStatus("rejected");
        achievement.setReviewedBy(body.getOrDefault("facultyEmail", "faculty"));
        achievement.setReviewNote(body.getOrDefault("reason", ""));
        achievementRepository.save(achievement);
        return ResponseEntity.ok(achievement);
    }
}
