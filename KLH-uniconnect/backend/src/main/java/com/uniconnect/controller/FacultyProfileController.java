package com.uniconnect.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniconnect.dto.FacultyProfileResponse;
import com.uniconnect.dto.FacultyProfileUpdateRequest;
import com.uniconnect.service.FacultyProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty/profile")
@CrossOrigin(originPatterns = "*")
public class FacultyProfileController {
    private final FacultyProfileService facultyProfileService;
    private final Cloudinary cloudinary;

    @Autowired
    public FacultyProfileController(FacultyProfileService facultyProfileService, Cloudinary cloudinary) {
        this.facultyProfileService = facultyProfileService;
        this.cloudinary = cloudinary;
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
            String baseName = orig != null && orig.contains(".")
                ? orig.substring(0, orig.lastIndexOf(".")) : "file";
            String publicId = "uniconnect/faculty/" + UUID.randomUUID() + "_" + baseName;

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "auto",
                "public_id", publicId,
                "folder", "uniconnect"
            ));
            String fileUrl = (String) uploadResult.get("secure_url");
            return ResponseEntity.ok(Map.of("url", fileUrl, "filename", orig != null ? orig : "file"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}
