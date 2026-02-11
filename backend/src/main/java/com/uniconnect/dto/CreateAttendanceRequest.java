package com.uniconnect.dto;

import java.util.List;

public class CreateAttendanceRequest {
    private String subject;
    private String subjectCode;
    private String section;
    private String date;
    private String period;
    private Integer totalStudents;
    private List<StudentAttendanceDto> students;

    public static class StudentAttendanceDto {
        private String studentId;
        private String studentName;
        private String rollNumber;
        private String status;
        private String remarks;

        public String getStudentId() { return studentId; }
        public void setStudentId(String studentId) { this.studentId = studentId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }

    public List<StudentAttendanceDto> getStudents() { return students; }
    public void setStudents(List<StudentAttendanceDto> students) { this.students = students; }
}
