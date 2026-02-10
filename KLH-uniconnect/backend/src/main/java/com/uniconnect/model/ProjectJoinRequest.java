package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import java.time.Instant;

@Document(collection = "project_join_requests")
@CompoundIndex(name = "applicant_project_idx", def = "{'applicantEmail': 1, 'projectId': 1}", unique = true)
public class ProjectJoinRequest {
    @Id private String id;
    private String projectId;
    private String projectName;
    private String applicantEmail;
    private String applicantName;
    private String role;           // The role they want to fill
    private String message;        // Why they want to join
    private String status;         // PENDING, ACCEPTED, REJECTED
    private Instant createdAt;
    private Instant updatedAt;

    public ProjectJoinRequest() { this.createdAt = Instant.now(); this.updatedAt = Instant.now(); this.status = "PENDING"; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
