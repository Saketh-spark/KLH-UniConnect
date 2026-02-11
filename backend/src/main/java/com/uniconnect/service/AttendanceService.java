package com.uniconnect.service;

import com.uniconnect.dto.*;
import com.uniconnect.model.AttendanceRecord;
import com.uniconnect.model.Student;
import com.uniconnect.repository.AttendanceRepository;
import com.uniconnect.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    // ========== GET ALL STUDENTS FOR ATTENDANCE ==========

    public List<Map<String, String>> getAllStudentsForAttendance() {
        List<Student> students = studentRepository.findAll();
        return students.stream()
            .map(s -> {
                Map<String, String> studentInfo = new HashMap<>();
                // Use email prefix as studentId to match the student portal login identity
                String emailPrefix = (s.getEmail() != null && s.getEmail().contains("@"))
                        ? s.getEmail().split("@")[0] : s.getId();
                studentInfo.put("studentId", emailPrefix);
                studentInfo.put("studentName", s.getName() != null ? s.getName() : "Unknown");
                studentInfo.put("rollNumber", s.getRollNumber() != null ? s.getRollNumber() : emailPrefix);
                studentInfo.put("email", s.getEmail());
                studentInfo.put("branch", s.getBranch() != null ? s.getBranch() : "");
                studentInfo.put("year", s.getYear() != null ? s.getYear() : "");
                return studentInfo;
            })
            .collect(Collectors.toList());
    }

    // ========== FACULTY METHODS ==========

    public AttendanceRecordResponse createAttendanceRecord(String facultyId, String facultyName, 
                                                            CreateAttendanceRequest request) {
        AttendanceRecord record = new AttendanceRecord();
        record.setSubject(request.getSubject());
        record.setSubjectCode(request.getSubjectCode());
        record.setSection(request.getSection());
        record.setDate(LocalDate.parse(request.getDate(), DATE_FORMATTER));
        record.setPeriod(request.getPeriod());
        record.setFacultyId(facultyId);
        record.setFacultyName(facultyName);
        record.setTotalStudents(request.getTotalStudents() != null ? request.getTotalStudents() : 45);
        record.setLocked(false);

        // Add students if provided
        if (request.getStudents() != null && !request.getStudents().isEmpty()) {
            List<AttendanceRecord.StudentAttendance> students = request.getStudents().stream()
                .map(dto -> {
                    AttendanceRecord.StudentAttendance sa = new AttendanceRecord.StudentAttendance();
                    sa.setStudentId(dto.getStudentId());
                    sa.setStudentName(dto.getStudentName());
                    sa.setRollNumber(dto.getRollNumber());
                    sa.setStatus(dto.getStatus() != null ? dto.getStatus() : "ABSENT");
                    sa.setRemarks(dto.getRemarks());
                    return sa;
                })
                .collect(Collectors.toList());
            record.setStudents(students);
        }

        record = attendanceRepository.save(record);
        return convertToResponse(record);
    }

    public List<AttendanceRecordResponse> getAllAttendanceRecords() {
        return attendanceRepository.findAllByOrderByDateDesc().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public List<AttendanceRecordResponse> getAttendanceByFaculty(String facultyId) {
        return attendanceRepository.findByFacultyId(facultyId).stream()
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public AttendanceRecordResponse getAttendanceById(String id) {
        AttendanceRecord record = attendanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        return convertToResponse(record);
    }

    public AttendanceRecordResponse updateAttendance(String id, CreateAttendanceRequest request) {
        AttendanceRecord record = attendanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        if (record.getLocked()) {
            throw new RuntimeException("Attendance record is locked and cannot be modified");
        }

        // Update students
        if (request.getStudents() != null) {
            List<AttendanceRecord.StudentAttendance> students = request.getStudents().stream()
                .map(dto -> {
                    AttendanceRecord.StudentAttendance sa = new AttendanceRecord.StudentAttendance();
                    sa.setStudentId(dto.getStudentId());
                    sa.setStudentName(dto.getStudentName());
                    sa.setRollNumber(dto.getRollNumber());
                    sa.setStatus(dto.getStatus());
                    sa.setRemarks(dto.getRemarks());
                    return sa;
                })
                .collect(Collectors.toList());
            record.setStudents(students);
        }

        record.setUpdatedAt(LocalDateTime.now());
        record = attendanceRepository.save(record);
        return convertToResponse(record);
    }

    public AttendanceRecordResponse lockAttendance(String id) {
        AttendanceRecord record = attendanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        record.setLocked(true);
        record.setUpdatedAt(LocalDateTime.now());
        record = attendanceRepository.save(record);
        return convertToResponse(record);
    }

    public void deleteAttendance(String id) {
        AttendanceRecord record = attendanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        if (record.getLocked()) {
            throw new RuntimeException("Attendance record is locked and cannot be deleted");
        }
        attendanceRepository.delete(record);
    }

    public List<LowAttendanceStudent> getLowAttendanceStudents(String facultyId) {
        List<AttendanceRecord> records = attendanceRepository.findByFacultyId(facultyId);
        return calculateLowAttendanceStudents(records);
    }

    // ========== STUDENT METHODS ==========

    public List<StudentAttendanceSummary> getStudentAttendance(String studentId) {
        List<AttendanceRecord> allRecords = attendanceRepository.findAll();
        
        // Group by subject
        Map<String, List<AttendanceRecord>> bySubject = allRecords.stream()
            .collect(Collectors.groupingBy(AttendanceRecord::getSubject));

        List<StudentAttendanceSummary> summaries = new ArrayList<>();

        for (Map.Entry<String, List<AttendanceRecord>> entry : bySubject.entrySet()) {
            String subject = entry.getKey();
            List<AttendanceRecord> subjectRecords = entry.getValue();

            int totalClasses = 0;
            int attended = 0;

            for (AttendanceRecord record : subjectRecords) {
                for (AttendanceRecord.StudentAttendance sa : record.getStudents()) {
                    // Match by studentId to handle both old and new records
                    boolean idMatch = sa.getStudentId() != null && sa.getStudentId().equals(studentId);
                    if (idMatch) {
                        totalClasses++; // Student is in this session's roster
                        if ("PRESENT".equals(sa.getStatus()) || "LATE".equals(sa.getStatus())) {
                            attended++;
                        }
                        break;
                    }
                }
            }

            double percentage = totalClasses > 0 ? (attended * 100.0 / totalClasses) : 0;

            StudentAttendanceSummary summary = new StudentAttendanceSummary();
            summary.setSubject(subject);
            summary.setSubjectCode(subjectRecords.get(0).getSubjectCode());
            summary.setAttended(attended);
            summary.setTotal(totalClasses);
            summary.setPercentage(Math.round(percentage * 10.0) / 10.0);
            summary.setStatus(percentage >= 85 ? "Good" : percentage >= 75 ? "Warning" : "Critical");

            summaries.add(summary);
        }

        return summaries;
    }

    public Map<String, Object> getStudentAttendanceOverview(String studentId) {
        List<StudentAttendanceSummary> summaries = getStudentAttendance(studentId);

        int totalAttended = summaries.stream().mapToInt(StudentAttendanceSummary::getAttended).sum();
        int totalClasses = summaries.stream().mapToInt(StudentAttendanceSummary::getTotal).sum();
        double overallPercentage = totalClasses > 0 ? (totalAttended * 100.0 / totalClasses) : 0;

        List<StudentAttendanceSummary> criticalSubjects = summaries.stream()
            .filter(s -> s.getPercentage() < 75)
            .collect(Collectors.toList());

        Map<String, Object> overview = new HashMap<>();
        overview.put("overallPercentage", Math.round(overallPercentage * 10.0) / 10.0);
        overview.put("totalAttended", totalAttended);
        overview.put("totalClasses", totalClasses);
        overview.put("subjects", summaries);
        overview.put("criticalSubjects", criticalSubjects);

        return overview;
    }

    // ========== HELPER METHODS ==========

    private AttendanceRecordResponse convertToResponse(AttendanceRecord record) {
        AttendanceRecordResponse response = new AttendanceRecordResponse();
        response.setId(record.getId());
        response.setSubject(record.getSubject());
        response.setSubjectCode(record.getSubjectCode());
        response.setSection(record.getSection());
        response.setDate(record.getDate().format(DATE_FORMATTER));
        response.setPeriod(record.getPeriod());
        response.setFacultyId(record.getFacultyId());
        response.setFacultyName(record.getFacultyName());
        response.setPresent(record.getPresentCount());
        response.setAbsent(record.getAbsentCount());
        response.setLate(record.getLateCount());
        response.setTotal(record.getTotalStudents() != null ? record.getTotalStudents() : record.getStudents().size());
        response.setLocked(record.getLocked());

        int total = response.getTotal();
        int presentAndLate = response.getPresent() + response.getLate();
        response.setPercentage(total > 0 ? Math.round((presentAndLate * 100.0 / total) * 10.0) / 10.0 : 0.0);

        // Convert students
        List<AttendanceRecordResponse.StudentAttendanceInfo> studentInfos = record.getStudents().stream()
            .map(sa -> {
                AttendanceRecordResponse.StudentAttendanceInfo info = new AttendanceRecordResponse.StudentAttendanceInfo();
                info.setStudentId(sa.getStudentId());
                info.setStudentName(sa.getStudentName());
                info.setRollNumber(sa.getRollNumber());
                info.setStatus(sa.getStatus());
                info.setRemarks(sa.getRemarks());
                return info;
            })
            .collect(Collectors.toList());
        response.setStudents(studentInfos);

        return response;
    }

    private List<LowAttendanceStudent> calculateLowAttendanceStudents(List<AttendanceRecord> records) {
        // Track attendance per student per subject
        Map<String, Map<String, int[]>> studentSubjectAttendance = new HashMap<>();

        for (AttendanceRecord record : records) {
            String subject = record.getSubject();
            String subjectCode = record.getSubjectCode();

            for (AttendanceRecord.StudentAttendance sa : record.getStudents()) {
                String studentId = sa.getStudentId();
                String studentName = sa.getStudentName();
                String key = studentId + "|" + subject;

                studentSubjectAttendance.computeIfAbsent(key, k -> {
                    Map<String, int[]> map = new HashMap<>();
                    map.put("name", new int[]{0});
                    map.put("attendance", new int[]{0, 0}); // [attended, total]
                    map.put("subject", new int[]{0});
                    map.put("subjectCode", new int[]{0});
                    return map;
                });

                Map<String, int[]> data = studentSubjectAttendance.get(key);
                int[] attendance = data.get("attendance");
                attendance[1]++; // total classes
                if ("PRESENT".equals(sa.getStatus()) || "LATE".equals(sa.getStatus())) {
                    attendance[0]++; // attended
                }
            }
        }

        // Find students below 75%
        List<LowAttendanceStudent> lowAttendanceStudents = new ArrayList<>();

        for (AttendanceRecord record : records) {
            String subject = record.getSubject();
            String subjectCode = record.getSubjectCode();

            for (AttendanceRecord.StudentAttendance sa : record.getStudents()) {
                String studentId = sa.getStudentId();
                String key = studentId + "|" + subject;

                Map<String, int[]> data = studentSubjectAttendance.get(key);
                if (data != null) {
                    int[] attendance = data.get("attendance");
                    if (attendance[1] > 0) {
                        double percentage = (attendance[0] * 100.0) / attendance[1];
                        if (percentage < 75) {
                            // Check if already added
                            boolean exists = lowAttendanceStudents.stream()
                                .anyMatch(las -> las.getStudentId().equals(studentId) && 
                                                  las.getSubject().equals(subject));
                            
                            if (!exists) {
                                LowAttendanceStudent las = new LowAttendanceStudent();
                                las.setStudentId(studentId);
                                las.setStudentName(sa.getStudentName());
                                las.setSubject(subject);
                                las.setSubjectCode(subjectCode);
                                las.setPercentage(Math.round(percentage * 10.0) / 10.0);
                                las.setStatus(percentage < 70 ? "Critical" : "Below 75%");
                                lowAttendanceStudents.add(las);
                            }
                        }
                    }
                }
            }
        }

        // Sort by percentage ascending
        lowAttendanceStudents.sort(Comparator.comparingDouble(LowAttendanceStudent::getPercentage));

        return lowAttendanceStudents;
    }

    // Seed sample data for testing
    public void seedSampleData() {
        if (attendanceRepository.count() > 0) {
            return; // Already has data
        }

        String[] subjects = {"Web Development", "Data Science", "Database Design", "Operating Systems", "Cloud Computing"};
        String[] codes = {"CS301", "CS302", "CS303", "CS304", "CS305"};
        String[] students = {
            "STU001|Rahul Kumar", "STU002|Priya Singh", "STU003|Amit Sharma", 
            "STU004|Sneha Patel", "STU005|Vikram Reddy", "STU006|Neha Gupta",
            "STU007|Arjun Verma", "STU008|Kavita Rao", "STU009|Rohit Mishra",
            "STU010|Ananya Das"
        };

        Random random = new Random(42);
        LocalDate today = LocalDate.now();

        for (int subIdx = 0; subIdx < subjects.length; subIdx++) {
            String subject = subjects[subIdx];
            String code = codes[subIdx];

            // Create 10 attendance records per subject (last 10 days)
            for (int day = 0; day < 10; day++) {
                AttendanceRecord record = new AttendanceRecord();
                record.setSubject(subject);
                record.setSubjectCode(code);
                record.setSection("A");
                record.setDate(today.minusDays(day));
                record.setPeriod("Period " + ((day % 4) + 1));
                record.setFacultyId("faculty-001");
                record.setFacultyName("Dr. Faculty");
                record.setTotalStudents(students.length);
                record.setLocked(day > 2); // Lock older records

                List<AttendanceRecord.StudentAttendance> studentList = new ArrayList<>();
                for (String studentData : students) {
                    String[] parts = studentData.split("\\|");
                    AttendanceRecord.StudentAttendance sa = new AttendanceRecord.StudentAttendance();
                    sa.setStudentId(parts[0]);
                    sa.setStudentName(parts[1]);
                    
                    // Randomize attendance, but make some students have low attendance
                    int roll = random.nextInt(100);
                    if (parts[0].equals("STU002") || parts[0].equals("STU005")) {
                        // Low attendance students - 60% chance absent
                        sa.setStatus(roll < 40 ? "PRESENT" : (roll < 45 ? "LATE" : "ABSENT"));
                    } else {
                        // Normal students - 85% present
                        sa.setStatus(roll < 80 ? "PRESENT" : (roll < 90 ? "LATE" : "ABSENT"));
                    }
                    studentList.add(sa);
                }
                record.setStudents(studentList);

                attendanceRepository.save(record);
            }
        }
    }
}
