package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "exam_attempts")
public class ExamAttempt {
    @Id
    private String id;
    
    private String examId;
    private String examTitle;
    private String studentId;
    private String studentName;
    private String subject;
    
    private Instant startedAt;
    private Instant submittedAt;
    private long timeSpentSeconds;
    
    private String status; // ONGOING, SUBMITTED, EVALUATED
    
    // Student answers: Map<questionId, selectedAnswer>
    private Map<String, String> studentAnswers = new HashMap<>();
    
    // Question marks: Map<questionId, marksObtained>
    // Initially 0, updated after faculty review/auto-evaluation
    private Map<String, Double> questionMarks = new HashMap<>();
    
    private double totalScore;
    private double totalMarks;
    private double percentage;
    private String grade; // A, B, C, D, F
    
    // For descriptive answers
    private Map<String, String> descriptiveAnswers = new HashMap<>();
    private Map<String, String> facultyRemarks = new HashMap<>();
    private boolean allAnswersEvaluated;
    
    private String submittedForReview; // Timestamp of submission
    private String reviewedBy; // Faculty ID who reviewed
    private Instant reviewedAt;
    
    private Instant createdAt;
    private Instant updatedAt;
    
    public ExamAttempt() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.status = "ONGOING";
        this.totalScore = 0;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getExamId() { return examId; }
    public void setExamId(String examId) { this.examId = examId; }
    
    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    
    public long getTimeSpentSeconds() { return timeSpentSeconds; }
    public void setTimeSpentSeconds(long timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Map<String, String> getStudentAnswers() { return studentAnswers; }
    public void setStudentAnswers(Map<String, String> studentAnswers) { this.studentAnswers = studentAnswers; }
    
    public Map<String, Double> getQuestionMarks() { return questionMarks; }
    public void setQuestionMarks(Map<String, Double> questionMarks) { this.questionMarks = questionMarks; }
    
    public double getTotalScore() { return totalScore; }
    public void setTotalScore(double totalScore) { this.totalScore = totalScore; }
    
    public double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(double totalMarks) { this.totalMarks = totalMarks; }
    
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public Map<String, String> getDescriptiveAnswers() { return descriptiveAnswers; }
    public void setDescriptiveAnswers(Map<String, String> descriptiveAnswers) { this.descriptiveAnswers = descriptiveAnswers; }
    
    public Map<String, String> getFacultyRemarks() { return facultyRemarks; }
    public void setFacultyRemarks(Map<String, String> facultyRemarks) { this.facultyRemarks = facultyRemarks; }
    
    public boolean isAllAnswersEvaluated() { return allAnswersEvaluated; }
    public void setAllAnswersEvaluated(boolean allAnswersEvaluated) { this.allAnswersEvaluated = allAnswersEvaluated; }
    
    public String getSubmittedForReview() { return submittedForReview; }
    public void setSubmittedForReview(String submittedForReview) { this.submittedForReview = submittedForReview; }
    
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
