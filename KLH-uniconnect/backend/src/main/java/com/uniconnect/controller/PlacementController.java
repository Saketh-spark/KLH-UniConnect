package com.uniconnect.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.uniconnect.model.*;
import com.uniconnect.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/placements")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000"})
public class PlacementController {

    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final CompanyRepository companyRepository;
    private final StudentRepository studentRepository;
    private final ResumeRepository resumeRepository;
    private final StudentResumeReviewRepository studentResumeReviewRepository;
    private final TrainingMaterialRepository trainingMaterialRepository;
    private final TrainingSessionRepository trainingSessionRepository;
    private final Cloudinary cloudinary;

    public PlacementController(
            JobRepository jobRepository,
            JobApplicationRepository jobApplicationRepository,
            InterviewRepository interviewRepository,
            CompanyRepository companyRepository,
            StudentRepository studentRepository,
            ResumeRepository resumeRepository,
            StudentResumeReviewRepository studentResumeReviewRepository,
            TrainingMaterialRepository trainingMaterialRepository,
            TrainingSessionRepository trainingSessionRepository,
            Cloudinary cloudinary) {
        this.jobRepository = jobRepository;
        this.jobApplicationRepository = jobApplicationRepository;
        this.interviewRepository = interviewRepository;
        this.companyRepository = companyRepository;
        this.studentRepository = studentRepository;
        this.resumeRepository = resumeRepository;
        this.studentResumeReviewRepository = studentResumeReviewRepository;
        this.trainingMaterialRepository = trainingMaterialRepository;
        this.trainingSessionRepository = trainingSessionRepository;
        this.cloudinary = cloudinary;
    }

    // ==================== JOB ENDPOINTS ====================

    // Get all jobs
    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs() {
        try {
            List<Job> jobs = jobRepository.findAll();
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get active jobs (for students)
    @GetMapping("/jobs/active")
    public ResponseEntity<?> getActiveJobs() {
        try {
            List<Job> jobs = jobRepository.findByStatusIn(List.of("Active", "Closing Soon"));
            return ResponseEntity.ok(jobs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get single job
    @GetMapping("/jobs/{id}")
    public ResponseEntity<?> getJob(@PathVariable String id) {
        try {
            Optional<Job> job = jobRepository.findById(id);
            if (job.isPresent()) {
                return ResponseEntity.ok(job.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Create job (Faculty)
    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        try {
            job.setCreatedAt(LocalDateTime.now());
            job.setUpdatedAt(LocalDateTime.now());
            Job saved = jobRepository.save(job);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Update job (Faculty)
    @PutMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(@PathVariable String id, @RequestBody Job jobUpdate) {
        try {
            Optional<Job> existing = jobRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
            }
            
            Job job = existing.get();
            if (jobUpdate.getCompany() != null) job.setCompany(jobUpdate.getCompany());
            if (jobUpdate.getPosition() != null) job.setPosition(jobUpdate.getPosition());
            if (jobUpdate.getSalary() != null) job.setSalary(jobUpdate.getSalary());
            if (jobUpdate.getDeadline() != null) job.setDeadline(jobUpdate.getDeadline());
            if (jobUpdate.getMinCGPA() > 0) job.setMinCGPA(jobUpdate.getMinCGPA());
            if (jobUpdate.getBranch() != null) job.setBranch(jobUpdate.getBranch());
            if (jobUpdate.getSkills() != null) job.setSkills(jobUpdate.getSkills());
            if (jobUpdate.getMaxBacklogs() >= 0) job.setMaxBacklogs(jobUpdate.getMaxBacklogs());
            if (jobUpdate.getStatus() != null) job.setStatus(jobUpdate.getStatus());
            if (jobUpdate.getVisibility() != null) job.setVisibility(jobUpdate.getVisibility());
            if (jobUpdate.getDescription() != null) job.setDescription(jobUpdate.getDescription());
            if (jobUpdate.getLocation() != null) job.setLocation(jobUpdate.getLocation());
            if (jobUpdate.getType() != null) job.setType(jobUpdate.getType());
            if (jobUpdate.getExperience() != null) job.setExperience(jobUpdate.getExperience());
            job.setUpdatedAt(LocalDateTime.now());

            Job saved = jobRepository.save(job);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete job (Faculty)
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable String id) {
        try {
            if (!jobRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
            }
            jobRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Close job
    @PostMapping("/jobs/{id}/close")
    public ResponseEntity<?> closeJob(@PathVariable String id) {
        try {
            Optional<Job> existing = jobRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Job not found"));
            }
            Job job = existing.get();
            job.setStatus("Closed");
            job.setUpdatedAt(LocalDateTime.now());
            Job saved = jobRepository.save(job);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== APPLICATION ENDPOINTS ====================

    // Get all applications (Faculty)
    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications() {
        try {
            List<JobApplication> applications = jobApplicationRepository.findAll();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get applications by job ID (Faculty)
    @GetMapping("/applications/job/{jobId}")
    public ResponseEntity<?> getApplicationsByJob(@PathVariable String jobId) {
        try {
            List<JobApplication> applications = jobApplicationRepository.findByJobId(jobId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get applications by status (Faculty)
    @GetMapping("/applications/status/{status}")
    public ResponseEntity<?> getApplicationsByStatus(@PathVariable String status) {
        try {
            List<JobApplication> applications = jobApplicationRepository.findByStatus(status);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get applications by student ID (Student portal)
    @GetMapping("/applications/student/{studentId}")
    public ResponseEntity<?> getApplicationsByStudent(@PathVariable String studentId) {
        try {
            List<JobApplication> applications = jobApplicationRepository.findByStudentId(studentId);
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Create application (Student - Apply Now)
    @PostMapping("/applications")
    public ResponseEntity<?> createApplication(@RequestBody JobApplication application) {
        try {
            // Check if student already applied to this job
            Optional<JobApplication> existing = jobApplicationRepository.findByStudentIdAndJobId(
                application.getStudentId(), application.getJobId());
            if (existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You have already applied to this job", "application", existing.get()));
            }
            application.setAppliedAt(LocalDateTime.now());
            application.setUpdatedAt(LocalDateTime.now());
            if (application.getStatus() == null || application.getStatus().isEmpty()) {
                application.setStatus("Applied");
            }
            JobApplication saved = jobApplicationRepository.save(application);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete application (Student - Withdraw)
    @DeleteMapping("/applications/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable String id) {
        try {
            if (!jobApplicationRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Application not found"));
            }
            jobApplicationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Application withdrawn successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Update application status (Faculty - Shortlist/Reject)
    @PutMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            Optional<JobApplication> existing = jobApplicationRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Application not found"));
            }
            
            JobApplication application = existing.get();
            String newStatus = request.get("status");
            if (newStatus != null) {
                application.setStatus(newStatus);
                application.setUpdatedAt(LocalDateTime.now());
                JobApplication saved = jobApplicationRepository.save(application);
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== RESUME BUILDER ENDPOINTS ====================

    // Save resume builder data
    @PostMapping("/resume/save")
    public ResponseEntity<?> saveResumeData(@RequestBody Map<String, Object> requestData) {
        try {
            String studentId = (String) requestData.get("studentId");
            if (studentId == null || studentId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "studentId is required"));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> resumeData = (Map<String, Object>) requestData.get("resumeData");
            if (resumeData == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "resumeData is required"));
            }

            // Find existing or create new
            Optional<Resume> existing = resumeRepository.findFirstByStudentId(studentId);
            Resume resume;
            if (existing.isPresent()) {
                resume = existing.get();
            } else {
                resume = new Resume();
                resume.setStudentId(studentId);
                resume.setStudentEmail((String) resumeData.get("email"));
            }

            resume.setResumeBuilderData(resumeData);
            resume.setSummary((String) resumeData.get("summary"));
            resume.setTitle((String) resumeData.getOrDefault("targetRole", "Resume"));
            resume.setUpdatedAt(LocalDateTime.now());

            Resume saved = resumeRepository.save(resume);
            return ResponseEntity.ok(Map.of("message", "Resume saved successfully", "id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get resume builder data for a student
    @GetMapping("/resume/{studentId}")
    public ResponseEntity<?> getResumeData(@PathVariable String studentId) {
        try {
            Optional<Resume> resume = resumeRepository.findFirstByStudentId(studentId);
            if (resume.isPresent() && resume.get().getResumeBuilderData() != null) {
                return ResponseEntity.ok(Map.of(
                    "resumeData", resume.get().getResumeBuilderData(),
                    "id", resume.get().getId(),
                    "updatedAt", resume.get().getUpdatedAt() != null ? resume.get().getUpdatedAt().toString() : ""
                ));
            }
            return ResponseEntity.ok(Map.of("resumeData", Map.of()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== INTERVIEW ENDPOINTS ====================

    // Get all interviews (Faculty)
    @GetMapping("/interviews")
    public ResponseEntity<?> getAllInterviews() {
        try {
            List<Interview> interviews = interviewRepository.findAll();
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get interviews by student (Student portal)
    @GetMapping("/interviews/student/{studentId}")
    public ResponseEntity<?> getStudentInterviews(@PathVariable String studentId) {
        try {
            List<Interview> interviews = interviewRepository.findByStudentId(studentId);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get interviews by status (Faculty)
    @GetMapping("/interviews/status/{status}")
    public ResponseEntity<?> getInterviewsByStatus(@PathVariable String status) {
        try {
            List<Interview> interviews = interviewRepository.findByStatus(status);
            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Schedule interview (Faculty)
    @PostMapping("/interviews")
    public ResponseEntity<?> scheduleInterview(@RequestBody Interview interview) {
        try {
            // Get student details if studentId provided
            if (interview.getStudentId() != null) {
                Optional<Student> student = studentRepository.findById(interview.getStudentId());
                if (student.isPresent()) {
                    interview.setStudentName(student.get().getName());
                    interview.setStudentEmail(student.get().getEmail());
                }
            }
            interview.setCreatedAt(LocalDateTime.now());
            interview.setUpdatedAt(LocalDateTime.now());
            interview.setStatus("Scheduled");
            Interview saved = interviewRepository.save(interview);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Update interview (Add feedback, change status)
    @PutMapping("/interviews/{id}")
    public ResponseEntity<?> updateInterview(@PathVariable String id, @RequestBody Interview interviewUpdate) {
        try {
            Optional<Interview> existing = interviewRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Interview not found"));
            }
            
            Interview interview = existing.get();
            if (interviewUpdate.getPerformance() != null) interview.setPerformance(interviewUpdate.getPerformance());
            if (interviewUpdate.getFeedback() != null) interview.setFeedback(interviewUpdate.getFeedback());
            if (interviewUpdate.getStatus() != null) interview.setStatus(interviewUpdate.getStatus());
            if (interviewUpdate.getRound() != null) interview.setRound(interviewUpdate.getRound());
            if (interviewUpdate.getDate() != null) interview.setDate(interviewUpdate.getDate());
            if (interviewUpdate.getTime() != null) interview.setTime(interviewUpdate.getTime());
            if (interviewUpdate.getMeetingLink() != null) interview.setMeetingLink(interviewUpdate.getMeetingLink());
            if (interviewUpdate.getNotes() != null) interview.setNotes(interviewUpdate.getNotes());
            interview.setUpdatedAt(LocalDateTime.now());

            Interview saved = interviewRepository.save(interview);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete interview
    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<?> deleteInterview(@PathVariable String id) {
        try {
            if (!interviewRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Interview not found"));
            }
            interviewRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Interview deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== COMPANY ENDPOINTS ====================

    // Get all companies
    @GetMapping("/companies")
    public ResponseEntity<?> getAllCompanies() {
        try {
            List<Company> companies = companyRepository.findAll();
            return ResponseEntity.ok(companies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get single company
    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompany(@PathVariable String id) {
        try {
            Optional<Company> company = companyRepository.findById(id);
            if (company.isPresent()) {
                return ResponseEntity.ok(company.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Company not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Create company
    @PostMapping("/companies")
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        try {
            // Check if company with same name exists
            if (companyRepository.findByName(company.getName()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Company already exists"));
            }
            company.setCreatedAt(LocalDateTime.now());
            company.setUpdatedAt(LocalDateTime.now());
            Company saved = companyRepository.save(company);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Update company
    @PutMapping("/companies/{id}")
    public ResponseEntity<?> updateCompany(@PathVariable String id, @RequestBody Company companyUpdate) {
        try {
            Optional<Company> existing = companyRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Company not found"));
            }
            
            Company company = existing.get();
            if (companyUpdate.getName() != null) company.setName(companyUpdate.getName());
            if (companyUpdate.getIndustry() != null) company.setIndustry(companyUpdate.getIndustry());
            if (companyUpdate.getWebsite() != null) company.setWebsite(companyUpdate.getWebsite());
            if (companyUpdate.getDescription() != null) company.setDescription(companyUpdate.getDescription());
            if (companyUpdate.getContactPerson() != null) company.setContactPerson(companyUpdate.getContactPerson());
            if (companyUpdate.getContactEmail() != null) company.setContactEmail(companyUpdate.getContactEmail());
            if (companyUpdate.getContactPhone() != null) company.setContactPhone(companyUpdate.getContactPhone());
            if (companyUpdate.getStatus() != null) company.setStatus(companyUpdate.getStatus());
            if (companyUpdate.getHiringFor() != null) company.setHiringFor(companyUpdate.getHiringFor());
            company.setUpdatedAt(LocalDateTime.now());

            Company saved = companyRepository.save(company);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Add company visit
    @PostMapping("/companies/{id}/visit")
    public ResponseEntity<?> addCompanyVisit(@PathVariable String id, @RequestBody Company.Visit visit) {
        try {
            Optional<Company> existing = companyRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Company not found"));
            }
            
            Company company = existing.get();
            company.getVisits().add(visit);
            company.setTotalHired(company.getTotalHired() + visit.getOffers());
            company.setUpdatedAt(LocalDateTime.now());

            Company saved = companyRepository.save(company);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ANALYTICS ENDPOINTS ====================

    // Get placement statistics (Dashboard)
    @GetMapping("/stats")
    public ResponseEntity<?> getPlacementStats() {
        try {
            long totalStudents = studentRepository.count();
            long totalApplications = jobApplicationRepository.count();
            long totalJobs = jobRepository.count();
            long activeJobs = jobRepository.countByStatus("Active");
            long interviewsScheduled = interviewRepository.countByStatus("Scheduled");
            long interviewsCompleted = interviewRepository.countByStatus("Completed");
            long offersReleased = jobApplicationRepository.findByStatus("accepted").size();
            long studentsPlaced = offersReleased; // Simplified

            // Applications by status
            List<JobApplication> allApps = jobApplicationRepository.findAll();
            Map<String, Long> applicationsByStatus = allApps.stream()
                    .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEligibleStudents", totalStudents);
            stats.put("totalApplications", totalApplications);
            stats.put("totalJobs", totalJobs);
            stats.put("activeJobs", activeJobs);
            stats.put("interviewsScheduled", interviewsScheduled);
            stats.put("interviewsCompleted", interviewsCompleted);
            stats.put("offersReleased", offersReleased);
            stats.put("studentsPlaced", studentsPlaced);
            stats.put("applicationsByStatus", applicationsByStatus);
            stats.put("averageReadinessScore", 72.5); // Placeholder - can be calculated from profiles

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get student-specific analytics
    @GetMapping("/stats/student/{studentId}")
    public ResponseEntity<?> getStudentStats(@PathVariable String studentId) {
        try {
            List<JobApplication> applications = jobApplicationRepository.findByStudentId(studentId);
            List<Interview> interviews = interviewRepository.findByStudentId(studentId);
            Optional<Resume> resume = resumeRepository.findFirstByStudentId(studentId);

            int totalApplications = applications.size();
            int pendingApplications = (int) applications.stream().filter(a -> a.getStatus().equals("applied")).count();
            int interviewsScheduled = (int) interviews.stream().filter(i -> i.getStatus().equals("Scheduled")).count();
            int interviewsCompleted = (int) interviews.stream().filter(i -> i.getStatus().equals("Completed")).count();
            int offers = (int) applications.stream().filter(a -> a.getStatus().equals("accepted")).count();

            // Calculate average interview score
            double avgInterviewScore = interviews.stream()
                    .filter(i -> i.getPerformance() != null)
                    .mapToDouble(Interview::getPerformance)
                    .average()
                    .orElse(0.0);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalApplications", totalApplications);
            stats.put("pendingApplications", pendingApplications);
            stats.put("interviewsScheduled", interviewsScheduled);
            stats.put("interviewsCompleted", interviewsCompleted);
            stats.put("offers", offers);
            stats.put("avgInterviewScore", Math.round(avgInterviewScore * 10.0) / 10.0);
            stats.put("hasResume", resume.isPresent());
            stats.put("profileCompletion", resume.isPresent() ? 85 : 50);

            // Application status breakdown
            Map<String, Long> statusBreakdown = applications.stream()
                    .collect(Collectors.groupingBy(JobApplication::getStatus, Collectors.counting()));
            stats.put("applicationStatusBreakdown", statusBreakdown);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get company-wise analytics
    @GetMapping("/stats/companies")
    public ResponseEntity<?> getCompanyStats() {
        try {
            List<Company> companies = companyRepository.findAll();
            List<Job> jobs = jobRepository.findAll();
            List<JobApplication> applications = jobApplicationRepository.findAll();

            // Group applications by company
            Map<String, Long> applicationsByCompany = applications.stream()
                    .collect(Collectors.groupingBy(JobApplication::getCompany, Collectors.counting()));

            // Group offers by company
            Map<String, Long> offersByCompany = applications.stream()
                    .filter(a -> a.getStatus().equals("accepted"))
                    .collect(Collectors.groupingBy(JobApplication::getCompany, Collectors.counting()));

            List<Map<String, Object>> companyStats = new ArrayList<>();
            for (String company : applicationsByCompany.keySet()) {
                Map<String, Object> stat = new HashMap<>();
                stat.put("company", company);
                stat.put("applications", applicationsByCompany.getOrDefault(company, 0L));
                stat.put("offers", offersByCompany.getOrDefault(company, 0L));
                stat.put("conversionRate", applicationsByCompany.get(company) > 0 
                        ? (offersByCompany.getOrDefault(company, 0L) * 100.0 / applicationsByCompany.get(company))
                        : 0);
                companyStats.add(stat);
            }

            return ResponseEntity.ok(companyStats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get placement trends (monthly)
    @GetMapping("/stats/trends")
    public ResponseEntity<?> getPlacementTrends() {
        try {
            List<JobApplication> applications = jobApplicationRepository.findAll();
            
            // Group by month (simplified - using appliedAt date)
            Map<String, Map<String, Long>> monthlyTrends = new LinkedHashMap<>();
            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            
            for (String month : months) {
                Map<String, Long> monthData = new HashMap<>();
                monthData.put("applications", 0L);
                monthData.put("interviews", 0L);
                monthData.put("offers", 0L);
                monthData.put("placements", 0L);
                monthlyTrends.put(month, monthData);
            }

            // Aggregate data by month
            for (JobApplication app : applications) {
                if (app.getAppliedAt() != null) {
                    int monthIndex = app.getAppliedAt().getMonthValue() - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        String month = months[monthIndex];
                        Map<String, Long> data = monthlyTrends.get(month);
                        data.put("applications", data.get("applications") + 1);
                        if (app.getStatus().equals("interview")) {
                            data.put("interviews", data.get("interviews") + 1);
                        }
                        if (app.getStatus().equals("accepted")) {
                            data.put("offers", data.get("offers") + 1);
                            data.put("placements", data.get("placements") + 1);
                        }
                    }
                }
            }

            List<Map<String, Object>> trends = new ArrayList<>();
            for (Map.Entry<String, Map<String, Long>> entry : monthlyTrends.entrySet()) {
                Map<String, Object> trend = new HashMap<>();
                trend.put("month", entry.getKey());
                trend.putAll(entry.getValue());
                trends.add(trend);
            }

            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Get upcoming events (deadlines, interviews)
    @GetMapping("/events/upcoming")
    public ResponseEntity<?> getUpcomingEvents() {
        try {
            List<Interview> scheduledInterviews = interviewRepository.findByStatus("Scheduled");
            List<Job> closingJobs = jobRepository.findByStatus("Closing Soon");

            List<Map<String, Object>> events = new ArrayList<>();

            // Add interviews as events
            for (Interview interview : scheduledInterviews) {
                Map<String, Object> event = new HashMap<>();
                event.put("id", interview.getId());
                event.put("company", interview.getCompany());
                event.put("type", "Interview");
                event.put("date", interview.getDate());
                event.put("time", interview.getTime());
                event.put("status", "Scheduled");
                event.put("studentName", interview.getStudentName());
                events.add(event);
            }

            // Add closing deadlines as events
            for (Job job : closingJobs) {
                Map<String, Object> event = new HashMap<>();
                event.put("id", job.getId());
                event.put("company", job.getCompany());
                event.put("type", "Application Deadline");
                event.put("date", job.getDeadline());
                event.put("time", "5:00 PM");
                event.put("status", "Closing Soon");
                event.put("position", job.getPosition());
                events.add(event);
            }

            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== RESUME REVIEW ENDPOINTS ====================

    // Get all resume reviews
    @GetMapping("/resume-reviews")
    public ResponseEntity<?> getAllResumeReviews() {
        try {
            List<StudentResumeReview> reviews = studentResumeReviewRepository.findAll();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Save feedback for a student
    @PostMapping("/resume-reviews/feedback")
    public ResponseEntity<?> saveResumeFeedback(@RequestBody Map<String, String> body) {
        try {
            String studentId = body.get("studentId");
            String feedback = body.get("feedback");
            String reviewedBy = body.get("reviewedBy");
            String studentName = body.get("studentName");
            String studentEmail = body.get("studentEmail");

            if (studentId == null || feedback == null || feedback.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "studentId and feedback are required"));
            }

            Optional<StudentResumeReview> existing = studentResumeReviewRepository.findFirstByStudentId(studentId);
            StudentResumeReview review;
            if (existing.isPresent()) {
                review = existing.get();
            } else {
                review = new StudentResumeReview();
                review.setStudentId(studentId);
                review.setStudentName(studentName);
                review.setStudentEmail(studentEmail);
            }
            review.setFeedback(feedback);
            if (reviewedBy != null) review.setReviewedBy(reviewedBy);
            review.setUpdatedAt(LocalDateTime.now());

            StudentResumeReview saved = studentResumeReviewRepository.save(review);
            return ResponseEntity.ok(Map.of("message", "Feedback saved successfully", "review", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Update readiness status for a student
    @PutMapping("/resume-reviews/readiness")
    public ResponseEntity<?> updateReadinessStatus(@RequestBody Map<String, String> body) {
        try {
            String studentId = body.get("studentId");
            String readinessStatus = body.get("readinessStatus");
            String reviewedBy = body.get("reviewedBy");
            String studentName = body.get("studentName");
            String studentEmail = body.get("studentEmail");

            if (studentId == null || readinessStatus == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "studentId and readinessStatus are required"));
            }

            Optional<StudentResumeReview> existing = studentResumeReviewRepository.findFirstByStudentId(studentId);
            StudentResumeReview review;
            if (existing.isPresent()) {
                review = existing.get();
            } else {
                review = new StudentResumeReview();
                review.setStudentId(studentId);
                review.setStudentName(studentName);
                review.setStudentEmail(studentEmail);
            }
            review.setReadinessStatus(readinessStatus);
            if (reviewedBy != null) review.setReviewedBy(reviewedBy);
            review.setUpdatedAt(LocalDateTime.now());

            StudentResumeReview saved = studentResumeReviewRepository.save(review);
            return ResponseEntity.ok(Map.of("message", "Readiness status updated to " + readinessStatus, "review", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Upload document for a job application (Resume, Certificates, ID Proof)
    @PostMapping("/applications/{id}/documents")
    public ResponseEntity<?> uploadApplicationDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("docType") String docType) {
        try {
            Optional<JobApplication> existing = jobApplicationRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Application not found"));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 50MB limit"));
            }

            // Upload to Cloudinary
            String originalFilename = file.getOriginalFilename();
            String baseName = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(0, originalFilename.lastIndexOf(".")) : "file";
            String publicId = "uniconnect/placements/" + java.util.UUID.randomUUID() + "_" + baseName;

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "auto",
                "public_id", publicId,
                "folder", "uniconnect"
            ));
            String fileUrl = (String) uploadResult.get("secure_url");

            // Update the application with the document URL
            JobApplication application = existing.get();
            switch (docType.toLowerCase()) {
                case "resume":
                    application.setResumeUrl(fileUrl);
                    break;
                case "certificates":
                    application.setCertificatesUrl(fileUrl);
                    break;
                case "idproof":
                case "id proof":
                    application.setIdProofUrl(fileUrl);
                    break;
                default:
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid document type: " + docType));
            }
            application.setUpdatedAt(LocalDateTime.now());
            JobApplication saved = jobApplicationRepository.save(application);

            return ResponseEntity.ok(Map.of(
                "message", docType + " uploaded successfully",
                "fileUrl", fileUrl,
                "application", saved
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== TRAINING MATERIALS ENDPOINTS ====================

    // Get all training materials
    @GetMapping("/training/materials")
    public ResponseEntity<?> getAllTrainingMaterials() {
        try {
            List<TrainingMaterial> materials = trainingMaterialRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(materials);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Upload training material with file
    @PostMapping("/training/materials")
    public ResponseEntity<?> uploadTrainingMaterial(
            @RequestParam("title") String title,
            @RequestParam("type") String type,
            @RequestParam("category") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("uploadedBy") String uploadedBy,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            TrainingMaterial material = new TrainingMaterial();
            material.setTitle(title);
            material.setType(type);
            material.setCategory(category);
            material.setDescription(description != null ? description : "");
            material.setUploadedBy(uploadedBy);

            if (file != null && !file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                String baseName = originalFilename != null && originalFilename.contains(".")
                        ? originalFilename.substring(0, originalFilename.lastIndexOf(".")) : "file";
                String publicId = "uniconnect/training/" + java.util.UUID.randomUUID() + "_" + baseName;

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "auto",
                    "public_id", publicId,
                    "folder", "uniconnect"
                ));
                material.setFileUrl((String) uploadResult.get("secure_url"));
                material.setOriginalFileName(originalFilename);
                material.setFileSize(file.getSize());
            }

            TrainingMaterial saved = trainingMaterialRepository.save(material);
            return ResponseEntity.ok(Map.of("message", "Training material uploaded successfully", "material", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete training material
    @DeleteMapping("/training/materials/{id}")
    public ResponseEntity<?> deleteTrainingMaterial(@PathVariable String id) {
        try {
            trainingMaterialRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Material deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Increment download count
    @PutMapping("/training/materials/{id}/download")
    public ResponseEntity<?> incrementDownload(@PathVariable String id) {
        try {
            Optional<TrainingMaterial> existing = trainingMaterialRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Material not found"));
            }
            TrainingMaterial mat = existing.get();
            mat.setDownloads(mat.getDownloads() + 1);
            trainingMaterialRepository.save(mat);
            return ResponseEntity.ok(Map.of("message", "Download count incremented", "downloads", mat.getDownloads()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== TRAINING SESSIONS ENDPOINTS ====================

    // Get all training sessions
    @GetMapping("/training/sessions")
    public ResponseEntity<?> getAllTrainingSessions() {
        try {
            List<TrainingSession> sessions = trainingSessionRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Create a training session
    @PostMapping("/training/sessions")
    public ResponseEntity<?> createTrainingSession(@RequestBody TrainingSession session) {
        try {
            session.setCreatedAt(LocalDateTime.now());
            session.setUpdatedAt(LocalDateTime.now());
            if (session.getStatus() == null) session.setStatus("Upcoming");
            TrainingSession saved = trainingSessionRepository.save(session);
            return ResponseEntity.ok(Map.of("message", "Session scheduled successfully", "session", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Delete a training session
    @DeleteMapping("/training/sessions/{id}")
    public ResponseEntity<?> deleteTrainingSession(@PathVariable String id) {
        try {
            trainingSessionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
