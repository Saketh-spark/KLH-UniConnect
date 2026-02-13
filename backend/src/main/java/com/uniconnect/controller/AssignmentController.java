package com.uniconnect.controller;

import com.uniconnect.dto.AssignmentResponse;
import com.uniconnect.dto.CreateAssignmentRequest;
import com.uniconnect.dto.FacultyAssignmentResponse;
import com.uniconnect.dto.GradeSubmissionRequest;
import com.uniconnect.dto.SubmissionResponse;
import com.uniconnect.service.AcademicFileUploadService;
import com.uniconnect.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final AcademicFileUploadService fileUploadService;

    public AssignmentController(AssignmentService assignmentService,
                               AcademicFileUploadService fileUploadService) {
        this.assignmentService = assignmentService;
        this.fileUploadService = fileUploadService;
    }

    // ========== STUDENT ENDPOINTS ==========

    @GetMapping
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments(
            @RequestHeader(value = "X-Student-Id", required = false, defaultValue = "anonymous") String studentId) {
        return ResponseEntity.ok(assignmentService.getAllAssignments(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignment(
            @PathVariable String id,
            @RequestHeader(value = "X-Student-Id", required = false, defaultValue = "anonymous") String studentId) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id, studentId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitAssignment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Student-Id", required = false, defaultValue = "anonymous") String studentId) {
        try {
            String fileUrl = fileUploadService.uploadAssignment(file);
            String fileName = file.getOriginalFilename();

            AssignmentResponse assignment = assignmentService.submitAssignment(
                id, studentId, fileUrl, fileName
            );

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Assignment submitted successfully");
            response.put("assignment", assignment);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ========== FACULTY ENDPOINTS ==========

    @GetMapping("/faculty")
    public ResponseEntity<List<FacultyAssignmentResponse>> getAllAssignmentsForFaculty(
            @RequestHeader(value = "X-Faculty-Id", required = false, defaultValue = "faculty-001") String facultyId) {
        return ResponseEntity.ok(assignmentService.getAllAssignmentsForFaculty(facultyId));
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<FacultyAssignmentResponse> getAssignmentForFaculty(
            @PathVariable String id) {
        return ResponseEntity.ok(assignmentService.getAssignmentForFaculty(id));
    }

    @PostMapping("/faculty")
    public ResponseEntity<?> createAssignment(
            @RequestHeader(value = "X-Faculty-Id", required = false, defaultValue = "faculty-001") String facultyId,
            @RequestHeader(value = "X-Faculty-Name", required = false, defaultValue = "Faculty") String facultyName,
            @RequestBody CreateAssignmentRequest request) {
        try {
            FacultyAssignmentResponse response = assignmentService.createAssignment(facultyId, facultyName, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<Map<String, Object>> deleteAssignment(
            @PathVariable String id,
            @RequestHeader(value = "X-Faculty-Id", required = false, defaultValue = "faculty-001") String facultyId) {
        try {
            assignmentService.deleteAssignment(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Assignment deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get all submissions for an assignment
    @GetMapping("/faculty/{id}/submissions")
    public ResponseEntity<?> getSubmissionsForAssignment(@PathVariable String id) {
        try {
            List<SubmissionResponse> submissions = assignmentService.getSubmissionsForAssignment(id);
            return ResponseEntity.ok(submissions);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Grade a submission
    @PutMapping("/faculty/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable String submissionId,
            @RequestBody GradeSubmissionRequest request) {
        try {
            SubmissionResponse response = assignmentService.gradeSubmission(
                submissionId, request.getMarks(), request.getFeedback()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
