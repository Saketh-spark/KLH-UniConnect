package com.uniconnect.controller;

import com.uniconnect.dto.AddCommentRequest;
import com.uniconnect.dto.CreateReelRequest;
import com.uniconnect.dto.FacultyFeedbackRequest;
import com.uniconnect.dto.ReelResponse;
import com.uniconnect.dto.ReelFeedResponse;
import com.uniconnect.service.FileUploadService;
import com.uniconnect.service.ReelService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reels")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"}, allowCredentials = "true")
public class ReelController {
    private final ReelService reelService;
    private final FileUploadService fileUploadService;
    private final com.uniconnect.repository.ReelRepository reelRepository;

    public ReelController(ReelService reelService, FileUploadService fileUploadService, com.uniconnect.repository.ReelRepository reelRepository) {
        this.reelService = reelService;
        this.fileUploadService = fileUploadService;
        this.reelRepository = reelRepository;
    }

    /**
     * Admin endpoint to clear all reels from the database
     * Use this to remove sample data and start fresh with real uploads
     */
    @DeleteMapping("/admin/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllReels() {
        long count = reelRepository.count();
        reelRepository.deleteAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("deletedCount", count);
        response.put("message", "All reels cleared. Database is now empty.");
        return ResponseEntity.ok(response);
    }

    /**
     * Admin endpoint to fix broken video URLs by replacing local uploads with sample videos
     * Use this when deployed to platforms with ephemeral filesystems (like Render)
     */
    @PostMapping("/admin/fix-video-urls")
    public ResponseEntity<Map<String, Object>> fixBrokenVideoUrls() {
        List<String> sampleVideos = List.of(
            "https://res.cloudinary.com/demo/video/upload/dog.mp4",
            "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
            "https://res.cloudinary.com/demo/video/upload/sea-turtle.mp4"
        );
        
        List<com.uniconnect.model.Reel> allReels = reelRepository.findAll();
        int fixedCount = 0;
        
        for (int i = 0; i < allReels.size(); i++) {
            com.uniconnect.model.Reel reel = allReels.get(i);
            String videoUrl = reel.getVideoUrl();
            
            // Fix if URL is a local upload path or broken Google sample URL
            if (videoUrl != null && (videoUrl.startsWith("/uploads/") || videoUrl.contains("commondatastorage.googleapis.com"))) {
                String newUrl = sampleVideos.get(i % sampleVideos.size());
                reel.setVideoUrl(newUrl);
                reelRepository.save(reel);
                fixedCount++;
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("totalReels", allReels.size());
        response.put("fixedCount", fixedCount);
        response.put("message", "Fixed " + fixedCount + " reel(s) with broken video URLs");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFiles(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @RequestHeader("X-Student-Id") String studentId) {
        try {
            Map<String, Object> response = new HashMap<>();

            // Upload video
            if (videoFile != null && !videoFile.isEmpty()) {
                String videoUrl = fileUploadService.uploadVideo(videoFile);
                response.put("videoUrl", videoUrl);
            }

            // Upload thumbnail (optional)
            if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
                String thumbnailUrl = fileUploadService.uploadThumbnail(thumbnailFile);
                response.put("thumbnailUrl", thumbnailUrl);
            }

            response.put("success", true);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/create")
    public ResponseEntity<ReelResponse> createReel(
            @RequestHeader("X-Student-Id") String studentId,
            @Valid @RequestBody CreateReelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reelService.createReel(studentId, request));
    }

    @GetMapping("/{reelId}")
    public ResponseEntity<ReelResponse> getReel(
            @PathVariable String reelId,
            @RequestHeader(value = "X-Student-Id", required = false) String studentId) {
        return ResponseEntity.ok(reelService.getReel(reelId, studentId));
    }

    @GetMapping
    public ResponseEntity<List<ReelResponse>> getAllReels(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sortBy", defaultValue = "recent") String sortBy,
            @RequestHeader(value = "X-Student-Id", required = false) String studentId) {
        return ResponseEntity.ok(reelService.getAllReels(studentId, category, sortBy));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ReelResponse>> searchReels(
            @RequestParam(name = "query") String query,
            @RequestHeader(value = "X-Student-Id", required = false) String studentId) {
        return ResponseEntity.ok(reelService.searchReels(query, studentId));
    }

    @GetMapping("/my-reels")
    public ResponseEntity<List<ReelResponse>> getMyReels(
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(reelService.getStudentReels(studentId));
    }

    @PostMapping("/{reelId}/like")
    public ResponseEntity<ReelResponse> likeReel(
            @PathVariable String reelId,
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(reelService.likeReel(reelId, studentId));
    }

    @PostMapping("/{reelId}/unlike")
    public ResponseEntity<ReelResponse> unlikeReel(
            @PathVariable String reelId,
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(reelService.unlikeReel(reelId, studentId));
    }

    @PostMapping("/{reelId}/save")
    public ResponseEntity<ReelResponse> saveReel(
            @PathVariable String reelId,
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(reelService.saveReel(reelId, studentId));
    }

    @PostMapping("/{reelId}/unsave")
    public ResponseEntity<ReelResponse> unsaveReel(
            @PathVariable String reelId,
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(reelService.unsaveReel(reelId, studentId));
    }

    @PostMapping("/{reelId}/comment")
    public ResponseEntity<ReelResponse> addComment(
            @PathVariable String reelId,
            @RequestHeader("X-Student-Id") String studentId,
            @Valid @RequestBody AddCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reelService.addComment(reelId, studentId, request));
    }

    @DeleteMapping("/{reelId}")
    public ResponseEntity<ReelResponse> deleteReel(
            @PathVariable String reelId,
            @RequestHeader("X-Student-Id") String studentId) {
        return ResponseEntity.ok(reelService.deleteReel(reelId, studentId));
    }

    // NEW: Faculty Endpoints for Reel Management
    @PostMapping("/{reelId}/faculty-feedback")
    public ResponseEntity<ReelFeedResponse> addFacultyFeedback(
            @PathVariable String reelId,
            @RequestHeader("X-Faculty-Id") String facultyId,
            @Valid @RequestBody FacultyFeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reelService.addFacultyFeedback(reelId, facultyId, request));
    }

    @PostMapping("/{reelId}/academic-status")
    public ResponseEntity<ReelFeedResponse> setAcademicStatus(
            @PathVariable String reelId,
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestParam String status) {
        return ResponseEntity.ok(reelService.setReelAcademicStatus(reelId, facultyId, status));
    }

    @PostMapping("/{reelId}/placement-ready")
    public ResponseEntity<ReelFeedResponse> markPlacementReady(
            @PathVariable String reelId,
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestParam boolean isPlacementReady) {
        return ResponseEntity.ok(reelService.markReelForPlacement(reelId, facultyId, isPlacementReady));
    }

    @PostMapping("/{reelId}/faculty-like")
    public ResponseEntity<ReelFeedResponse> likeReelAsFaculty(
            @PathVariable String reelId,
            @RequestHeader("X-Faculty-Id") String facultyId) {
        return ResponseEntity.ok(reelService.likReelAsFaculty(reelId, facultyId));
    }

    @PostMapping("/{reelId}/share")
    public ResponseEntity<ReelFeedResponse> shareReel(
            @PathVariable String reelId,
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestParam String audience) {
        return ResponseEntity.ok(reelService.shareReelWithAudience(reelId, facultyId, audience));
    }

    @GetMapping("/faculty/filter")
    public ResponseEntity<List<ReelFeedResponse>> getReelsByFilter(
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String semester) {
        return ResponseEntity.ok(reelService.getReelsByAcademicFilter(facultyId, subject, skill, year, semester));
    }

    @GetMapping("/faculty/review-queue")
    public ResponseEntity<List<ReelFeedResponse>> getReelsForReview(
            @RequestHeader("X-Faculty-Id") String facultyId) {
        return ResponseEntity.ok(reelService.getReelsRequiringReview(facultyId));
    }

    @GetMapping("/faculty/my-reels")
    public ResponseEntity<List<ReelResponse>> getFacultyReels(
            @RequestHeader("X-Faculty-Id") String facultyId) {
        return ResponseEntity.ok(reelService.getFacultyReels(facultyId));
    }
}

