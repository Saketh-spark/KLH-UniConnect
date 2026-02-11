package com.uniconnect.dto;

public class GradeSubmissionRequest {
    private Integer marks;
    private String feedback;

    public Integer getMarks() {
        return marks;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
