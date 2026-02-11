package com.uniconnect.service;

import com.uniconnect.dto.AssignmentResponse;
import com.uniconnect.dto.CreateAssignmentRequest;
import com.uniconnect.dto.FacultyAssignmentResponse;
import com.uniconnect.dto.SubmissionResponse;
import com.uniconnect.model.Assignment;
import com.uniconnect.model.AssignmentSubmission;
import com.uniconnect.repository.AssignmentRepository;
import com.uniconnect.repository.AssignmentSubmissionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_ONLY_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    public AssignmentService(AssignmentRepository assignmentRepository,
                           AssignmentSubmissionRepository submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    // ========== FACULTY METHODS ==========

    public FacultyAssignmentResponse createAssignment(String facultyId, String facultyName, 
                                                       CreateAssignmentRequest request) {
        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setSubject(request.getSubject());
        assignment.setUnit(request.getUnit());
        assignment.setDescription(request.getDescription());
        assignment.setAssignmentType(request.getAssignmentType());
        assignment.setTotalMarks(request.getTotalMarks() != null ? request.getTotalMarks() : 100);
        assignment.setTotalStudents(request.getTotalStudents() != null ? request.getTotalStudents() : 45);
        assignment.setCreatedBy(facultyId);
        assignment.setFacultyName(facultyName);

        // Parse due date
        try {
            LocalDateTime dueDate = LocalDateTime.parse(request.getDueDate(), DATE_TIME_FORMATTER);
            assignment.setDueDate(dueDate);
        } catch (Exception e) {
            // Try parsing as date only (add end of day time)
            try {
                LocalDateTime dueDate = LocalDateTime.parse(request.getDueDate() + "T23:59", DATE_TIME_FORMATTER);
                assignment.setDueDate(dueDate);
            } catch (Exception e2) {
                throw new IllegalArgumentException("Invalid date format. Use yyyy-MM-ddTHH:mm");
            }
        }

        assignment = assignmentRepository.save(assignment);
        return convertToFacultyResponse(assignment);
    }

    public List<FacultyAssignmentResponse> getAllAssignmentsForFaculty(String facultyId) {
        List<Assignment> assignments = assignmentRepository.findAll();
        
        return assignments.stream()
                .map(this::convertToFacultyResponse)
                .collect(Collectors.toList());
    }

    public FacultyAssignmentResponse getAssignmentForFaculty(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return convertToFacultyResponse(assignment);
    }

    public void deleteAssignment(String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        // Delete all submissions for this assignment
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(id);
        submissionRepository.deleteAll(submissions);
        
        // Delete the assignment
        assignmentRepository.delete(assignment);
    }

    // Get all submissions for an assignment
    public List<SubmissionResponse> getSubmissionsForAssignment(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        
        return submissions.stream()
                .map(sub -> convertToSubmissionResponse(sub, assignment))
                .collect(Collectors.toList());
    }

    // Grade a submission
    public SubmissionResponse gradeSubmission(String submissionId, Integer marks, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        submission.setMarksObtained(marks);
        submission.setFeedback(feedback);
        submission.setStatus("Graded");
        
        submission = submissionRepository.save(submission);
        return convertToSubmissionResponse(submission, assignment);
    }

    private SubmissionResponse convertToSubmissionResponse(AssignmentSubmission submission, Assignment assignment) {
        SubmissionResponse response = new SubmissionResponse();
        response.setId(submission.getId());
        response.setAssignmentId(submission.getAssignmentId());
        response.setStudentId(submission.getStudentId());
        response.setStudentName("Student " + submission.getStudentId()); // Can be enhanced to fetch actual name
        response.setFileUrl(submission.getFileUrl());
        response.setFileName(submission.getFileName());
        response.setSubmittedAt(submission.getSubmittedAt() != null ? 
            submission.getSubmittedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null);
        response.setMarksObtained(submission.getMarksObtained());
        response.setTotalMarks(assignment.getTotalMarks());
        response.setFeedback(submission.getFeedback());
        response.setStatus(submission.getStatus());
        return response;
    }

    private FacultyAssignmentResponse convertToFacultyResponse(Assignment assignment) {
        FacultyAssignmentResponse response = new FacultyAssignmentResponse();
        response.setId(assignment.getId());
        response.setTitle(assignment.getTitle());
        response.setSubject(assignment.getSubject());
        response.setUnit(assignment.getUnit());
        response.setDescription(assignment.getDescription());
        response.setDueDate(assignment.getDueDate().format(DATE_ONLY_FORMATTER));
        response.setDueTime(assignment.getDueDate().format(TIME_ONLY_FORMATTER));
        response.setAssignmentType(assignment.getAssignmentType());
        response.setTotalMarks(assignment.getTotalMarks());
        response.setTotalStudents(assignment.getTotalStudents() != null ? assignment.getTotalStudents() : 45);
        response.setCreatedDate(assignment.getCreatedAt().format(DATE_ONLY_FORMATTER));
        response.setCreatedBy(assignment.getCreatedBy());
        response.setFacultyName(assignment.getFacultyName());

        // Check if past due
        LocalDateTime now = LocalDateTime.now();
        boolean isPastDue = now.isAfter(assignment.getDueDate());
        response.setIsPastDue(isPastDue);

        // Calculate statistics
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignment.getId());
        int submittedCount = submissions.size();
        int totalStudents = response.getTotalStudents();

        response.setSubmissions(submittedCount);

        if (isPastDue) {
            // After due date: non-submitted are overdue
            response.setPending(0);
            response.setOverdue(totalStudents - submittedCount);
        } else {
            // Before due date: non-submitted are pending
            response.setPending(totalStudents - submittedCount);
            response.setOverdue(0);
        }

        // Calculate average score (from graded submissions)
        double avgScore = submissions.stream()
                .filter(s -> s.getMarksObtained() != null && assignment.getTotalMarks() != null && assignment.getTotalMarks() > 0)
                .mapToDouble(s -> (s.getMarksObtained() * 100.0) / assignment.getTotalMarks())
                .average()
                .orElse(0.0);
        response.setAvgScore(Math.round(avgScore * 10.0) / 10.0);

        return response;
    }

    // ========== STUDENT METHODS ==========

    public List<AssignmentResponse> getAllAssignments(String studentId) {
        List<Assignment> assignments = assignmentRepository.findAll();
        
        return assignments.stream()
                .map(assignment -> convertToResponse(assignment, studentId))
                .collect(Collectors.toList());
    }

    public AssignmentResponse getAssignmentById(String id, String studentId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return convertToResponse(assignment, studentId);
    }

    public AssignmentResponse submitAssignment(String assignmentId, String studentId, 
                                              String fileUrl, String fileName) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // Check if already submitted
        Optional<AssignmentSubmission> existingSubmission = 
            submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        AssignmentSubmission submission;
        if (existingSubmission.isPresent()) {
            submission = existingSubmission.get();
            submission.setFileUrl(fileUrl);
            submission.setFileName(fileName);
            submission.setSubmittedAt(LocalDateTime.now());
        } else {
            submission = new AssignmentSubmission();
            submission.setAssignmentId(assignmentId);
            submission.setStudentId(studentId);
            submission.setFileUrl(fileUrl);
            submission.setFileName(fileName);
        }

        submissionRepository.save(submission);
        return convertToResponse(assignment, studentId);
    }

    private AssignmentResponse convertToResponse(Assignment assignment, String studentId) {
        AssignmentResponse response = new AssignmentResponse();
        response.setId(assignment.getId());
        response.setTitle(assignment.getTitle());
        response.setSubject(assignment.getSubject());
        response.setDescription(assignment.getDescription());
        response.setDueDate(assignment.getDueDate().format(DATE_FORMATTER));
        response.setTotalMarks(assignment.getTotalMarks());

        // Check if assignment is overdue
        LocalDateTime now = LocalDateTime.now();
        boolean isOverdue = now.isAfter(assignment.getDueDate());
        response.setIsOverdue(isOverdue);

        if (isOverdue) {
            long daysOverdue = ChronoUnit.DAYS.between(assignment.getDueDate(), now);
            response.setDaysOverdue(daysOverdue);
        }

        // Check submission status
        Optional<AssignmentSubmission> submission = 
            submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), studentId);

        if (submission.isPresent()) {
            AssignmentSubmission sub = submission.get();
            response.setStatus(sub.getStatus());
            response.setMarks(sub.getMarksObtained());
            response.setFeedback(sub.getFeedback());
        } else {
            response.setStatus(isOverdue ? "Overdue" : "Pending");
        }

        return response;
    }
}
