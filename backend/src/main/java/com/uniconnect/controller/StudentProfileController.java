package com.uniconnect.controller;

import com.uniconnect.dto.StudentProfileResponse;
import com.uniconnect.dto.StudentProfileUpdateRequest;
import com.uniconnect.model.Student;
import com.uniconnect.repository.StudentRepository;
import com.uniconnect.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/students/profile")
@CrossOrigin(originPatterns = "*")
public class StudentProfileController {
    private final StudentProfileService studentProfileService;
    private final StudentRepository studentRepository;
    private static final String CERTIFICATE_UPLOAD_DIR = "uploads/certificates";
    private static final String DOCUMENT_UPLOAD_DIR = "uploads/documents";
    private static final String RESUME_UPLOAD_DIR = "uploads/resumes";

    public StudentProfileController(StudentProfileService studentProfileService, StudentRepository studentRepository) {
        this.studentProfileService = studentProfileService;
        this.studentRepository = studentRepository;
        
        // Create upload directories if they don't exist
        for (String dir : new String[]{CERTIFICATE_UPLOAD_DIR, DOCUMENT_UPLOAD_DIR, RESUME_UPLOAD_DIR}) {
            File uploadDir = new File(dir);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
        }
    }

    @GetMapping
    public ResponseEntity<StudentProfileResponse> getProfile(@RequestParam(name = "email") String email) {
        return ResponseEntity.ok(studentProfileService.getProfileByEmail(email));
    }

    @PutMapping
    public ResponseEntity<StudentProfileResponse> updateProfile(@Valid @RequestBody StudentProfileUpdateRequest request) {
        return ResponseEntity.ok(studentProfileService.updateProfile(request));
    }

    @PostMapping("/upload-certificate")
    public ResponseEntity<Map<String, String>> uploadCertificate(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            Path filePath = Paths.get(CERTIFICATE_UPLOAD_DIR, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/certificates/" + uniqueFilename;
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", uniqueFilename);
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    // ═══════════ Upload Document — auto-saves to student profile ═══════════
    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Validate file size (10 MB max)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 10 MB limit"));
            }

            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            Path filePath = Paths.get(DOCUMENT_UPLOAD_DIR, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/documents/" + uniqueFilename;

            // Auto-save to student profile in MongoDB
            Student student = studentOpt.get();
            List<Student.ProfileDocument> docs = student.getDocuments();
            if (docs == null) docs = new ArrayList<>();

            Student.ProfileDocument newDoc = new Student.ProfileDocument(
                originalFilename != null ? originalFilename : "Document",
                fileExtension.replace(".", "").toUpperCase(),
                fileUrl,
                LocalDate.now().toString(),
                false
            );
            docs.add(newDoc);
            student.setDocuments(docs);
            studentRepository.save(student);

            // Return the new document info + all documents
            Map<String, Object> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", originalFilename);
            response.put("document", Map.of(
                "name", newDoc.getName(),
                "type", newDoc.getType(),
                "fileUrl", newDoc.getFileUrl(),
                "uploadDate", newDoc.getUploadDate(),
                "verified", newDoc.isVerified()
            ));

            // Return all documents so frontend can sync
            List<Map<String, Object>> allDocs = new ArrayList<>();
            for (Student.ProfileDocument d : student.getDocuments()) {
                allDocs.add(Map.of(
                    "name", d.getName(),
                    "type", d.getType(),
                    "fileUrl", d.getFileUrl(),
                    "uploadDate", d.getUploadDate() != null ? d.getUploadDate() : "",
                    "verified", d.isVerified()
                ));
            }
            response.put("documents", allDocs);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }

    // ═══════════ Upload Resume — auto-saves to student profile ═══════════
    @PostMapping("/upload-resume")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Validate file size (10 MB max)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 10 MB limit"));
            }

            // Validate file type
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
                : "";
            if (!fileExtension.equals(".pdf") && !fileExtension.equals(".doc") && !fileExtension.equals(".docx")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF, DOC and DOCX files are allowed"));
            }

            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(RESUME_UPLOAD_DIR, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/resumes/" + uniqueFilename;

            // Auto-save to student profile in MongoDB
            Student student = studentOpt.get();
            student.setResume(fileUrl);
            studentRepository.save(student);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("filename", originalFilename);
            response.put("resume", fileUrl);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload resume: " + e.getMessage()));
        }
    }

    // ═══════════ Delete Document ═══════════
    @DeleteMapping("/document")
    public ResponseEntity<?> deleteDocument(
            @RequestParam("email") String email,
            @RequestParam("index") int index) {
        try {
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            Student student = studentOpt.get();
            List<Student.ProfileDocument> docs = student.getDocuments();
            if (docs == null || index < 0 || index >= docs.size()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid document index"));
            }

            docs.remove(index);
            student.setDocuments(docs);
            studentRepository.save(student);

            return ResponseEntity.ok(Map.of("message", "Document deleted", "remaining", docs.size()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete document: " + e.getMessage()));
        }
    }

    // ═══════════ Delete Resume ═══════════
    @DeleteMapping("/resume")
    public ResponseEntity<?> deleteResume(@RequestParam("email") String email) {
        try {
            Optional<Student> studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            Student student = studentOpt.get();
            student.setResume(null);
            studentRepository.save(student);

            return ResponseEntity.ok(Map.of("message", "Resume deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete resume: " + e.getMessage()));
        }
    }
}
