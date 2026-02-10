package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.*;

@Document(collection = "collab_projects")
public class CollabProject {
    @Id private String id;
    private String name;
    private String description;
    private String ownerEmail;
    private String ownerName;
    private String domain;           // Web, AI/ML, Mobile, IoT, Blockchain, etc.
    private List<String> techStack = new ArrayList<>();
    private List<String> rolesNeeded = new ArrayList<>();
    private int maxMembers;
    private List<Member> members = new ArrayList<>();
    private String status;           // Active, Completed, Paused
    private String repoUrl;
    private String mentorEmail;
    private String mentorName;
    private Instant createdAt;
    private Instant updatedAt;

    public CollabProject() { this.createdAt = Instant.now(); this.updatedAt = Instant.now(); this.status = "Active"; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public List<String> getTechStack() { return techStack; }
    public void setTechStack(List<String> techStack) { this.techStack = techStack; }
    public List<String> getRolesNeeded() { return rolesNeeded; }
    public void setRolesNeeded(List<String> rolesNeeded) { this.rolesNeeded = rolesNeeded; }
    public int getMaxMembers() { return maxMembers; }
    public void setMaxMembers(int maxMembers) { this.maxMembers = maxMembers; }
    public List<Member> getMembers() { return members; }
    public void setMembers(List<Member> members) { this.members = members; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRepoUrl() { return repoUrl; }
    public void setRepoUrl(String repoUrl) { this.repoUrl = repoUrl; }
    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }
    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static class Member {
        private String email;
        private String name;
        private String role;
        private String rollNumber;
        private String branch;
        private Instant joinedAt;

        public Member() {}
        public Member(String email, String name, String role) {
            this.email = email; this.name = name; this.role = role; this.joinedAt = Instant.now();
        }
        public Member(String email, String name, String role, String rollNumber, String branch) {
            this.email = email; this.name = name; this.role = role;
            this.rollNumber = rollNumber; this.branch = branch; this.joinedAt = Instant.now();
        }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getBranch() { return branch; }
        public void setBranch(String branch) { this.branch = branch; }
        public Instant getJoinedAt() { return joinedAt; }
        public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
    }
}
