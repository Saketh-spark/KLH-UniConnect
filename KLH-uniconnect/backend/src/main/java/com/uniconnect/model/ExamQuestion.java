package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "exam_questions")
public class ExamQuestion {
    @Id
    private String id;
    
    private String questionText;
    private String questionType; // MCQ, DESCRIPTIVE, CODING
    private String subject;
    private String unit;
    private String difficulty; // EASY, MEDIUM, HARD
    
    private int marks;
    private int optionCount; // For MCQ
    
    private List<String> options = new ArrayList<>(); // For MCQ
    private String correctAnswer; // MCQ: "A"/"B"/"C"/"D" or descriptive: answer text
    private String explanation; // Explanation for correct answer
    
    private boolean isActive;
    private String createdBy; // Faculty ID
    private Instant createdAt;
    private Instant updatedAt;
    private int usageCount; // How many times used in exams
    
    public ExamQuestion() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.isActive = true;
        this.marks = 1;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
    
    public int getOptionCount() { return optionCount; }
    public void setOptionCount(int optionCount) { this.optionCount = optionCount; }
    
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    
    public int getUsageCount() { return usageCount; }
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }
}
