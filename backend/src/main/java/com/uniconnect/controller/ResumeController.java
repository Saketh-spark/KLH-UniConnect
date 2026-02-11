package com.uniconnect.controller;

import com.uniconnect.model.Resume;
import com.uniconnect.repository.ResumeRepository;
import com.uniconnect.repository.StudentRepository;
import com.uniconnect.model.Student;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000"})
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final StudentRepository studentRepository;

    public ResumeController(ResumeRepository resumeRepository, StudentRepository studentRepository) {
        this.resumeRepository = resumeRepository;
        this.studentRepository = studentRepository;
    }

    // Get or create resume
    @GetMapping("/{studentId}")
    public ResponseEntity<?> getResume(@PathVariable("studentId") String studentId) {
        try {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student not found"));
            }

            Student student = studentOpt.get();
            Optional<Resume> resumeOpt = resumeRepository.findFirstByStudentId(studentId);

            if (resumeOpt.isPresent()) {
                return ResponseEntity.ok(resumeOpt.get());
            } else {
                // Create new empty resume
                Resume newResume = new Resume();
                newResume.setStudentId(studentId);
                newResume.setStudentEmail(student.getEmail());
                newResume.setTitle("Software Engineer");
                newResume.setSummary("Passionate full-stack developer with experience in modern web technologies.");
                
                Resume saved = resumeRepository.save(newResume);
                return ResponseEntity.ok(saved);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // Update resume
    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateResume(@PathVariable("studentId") String studentId, @RequestBody Resume resumeData) {
        try {
            Optional<Resume> resumeOpt = resumeRepository.findFirstByStudentId(studentId);
            
            Resume resume;
            if (resumeOpt.isPresent()) {
                resume = resumeOpt.get();
            } else {
                resume = new Resume();
                resume.setStudentId(studentId);
            }

            resume.setTitle(resumeData.getTitle());
            resume.setSummary(resumeData.getSummary());
            resume.setExperience(resumeData.getExperience());
            resume.setEducation(resumeData.getEducation());
            resume.setSkills(resumeData.getSkills());
            resume.setCertifications(resumeData.getCertifications());
            resume.setProjects(resumeData.getProjects());
            resume.setTemplate(resumeData.getTemplate());
            resume.setUpdatedAt(LocalDateTime.now());

            Resume saved = resumeRepository.save(resume);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    // ========================
    // Generate AI Resume - Professional, ATS-Optimized, Corporate Design
    // ========================
    @PostMapping("/generate-ai/{studentId}")
    public ResponseEntity<?> generateAIResume(@PathVariable("studentId") String studentId) {
        try {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student not found"));
            }

            Student student = studentOpt.get();
            
            // Determine experience level and target role
            String experienceLevel = determineExperienceLevel(student);
            String targetRole = student.getBranch() != null ? student.getBranch() + " Engineer" : "Software Engineer";
            
            // Create or update existing resume - delete any duplicates first
            List<Resume> existingResumes = resumeRepository.findAllByStudentId(studentId);
            if (existingResumes.size() > 1) {
                // Delete all duplicates, keep none - we'll create fresh
                resumeRepository.deleteAllByStudentId(studentId);
            }
            
            Resume resume = resumeRepository.findFirstByStudentId(studentId).orElse(new Resume());
            resume.setStudentId(studentId);
            resume.setStudentEmail(student.getEmail());
            
            // ========================
            // HEADER - Professional Title
            // ========================
            resume.setTitle(student.getName() + " | " + targetRole);
            
            // ========================
            // PROFESSIONAL SUMMARY - ATS-Optimized, Results-Focused
            // ========================
            resume.setSummary(generateProfessionalSummary(student, targetRole, experienceLevel));
            
            // ========================
            // CORE SKILLS - Categorized for ATS & UI Excellence
            // ========================
            resume.setSkills(generateCategorizedSkills(student));
            
            // ========================
            // EDUCATION - Clean Corporate Format
            // ========================
            resume.setEducation(generateEducation(student));
            
            // ========================
            // PROJECTS - Action-Oriented with Quantified Impact
            // ========================
            resume.setProjects(generateProjectsWithImpact(student));
            
            // ========================
            // CERTIFICATIONS & ACHIEVEMENTS - Clean Bullet List
            // ========================
            resume.setCertifications(generateCertificationsAndAchievements(student));
            
            // ========================
            // EXPERIENCE - Professional Format (if applicable)
            // ========================
            resume.setExperience(new ArrayList<>()); // Empty for freshers, can be populated later
            
            // ========================
            // TEMPLATE - Modern, Premium, ATS-Safe
            // ========================
            resume.setTemplate("modern-corporate");
            resume.setUpdatedAt(LocalDateTime.now());
            
            // Save AI-generated resume
            Resume savedResume = resumeRepository.save(resume);
            
            // ========================
            // POST-RESUME ENHANCEMENTS
            // ========================
            Map<String, Object> response = new HashMap<>();
            response.put("resume", savedResume);
            response.put("atsKeywords", generateATSKeywords(student, targetRole));
            response.put("improvements", generateImprovementSuggestions(student));
            response.put("coverLetterTips", generateCoverLetterTips(student, targetRole));
            response.put("message", "✅ Professional ATS-optimized resume generated successfully! Ready for top MNCs & startups.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Resume generation failed: " + e.getMessage()));
        }
    }

    // ========================
    // Generate AI Resume from Custom Form Data
    // ========================
    @PostMapping("/generate-ai-custom/{studentId}")
    public ResponseEntity<?> generateAIResumeCustom(@PathVariable("studentId") String studentId, @RequestBody Map<String, Object> formData) {
        try {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            if (!studentOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student not found"));
            }

            // Extract form data with safe null handling
            String fullName = getStringValue(formData, "fullName", "Your Name");
            String email = getStringValue(formData, "email", "");
            String phone = getStringValue(formData, "phone", "");
            String location = getStringValue(formData, "location", "");
            String linkedIn = getStringValue(formData, "linkedIn", "");
            String github = getStringValue(formData, "github", "");
            String targetRole = getStringValue(formData, "targetRole", "Software Engineer");
            String industry = getStringValue(formData, "industry", "Technology");
            String experienceLevel = getStringValue(formData, "experienceLevel", "fresher");
            String careerGoal = getStringValue(formData, "careerGoal", "");
            String degree = getStringValue(formData, "degree", "");
            String institution = getStringValue(formData, "institution", "");
            String graduationYear = getStringValue(formData, "graduationYear", "");
            String gpa = getStringValue(formData, "gpa", "");
            String technicalSkills = getStringValue(formData, "technicalSkills", "");
            String tools = getStringValue(formData, "tools", "");
            String softSkills = getStringValue(formData, "softSkills", "");
            String certifications = getStringValue(formData, "certifications", "");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> experiences = formData.get("experiences") != null 
                ? (List<Map<String, Object>>) formData.get("experiences") 
                : new ArrayList<>();
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> projects = formData.get("projects") != null 
                ? (List<Map<String, Object>>) formData.get("projects") 
                : new ArrayList<>();

            // Create or update resume
            List<Resume> existingResumes = resumeRepository.findAllByStudentId(studentId);
            if (existingResumes.size() > 1) {
                resumeRepository.deleteAllByStudentId(studentId);
            }
            
            Resume resume = resumeRepository.findFirstByStudentId(studentId).orElse(new Resume());
            resume.setStudentId(studentId);
            resume.setStudentEmail(email);
            
            // HEADER - Professional Title
            resume.setTitle(fullName + " | " + targetRole);
            
            // PROFESSIONAL SUMMARY - ATS-Optimized
            String summary = generateCustomProfessionalSummary(fullName, targetRole, experienceLevel, careerGoal, industry);
            resume.setSummary(summary);
            
            // CORE SKILLS - As List
            List<String> skillsList = new ArrayList<>();
            if (!technicalSkills.isEmpty()) {
                for (String skill : technicalSkills.split(",")) {
                    skillsList.add(skill.trim());
                }
            }
            if (!tools.isEmpty()) {
                for (String tool : tools.split(",")) {
                    skillsList.add(tool.trim());
                }
            }
            if (!softSkills.isEmpty()) {
                for (String skill : softSkills.split(",")) {
                    skillsList.add(skill.trim());
                }
            }
            resume.setSkills(skillsList);
            
            // EDUCATION - Using Resume.Education class
            List<Resume.Education> educationList = new ArrayList<>();
            Resume.Education edu = new Resume.Education();
            edu.setDegree(degree);
            edu.setInstitution(institution);
            edu.setGraduationDate(graduationYear);
            edu.setGpa(gpa);
            edu.setLocation(location);
            educationList.add(edu);
            resume.setEducation(educationList);
            
            // EXPERIENCE - Using Resume.Experience class
            List<Resume.Experience> experienceList = new ArrayList<>();
            for (Map<String, Object> exp : experiences) {
                String jobTitle = getStringValue(exp, "jobTitle", "");
                String company = getStringValue(exp, "company", "");
                String duration = getStringValue(exp, "duration", "");
                String expLocation = getStringValue(exp, "location", "");
                String responsibilities = getStringValue(exp, "responsibilities", "");
                
                if (!jobTitle.isEmpty()) {
                    Resume.Experience experience = new Resume.Experience();
                    experience.setTitle(jobTitle);
                    experience.setCompany(company);
                    experience.setLocation(expLocation);
                    experience.setDescription(responsibilities);
                    // Parse duration (e.g., "2020 to 2024")
                    if (duration.contains(" to ")) {
                        String[] parts = duration.split(" to ");
                        experience.setStartDate(parts[0].trim());
                        experience.setEndDate(parts.length > 1 ? parts[1].trim() : "Present");
                    } else {
                        experience.setStartDate(duration);
                        experience.setEndDate("Present");
                    }
                    experienceList.add(experience);
                }
            }
            resume.setExperience(experienceList);
            
            // PROJECTS - Using Resume.Project class
            List<Resume.Project> projectList = new ArrayList<>();
            for (Map<String, Object> proj : projects) {
                String name = getStringValue(proj, "name", "");
                String description = getStringValue(proj, "description", "");
                String technologies = getStringValue(proj, "technologies", "");
                String impact = getStringValue(proj, "impact", "");
                
                if (!name.isEmpty()) {
                    Resume.Project project = new Resume.Project();
                    project.setName(name);
                    project.setDescription(description + (impact.isEmpty() ? "" : " | Impact: " + impact));
                    // Parse technologies into list
                    List<String> techList = new ArrayList<>();
                    for (String tech : technologies.split(",")) {
                        techList.add(tech.trim());
                    }
                    project.setTechnologies(techList);
                    projectList.add(project);
                }
            }
            resume.setProjects(projectList);
            
            // CERTIFICATIONS - As List
            List<String> certList = new ArrayList<>();
            if (!certifications.isEmpty()) {
                for (String cert : certifications.split(",")) {
                    certList.add(cert.trim());
                }
            }
            resume.setCertifications(certList);
            
            // TEMPLATE
            resume.setTemplate("modern-corporate");
            resume.setUpdatedAt(LocalDateTime.now());
            
            Resume savedResume = resumeRepository.save(resume);
            
            // Response with enhancements
            Map<String, Object> response = new HashMap<>();
            response.put("resume", savedResume);
            response.put("atsKeywords", generateCustomATSKeywords(targetRole, technicalSkills, tools));
            response.put("improvements", generateCustomImprovementSuggestions(experiences, projects));
            response.put("coverLetterTips", generateCustomCoverLetterTips(fullName, targetRole, industry));
            response.put("message", "✅ Professional ATS-optimized resume generated successfully!");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Resume generation failed: " + e.getMessage()));
        }
    }

    // Helper to safely get string value from map
    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        if (map == null || !map.containsKey(key) || map.get(key) == null) {
            return defaultValue;
        }
        return map.get(key).toString();
    }

    private String generateCustomProfessionalSummary(String name, String targetRole, String level, String careerGoal, String industry) {
        String levelDesc = switch (level) {
            case "fresher" -> "Enthusiastic and dedicated";
            case "intern" -> "Motivated intern with hands-on experience";
            case "entry" -> "Results-driven professional with foundational expertise";
            case "mid" -> "Accomplished professional with proven track record";
            case "senior" -> "Seasoned expert with extensive experience";
            default -> "Dedicated professional";
        };
        
        if (careerGoal != null && !careerGoal.isEmpty()) {
            return careerGoal;
        }
        
        return levelDesc + " " + targetRole + " with strong foundation in " + industry + 
               ". Passionate about delivering high-quality solutions and driving innovation. " +
               "Seeking challenging opportunities to leverage technical skills and contribute to organizational success.";
    }

    private List<String> generateCustomATSKeywords(String targetRole, String technical, String tools) {
        List<String> keywords = new ArrayList<>();
        keywords.add(targetRole);
        if (!technical.isEmpty()) {
            String[] techArr = technical.split(",");
            for (int i = 0; i < Math.min(2, techArr.length); i++) {
                keywords.add(techArr[i].trim());
            }
        }
        if (!tools.isEmpty()) {
            String[] toolsArr = tools.split(",");
            for (int i = 0; i < Math.min(2, toolsArr.length); i++) {
                keywords.add(toolsArr[i].trim());
            }
        }
        return keywords;
    }

    private List<String> generateCustomImprovementSuggestions(List<Map<String, Object>> experiences, List<Map<String, Object>> projects) {
        List<String> suggestions = new ArrayList<>();
        suggestions.add("Add quantified metrics to demonstrate measurable impact");
        suggestions.add("Include action verbs like 'Developed', 'Implemented', 'Optimized'");
        if (experiences.isEmpty() || experiences.stream().allMatch(e -> getStringValue(e, "jobTitle", "").isEmpty())) {
            suggestions.add("Consider adding internship or relevant experience");
        }
        if (projects.size() < 3) {
            suggestions.add("Add more projects to showcase diverse technical skills");
        }
        return suggestions;
    }

    private List<String> generateCustomCoverLetterTips(String name, String targetRole, String industry) {
        List<String> tips = new ArrayList<>();
        tips.add("Personalize your opening with the company's recent achievements");
        tips.add("Highlight specific skills matching the " + targetRole + " role requirements");
        tips.add("Demonstrate knowledge of " + industry + " industry trends");
        return tips;
    }
    
    // ========================
    // HELPER METHODS - Premium Resume Generation
    // ========================
    
    private String determineExperienceLevel(Student student) {
        int projectCount = student.getProjects() != null ? student.getProjects().size() : 0;
        int certCount = student.getCertificates() != null ? student.getCertificates().size() : 0;
        
        if (projectCount >= 5 && certCount >= 3) {
            return "accomplished student with comprehensive project portfolio";
        } else if (projectCount >= 3) {
            return "motivated student with strong technical foundation";
        } else {
            return "dedicated fresher eager to contribute";
        }
    }
    
    private String generateProfessionalSummary(Student student, String targetRole, String experienceLevel) {
        StringBuilder summary = new StringBuilder();
        
        // Opening line - Dynamic & results-driven
        summary.append("Dynamic and results-driven ").append(experienceLevel)
               .append(" pursuing ").append(student.getBranch() != null ? student.getBranch() : "Computer Science")
               .append(" at KL University (Deemed to be University). ");
        
        // Technical proficiency
        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            List<String> topSkills = student.getSkills().stream()
                .filter(skill -> skill != null && skill.getName() != null)
                .limit(4)
                .map(skill -> skill.getName())
                .collect(Collectors.toList());
            if (!topSkills.isEmpty()) {
                summary.append("Proficient in ").append(String.join(", ", topSkills)).append(". ");
            }
        }
        
        // Project demonstration
        if (student.getProjects() != null && !student.getProjects().isEmpty()) {
            summary.append("Demonstrated expertise through ")
                   .append(student.getProjects().size())
                   .append(" successful project implementations leveraging modern technologies. ");
        }
        
        // Closing impact statement
        summary.append("Strong problem-solving abilities with a passion for innovation and continuous learning. ")
               .append("Seeking challenging opportunities to contribute technical expertise and drive organizational success.");
        
        return summary.toString();
    }
    
    private List<String> generateCategorizedSkills(Student student) {
        List<String> skillsList = new ArrayList<>();
        
        // Technical Skills
        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            skillsList.add("▸ TECHNICAL SKILLS");
            student.getSkills().forEach(skill -> {
                if (skill != null && skill.getName() != null) {
                    String level = skill.getLevel() != null ? " - " + skill.getLevel() : "";
                    skillsList.add("  • " + skill.getName() + level);
                }
            });
            skillsList.add(""); // Spacing
        }
        
        // Tools & Technologies from Projects
        if (student.getProjects() != null && !student.getProjects().isEmpty()) {
            Set<String> allTechs = new HashSet<>();
            student.getProjects().forEach(project -> {
                if (project.getTags() != null) {
                    allTechs.addAll(project.getTags());
                }
            });
            if (!allTechs.isEmpty()) {
                skillsList.add("▸ TOOLS & TECHNOLOGIES");
                allTechs.forEach(tech -> skillsList.add("  • " + tech));
                skillsList.add("");
            }
        }
        
        // Soft Skills - Industry Standard
        skillsList.add("▸ SOFT SKILLS");
        skillsList.add("  • Problem Solving & Analytical Thinking");
        skillsList.add("  • Team Collaboration & Cross-Functional Communication");
        skillsList.add("  • Agile Development & Project Management");
        skillsList.add("  • Continuous Learning & Adaptability");
        
        return skillsList;
    }
    
    private List<Resume.Education> generateEducation(Student student) {
        List<Resume.Education> educationList = new ArrayList<>();
        
        Resume.Education edu = new Resume.Education();
        edu.setDegree(student.getBranch() != null 
            ? "Bachelor of Technology in " + student.getBranch() 
            : "Bachelor's Degree in Computer Science and Engineering");
        edu.setInstitution("KL University (Deemed to be University)");
        edu.setLocation(student.getLocation() != null ? student.getLocation() : "Vijayawada, Andhra Pradesh, India");
        edu.setGraduationDate(student.getYear() != null ? student.getYear() : "Expected 2025");
        
        // GPA field can be added later if needed
        edu.setGpa("Academic Performance: Strong");
        
        educationList.add(edu);
        return educationList;
    }
    
    private List<Resume.Project> generateProjectsWithImpact(Student student) {
        List<Resume.Project> projectList = new ArrayList<>();
        
        if (student.getProjects() != null && !student.getProjects().isEmpty()) {
            for (var proj : student.getProjects()) {
                if (proj == null || proj.getName() == null) continue;
                
                Resume.Project project = new Resume.Project();
                
                // Project name
                project.setName(proj.getName());
                
                // Enhanced description with action verbs
                String description = proj.getDescription() != null ? proj.getDescription() : "Developed innovative solution";
                if (!description.matches("^(Developed|Built|Created|Designed|Implemented|Engineered|Architected|Deployed|Constructed|Established).*")) {
                    description = "Developed " + description;
                }
                
                // Add impact metrics if possible
                if (!description.contains("%") && !description.contains("performance") && !description.contains("efficiency")) {
                    description += " Achieved improved system performance and user experience through optimized architecture.";
                }
                
                project.setDescription(description);
                
                // Technologies
                if (proj.getTags() != null && !proj.getTags().isEmpty()) {
                    project.setTechnologies(proj.getTags());
                }
                
                // URL
                if (proj.getHref() != null && !proj.getHref().isEmpty()) {
                    project.setUrl(proj.getHref());
                }
                
                projectList.add(project);
            }
        }
        
        return projectList;
    }
    
    private List<String> generateCertificationsAndAchievements(Student student) {
        List<String> certList = new ArrayList<>();
        
        // Certifications
        if (student.getCertificates() != null && !student.getCertificates().isEmpty()) {
            certList.add("▸ CERTIFICATIONS");
            student.getCertificates().forEach(cert -> {
                if (cert != null && cert.getName() != null) {
                    String issuer = cert.getIssuer() != null ? " - " + cert.getIssuer() : "";
                    certList.add("  • " + cert.getName() + issuer);
                }
            });
            certList.add("");
        }
        
        // Awards & Achievements
        if (student.getAwards() != null && !student.getAwards().isEmpty()) {
            certList.add("▸ AWARDS & ACHIEVEMENTS");
            student.getAwards().forEach(award -> {
                if (award != null && award.getTitle() != null) {
                    String desc = award.getDescription() != null ? " - " + award.getDescription() : "";
                    certList.add("  • " + award.getTitle() + desc);
                }
            });
        }
        
        return certList;
    }
    
    private List<String> generateATSKeywords(Student student, String targetRole) {
        List<String> keywords = new ArrayList<>();
        
        // Add primary role
        keywords.add(targetRole);
        
        // Add branch/specialization
        if (student.getBranch() != null) {
            keywords.add(student.getBranch());
        }
        
        // Add top skills
        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            keywords.addAll(student.getSkills().stream()
                .filter(skill -> skill != null && skill.getName() != null)
                .limit(2)
                .map(skill -> skill.getName())
                .collect(Collectors.toList()));
        }
        
        // Add soft skills
        keywords.add("Problem Solving");
        keywords.add("Team Collaboration");
        
        return keywords.stream().limit(5).collect(Collectors.toList());
    }
    
    private List<String> generateImprovementSuggestions(Student student) {
        List<String> suggestions = new ArrayList<>();
        
        int projectCount = student.getProjects() != null ? student.getProjects().size() : 0;
        int certCount = student.getCertificates() != null ? student.getCertificates().size() : 0;
        int skillCount = student.getSkills() != null ? student.getSkills().size() : 0;
        
        if (certCount < 2) {
            suggestions.add("💡 Add relevant industry certifications to boost credibility (e.g., AWS Cloud Practitioner, Azure Fundamentals, Google Cloud Associate)");
        }
        
        if (projectCount < 3) {
            suggestions.add("💡 Include at least 3-4 diverse projects showcasing full-stack, cloud, or AI/ML capabilities");
        }
        
        if (skillCount < 8) {
            suggestions.add("💡 Expand skills section to 8-10 technical skills plus 4-5 soft skills for better ATS matching");
        }
        
        if (suggestions.isEmpty()) {
            suggestions.add("✅ Profile is well-optimized! Consider quantifying project impacts with metrics (e.g., '40% faster', '500+ users')");
            suggestions.add("✅ Keep resume updated with latest projects, certifications, and tech stack");
            suggestions.add("✅ Tailor this resume for specific job applications by reordering skills to match JD");
        }
        
        return suggestions;
    }
    
    private List<String> generateCoverLetterTips(Student student, String targetRole) {
        List<String> tips = new ArrayList<>();
        
        tips.add("📝 COVER LETTER STRUCTURE:");
        tips.add("• Opening: Mention the specific role and company, express genuine enthusiasm");
        tips.add("• Body: Highlight 2-3 relevant projects/skills from your resume that match the job description");
        tips.add("• Closing: Express eagerness for an interview and how you'll contribute to the company's mission");
        tips.add("• Keep it concise: 3-4 short paragraphs, max 300 words");
        tips.add("• Personalize for each application - mention company-specific details");
        
        return tips;
    }
}
