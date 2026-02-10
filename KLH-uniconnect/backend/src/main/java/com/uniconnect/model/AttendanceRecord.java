package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "attendance_records")
public class AttendanceRecord {
    @Id
    private String id;
    private String subject;
    private String subjectCode;
    private String section;
    private LocalDate date;
    private String period;
    private String facultyId;
    private String facultyName;
    private List<StudentAttendance> students = new ArrayList<>();
    private Integer totalStudents;
    private Boolean locked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AttendanceRecord() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.locked = false;
    }

    // Inner class for student attendance
    public static class StudentAttendance {
        private String studentId;
        private String studentName;
        private String rollNumber;
        private String status; // PRESENT, ABSENT, LATE
        private String remarks;

        public StudentAttendance() {}

        public StudentAttendance(String studentId, String studentName, String status) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.status = status;
        }

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public List<StudentAttendance> getStudents() { return students; }
    public void setStudents(List<StudentAttendance> students) { this.students = students; }

    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }

    public Boolean getLocked() { return locked; }
    public void setLocked(Boolean locked) { this.locked = locked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public int getPresentCount() {
        return (int) students.stream().filter(s -> "PRESENT".equals(s.getStatus())).count();
    }

    public int getAbsentCount() {
        return (int) students.stream().filter(s -> "ABSENT".equals(s.getStatus())).count();
    }

    public int getLateCount() {
        return (int) students.stream().filter(s -> "LATE".equals(s.getStatus())).count();
    }
}
