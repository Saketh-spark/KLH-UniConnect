package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "certificates")
public class Certificate {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String department;
    private String year;
    private String title;
    private String issuer;
    private String category;
    private LocalDateTime issueDate;
    private LocalDateTime uploadDate;
    private String fileUrl;
    private String originalFileName;
    private String status;
    private String verificationCode;
    private String shareLink;
    private String description;
    private String credentialId;
    private String credentialUrl;
    private String reviewedBy;
    private String reviewNote;
    private String rejectionReason;
    private LocalDateTime approvedDate;
    private boolean universityIssued;
    private String type;
    private String templateName;
    private String eventName;
    private String signature;
    private String generatedBy;

    public Certificate() {
        this.uploadDate = LocalDateTime.now();
        this.status = "pending";
        this.type = "student-uploaded";
        this.universityIssued = false;
        this.verificationCode = generateVerificationCode();
    }

    private String generateVerificationCode() {
        return "CERT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 10000);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDateTime getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDateTime issueDate) { this.issueDate = issueDate; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    public String getShareLink() { return shareLink; }
    public void setShareLink(String shareLink) { this.shareLink = shareLink; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCredentialId() { return credentialId; }
    public void setCredentialId(String credentialId) { this.credentialId = credentialId; }
    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public LocalDateTime getApprovedDate() { return approvedDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }
    public boolean isUniversityIssued() { return universityIssued; }
    public void setUniversityIssued(boolean universityIssued) { this.universityIssued = universityIssued; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }
}
