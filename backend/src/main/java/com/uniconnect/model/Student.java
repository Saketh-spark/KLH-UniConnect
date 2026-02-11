package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "students")
public class Student {
  @Id
  private String id;

  @Indexed(unique = true)
  private String email;

  private String password;

  private Instant createdAt;

  // Profile fields
  private String name;
  private String phone;
  private String branch;
  private String location;
  private String joinedDate;
  private String bio;
  private String avatarUrl;
  private String coverUrl;
  private String rollNumber;
  private String year;

  // New profile fields
  private String gender;
  private String dateOfBirth;
  private String address;
  private String parentName;
  private String parentPhone;
  private String bloodGroup;
  private String section;
  private String admissionDate;
  private String course;
  private String semester;
  private Double cgpa;
  private String attendanceSummary;
  private String resume;

  // Settings
  private String theme;
  private String language;
  private String privacySettings;
  private String notificationPrefs;

  private List<Stat> stats = new ArrayList<>();
  private List<SocialLink> socials = new ArrayList<>();
  private List<Skill> skills = new ArrayList<>();
  private List<Certificate> certificates = new ArrayList<>();
  private List<Award> awards = new ArrayList<>();
  private List<Project> projects = new ArrayList<>();
  private List<ProfileDocument> documents = new ArrayList<>();
  private List<Internship> internships = new ArrayList<>();

  public Student() {
  }

  public Student(String email, String password, Instant createdAt) {
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getBranch() {
    return branch;
  }

  public void setBranch(String branch) {
    this.branch = branch;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getJoinedDate() {
    return joinedDate;
  }

  public void setJoinedDate(String joinedDate) {
    this.joinedDate = joinedDate;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public String getCoverUrl() {
    return coverUrl;
  }

  public void setCoverUrl(String coverUrl) {
    this.coverUrl = coverUrl;
  }

  public String getRollNumber() {
    return rollNumber;
  }

  public void setRollNumber(String rollNumber) {
    this.rollNumber = rollNumber;
  }

  public String getYear() {
    return year;
  }

  public void setYear(String year) {
    this.year = year;
  }

  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }
  public String getDateOfBirth() { return dateOfBirth; }
  public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }
  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }
  public String getParentName() { return parentName; }
  public void setParentName(String parentName) { this.parentName = parentName; }
  public String getParentPhone() { return parentPhone; }
  public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }
  public String getBloodGroup() { return bloodGroup; }
  public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
  public String getSection() { return section; }
  public void setSection(String section) { this.section = section; }
  public String getAdmissionDate() { return admissionDate; }
  public void setAdmissionDate(String admissionDate) { this.admissionDate = admissionDate; }
  public String getCourse() { return course; }
  public void setCourse(String course) { this.course = course; }
  public String getSemester() { return semester; }
  public void setSemester(String semester) { this.semester = semester; }
  public Double getCgpa() { return cgpa; }
  public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
  public String getAttendanceSummary() { return attendanceSummary; }
  public void setAttendanceSummary(String attendanceSummary) { this.attendanceSummary = attendanceSummary; }
  public String getResume() { return resume; }
  public void setResume(String resume) { this.resume = resume; }
  public String getTheme() { return theme; }
  public void setTheme(String theme) { this.theme = theme; }
  public String getLanguage() { return language; }
  public void setLanguage(String language) { this.language = language; }
  public String getPrivacySettings() { return privacySettings; }
  public void setPrivacySettings(String privacySettings) { this.privacySettings = privacySettings; }
  public String getNotificationPrefs() { return notificationPrefs; }
  public void setNotificationPrefs(String notificationPrefs) { this.notificationPrefs = notificationPrefs; }
  public List<ProfileDocument> getDocuments() { return documents; }
  public void setDocuments(List<ProfileDocument> documents) { this.documents = documents; }
  public List<Internship> getInternships() { return internships; }
  public void setInternships(List<Internship> internships) { this.internships = internships; }

  public List<Stat> getStats() {
    return stats;
  }

  public void setStats(List<Stat> stats) {
    this.stats = stats;
  }

  public List<SocialLink> getSocials() {
    return socials;
  }

  public void setSocials(List<SocialLink> socials) {
    this.socials = socials;
  }

  public List<Skill> getSkills() {
    return skills;
  }

  public void setSkills(List<Skill> skills) {
    this.skills = skills;
  }

  public List<Certificate> getCertificates() {
    return certificates;
  }

  public void setCertificates(List<Certificate> certificates) {
    this.certificates = certificates;
  }

  public List<Award> getAwards() {
    return awards;
  }

  public void setAwards(List<Award> awards) {
    this.awards = awards;
  }

  public List<Project> getProjects() {
    return projects;
  }

  public void setProjects(List<Project> projects) {
    this.projects = projects;
  }

  public static class Stat {
    private String label;
    private Integer value;

    public Stat() {
    }

    public Stat(String label, Integer value) {
      this.label = label;
      this.value = value;
    }

    public String getLabel() {
      return label;
    }

    public void setLabel(String label) {
      this.label = label;
    }

    public Integer getValue() {
      return value;
    }

    public void setValue(Integer value) {
      this.value = value;
    }
  }

  public static class SocialLink {
    private String label;
    private String url;

    public SocialLink() {
    }

    public SocialLink(String label, String url) {
      this.label = label;
      this.url = url;
    }

    public String getLabel() {
      return label;
    }

    public void setLabel(String label) {
      this.label = label;
    }

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }
  }

  public static class Skill {
    private String name;
    private String level;
    private Integer progress;
    private Integer endorsements;
    private String color;

    public Skill() {
    }

    public Skill(String name, String level, Integer progress, Integer endorsements, String color) {
      this.name = name;
      this.level = level;
      this.progress = progress;
      this.endorsements = endorsements;
      this.color = color;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getLevel() {
      return level;
    }

    public void setLevel(String level) {
      this.level = level;
    }

    public Integer getProgress() {
      return progress;
    }

    public void setProgress(Integer progress) {
      this.progress = progress;
    }

    public Integer getEndorsements() {
      return endorsements;
    }

    public void setEndorsements(Integer endorsements) {
      this.endorsements = endorsements;
    }

    public String getColor() {
      return color;
    }

    public void setColor(String color) {
      this.color = color;
    }
  }

  public static class Certificate {
    private String name;
    private String issuer;
    private String issued;
    private String expires;
    private String banner;

    public Certificate() {
    }

    public Certificate(String name, String issuer, String issued, String expires, String banner) {
      this.name = name;
      this.issuer = issuer;
      this.issued = issued;
      this.expires = expires;
      this.banner = banner;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getIssuer() {
      return issuer;
    }

    public void setIssuer(String issuer) {
      this.issuer = issuer;
    }

    public String getIssued() {
      return issued;
    }

    public void setIssued(String issued) {
      this.issued = issued;
    }

    public String getExpires() {
      return expires;
    }

    public void setExpires(String expires) {
      this.expires = expires;
    }

    public String getBanner() {
      return banner;
    }

    public void setBanner(String banner) {
      this.banner = banner;
    }
  }

  public static class Award {
    private String title;
    private String description;
    private String date;

    public Award() {
    }

    public Award(String title, String description, String date) {
      this.title = title;
      this.description = description;
      this.date = date;
    }

    public String getTitle() {
      return title;
    }

    public void setTitle(String title) {
      this.title = title;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }

    public String getDate() {
      return date;
    }

    public void setDate(String date) {
      this.date = date;
    }
  }

  public static class Project {
    private String name;
    private String description;
    private String banner;
    private List<String> tags = new ArrayList<>();
    private String href;

    public Project() {
    }

    public Project(String name, String description, String banner, List<String> tags, String href) {
      this.name = name;
      this.description = description;
      this.banner = banner;
      this.tags = tags;
      this.href = href;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }

    public String getBanner() {
      return banner;
    }

    public void setBanner(String banner) {
      this.banner = banner;
    }

    public List<String> getTags() {
      return tags;
    }

    public void setTags(List<String> tags) {
      this.tags = tags;
    }

    public String getHref() {
      return href;
    }

    public void setHref(String href) {
      this.href = href;
    }
  }

  public static class ProfileDocument {
    private String name;
    private String type;
    private String fileUrl;
    private String uploadDate;
    private boolean verified;
    public ProfileDocument() {}
    public ProfileDocument(String name, String type, String fileUrl, String uploadDate, boolean verified) {
      this.name = name; this.type = type; this.fileUrl = fileUrl; this.uploadDate = uploadDate; this.verified = verified;
    }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getUploadDate() { return uploadDate; }
    public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
  }

  public static class Internship {
    private String company;
    private String role;
    private String duration;
    private String description;
    public Internship() {}
    public Internship(String company, String role, String duration, String description) {
      this.company = company; this.role = role; this.duration = duration; this.description = description;
    }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
  }
}
