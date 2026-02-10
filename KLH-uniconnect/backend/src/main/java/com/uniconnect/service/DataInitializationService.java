package com.uniconnect.service;

import com.uniconnect.model.Material;
import com.uniconnect.model.Assignment;
import com.uniconnect.model.Reel;
import com.uniconnect.repository.MaterialRepository;
import com.uniconnect.repository.AssignmentRepository;
import com.uniconnect.repository.ReelRepository;
import com.uniconnect.util.SampleFileGenerator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Instant;
import java.util.Arrays;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    private final MaterialRepository materialRepository;
    private final AssignmentRepository assignmentRepository;
    private final ReelRepository reelRepository;

    public DataInitializationService(MaterialRepository materialRepository,
                                    AssignmentRepository assignmentRepository,
                                    ReelRepository reelRepository) {
        this.materialRepository = materialRepository;
        this.assignmentRepository = assignmentRepository;
        this.reelRepository = reelRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // Generate sample files
            System.out.println("Generating sample material files...");
            SampleFileGenerator.generateSampleMaterials();
            
            // Only seed if collection is empty
            if (materialRepository.findAll().isEmpty()) {
                seedMaterials();
            }
            
            if (assignmentRepository.findAll().isEmpty()) {
                seedAssignments();
            }

            // Reels are no longer seeded with sample data - only real uploads are shown
            // if (reelRepository.findAll().isEmpty()) {
            //     seedReels();
            // }
        } catch (Exception e) {
            System.out.println("⚠ Warning: Cannot initialize materials, assignments, and reels");
            System.out.println("  The application will run without sample data. You can still use the API.");
            System.out.println("  Error: " + e.getMessage());
        }
    }

    private void seedMaterials() {
        Material m1 = new Material();
        m1.setTitle("Database Management Systems – Unit 1 & 2");
        m1.setSubject("DBMS");
        m1.setSemester("Sem 4");
        m1.setAuthor("Dr. Rajesh Kumar");
        m1.setFileUrl("/uploads/materials/dbms-unit1-2.pdf");
        m1.setFileSize("12.5 MB");
        m1.setType("PDF");
        m1.setDownloads(245);

        Material m2 = new Material();
        m2.setTitle("Web Development Fundamentals");
        m2.setSubject("Web Technologies");
        m2.setSemester("Sem 4");
        m2.setAuthor("Prof. Sneha Sharma");
        m2.setFileUrl("/uploads/materials/web-dev-fundamentals.pdf");
        m2.setFileSize("8.3 MB");
        m2.setType("Notes");
        m2.setDownloads(189);

        Material m3 = new Material();
        m3.setTitle("Data Structures & Algorithms – Sorting");
        m3.setSubject("DSA");
        m3.setSemester("Sem 3");
        m3.setAuthor("Dr. Vikram Singh");
        m3.setFileUrl("/uploads/materials/dsa-sorting.pdf");
        m3.setFileSize("5.2 MB");
        m3.setType("PDF");
        m3.setDownloads(412);

        Material m4 = new Material();
        m4.setTitle("Operating Systems – Process Management");
        m4.setSubject("Operating Systems");
        m4.setSemester("Sem 4");
        m4.setAuthor("Prof. Aditya Patel");
        m4.setFileUrl("/uploads/materials/os-process-management.pdf");
        m4.setFileSize("15.8 MB");
        m4.setType("PPT");
        m4.setDownloads(178);

        Material m5 = new Material();
        m5.setTitle("Microprocessors & Interfacing");
        m5.setSubject("Microprocessors");
        m5.setSemester("Sem 3");
        m5.setAuthor("Dr. Priya Mishra");
        m5.setFileUrl("/uploads/materials/microprocessors-interfacing.pdf");
        m5.setFileSize("9.7 MB");
        m5.setType("Notes");
        m5.setDownloads(94);

        materialRepository.saveAll(Arrays.asList(m1, m2, m3, m4, m5));
        System.out.println("✓ Sample materials seeded successfully!");
    }

    private void seedAssignments() {
        Assignment a1 = new Assignment();
        a1.setTitle("Implement Sorting Algorithms");
        a1.setSubject("DSA");
        a1.setDescription("Implement and compare Quick Sort, Merge Sort, and Heap Sort with time complexity analysis");
        a1.setDueDate(LocalDateTime.of(2024, 12, 20, 23, 59));
        a1.setTotalMarks(25);
        a1.setCreatedBy("faculty1");

        Assignment a2 = new Assignment();
        a2.setTitle("Microcontroller Programming Project");
        a2.setSubject("Microprocessors");
        a2.setDescription("Program an 8085 microcontroller to control LED patterns");
        a2.setDueDate(LocalDateTime.of(2024, 12, 25, 23, 59));
        a2.setTotalMarks(30);
        a2.setCreatedBy("faculty2");

        Assignment a3 = new Assignment();
        a3.setTitle("Design a Relational Database Schema");
        a3.setSubject("DBMS");
        a3.setDescription("Design a database for an e-commerce platform with 5+ tables");
        a3.setDueDate(LocalDateTime.of(2024, 12, 10, 23, 59));
        a3.setTotalMarks(20);
        a3.setCreatedBy("faculty3");

        Assignment a4 = new Assignment();
        a4.setTitle("Build a Personal Portfolio Website");
        a4.setSubject("Web Technologies");
        a4.setDescription("Create a responsive website showcasing your projects using HTML, CSS, and JavaScript");
        a4.setDueDate(LocalDateTime.of(2024, 12, 15, 23, 59));
        a4.setTotalMarks(20);
        a4.setCreatedBy("faculty4");

        Assignment a5 = new Assignment();
        a5.setTitle("Process Scheduling Algorithms");
        a5.setSubject("Operating Systems");
        a5.setDescription("Simulate and analyze FCFS, SJF, and Round Robin scheduling algorithms");
        a5.setDueDate(LocalDateTime.of(2024, 12, 8, 23, 59));
        a5.setTotalMarks(20);
        a5.setCreatedBy("faculty5");

        assignmentRepository.saveAll(Arrays.asList(a1, a2, a3, a4, a5));
        System.out.println("✓ Sample assignments seeded successfully!");
    }

    private void seedReels() {
        // Sample reel 1: DSA Project
        Reel r1 = new Reel(
            "student1",
            "Priya Sharma",
            "Computer Science",
            "https://via.placeholder.com/40?text=PS",
            "Quick Sort Implementation in Java",
            "A comprehensive guide to implementing Quick Sort algorithm with time complexity analysis and real-world applications.",
            "Projects"
        );
        r1.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4");
        r1.setThumbnailUrl("https://via.placeholder.com/400x600?text=DSA+Project");
        r1.setSubject("DSA");
        r1.setSkill("Data Structures");
        r1.setSemester("3rd");
        r1.setYear("3");
        r1.setHashtags(Arrays.asList("#DSA", "#Java", "#Algorithm", "#Learning"));
        r1.setViews(127);
        r1.setLikes(45);
        r1.setComments(12);
        r1.setSaves(8);
        r1.setAcademicStatus("APPROVED");
        r1.setAcademicScore(85.0);
        r1.setPlacementVisibility("PUBLIC");
        r1.setCreatedAt(Instant.now().minusSeconds(86400 * 5)); // 5 days ago

        // Sample reel 2: Web Development
        Reel r2 = new Reel(
            "student2",
            "Saketh Reddy",
            "Computer Science",
            "https://via.placeholder.com/40?text=SR",
            "Building a React E-Commerce Platform",
            "Full-stack React application with Redux state management, MongoDB backend, and payment integration.",
            "Projects"
        );
        r2.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4");
        r2.setThumbnailUrl("https://via.placeholder.com/400x600?text=React+Project");
        r2.setSubject("Web Development");
        r2.setSkill("Frontend");
        r2.setSemester("4th");
        r2.setYear("3");
        r2.setHashtags(Arrays.asList("#React", "#WebDev", "#JavaScript", "#Project"));
        r2.setViews(245);
        r2.setLikes(89);
        r2.setComments(34);
        r2.setSaves(28);
        r2.setAcademicStatus("APPROVED");
        r2.setAcademicScore(92.0);
        r2.setPlacementReady(true);
        r2.setPlacementVisibility("PUBLIC");
        r2.setCreatedAt(Instant.now().minusSeconds(86400 * 3)); // 3 days ago

        // Sample reel 3: Machine Learning
        Reel r3 = new Reel(
            "student3",
            "Aniket Patel",
            "Computer Science",
            "https://via.placeholder.com/40?text=AP",
            "Predicting House Prices using ML",
            "End-to-end machine learning project using Python, scikit-learn, and pandas to predict real estate prices.",
            "Projects"
        );
        r3.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4");
        r3.setThumbnailUrl("https://via.placeholder.com/400x600?text=ML+Project");
        r3.setSubject("AI/ML");
        r3.setSkill("Machine Learning");
        r3.setSemester("4th");
        r3.setYear("4");
        r3.setHashtags(Arrays.asList("#MachineLearning", "#Python", "#DataScience", "#AI"));
        r3.setViews(156);
        r3.setLikes(67);
        r3.setComments(22);
        r3.setSaves(15);
        r3.setAcademicStatus("APPROVED");
        r3.setAcademicScore(88.0);
        r3.setPlacementReady(true);
        r3.setPlacementVisibility("PUBLIC");
        r3.setCreatedAt(Instant.now().minusSeconds(86400 * 2)); // 2 days ago

        // Sample reel 4: Cloud Architecture
        Reel r4 = new Reel(
            "student4",
            "Neha Gupta",
            "Computer Science",
            "https://via.placeholder.com/40?text=NG",
            "Deploying Microservices on AWS",
            "Learn how to architect and deploy scalable microservices on Amazon Web Services with Docker and Kubernetes.",
            "Projects"
        );
        r4.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4");
        r4.setThumbnailUrl("https://via.placeholder.com/400x600?text=Cloud+Architecture");
        r4.setSubject("Cloud Computing");
        r4.setSkill("Backend");
        r4.setSemester("4th");
        r4.setYear("4");
        r4.setHashtags(Arrays.asList("#AWS", "#Microservices", "#Cloud", "#DevOps"));
        r4.setViews(203);
        r4.setLikes(78);
        r4.setComments(28);
        r4.setSaves(19);
        r4.setAcademicStatus("APPROVED");
        r4.setAcademicScore(90.0);
        r4.setPlacementReady(true);
        r4.setPlacementVisibility("PUBLIC");
        r4.setCreatedAt(Instant.now().minusSeconds(86400)); // 1 day ago

        // Sample reel 5: Interview Preparation
        Reel r5 = new Reel(
            "student5",
            "Rohit Kumar",
            "Computer Science",
            "https://via.placeholder.com/40?text=RK",
            "System Design Interview - Social Media Feed",
            "Complete walkthrough of designing a scalable social media feed system for technical interviews.",
            "Placements"
        );
        r5.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerJoyrides.mp4");
        r5.setThumbnailUrl("https://via.placeholder.com/400x600?text=System+Design");
        r5.setSubject("System Design");
        r5.setSkill("Backend");
        r5.setSemester("4th");
        r5.setYear("4");
        r5.setHashtags(Arrays.asList("#SystemDesign", "#Interview", "#DSA", "#Preparation"));
        r5.setViews(312);
        r5.setLikes(125);
        r5.setComments(45);
        r5.setSaves(67);
        r5.setAcademicStatus("APPROVED");
        r5.setAcademicScore(95.0);
        r5.setPlacementReady(true);
        r5.setPlacementVisibility("PUBLIC");
        r5.setCreatedAt(Instant.now()); // Now

        // Sample reel 6: Hackathon Win
        Reel r6 = new Reel(
            "student6",
            "Divya Singh",
            "Computer Science",
            "https://via.placeholder.com/40?text=DS",
            "Hackathon Winning Project - Smart Campus IoT",
            "An innovative IoT solution for campus management that won the annual hackathon.",
            "Achievements"
        );
        r6.setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-library/sample/Sintel.mp4");
        r6.setThumbnailUrl("https://via.placeholder.com/400x600?text=Hackathon");
        r6.setSubject("IoT");
        r6.setSkill("Full Stack");
        r6.setSemester("3rd");
        r6.setYear("3");
        r6.setHashtags(Arrays.asList("#Hackathon", "#IoT", "#Innovation", "#Winner"));
        r6.setViews(445);
        r6.setLikes(198);
        r6.setComments(67);
        r6.setSaves(112);
        r6.setAcademicStatus("APPROVED");
        r6.setAcademicScore(94.0);
        r6.setPlacementReady(true);
        r6.setPlacementVisibility("PUBLIC");
        r6.setFeaturedTag("GOOD_PROJECT");
        r6.setCreatedAt(Instant.now().minusSeconds(86400 * 7)); // 7 days ago

        reelRepository.saveAll(Arrays.asList(r1, r2, r3, r4, r5, r6));
        System.out.println("✓ Sample reels seeded successfully!");
    }
}
