package com.uniconnect.dto;

public class StudentAttendanceSummary {
    private String subject;
    private String subjectCode;
    private Integer attended;
    private Integer total;
    private Double percentage;
    private String status; // Good, Warning, Critical

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public Integer getAttended() { return attended; }
    public void setAttended(Integer attended) { this.attended = attended; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
