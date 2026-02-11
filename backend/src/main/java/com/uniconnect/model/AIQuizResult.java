package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "ai_quiz_results")
public class AIQuizResult {
    @Id
    private String id;
    
    private String studentId;
    private String subject;
    private String quizType;       // "mcq", "short-answer", "long-answer", "mixed"
    private int totalQuestions;
    private int correctAnswers;
    private int wrongAnswers;
    private int skipped;
    private double scorePercent;
    private long timeTakenSeconds;
    private List<Map<String, Object>> questions = new ArrayList<>();  // [{question, options, correctAnswer, studentAnswer, isCorrect, explanation}]
    private List<String> weakTopics = new ArrayList<>();
    private String difficulty;     // "easy", "medium", "hard"
    private Instant completedAt;
    
    public AIQuizResult() {
        this.completedAt = Instant.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getQuizType() { return quizType; }
    public void setQuizType(String quizType) { this.quizType = quizType; }
    
    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
    
    public int getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
    
    public int getWrongAnswers() { return wrongAnswers; }
    public void setWrongAnswers(int wrongAnswers) { this.wrongAnswers = wrongAnswers; }
    
    public int getSkipped() { return skipped; }
    public void setSkipped(int skipped) { this.skipped = skipped; }
    
    public double getScorePercent() { return scorePercent; }
    public void setScorePercent(double scorePercent) { this.scorePercent = scorePercent; }
    
    public long getTimeTakenSeconds() { return timeTakenSeconds; }
    public void setTimeTakenSeconds(long timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }
    
    public List<Map<String, Object>> getQuestions() { return questions; }
    public void setQuestions(List<Map<String, Object>> questions) { this.questions = questions; }
    
    public List<String> getWeakTopics() { return weakTopics; }
    public void setWeakTopics(List<String> weakTopics) { this.weakTopics = weakTopics; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}
