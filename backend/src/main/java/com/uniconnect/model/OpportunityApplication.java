package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import java.time.Instant;

@Document(collection = "opportunity_applications")
@CompoundIndex(name = "applicant_opp_idx", def = "{'applicantEmail': 1, 'opportunityId': 1}", unique = true)
public class OpportunityApplication {
    @Id private String id;
    private String opportunityId;
    private String applicantEmail;
    private String applicantName;
    private String resumeUrl;
    private String coverNote;
    private String status; // APPLIED, SHORTLISTED, REJECTED, WITHDRAWN
    private Instant appliedAt;

    public OpportunityApplication() { this.appliedAt = Instant.now(); this.status = "APPLIED"; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOpportunityId() { return opportunityId; }
    public void setOpportunityId(String opportunityId) { this.opportunityId = opportunityId; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }
    public String getCoverNote() { return coverNote; }
    public void setCoverNote(String coverNote) { this.coverNote = coverNote; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Instant appliedAt) { this.appliedAt = appliedAt; }
}
