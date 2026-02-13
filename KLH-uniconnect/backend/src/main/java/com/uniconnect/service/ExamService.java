package com.uniconnect.service;

import com.uniconnect.dto.ExamResponse;
import com.uniconnect.model.*;
import com.uniconnect.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamService {
    private final ExamRepository examRepository;
    private final ExamQuestionRepository questionRepository;
    private final ExamAttemptRepository attemptRepository;
    private final StudentRepository studentRepository;
    private final GradeRepository gradeRepository;

    public ExamService(ExamRepository examRepository, ExamQuestionRepository questionRepository,
                      ExamAttemptRepository attemptRepository, StudentRepository studentRepository,
                      GradeRepository gradeRepository) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.studentRepository = studentRepository;
        this.gradeRepository = gradeRepository;
    }

    // ============ EXAM MANAGEMENT ============

    public ExamResponse createExam(String facultyId, Exam exam) {
        // Use facultyId directly, no need to verify in StudentRepository
        exam.setFacultyId(facultyId);
        exam.setFacultyName(facultyId); // Default to ID if name not available
        exam.setCreatedAt(Instant.now());
        exam.setUpdatedAt(Instant.now());
        exam.setStatus("DRAFT");

        // Initialize empty lists if not provided
        if (exam.getQuestionIds() == null) {
            exam.setQuestionIds(new ArrayList<>());
        }
        if (exam.getEnrolledStudentsIds() == null) {
            exam.setEnrolledStudentsIds(new ArrayList<>());
        }

        Exam saved = examRepository.save(exam);
        return mapToResponse(saved);
    }

    public ExamResponse updateExam(String examId, Exam updatedExam) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        if (!exam.getStatus().equals("DRAFT")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only edit exams in DRAFT status");
        }

        exam.setTitle(updatedExam.getTitle());
        exam.setSubject(updatedExam.getSubject());
        exam.setDescription(updatedExam.getDescription());
        exam.setInstructions(updatedExam.getInstructions());
        exam.setDurationMinutes(updatedExam.getDurationMinutes());
        exam.setTotalMarks(updatedExam.getTotalMarks());
        exam.setStartTime(updatedExam.getStartTime());
        exam.setEndTime(updatedExam.getEndTime());
        exam.setAutoSubmitOnTimeout(updatedExam.isAutoSubmitOnTimeout());
        exam.setNegativeMark(updatedExam.isNegativeMark());
        exam.setNegativeMarkPercent(updatedExam.getNegativeMarkPercent());
        exam.setShuffleQuestions(updatedExam.isShuffleQuestions());
        exam.setShuffleOptions(updatedExam.isShuffleOptions());
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        return mapToResponse(saved);
    }

    public ExamResponse scheduleExam(String examId, String facultyId, List<String> studentIdentifiers,
                                       String startTimeStr, String endTimeStr) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        // Verify faculty ownership
        if (!exam.getFacultyId().equals(facultyId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only schedule your own exams");
        }

        // Set faculty-specified start and end times
        if (startTimeStr != null && !startTimeStr.isBlank()) {
            exam.setStartTime(Instant.parse(startTimeStr));
        }
        if (endTimeStr != null && !endTimeStr.isBlank()) {
            exam.setEndTime(Instant.parse(endTimeStr));
        } else if (startTimeStr != null && !startTimeStr.isBlank()) {
            // If no end time, calculate from start + duration
            Instant start = Instant.parse(startTimeStr);
            exam.setEndTime(start.plusSeconds(exam.getDurationMinutes() * 60));
        }

        // Validate times
        if (exam.getStartTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time is required for scheduling");
        }

        // Resolve student identifiers: faculty may provide emails, so we store both
        // email AND MongoDB ObjectId so the student portal can match by either one
        Set<String> allIds = new LinkedHashSet<>();
        for (String identifier : studentIdentifiers) {
            allIds.add(identifier); // Always keep the original (email)
            // If it looks like an email, also resolve to MongoDB ObjectId
            if (identifier.contains("@")) {
                studentRepository.findByEmail(identifier).ifPresent(s -> {
                    allIds.add(s.getId()); // Also store the ObjectId
                });
            }
        }

        exam.setEnrolledStudentsIds(new ArrayList<>(allIds));
        exam.setStatus("SCHEDULED");
        exam.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(exam);
        return mapToResponse(saved);
    }

    public List<ExamResponse> getExamsForFaculty(String facultyId) {
        return examRepository.findByFacultyIdOrderByCreatedAtDesc(facultyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExamResponse> getExamsForStudent(String studentId) {
        // Collect all exams this student should see
        Set<Exam> allExams = new LinkedHashSet<>();

        // 1. Search by ObjectId
        allExams.addAll(examRepository.findByEnrolledStudentsIdsContaining(studentId));

        // 2. Search by the student's email (faculty enrolls by email)
        resolveStudent(studentId).ifPresent(student -> {
            allExams.addAll(examRepository.findByEnrolledStudentsIdsContaining(student.getEmail()));
        });

        // 3. Also include all SCHEDULED/ONGOING exams so students can discover available exams
        allExams.addAll(examRepository.findByStatus("SCHEDULED"));
        allExams.addAll(examRepository.findByStatus("ONGOING"));

        return allExams.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExamResponse> getUpcomingExams() {
        return examRepository.findByStatusAndEndTimeAfter("SCHEDULED", Instant.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ExamResponse getExamById(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));
        return mapToResponse(exam);
    }

    // ============ QUESTION MANAGEMENT ============

    public ExamQuestion createQuestion(String facultyId, ExamQuestion question) {
        question.setCreatedBy(facultyId);
        question.setCreatedAt(Instant.now());
        question.setActive(true);
        return questionRepository.save(question);
    }

    public ExamQuestion updateQuestion(String questionId, ExamQuestion updatedQuestion) {
        ExamQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        question.setQuestionText(updatedQuestion.getQuestionText());
        question.setOptions(updatedQuestion.getOptions());
        question.setCorrectAnswer(updatedQuestion.getCorrectAnswer());
        question.setExplanation(updatedQuestion.getExplanation());
        question.setMarks(updatedQuestion.getMarks());
        question.setUpdatedAt(Instant.now());

        return questionRepository.save(question);
    }

    public List<ExamQuestion> getQuestionsForFaculty(String facultyId) {
        return questionRepository.findByCreatedByOrderByCreatedAtDesc(facultyId);
    }

    public List<ExamQuestion> getQuestionsBySubject(String subject) {
        return questionRepository.findBySubject(subject);
    }

    public void addQuestionsToExam(String examId, List<String> questionIds) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        // Avoid duplicates
        Set<String> existing = new LinkedHashSet<>(exam.getQuestionIds());
        existing.addAll(questionIds);
        exam.setQuestionIds(new ArrayList<>(existing));
        exam.setUpdatedAt(Instant.now());
        examRepository.save(exam);
    }

    public void removeQuestionsFromExam(String examId, List<String> questionIds) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        exam.getQuestionIds().removeAll(questionIds);
        exam.setUpdatedAt(Instant.now());
        examRepository.save(exam);
    }

    public void deleteExam(String examId, String facultyId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        if (!exam.getFacultyId().equals(facultyId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own exams");
        }
        if (!exam.getStatus().equals("DRAFT")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only delete DRAFT exams");
        }

        examRepository.deleteById(examId);
    }

    public ExamResponse duplicateExam(String examId, String facultyId) {
        Exam original = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        Exam copy = new Exam();
        copy.setTitle(original.getTitle() + " (Copy)");
        copy.setSubject(original.getSubject());
        copy.setFacultyId(facultyId);
        copy.setFacultyName(original.getFacultyName());
        copy.setDurationMinutes(original.getDurationMinutes());
        copy.setTotalMarks(original.getTotalMarks());
        copy.setDescription(original.getDescription());
        copy.setInstructions(original.getInstructions());
        copy.setAutoSubmitOnTimeout(original.isAutoSubmitOnTimeout());
        copy.setNegativeMark(original.isNegativeMark());
        copy.setNegativeMarkPercent(original.getNegativeMarkPercent());
        copy.setShuffleQuestions(original.isShuffleQuestions());
        copy.setShuffleOptions(original.isShuffleOptions());
        copy.setQuestionIds(new ArrayList<>(original.getQuestionIds()));
        copy.setStatus("DRAFT");
        copy.setCreatedAt(Instant.now());
        copy.setUpdatedAt(Instant.now());

        Exam saved = examRepository.save(copy);
        return mapToResponse(saved);
    }

    public List<ExamQuestion> getExamQuestions(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        if (exam.getQuestionIds().isEmpty()) return new ArrayList<>();
        return questionRepository.findAllById(exam.getQuestionIds());
    }

    public void deleteQuestion(String questionId, String facultyId) {
        ExamQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        if (!question.getCreatedBy().equals(facultyId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own questions");
        }

        questionRepository.deleteById(questionId);
    }

    // ============ STUDENT RESOLUTION HELPER ============

    /**
     * Resolve a student from any identifier: MongoDB ObjectId, full email, or email prefix.
     * The auth system returns email prefix (e.g. "2410080030") as studentId,
     * so we must handle all three lookup strategies.
     */
    private Optional<Student> resolveStudent(String identifier) {
        // 1. Try as MongoDB ObjectId
        Optional<Student> student = studentRepository.findById(identifier);
        if (student.isPresent()) return student;

        // 2. Try as full email
        student = studentRepository.findByEmail(identifier);
        if (student.isPresent()) return student;

        // 3. Try as email prefix (e.g. "2410080030" → matches "2410080030@klh.edu.in")
        List<Student> matches = studentRepository.findByEmailContainingIgnoreCase(identifier);
        return matches.stream()
                .filter(s -> s.getEmail() != null &&
                        s.getEmail().toLowerCase().startsWith(identifier.toLowerCase() + "@"))
                .findFirst();
    }

    // ============ EXAM ATTEMPT (STUDENT) ============

    public ExamAttempt startExam(String examId, String studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        // Verify exam time has started
        Instant now = Instant.now();
        if (exam.getStartTime() != null && now.isBefore(exam.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Exam has not started yet. It starts at " + exam.getStartTime());
        }
        if (exam.getEndTime() != null && now.isAfter(exam.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exam time has ended");
        }

        // Auto-update status to ONGOING if scheduled and time has started
        if ("SCHEDULED".equals(exam.getStatus()) && exam.getStartTime() != null && !now.isBefore(exam.getStartTime())) {
            exam.setStatus("ONGOING");
            examRepository.save(exam);
        }

        // Resolve student from any identifier (ObjectId, email, or email prefix)
        Student student = resolveStudent(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Check if student already has an ongoing attempt (check both raw ID and resolved ID)
        Optional<ExamAttempt> existing = attemptRepository.findByExamIdAndStudentId(examId, studentId);
        if (!existing.isPresent()) {
            existing = attemptRepository.findByExamIdAndStudentId(examId, student.getId());
        }
        if (existing.isPresent() && existing.get().getStatus().equals("ONGOING")) {
            return existing.get();
        }

        ExamAttempt attempt = new ExamAttempt();
        attempt.setExamId(examId);
        attempt.setExamTitle(exam.getTitle());
        attempt.setStudentId(studentId);
        attempt.setStudentName(student.getName());
        attempt.setSubject(exam.getSubject());
        attempt.setStartedAt(Instant.now());
        attempt.setStatus("ONGOING");
        attempt.setTotalMarks(exam.getTotalMarks());
        attempt.setStudentAnswers(new HashMap<>());
        attempt.setDescriptiveAnswers(new HashMap<>());

        return attemptRepository.save(attempt);
    }

    public ExamAttempt saveAnswer(String attemptId, String questionId, String answer) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));

        if (!attempt.getStatus().equals("ONGOING")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exam is not ongoing");
        }

        attempt.getStudentAnswers().put(questionId, answer);
        attempt.setUpdatedAt(Instant.now());

        return attemptRepository.save(attempt);
    }

    public ExamAttempt submitExam(String attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));

        attempt.setStatus("SUBMITTED");
        attempt.setSubmittedAt(Instant.now());

        // Calculate time spent
        long timeSpentSeconds = (attempt.getSubmittedAt().getEpochSecond() - attempt.getStartedAt().getEpochSecond());
        attempt.setTimeSpentSeconds(timeSpentSeconds);

        // Auto-evaluate MCQs
        evaluateExam(attempt);

        attempt.setUpdatedAt(Instant.now());
        ExamAttempt saved = attemptRepository.save(attempt);

        // If all answers are evaluated (no descriptive), push to grades
        if (saved.isAllAnswersEvaluated()) {
            pushResultsToGrades(saved);
        }

        return saved;
    }

    // ============ AUTO-EVALUATION & GRADING ============

    private void evaluateExam(ExamAttempt attempt) {
        Exam exam = examRepository.findById(attempt.getExamId()).orElse(null);
        if (exam == null) return;

        List<ExamQuestion> questions = questionRepository.findAllById(exam.getQuestionIds());
        double totalScore = 0;
        boolean hasDescriptive = false;

        for (ExamQuestion question : questions) {
            String studentAnswer = attempt.getStudentAnswers().get(question.getId());
            double marks = 0;

            if ("MCQ".equals(question.getQuestionType())) {
                if (studentAnswer != null && studentAnswer.equals(question.getCorrectAnswer())) {
                    marks = question.getMarks();
                } else if (exam.isNegativeMark() && studentAnswer != null) {
                    marks = -(question.getMarks() * exam.getNegativeMarkPercent() / 100.0);
                }
            } else if ("DESCRIPTIVE".equals(question.getQuestionType())) {
                hasDescriptive = true;
                attempt.getDescriptiveAnswers().put(question.getId(), studentAnswer);
            }

            attempt.getQuestionMarks().put(question.getId(), marks);
            totalScore += marks;
        }

        attempt.setTotalScore(Math.max(0, totalScore)); // Prevent negative total
        attempt.setPercentage((attempt.getTotalScore() / attempt.getTotalMarks()) * 100);
        attempt.setGrade(calculateGrade(attempt.getPercentage()));

        if (!hasDescriptive) {
            attempt.setAllAnswersEvaluated(true);
        }
    }

    private String calculateGrade(double percentage) {
        if (percentage >= 90) return "A";
        if (percentage >= 80) return "B";
        if (percentage >= 70) return "C";
        if (percentage >= 60) return "D";
        return "F";
    }

    public void publishResults(String examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exam not found"));

        List<ExamAttempt> attempts = attemptRepository.findByExamIdAndStatus(examId, "SUBMITTED");

        // Calculate statistics
        if (!attempts.isEmpty()) {
            double avgScore = attempts.stream().mapToDouble(ExamAttempt::getTotalScore).average().orElse(0);
            double highestScore = attempts.stream().mapToDouble(ExamAttempt::getTotalScore).max().orElse(0);
            double lowestScore = attempts.stream().mapToDouble(ExamAttempt::getTotalScore).min().orElse(0);

            exam.setAverageScore(avgScore);
            exam.setHighestScore(highestScore);
            exam.setLowestScore(lowestScore);
            exam.setTotalAttempts(attempts.size());
            exam.setTotalSubmitted(attempts.size());
        }

        exam.setResultsPublished(true);
        exam.setResultsPublishedAt(Instant.now());
        exam.setStatus("COMPLETED");
        examRepository.save(exam);

        // Push all results to grades
        for (ExamAttempt attempt : attempts) {
            pushResultsToGrades(attempt);
        }
    }

    // ============ GRADES INTEGRATION ============

    private void pushResultsToGrades(ExamAttempt attempt) {
        try {
            Optional<Grade> gradeOpt = gradeRepository.findByStudentIdAndSubject(attempt.getStudentId(), attempt.getSubject());

            Grade grade = gradeOpt.orElseGet(() -> {
                Grade newGrade = new Grade();
                newGrade.setStudentId(attempt.getStudentId());
                newGrade.setStudentName(attempt.getStudentName());
                newGrade.setSubject(attempt.getSubject());
                newGrade.setExamMarks(0);
                newGrade.setAssignmentMarks(0);
                newGrade.setProjectMarks(0);
                newGrade.setParticipationMarks(0);
                return newGrade;
            });

            // Add exam marks to grade
            grade.setExamMarks((int) attempt.getTotalScore());
            grade.setLastUpdated(Instant.now());

            // Recalculate CGPA
            int total = grade.getExamMarks() + grade.getAssignmentMarks() + grade.getProjectMarks() + grade.getParticipationMarks();
            grade.setTotalMarks(total);
            double cgpa = (total / 400.0) * 10.0; // Assuming 400 is max marks
            grade.setCgpa(cgpa);
            grade.setGrade(calculateGrade((cgpa / 10.0) * 100));

            gradeRepository.save(grade);
        } catch (Exception e) {
            // Log error but don't fail exam submission
            System.err.println("Error pushing grades: " + e.getMessage());
        }
    }

    public List<ExamAttempt> getAttemptsForExam(String examId) {
        return attemptRepository.findByExamIdOrderBySubmittedAtDesc(examId);
    }

    public List<ExamAttempt> getAttemptsForStudent(String studentId) {
        return attemptRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    public ExamAttempt getAttemptById(String attemptId) {
        return attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
    }

    // ============ STUDENT SEARCH & SCHEDULE FOR ALL ============

    public List<Map<String, String>> getAllStudentsForExam() {
        List<Student> students = studentRepository.findAll();
        return students.stream()
            .map(this::mapStudentToInfo)
            .sorted(Comparator.comparing(m -> m.getOrDefault("rollNumber", "")))
            .collect(Collectors.toList());
    }

    public List<Map<String, String>> searchStudents(String query) {
        if (query == null || query.isBlank()) {
            return getAllStudentsForExam();
        }
        String q = query.toLowerCase().trim();
        List<Student> students = studentRepository.findAll();
        return students.stream()
            .filter(s -> {
                String name = s.getName() != null ? s.getName().toLowerCase() : "";
                String email = s.getEmail() != null ? s.getEmail().toLowerCase() : "";
                String roll = s.getRollNumber() != null ? s.getRollNumber().toLowerCase() : "";
                String branch = s.getBranch() != null ? s.getBranch().toLowerCase() : "";
                String section = s.getSection() != null ? s.getSection().toLowerCase() : "";
                String year = s.getYear() != null ? s.getYear().toLowerCase() : "";
                return name.contains(q) || email.contains(q) || roll.contains(q)
                    || branch.contains(q) || section.contains(q) || year.contains(q);
            })
            .map(this::mapStudentToInfo)
            .sorted(Comparator.comparing(m -> m.getOrDefault("rollNumber", "")))
            .collect(Collectors.toList());
    }

    public ExamResponse scheduleExamForAll(String examId, String facultyId,
                                            String startTimeStr, String endTimeStr) {
        List<Student> allStudents = studentRepository.findAll();
        List<String> allEmails = allStudents.stream()
            .map(Student::getEmail)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        return scheduleExam(examId, facultyId, allEmails, startTimeStr, endTimeStr);
    }

    private Map<String, String> mapStudentToInfo(Student s) {
        Map<String, String> info = new HashMap<>();
        String emailPrefix = (s.getEmail() != null && s.getEmail().contains("@"))
                ? s.getEmail().split("@")[0] : s.getId();
        info.put("id", s.getId());
        info.put("email", s.getEmail() != null ? s.getEmail() : "");
        info.put("name", s.getName() != null ? s.getName() : emailPrefix);
        info.put("rollNumber", s.getRollNumber() != null && !s.getRollNumber().isEmpty()
                ? s.getRollNumber() : emailPrefix);
        info.put("branch", s.getBranch() != null ? s.getBranch() : "");
        info.put("year", s.getYear() != null ? s.getYear() : "");
        info.put("section", s.getSection() != null ? s.getSection() : "");
        return info;
    }

    // ============ HELPER METHODS ============

    private ExamResponse mapToResponse(Exam exam) {
        return new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getSubject(),
                exam.getFacultyId(),
                exam.getFacultyName(),
                exam.getClass_(),
                exam.getDurationMinutes(),
                exam.getTotalMarks(),
                exam.getDescription(),
                exam.getInstructions(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getStatus(),
                exam.isAutoSubmitOnTimeout(),
                exam.isNegativeMark(),
                exam.isShuffleQuestions(),
                exam.isShuffleOptions(),
                exam.getQuestionIds().size(),
                exam.isResultsPublished(),
                exam.getTotalAttempts(),
                exam.getTotalSubmitted(),
                exam.getAverageScore(),
                exam.getCreatedAt(),
                exam.getEnrolledStudentsIds()
        );
    }
}
