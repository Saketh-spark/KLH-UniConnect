package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reels")
public class Reel {
    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String department;
    private String avatar;
    private String year;

    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;

    // NEW: Academic categorization
    private String category; // Projects, Placements, Events & Clubs, Achievements, Learning Shorts
    private String subject; // Math, DSA, Web Dev, AI/ML, etc.
    private String skill; // DSA, Web, AI, Core Subject, etc.
    private String semester; // 1st, 2nd, 3rd, 4th, etc.
    private String clubOrEvent; // Optional: name of club or event
    
    @Indexed
    private Instant createdAt;
    private Instant updatedAt;

    private int views;
    private int likes;
    private int comments;
    private int saves;
    private boolean verified;
    private boolean safe;
    
    // NEW: Academic validation & placement features
    private String academicStatus; // PENDING, APPROVED, FLAGGED
    private double academicScore; // 0-100, calculated by faculty
    private String placementVisibility; // PRIVATE, PEERS_ONLY, FACULTY_ONLY, PUBLIC
    private boolean placementReady; // Faculty marks if placement-ready
    private String reelType; // STUDENT_CREATED, FACULTY_CREATED
    
    // NEW: Faculty feedback & validation
    private List<FacultyFeedback> facultyFeedbacks = new ArrayList<>();
    private String featuredTag; // NONE, GOOD_PROJECT, NEEDS_IMPROVEMENT, PLACEMENT_READY, ACADEMIC_HIGHLIGHT
    private List<String> sharedWith = new ArrayList<>(); // Class, Department, Placement Cell

    private List<String> hashtags = new ArrayList<>();
    private List<Comment> commentList = new ArrayList<>();
    private List<String> likedByStudents = new ArrayList<>();
    private List<String> savedByStudents = new ArrayList<>();
    private List<String> likedByFaculty = new ArrayList<>(); // Faculty likes

    public Reel() {
    }

    public Reel(String studentId, String studentName, String department, String avatar, String title, String description, String category) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.department = department;
        this.avatar = avatar;
        this.title = title;
        this.description = description;
        this.category = category;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.views = 0;
        this.likes = 0;
        this.comments = 0;
        this.saves = 0;
        this.verified = false;
        this.safe = true;
        this.academicStatus = "PENDING";
        this.placementVisibility = "PRIVATE";
        this.placementReady = false;
        this.reelType = "STUDENT_CREATED";
        this.featuredTag = "NONE";
        this.academicScore = 0.0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public int getViews() { return views; }
    public void setViews(int views) { this.views = views; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public int getComments() { return comments; }
    public void setComments(int comments) { this.comments = comments; }

    public int getSaves() { return saves; }
    public void setSaves(int saves) { this.saves = saves; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public boolean isSafe() { return safe; }
    public void setSafe(boolean safe) { this.safe = safe; }

    public List<String> getHashtags() { return hashtags; }
    public void setHashtags(List<String> hashtags) { this.hashtags = hashtags; }

    public List<Comment> getCommentList() { return commentList; }
    public void setCommentList(List<Comment> commentList) { this.commentList = commentList; }

    public List<String> getLikedByStudents() { return likedByStudents; }
    public void setLikedByStudents(List<String> likedByStudents) { this.likedByStudents = likedByStudents; }

    public List<String> getSavedByStudents() { return savedByStudents; }
    public void setSavedByStudents(List<String> savedByStudents) { this.savedByStudents = savedByStudents; }
    
    // NEW: Getters and Setters for Academic Fields
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getClubOrEvent() { return clubOrEvent; }
    public void setClubOrEvent(String clubOrEvent) { this.clubOrEvent = clubOrEvent; }
    
    public String getAcademicStatus() { return academicStatus; }
    public void setAcademicStatus(String academicStatus) { this.academicStatus = academicStatus; }
    
    public double getAcademicScore() { return academicScore; }
    public void setAcademicScore(double academicScore) { this.academicScore = academicScore; }
    
    public String getPlacementVisibility() { return placementVisibility; }
    public void setPlacementVisibility(String placementVisibility) { this.placementVisibility = placementVisibility; }
    
    public boolean isPlacementReady() { return placementReady; }
    public void setPlacementReady(boolean placementReady) { this.placementReady = placementReady; }
    
    public String getReelType() { return reelType; }
    public void setReelType(String reelType) { this.reelType = reelType; }
    
    public String getFeaturedTag() { return featuredTag; }
    public void setFeaturedTag(String featuredTag) { this.featuredTag = featuredTag; }
    
    public List<FacultyFeedback> getFacultyFeedbacks() { return facultyFeedbacks; }
    public void setFacultyFeedbacks(List<FacultyFeedback> facultyFeedbacks) { this.facultyFeedbacks = facultyFeedbacks; }
    
    public List<String> getSharedWith() { return sharedWith; }
    public void setSharedWith(List<String> sharedWith) { this.sharedWith = sharedWith; }
    
    public List<String> getLikedByFaculty() { return likedByFaculty; }
    public void setLikedByFaculty(List<String> likedByFaculty) { this.likedByFaculty = likedByFaculty; }

    // Inner class for FacultyFeedback
    public static class FacultyFeedback {
        private String id;
        private String facultyId;
        private String facultyName;
        private String feedbackText;
        private double rating; // 0-10
        private List<String> tags; // "Needs Improvement", "Good", "Excellent"
        private Instant createdAt;

        public FacultyFeedback() {
        }

        public FacultyFeedback(String facultyId, String facultyName, String feedbackText, double rating) {
            this.id = java.util.UUID.randomUUID().toString();
            this.facultyId = facultyId;
            this.facultyName = facultyName;
            this.feedbackText = feedbackText;
            this.rating = rating;
            this.createdAt = Instant.now();
            this.tags = new ArrayList<>();
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getFacultyId() { return facultyId; }
        public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

        public String getFacultyName() { return facultyName; }
        public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

        public String getFeedbackText() { return feedbackText; }
        public void setFeedbackText(String feedbackText) { this.feedbackText = feedbackText; }

        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }

        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    
    public static class Comment {
        private String id;
        private String studentId;
        private String studentName;
        private String avatar;
        private String text;
        private Instant createdAt;
        private int likes;
        private boolean isFromFaculty; // NEW: Mark if comment is from faculty
        private String facultyId; // NEW: Faculty ID if from faculty
        private String role; // NEW: "STUDENT" or "FACULTY"

        public Comment() {
        }

        public Comment(String studentId, String studentName, String avatar, String text) {
            this.id = java.util.UUID.randomUUID().toString();
            this.studentId = studentId;
            this.studentName = studentName;
            this.avatar = avatar;
            this.text = text;
            this.createdAt = Instant.now();
            this.likes = 0;
            this.isFromFaculty = false;
            this.role = "STUDENT";
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

        public int getLikes() { return likes; }
        public void setLikes(int likes) { this.likes = likes; }
        
        public boolean isFromFaculty() { return isFromFaculty; }
        public void setFromFaculty(boolean fromFaculty) { isFromFaculty = fromFaculty; }
        
        public String getFacultyId() { return facultyId; }
        public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
        
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
