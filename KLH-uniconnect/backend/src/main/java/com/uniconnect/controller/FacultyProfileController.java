package com.uniconnect.controller;

import com.uniconnect.dto.FacultyProfileResponse;
import com.uniconnect.dto.FacultyProfileUpdateRequest;
import com.uniconnect.service.FacultyProfileService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty/profile")
@CrossOrigin(originPatterns = "*")
public class FacultyProfileController {
    private final FacultyProfileService facultyProfileService;
    private static final String UPLOAD_DIR = "uploads/faculty";

    public FacultyProfileController(FacultyProfileService facultyProfileService) {
        this.facultyProfileService = facultyProfileService;
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) dir.mkdirs();
    }

    @GetMapping
    public ResponseEntity<FacultyProfileResponse> getProfile(@RequestParam(name = "email") String email) {
        return ResponseEntity.ok(facultyProfileService.getProfileByEmail(email));
    }

    @PutMapping
    public ResponseEntity<FacultyProfileResponse> updateProfile(@Valid @RequestBody FacultyProfileUpdateRequest request) {
        return ResponseEntity.ok(facultyProfileService.updateProfile(request));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            String orig = file.getOriginalFilename();
            String ext = orig != null && orig.contains(".") ? orig.substring(orig.lastIndexOf(".")) : "";
            String unique = UUID.randomUUID().toString() + ext;
            Path path = Paths.get(UPLOAD_DIR, unique);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(Map.of("url", "/uploads/faculty/" + unique, "filename", unique));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
