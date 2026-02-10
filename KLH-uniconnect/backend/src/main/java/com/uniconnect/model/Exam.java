package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exams")
public class Exam {
    @Id
    private String id;
    
    private String title;
    private String subject;
    private String facultyId;
    private String facultyName;
    private String class_; // Class or section
    private String semester;
    private String batch;
    
    private long durationMinutes;
    private int totalMarks;
    private String description;
    private String instructions;
    
    private Instant startTime;
    private Instant endTime;
    private Instant createdAt;
    private Instant updatedAt;
    
    private String status; // DRAFT, SCHEDULED, ONGOING, COMPLETED
    private boolean autoSubmitOnTimeout;
    private boolean negativeMark;
    private int negativeMarkPercent; // e.g., 25% of correct mark
    private boolean shuffleQuestions;
    private boolean shuffleOptions;
    
    private List<String> questionIds = new ArrayList<>(); // IDs of questions in this exam
    private List<String> enrolledStudentsIds = new ArrayList<>(); // Student IDs who can take this exam
    private boolean resultsPublished;
    private Instant resultsPublishedAt;
    
    private double averageScore;
    private double highestScore;
    private double lowestScore;
    private int totalAttempts;
    private int totalSubmitted;
    
    public Exam() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.status = "DRAFT";
        this.autoSubmitOnTimeout = true;
        this.negativeMark = false;
        this.shuffleQuestions = false;
        this.shuffleOptions = false;
        this.resultsPublished = false;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
    
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
    
    public String getClass_() { return class_; }
    public void setClass_(String class_) { this.class_ = class_; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    
    public long getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(long durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public int getTotalMarks() { return totalMarks; }
    public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    
    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    
    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public boolean isAutoSubmitOnTimeout() { return autoSubmitOnTimeout; }
    public void setAutoSubmitOnTimeout(boolean autoSubmitOnTimeout) { this.autoSubmitOnTimeout = autoSubmitOnTimeout; }
    
    public boolean isNegativeMark() { return negativeMark; }
    public void setNegativeMark(boolean negativeMark) { this.negativeMark = negativeMark; }
    
    public int getNegativeMarkPercent() { return negativeMarkPercent; }
    public void setNegativeMarkPercent(int negativeMarkPercent) { this.negativeMarkPercent = negativeMarkPercent; }
    
    public boolean isShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }
    
    public boolean isShuffleOptions() { return shuffleOptions; }
    public void setShuffleOptions(boolean shuffleOptions) { this.shuffleOptions = shuffleOptions; }
    
    public List<String> getQuestionIds() { return questionIds; }
    public void setQuestionIds(List<String> questionIds) { this.questionIds = questionIds; }
    
    public List<String> getEnrolledStudentsIds() { return enrolledStudentsIds; }
    public void setEnrolledStudentsIds(List<String> enrolledStudentsIds) { this.enrolledStudentsIds = enrolledStudentsIds; }
    
    public boolean isResultsPublished() { return resultsPublished; }
    public void setResultsPublished(boolean resultsPublished) { this.resultsPublished = resultsPublished; }
    
    public Instant getResultsPublishedAt() { return resultsPublishedAt; }
    public void setResultsPublishedAt(Instant resultsPublishedAt) { this.resultsPublishedAt = resultsPublishedAt; }
    
    public double getAverageScore() { return averageScore; }
    public void setAverageScore(double averageScore) { this.averageScore = averageScore; }
    
    public double getHighestScore() { return highestScore; }
    public void setHighestScore(double highestScore) { this.highestScore = highestScore; }
    
    public double getLowestScore() { return lowestScore; }
    public void setLowestScore(double lowestScore) { this.lowestScore = lowestScore; }
    
    public int getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(int totalAttempts) { this.totalAttempts = totalAttempts; }
    
    public int getTotalSubmitted() { return totalSubmitted; }
    public void setTotalSubmitted(int totalSubmitted) { this.totalSubmitted = totalSubmitted; }
}
