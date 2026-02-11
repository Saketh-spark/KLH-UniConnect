package com.uniconnect.service;

import com.uniconnect.dto.AddCommentRequest;
import com.uniconnect.dto.CreateReelRequest;
import com.uniconnect.dto.FacultyFeedbackRequest;
import com.uniconnect.dto.ReelCommentResponse;
import com.uniconnect.dto.ReelResponse;
import com.uniconnect.dto.FacultyFeedbackResponse;
import com.uniconnect.dto.ReelFeedResponse;
import com.uniconnect.model.Reel;
import com.uniconnect.model.Student;
import com.uniconnect.model.Faculty;
import com.uniconnect.repository.ReelRepository;
import com.uniconnect.repository.StudentRepository;
import com.uniconnect.repository.FacultyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReelService {
    private final ReelRepository reelRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public ReelService(ReelRepository reelRepository, StudentRepository studentRepository, FacultyRepository facultyRepository) {
        this.reelRepository = reelRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    public ReelResponse createReel(String studentId, CreateReelRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Reel reel = new Reel(
                studentId,
                student.getName() != null ? student.getName() : "Anonymous",
                student.getBranch() != null ? student.getBranch() : "Unknown",
                student.getAvatarUrl() != null ? student.getAvatarUrl() : "https://via.placeholder.com/48",
                request.title(),
                request.description(),
                request.category()
        );

        reel.setVideoUrl(request.videoUrl());
        reel.setThumbnailUrl(request.thumbnailUrl());
        reel.setHashtags(request.hashtags());
        
        // NEW: Set academic fields
        reel.setYear(student.getYear());
        reel.setSubject(request.subject());
        reel.setSkill(request.skill());
        reel.setSemester(request.semester());
        reel.setClubOrEvent(request.clubOrEvent());
        reel.setPlacementVisibility(request.placementVisibility() != null ? request.placementVisibility() : "PRIVATE");
        reel.setReelType("STUDENT_CREATED");

        Reel savedReel = reelRepository.save(reel);
        return mapToResponse(savedReel, studentId);
    }

    public ReelResponse getReel(String reelId, String studentId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        // Increment views
        reel.setViews(reel.getViews() + 1);
        reelRepository.save(reel);

        return mapToResponse(reel, studentId);
    }

    public List<ReelResponse> getAllReels(String studentId, String category, String sortBy) {
        List<Reel> reels;

        if (category != null && !category.equals("All")) {
            reels = reelRepository.findByCategoryOrderByCreatedAtDesc(category);
        } else {
            reels = reelRepository.findByOrderByCreatedAtDesc();
        }

        // Sort based on sortBy parameter
        if ("likes".equals(sortBy)) {
            reels.sort((a, b) -> b.getLikes() - a.getLikes());
        } else if ("views".equals(sortBy)) {
            reels.sort((a, b) -> b.getViews() - a.getViews());
        }
        // Default is by createdAt (already sorted)

        return reels.stream()
                .map(reel -> mapToResponse(reel, studentId))
                .collect(Collectors.toList());
    }

    public List<ReelResponse> searchReels(String query, String studentId) {
        List<Reel> reels = reelRepository.findByTitleContainingIgnoreCase(query);
        return reels.stream()
                .map(reel -> mapToResponse(reel, studentId))
                .collect(Collectors.toList());
    }

    public List<ReelResponse> getStudentReels(String studentId) {
        List<Reel> reels = reelRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        return reels.stream()
                .map(reel -> mapToResponse(reel, studentId))
                .collect(Collectors.toList());
    }

    public ReelResponse likeReel(String reelId, String studentId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (!reel.getLikedByStudents().contains(studentId)) {
            reel.getLikedByStudents().add(studentId);
            reel.setLikes(reel.getLikes() + 1);
        }

        Reel savedReel = reelRepository.save(reel);
        return mapToResponse(savedReel, studentId);
    }

    public ReelResponse unlikeReel(String reelId, String studentId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (reel.getLikedByStudents().contains(studentId)) {
            reel.getLikedByStudents().remove(studentId);
            reel.setLikes(Math.max(0, reel.getLikes() - 1));
        }

        Reel savedReel = reelRepository.save(reel);
        return mapToResponse(savedReel, studentId);
    }

    public ReelResponse saveReel(String reelId, String studentId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (!reel.getSavedByStudents().contains(studentId)) {
            reel.getSavedByStudents().add(studentId);
            reel.setSaves(reel.getSaves() + 1);
        }

        Reel savedReel = reelRepository.save(reel);
        return mapToResponse(savedReel, studentId);
    }

    public ReelResponse unsaveReel(String reelId, String studentId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (reel.getSavedByStudents().contains(studentId)) {
            reel.getSavedByStudents().remove(studentId);
            reel.setSaves(Math.max(0, reel.getSaves() - 1));
        }

        Reel savedReel = reelRepository.save(reel);
        return mapToResponse(savedReel, studentId);
    }

    public ReelResponse addComment(String reelId, String studentId, AddCommentRequest request) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        Reel.Comment comment = new Reel.Comment(
                studentId,
                student.getName() != null ? student.getName() : "Anonymous",
                student.getAvatarUrl() != null ? student.getAvatarUrl() : "https://via.placeholder.com/48",
                request.text()
        );

        reel.getCommentList().add(comment);
        reel.setComments(reel.getComments() + 1);

        Reel savedReel = reelRepository.save(reel);
        return mapToResponse(savedReel, studentId);
    }

    public ReelResponse deleteReel(String reelId, String studentId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (!reel.getStudentId().equals(studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own reels");
        }

        reelRepository.deleteById(reelId);
        return mapToResponse(reel, studentId);
    }

    // NEW: Faculty Methods for Reel Management
    public ReelFeedResponse addFacultyFeedback(String reelId, String facultyId, FacultyFeedbackRequest request) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Faculty not found"));

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        Reel.FacultyFeedback feedback = new Reel.FacultyFeedback(
                facultyId,
                faculty.getEmail() != null ? faculty.getEmail() : "Faculty",
                request.feedbackText(),
                request.rating()
        );
        feedback.setTags(request.tags());

        reel.getFacultyFeedbacks().add(feedback);
        
        // Update academic score as average of faculty ratings
        updateAcademicScore(reel);
        
        // Set featured tag if provided
        if (request.featuredTag() != null && !request.featuredTag().isEmpty()) {
            reel.setFeaturedTag(request.featuredTag());
            if ("PLACEMENT_READY".equals(request.featuredTag())) {
                reel.setPlacementReady(true);
            }
        }
        
        reel.setUpdatedAt(Instant.now());
        Reel savedReel = reelRepository.save(reel);
        return mapToFeedResponse(savedReel, facultyId, true);
    }

    public ReelFeedResponse setReelAcademicStatus(String reelId, String facultyId, String status) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        // Validate status
        if (!status.matches("PENDING|APPROVED|FLAGGED")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid academic status");
        }

        reel.setAcademicStatus(status);
        reel.setUpdatedAt(Instant.now());
        Reel savedReel = reelRepository.save(reel);
        return mapToFeedResponse(savedReel, facultyId, true);
    }

    public ReelFeedResponse markReelForPlacement(String reelId, String facultyId, boolean isPlacementReady) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        reel.setPlacementReady(isPlacementReady);
        reel.setPlacementVisibility(isPlacementReady ? "PUBLIC" : "PRIVATE");
        reel.setUpdatedAt(Instant.now());
        Reel savedReel = reelRepository.save(reel);
        return mapToFeedResponse(savedReel, facultyId, true);
    }

    public ReelFeedResponse likReelAsFaculty(String reelId, String facultyId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (!reel.getLikedByFaculty().contains(facultyId)) {
            reel.getLikedByFaculty().add(facultyId);
        }

        Reel savedReel = reelRepository.save(reel);
        return mapToFeedResponse(savedReel, facultyId, true);
    }

    public ReelFeedResponse shareReelWithAudience(String reelId, String facultyId, String audience) {
        // audience: CLASS, DEPARTMENT, PLACEMENT_CELL
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reel not found"));

        if (!reel.getSharedWith().contains(audience)) {
            reel.getSharedWith().add(audience);
        }

        Reel savedReel = reelRepository.save(reel);
        return mapToFeedResponse(savedReel, facultyId, true);
    }

    // NEW: Filter reels by academic criteria
    public List<ReelFeedResponse> getReelsByAcademicFilter(String facultyId, String subject, String skill, String year, String semester) {
        List<Reel> reels = reelRepository.findAll();
        
        List<Reel> filtered = reels.stream()
                .filter(r -> subject == null || subject.equals(r.getSubject()))
                .filter(r -> skill == null || skill.equals(r.getSkill()))
                .filter(r -> year == null || year.equals(r.getYear()))
                .filter(r -> semester == null || semester.equals(r.getSemester()))
                .collect(Collectors.toList());

        return filtered.stream()
                .map(r -> mapToFeedResponse(r, facultyId, true))
                .collect(Collectors.toList());
    }

    // NEW: Get reels requiring faculty review
    public List<ReelFeedResponse> getReelsRequiringReview(String facultyId) {
        List<Reel> reels = reelRepository.findAll();
        List<ReelFeedResponse> needsReview = reels.stream()
                .filter(r -> "PENDING".equals(r.getAcademicStatus()))
                .map(r -> mapToFeedResponse(r, facultyId, true))
                .collect(Collectors.toList());
        return needsReview;
    }

    // NEW: Get faculty-created reels
    public List<ReelResponse> getFacultyReels(String facultyId) {
        List<Reel> reels = reelRepository.findAll();
        return reels.stream()
                .filter(r -> "FACULTY_CREATED".equals(r.getReelType()))
                .filter(r -> r.getStudentId().equals(facultyId)) // Assuming facultyId is used as studentId for faculty reels
                .map(r -> mapToResponse(r, facultyId))
                .collect(Collectors.toList());
    }

    private void updateAcademicScore(Reel reel) {
        if (reel.getFacultyFeedbacks().isEmpty()) {
            reel.setAcademicScore(0.0);
            return;
        }

        double average = reel.getFacultyFeedbacks().stream()
                .mapToDouble(Reel.FacultyFeedback::getRating)
                .average()
                .orElse(0.0);

        // Convert from 0-10 scale to 0-100 scale
        reel.setAcademicScore(average * 10);
    }

    private ReelResponse mapToResponse(Reel reel, String currentStudentId) {
        List<ReelCommentResponse> comments = reel.getCommentList().stream()
                .map(c -> new ReelCommentResponse(
                        c.getId(),
                        c.getStudentId(),
                        c.getStudentName(),
                        c.getAvatar(),
                        c.getText(),
                        c.getCreatedAt(),
                        c.getLikes()
                ))
                .collect(Collectors.toList());

        boolean isLiked = currentStudentId != null && reel.getLikedByStudents().contains(currentStudentId);
        boolean isSaved = currentStudentId != null && reel.getSavedByStudents().contains(currentStudentId);
        
        // Determine uploader role based on reelType
        String uploaderRole = "FACULTY_CREATED".equals(reel.getReelType()) ? "FACULTY" : "STUDENT";
        
        // Get uploader info - start with values from reel
        String[] uploaderInfo = new String[4]; // name, department, year, avatar
        uploaderInfo[0] = reel.getStudentName();
        uploaderInfo[1] = reel.getDepartment();
        uploaderInfo[2] = reel.getYear();
        uploaderInfo[3] = reel.getAvatar();
        
        // If uploader info is missing, try to fetch from student/faculty record
        if ((uploaderInfo[0] == null || uploaderInfo[0].isEmpty() || "Unknown User".equals(uploaderInfo[0])) 
                && reel.getStudentId() != null) {
            if ("FACULTY".equals(uploaderRole)) {
                // Try faculty lookup - Faculty model only has email, so derive name from it
                facultyRepository.findById(reel.getStudentId()).ifPresent(faculty -> {
                    if (uploaderInfo[0] == null || uploaderInfo[0].isEmpty()) {
                        // Extract name from email (e.g., john.doe@klh.edu.in -> John Doe)
                        String email = faculty.getEmail();
                        if (email != null && email.contains("@")) {
                            String namePart = email.substring(0, email.indexOf("@")).replace(".", " ");
                            // Capitalize each word
                            String[] words = namePart.split(" ");
                            StringBuilder sb = new StringBuilder();
                            for (String word : words) {
                                if (!word.isEmpty()) {
                                    sb.append(Character.toUpperCase(word.charAt(0)));
                                    if (word.length() > 1) sb.append(word.substring(1));
                                    sb.append(" ");
                                }
                            }
                            uploaderInfo[0] = sb.toString().trim();
                        }
                    }
                });
            } else {
                // Try student lookup
                studentRepository.findById(reel.getStudentId()).ifPresent(student -> {
                    if (uploaderInfo[0] == null || uploaderInfo[0].isEmpty()) uploaderInfo[0] = student.getName();
                    if (uploaderInfo[1] == null || uploaderInfo[1].isEmpty()) uploaderInfo[1] = student.getBranch();
                    if (uploaderInfo[2] == null || uploaderInfo[2].isEmpty()) uploaderInfo[2] = student.getYear();
                    if (uploaderInfo[3] == null || uploaderInfo[3].isEmpty()) uploaderInfo[3] = student.getAvatarUrl();
                });
            }
        }
        
        // Provide defaults if still missing
        String uploaderName = (uploaderInfo[0] != null && !uploaderInfo[0].isEmpty()) ? uploaderInfo[0] : "Unknown User";
        String department = (uploaderInfo[1] != null && !uploaderInfo[1].isEmpty()) ? uploaderInfo[1] : "Unknown";
        String year = uploaderInfo[2]; // year can be null
        String avatar = (uploaderInfo[3] != null && !uploaderInfo[3].isEmpty()) ? uploaderInfo[3] : "https://via.placeholder.com/48";

        return new ReelResponse(
                reel.getId(),
                reel.getStudentId(),
                uploaderName,
                department,
                year,
                avatar,
                uploaderRole,
                reel.getTitle(),
                reel.getDescription(),
                reel.getVideoUrl(),
                reel.getThumbnailUrl(),
                reel.getCategory(),
                reel.getCreatedAt(),
                reel.getViews(),
                reel.getLikes(),
                reel.getComments(),
                reel.getSaves(),
                reel.isVerified(),
                reel.isSafe(),
                reel.getHashtags(),
                comments,
                isLiked,
                isSaved
        );
    }

    // NEW: Map to Faculty Feed Response
    private ReelFeedResponse mapToFeedResponse(Reel reel, String currentFacultyId, boolean isFacultyView) {
        List<ReelCommentResponse> comments = reel.getCommentList().stream()
                .map(c -> new ReelCommentResponse(
                        c.getId(),
                        c.getStudentId(),
                        c.getStudentName(),
                        c.getAvatar(),
                        c.getText(),
                        c.getCreatedAt(),
                        c.getLikes()
                ))
                .collect(Collectors.toList());

        List<FacultyFeedbackResponse> feedbacks = reel.getFacultyFeedbacks().stream()
                .map(f -> new FacultyFeedbackResponse(
                        f.getId(),
                        f.getFacultyId(),
                        f.getFacultyName(),
                        f.getFeedbackText(),
                        f.getRating(),
                        f.getTags(),
                        f.getCreatedAt()
                ))
                .collect(Collectors.toList());

        boolean isLikedByFaculty = currentFacultyId != null && reel.getLikedByFaculty().contains(currentFacultyId);

        return new ReelFeedResponse(
                reel.getId(),
                reel.getStudentId(),
                reel.getStudentName(),
                reel.getDepartment(),
                reel.getYear(),
                reel.getAvatar(),
                reel.getTitle(),
                reel.getDescription(),
                reel.getVideoUrl(),
                reel.getThumbnailUrl(),
                reel.getCategory(),
                reel.getSubject(),
                reel.getSkill(),
                reel.getSemester(),
                reel.getClubOrEvent(),
                reel.getCreatedAt(),
                reel.getViews(),
                reel.getLikes(),
                reel.getComments(),
                reel.getSaves(),
                reel.getLikedByFaculty().size(),
                reel.isVerified(),
                reel.isSafe(),
                reel.getAcademicScore(),
                reel.getAcademicStatus(),
                reel.getPlacementVisibility(),
                reel.isPlacementReady(),
                reel.getFeaturedTag(),
                reel.getHashtags(),
                comments,
                feedbacks,
                false, // isLikedByCurrentUser
                false, // isSavedByCurrentUser
                isLikedByFaculty
        );
    }

    // Admin method to clear all reels
    public long clearAllReels() {
        long count = reelRepository.count();
        reelRepository.deleteAll();
        return count;
    }
}
