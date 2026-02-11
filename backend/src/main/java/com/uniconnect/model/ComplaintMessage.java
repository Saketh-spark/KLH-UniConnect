package com.uniconnect.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "complaint_messages")
public class ComplaintMessage {
    @Id
    private String id;

    private String complaintId;
    private String email;
    private String content;
    private Boolean fromStudent;
    private LocalDateTime timestamp;

    public ComplaintMessage() {}

    public ComplaintMessage(String complaintId, String email, String content, Boolean fromStudent) {
        this.complaintId = complaintId;
        this.email = email;
        this.content = content;
        this.fromStudent = fromStudent;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getComplaintId() { return complaintId; }
    public void setComplaintId(String complaintId) { this.complaintId = complaintId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getFromStudent() { return fromStudent; }
    public void setFromStudent(Boolean fromStudent) { this.fromStudent = fromStudent; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
