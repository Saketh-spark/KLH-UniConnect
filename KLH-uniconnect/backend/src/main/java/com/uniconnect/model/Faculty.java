package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "faculties")
public class Faculty {
  @Id
  private String id;

  @Indexed(unique = true)
  private String email;

  private String password;
  private Instant createdAt;

  // Personal info
  private String name;
  private String employeeId;
  private String avatarUrl;
  private String coverUrl;
  private String department;
  private String designation;
  private String phone;
  private String officeLocation;
  private String joiningDate;
  private String bio;

  // Professional
  private String qualification;
  private String specialization;
  private Integer experienceYears;
  private String researchInterests;
  private List<String> subjectsHandled = new ArrayList<>();

  // Portfolio
  private List<Publication> publications = new ArrayList<>();
  private List<String> patents = new ArrayList<>();
  private List<FacultyAward> awards = new ArrayList<>();
  private List<String> workshopsConducted = new ArrayList<>();
  private List<ResearchProject> researchProjects = new ArrayList<>();
  private List<FacultyDocument> documents = new ArrayList<>();

  // Settings
  private String theme;
  private String language;
  private String privacySettings;
  private String notificationPrefs;

  public Faculty() {}

  public Faculty(String email, String password, Instant createdAt) {
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  // Getters and setters
  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getEmployeeId() { return employeeId; }
  public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
  public String getAvatarUrl() { return avatarUrl; }
  public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
  public String getCoverUrl() { return coverUrl; }
  public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
  public String getDepartment() { return department; }
  public void setDepartment(String department) { this.department = department; }
  public String getDesignation() { return designation; }
  public void setDesignation(String designation) { this.designation = designation; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getOfficeLocation() { return officeLocation; }
  public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }
  public String getJoiningDate() { return joiningDate; }
  public void setJoiningDate(String joiningDate) { this.joiningDate = joiningDate; }
  public String getBio() { return bio; }
  public void setBio(String bio) { this.bio = bio; }
  public String getQualification() { return qualification; }
  public void setQualification(String qualification) { this.qualification = qualification; }
  public String getSpecialization() { return specialization; }
  public void setSpecialization(String specialization) { this.specialization = specialization; }
  public Integer getExperienceYears() { return experienceYears; }
  public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
  public String getResearchInterests() { return researchInterests; }
  public void setResearchInterests(String researchInterests) { this.researchInterests = researchInterests; }
  public List<String> getSubjectsHandled() { return subjectsHandled; }
  public void setSubjectsHandled(List<String> subjectsHandled) { this.subjectsHandled = subjectsHandled; }
  public List<Publication> getPublications() { return publications; }
  public void setPublications(List<Publication> publications) { this.publications = publications; }
  public List<String> getPatents() { return patents; }
  public void setPatents(List<String> patents) { this.patents = patents; }
  public List<FacultyAward> getAwards() { return awards; }
  public void setAwards(List<FacultyAward> awards) { this.awards = awards; }
  public List<String> getWorkshopsConducted() { return workshopsConducted; }
  public void setWorkshopsConducted(List<String> workshopsConducted) { this.workshopsConducted = workshopsConducted; }
  public List<ResearchProject> getResearchProjects() { return researchProjects; }
  public void setResearchProjects(List<ResearchProject> researchProjects) { this.researchProjects = researchProjects; }
  public List<FacultyDocument> getDocuments() { return documents; }
  public void setDocuments(List<FacultyDocument> documents) { this.documents = documents; }
  public String getTheme() { return theme; }
  public void setTheme(String theme) { this.theme = theme; }
  public String getLanguage() { return language; }
  public void setLanguage(String language) { this.language = language; }
  public String getPrivacySettings() { return privacySettings; }
  public void setPrivacySettings(String privacySettings) { this.privacySettings = privacySettings; }
  public String getNotificationPrefs() { return notificationPrefs; }
  public void setNotificationPrefs(String notificationPrefs) { this.notificationPrefs = notificationPrefs; }

  // Inner classes
  public static class Publication {
    private String title;
    private String journal;
    private String year;
    private String doi;
    public Publication() {}
    public Publication(String title, String journal, String year, String doi) {
      this.title = title; this.journal = journal; this.year = year; this.doi = doi;
    }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getJournal() { return journal; }
    public void setJournal(String journal) { this.journal = journal; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getDoi() { return doi; }
    public void setDoi(String doi) { this.doi = doi; }
  }

  public static class FacultyAward {
    private String title;
    private String description;
    private String date;
    public FacultyAward() {}
    public FacultyAward(String title, String description, String date) {
      this.title = title; this.description = description; this.date = date;
    }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
  }

  public static class ResearchProject {
    private String title;
    private String status;
    private String funding;
    private String description;
    public ResearchProject() {}
    public ResearchProject(String title, String status, String funding, String description) {
      this.title = title; this.status = status; this.funding = funding; this.description = description;
    }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFunding() { return funding; }
    public void setFunding(String funding) { this.funding = funding; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
  }

  public static class FacultyDocument {
    private String name;
    private String type;
    private String fileUrl;
    private String uploadDate;
    public FacultyDocument() {}
    public FacultyDocument(String name, String type, String fileUrl, String uploadDate) {
      this.name = name; this.type = type; this.fileUrl = fileUrl; this.uploadDate = uploadDate;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getUploadDate() { return uploadDate; }
    public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }
  }
}
