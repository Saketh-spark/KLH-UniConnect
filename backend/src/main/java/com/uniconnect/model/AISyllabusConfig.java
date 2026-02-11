package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "ai_syllabus_configs")
public class AISyllabusConfig {
    @Id
    private String id;
    
    private String facultyId;
    private String subject;
    private String semester;
    private String department;
    private List<String> topics = new ArrayList<>();
    private List<String> restrictedTopics = new ArrayList<>();  // Topics AI should NOT answer about
    private List<String> materialUrls = new ArrayList<>();       // Uploaded materials for AI context
    private boolean restrictNonAcademic;
    private String syllabusText;                                 // Raw syllabus text for AI boundary
    private Instant createdAt;
    private Instant updatedAt;
    
    public AISyllabusConfig() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.restrictNonAcademic = true;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }
    
    public List<String> getRestrictedTopics() { return restrictedTopics; }
    public void setRestrictedTopics(List<String> restrictedTopics) { this.restrictedTopics = restrictedTopics; }
    
    public List<String> getMaterialUrls() { return materialUrls; }
    public void setMaterialUrls(List<String> materialUrls) { this.materialUrls = materialUrls; }
    
    public boolean isRestrictNonAcademic() { return restrictNonAcademic; }
    public void setRestrictNonAcademic(boolean restrictNonAcademic) { this.restrictNonAcademic = restrictNonAcademic; }
    
    public String getSyllabusText() { return syllabusText; }
    public void setSyllabusText(String syllabusText) { this.syllabusText = syllabusText; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
