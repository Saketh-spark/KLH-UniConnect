package com.uniconnect.controller;

import com.uniconnect.dto.*;
import com.uniconnect.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ========== FACULTY ENDPOINTS ==========

    @PostMapping
    public ResponseEntity<AttendanceRecordResponse> createAttendance(
            @RequestHeader(value = "X-Faculty-Id", required = false, defaultValue = "faculty-001") String facultyId,
            @RequestHeader(value = "X-Faculty-Name", required = false, defaultValue = "Dr. Faculty") String facultyName,
            @RequestBody CreateAttendanceRequest request) {
        AttendanceRecordResponse response = attendanceService.createAttendanceRecord(facultyId, facultyName, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AttendanceRecordResponse>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendanceRecords());
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<AttendanceRecordResponse>> getAttendanceByFaculty(
            @RequestHeader(value = "X-Faculty-Id", required = false, defaultValue = "faculty-001") String facultyId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByFaculty(facultyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceRecordResponse> getAttendanceById(@PathVariable String id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceRecordResponse> updateAttendance(
            @PathVariable String id,
            @RequestBody CreateAttendanceRequest request) {
        AttendanceRecordResponse response = attendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<AttendanceRecordResponse> lockAttendance(@PathVariable String id) {
        return ResponseEntity.ok(attendanceService.lockAttendance(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAttendance(@PathVariable String id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(Map.of("message", "Attendance record deleted successfully"));
    }

    @GetMapping("/low-attendance")
    public ResponseEntity<List<LowAttendanceStudent>> getLowAttendanceStudents(
            @RequestHeader(value = "X-Faculty-Id", required = false, defaultValue = "faculty-001") String facultyId) {
        return ResponseEntity.ok(attendanceService.getLowAttendanceStudents(facultyId));
    }

    // ========== STUDENT ENDPOINTS ==========

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, String>>> getAllStudents() {
        return ResponseEntity.ok(attendanceService.getAllStudentsForAttendance());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentAttendanceSummary>> getStudentAttendance(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @GetMapping("/student/{studentId}/overview")
    public ResponseEntity<Map<String, Object>> getStudentOverview(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceOverview(studentId));
    }

    // ========== ADMIN/SEED ENDPOINTS ==========

    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seedSampleData() {
        attendanceService.seedSampleData();
        return ResponseEntity.ok(Map.of("message", "Sample attendance data seeded successfully"));
    }
}
