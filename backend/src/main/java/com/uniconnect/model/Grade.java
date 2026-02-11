package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "grades")
public class Grade {
    @Id
    private String id;
    
    private String studentId;
    private String studentName;
    private String subject;
    private String semester;
    private String batch;
    
    private int examMarks; // Out of 100
    private int assignmentMarks; // Out of 100
    private int projectMarks; // Out of 100
    private int participationMarks; // Out of 100
    
    private int totalMarks; // Sum of all
    private double cgpa; // CGPA (0-10)
    private String grade; // A, B, C, D, F
    
    private String remarks;
    private Instant lastUpdated;
    private Instant createdAt;
    
    public Grade() {
        this.createdAt = Instant.now();
        this.lastUpdated = Instant.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    
    public int getExamMarks() { return examMarks; }
    public void setExamMarks(int examMarks) { this.examMarks = examMarks; }
    
    public int getAssignmentMarks() { return assignmentMarks; }
    public void setAssignmentMarks(int assignmentMarks) { this.assignmentMarks = assignmentMarks; }
    
    public int getProjectMarks() { return projectMarks; }
    public void setProjectMarks(int projectMarks) { this.projectMarks = projectMarks; }
    
    public int getParticipationMarks() { return participationMarks; }
    public void setParticipationMarks(int participationMarks) { this.participationMarks = participationMarks; }
    
    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
    
    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    
    public Instant getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(Instant lastUpdated) { this.lastUpdated = lastUpdated; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
