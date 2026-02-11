package com.uniconnect.controller;

import com.uniconnect.model.JobApplication;
import com.uniconnect.repository.JobApplicationRepository;
import com.uniconnect.repository.StudentRepository;
import com.uniconnect.model.Student;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000"})
public class JobApplicationController {

    private final JobApplicationRepository jobApplicationRepository;
    private final StudentRepository studentRepository;

    public JobApplicationController(JobApplicationRepository jobApplicationRepository, StudentRepository studentRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.studentRepository = studentRepository;
    }

    // Apply for a job
    @PostMapping("/apply")
    public ResponseEntity<?> applyForJob(@RequestBody Map<String, Object> request) {
        try {
            String studentId = (String) request.get("studentId");
            String jobId = (String) request.get("jobId");
            String jobTitle = (String) request.get("jobTitle");
            String company = (String) request.get("company");
            String coverLetter = (String) request.get("coverLetter");
            String resumeUrl = (String) request.get("resumeUrl");

            // Check if already applied
            Optional<JobApplication> existing = jobApplicationRepository.findByStudentIdAndJobId(studentId, jobId);
            if (existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Already applied to this job"));
            }

            // Get student details
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student not found"));
            }

            Student student = studentOpt.get();

            JobApplication application = new JobApplication();
            application.setStudentId(studentId);
            application.setJobId(jobId);
            application.setJobTitle(jobTitle);
            application.setCompany(company);
            application.setStudentName(student.getName() != null ? student.getName() : student.getEmail().split("@")[0]);
            application.setStudentEmail(student.getEmail());
            application.setCoverLetter(coverLetter);
            application.setResumeUrl(resumeUrl);

            JobApplication saved = jobApplicationRepository.save(application);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get student's applications
    @GetMapping("/applications/{studentId}")
    public ResponseEntity<?> getStudentApplications(@PathVariable("studentId") String studentId) {
        try {
            List<JobApplication> applications = jobApplicationRepository.findByStudentId(studentId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Check if student applied to a job
    @GetMapping("/check-application")
    public ResponseEntity<?> checkApplication(@RequestParam("studentId") String studentId, @RequestParam("jobId") String jobId) {
        try {
            Optional<JobApplication> application = jobApplicationRepository.findByStudentIdAndJobId(studentId, jobId);
            return ResponseEntity.ok(Map.of("applied", application.isPresent(), "application", application.orElse(null)));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
