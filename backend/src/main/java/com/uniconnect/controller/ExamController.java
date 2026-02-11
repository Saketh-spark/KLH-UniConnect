package com.uniconnect.controller;

import com.uniconnect.dto.ExamResponse;
import com.uniconnect.model.Exam;
import com.uniconnect.model.ExamAttempt;
import com.uniconnect.model.ExamQuestion;
import com.uniconnect.service.ExamService;
import com.uniconnect.service.QuestionGeneratorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {
    private final ExamService examService;
    private final QuestionGeneratorService questionGeneratorService;

    public ExamController(ExamService examService, QuestionGeneratorService questionGeneratorService) {
        this.examService = examService;
        this.questionGeneratorService = questionGeneratorService;
    }

    // ============ FACULTY ENDPOINTS ============

    @PostMapping("/create")
    public ResponseEntity<ExamResponse> createExam(
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestBody Exam exam) {
        ExamResponse response = examService.createExam(facultyId, exam);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{examId}")
    public ResponseEntity<ExamResponse> updateExam(
            @PathVariable String examId,
            @RequestBody Exam exam) {
        ExamResponse response = examService.updateExam(examId, exam);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{examId}/schedule")
    public ResponseEntity<ExamResponse> scheduleExam(
            @PathVariable String examId,
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> studentIds = (List<String>) body.get("studentEmails");
        String startTime = (String) body.get("startTime");
        String endTime = (String) body.get("endTime");
        ExamResponse response = examService.scheduleExam(examId, facultyId, studentIds, startTime, endTime);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/faculty")
    public ResponseEntity<List<ExamResponse>> getExamsForFaculty(
            @RequestHeader("X-Faculty-Id") String facultyId) {
        List<ExamResponse> exams = examService.getExamsForFaculty(facultyId);
        return ResponseEntity.ok(exams);
    }

    @PostMapping("/{examId}/publish-results")
    public ResponseEntity<Map<String, Object>> publishResults(
            @PathVariable String examId) {
        try {
            examService.publishResults(examId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Results published successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{examId}/attempts")
    public ResponseEntity<List<ExamAttempt>> getExamAttempts(
            @PathVariable String examId) {
        List<ExamAttempt> attempts = examService.getAttemptsForExam(examId);
        return ResponseEntity.ok(attempts);
    }

    // ============ AI QUESTION GENERATION ============

    @PostMapping("/generate-questions")
    public ResponseEntity<Map<String, Object>> generateQuestions(
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestBody Map<String, Object> request) {
        try {
            String syllabus = (String) request.getOrDefault("syllabus", "");
            String subject = (String) request.getOrDefault("subject", "General");
            String questionType = (String) request.getOrDefault("questionType", "MCQ");
            int count = request.containsKey("count") ? ((Number) request.get("count")).intValue() : 10;
            String difficulty = (String) request.getOrDefault("difficulty", "MIXED");
            int marksPerQuestion = request.containsKey("marksPerQuestion")
                    ? ((Number) request.get("marksPerQuestion")).intValue() : 1;
            String examId = (String) request.getOrDefault("examId", null);

            if (syllabus.isBlank()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("error", "Syllabus/description cannot be empty");
                return ResponseEntity.badRequest().body(error);
            }

            // Cap at 100 questions per request
            count = Math.min(count, 100);

            List<ExamQuestion> generated = questionGeneratorService.generateQuestions(
                    syllabus, subject, questionType, count, difficulty, marksPerQuestion, facultyId);

            // If examId provided, auto-add to exam
            if (examId != null && !examId.isBlank()) {
                List<String> qIds = generated.stream().map(ExamQuestion::getId).toList();
                examService.addQuestionsToExam(examId, qIds);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", generated.size());
            response.put("questions", generated);
            response.put("message", generated.size() + " questions generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ============ QUESTION BANK ENDPOINTS ============

    @PostMapping("/questions/create")
    public ResponseEntity<ExamQuestion> createQuestion(
            @RequestHeader("X-Faculty-Id") String facultyId,
            @RequestBody ExamQuestion question) {
        ExamQuestion saved = examService.createQuestion(facultyId, question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<ExamQuestion> updateQuestion(
            @PathVariable String questionId,
            @RequestBody ExamQuestion question) {
        ExamQuestion updated = examService.updateQuestion(questionId, question);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/questions/faculty")
    public ResponseEntity<List<ExamQuestion>> getQuestionsForFaculty(
            @RequestHeader("X-Faculty-Id") String facultyId) {
        List<ExamQuestion> questions = examService.getQuestionsForFaculty(facultyId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/questions/subject/{subject}")
    public ResponseEntity<List<ExamQuestion>> getQuestionsBySubject(
            @PathVariable String subject) {
        List<ExamQuestion> questions = examService.getQuestionsBySubject(subject);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{examId}/add-questions")
    public ResponseEntity<Map<String, Object>> addQuestionsToExam(
            @PathVariable String examId,
            @RequestBody List<String> questionIds) {
        try {
            examService.addQuestionsToExam(examId, questionIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Questions added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{examId}/remove-questions")
    public ResponseEntity<Map<String, Object>> removeQuestionsFromExam(
            @PathVariable String examId,
            @RequestBody List<String> questionIds) {
        try {
            examService.removeQuestionsFromExam(examId, questionIds);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Questions removed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{examId}")
    public ResponseEntity<Map<String, Object>> deleteExam(
            @PathVariable String examId,
            @RequestHeader("X-Faculty-Id") String facultyId) {
        try {
            examService.deleteExam(examId, facultyId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Exam deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/{examId}/duplicate")
    public ResponseEntity<ExamResponse> duplicateExam(
            @PathVariable String examId,
            @RequestHeader("X-Faculty-Id") String facultyId) {
        ExamResponse response = examService.duplicateExam(examId, facultyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{examId}/questions")
    public ResponseEntity<List<ExamQuestion>> getExamQuestions(
            @PathVariable String examId) {
        List<ExamQuestion> questions = examService.getExamQuestions(examId);
        return ResponseEntity.ok(questions);
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Map<String, Object>> deleteQuestion(
            @PathVariable String questionId,
            @RequestHeader("X-Faculty-Id") String facultyId) {
        try {
            examService.deleteQuestion(questionId, facultyId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Question deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ============ STUDENT ENDPOINTS ============

    @GetMapping("/student")
    public ResponseEntity<List<ExamResponse>> getExamsForStudent(
            @RequestHeader("X-Student-Id") String studentId) {
        List<ExamResponse> exams = examService.getExamsForStudent(studentId);
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<ExamResponse>> getUpcomingExams() {
        List<ExamResponse> exams = examService.getUpcomingExams();
        return ResponseEntity.ok(exams);
    }

    @GetMapping("/{examId}")
    public ResponseEntity<ExamResponse> getExamById(
            @PathVariable String examId) {
        ExamResponse exam = examService.getExamById(examId);
        return ResponseEntity.ok(exam);
    }

    // ============ EXAM ATTEMPT ENDPOINTS ============

    @PostMapping("/{examId}/start")
    public ResponseEntity<ExamAttempt> startExam(
            @PathVariable String examId,
            @RequestHeader("X-Student-Id") String studentId) {
        ExamAttempt attempt = examService.startExam(examId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(attempt);
    }

    @PostMapping("/{attemptId}/save-answer")
    public ResponseEntity<ExamAttempt> saveAnswer(
            @PathVariable String attemptId,
            @RequestBody Map<String, String> payload) {
        String questionId = payload.get("questionId");
        String answer = payload.get("answer");
        ExamAttempt attempt = examService.saveAnswer(attemptId, questionId, answer);
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<ExamAttempt> submitExam(
            @PathVariable String attemptId) {
        ExamAttempt attempt = examService.submitExam(attemptId);
        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/student/attempts")
    public ResponseEntity<List<ExamAttempt>> getStudentAttempts(
            @RequestHeader("X-Student-Id") String studentId) {
        List<ExamAttempt> attempts = examService.getAttemptsForStudent(studentId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/attempt/{attemptId}")
    public ResponseEntity<ExamAttempt> getAttemptById(
            @PathVariable String attemptId) {
        ExamAttempt attempt = examService.getAttemptById(attemptId);
        return ResponseEntity.ok(attempt);
    }
}
