package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "resumes")
public class Resume {
    @Id
    private String id;
    private String studentId;
    private String studentEmail;
    private String title;
    private String summary;
    private List<Experience> experience = new ArrayList<>();
    private List<Education> education = new ArrayList<>();
    private List<String> skills = new ArrayList<>();
    private List<String> certifications = new ArrayList<>();
    private List<Project> projects = new ArrayList<>();
    private String template; // modern, classic, minimal
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Full resume builder data (stores the complete frontend form state)
    private Map<String, Object> resumeBuilderData;

    public Resume() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.template = "modern";
    }

    public static class Experience {
        private String title;
        private String company;
        private String location;
        private String startDate;
        private String endDate;
        private String description;
        private boolean current;

        public Experience() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isCurrent() { return current; }
        public void setCurrent(boolean current) { this.current = current; }
    }

    public static class Education {
        private String degree;
        private String institution;
        private String location;
        private String graduationDate;
        private String gpa;

        public Education() {}

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }
        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getGraduationDate() { return graduationDate; }
        public void setGraduationDate(String graduationDate) { this.graduationDate = graduationDate; }
        public String getGpa() { return gpa; }
        public void setGpa(String gpa) { this.gpa = gpa; }
    }

    public static class Project {
        private String name;
        private String description;
        private List<String> technologies;
        private String url;

        public Project() {
            this.technologies = new ArrayList<>();
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getTechnologies() { return technologies; }
        public void setTechnologies(List<String> technologies) { this.technologies = technologies; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<Experience> getExperience() { return experience; }
    public void setExperience(List<Experience> experience) { this.experience = experience; }

    public List<Education> getEducation() { return education; }
    public void setEducation(List<Education> education) { this.education = education; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public List<Project> getProjects() { return projects; }
    public void setProjects(List<Project> projects) { this.projects = projects; }

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Map<String, Object> getResumeBuilderData() { return resumeBuilderData; }
    public void setResumeBuilderData(Map<String, Object> resumeBuilderData) { this.resumeBuilderData = resumeBuilderData; }
}
