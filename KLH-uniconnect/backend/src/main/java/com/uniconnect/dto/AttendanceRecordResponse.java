package com.uniconnect.dto;

import java.util.List;

public class AttendanceRecordResponse {
    private String id;
    private String subject;
    private String subjectCode;
    private String section;
    private String date;
    private String period;
    private String facultyId;
    private String facultyName;
    private Integer present;
    private Integer absent;
    private Integer late;
    private Integer total;
    private Double percentage;
    private Boolean locked;
    private List<StudentAttendanceInfo> students;

    public static class StudentAttendanceInfo {
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

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getFacultyId() { return facultyId; }
    public void setFacultyId(String facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public Integer getPresent() { return present; }
    public void setPresent(Integer present) { this.present = present; }

    public Integer getAbsent() { return absent; }
    public void setAbsent(Integer absent) { this.absent = absent; }

    public Integer getLate() { return late; }
    public void setLate(Integer late) { this.late = late; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public Boolean getLocked() { return locked; }
    public void setLocked(Boolean locked) { this.locked = locked; }

    public List<StudentAttendanceInfo> getStudents() { return students; }
    public void setStudents(List<StudentAttendanceInfo> students) { this.students = students; }
}
