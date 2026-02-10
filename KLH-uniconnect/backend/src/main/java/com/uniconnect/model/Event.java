package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "events")
public class Event {
    @Id
    private String id;
    
    private String title;
    private String description;
    private String eventType; // Workshop, Seminar, Competition, Cultural, Sports, Technical
    private Instant dateTime;
    private String venue;
    private Integer maxParticipants;
    private Instant registrationDeadline;
    private String bannerUrl;
    private String clubId;
    private String departmentId;
    private String createdBy; // Faculty ID
    private String status; // Upcoming, Completed, Cancelled, Published
    private Integer registrationCount = 0;
    private List<String> registeredStudents = new ArrayList<>();
    private List<Attendance> attendance = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // Inner class for attendance
    public static class Attendance {
        public String studentId;
        public String studentName;
        public String studentEmail;
        public Instant markedAt;

        public Attendance(String studentId, String studentName, String studentEmail) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.markedAt = Instant.now();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public Instant getDateTime() { return dateTime; }
    public void setDateTime(Instant dateTime) { this.dateTime = dateTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Instant getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(Instant registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getClubId() { return clubId; }
    public void setClubId(String clubId) { this.clubId = clubId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRegistrationCount() { return registrationCount; }
    public void setRegistrationCount(Integer registrationCount) { this.registrationCount = registrationCount; }

    public List<String> getRegisteredStudents() { return registeredStudents; }
    public void setRegisteredStudents(List<String> registeredStudents) { this.registeredStudents = registeredStudents; }

    public List<Attendance> getAttendance() { return attendance; }
    public void setAttendance(List<Attendance> attendance) { this.attendance = attendance; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
