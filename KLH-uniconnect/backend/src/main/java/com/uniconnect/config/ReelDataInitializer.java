package com.uniconnect.config;

import com.uniconnect.model.Reel;
import com.uniconnect.repository.ReelRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Initialize sample reels in the database on application startup
 */
@Component
public class ReelDataInitializer implements CommandLineRunner {

    private final ReelRepository reelRepository;

    @Value("${reels.seed-sample-data:false}")
    private boolean seedSampleData;

    public ReelDataInitializer(ReelRepository reelRepository) {
        this.reelRepository = reelRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            if (seedSampleData) {
                System.out.println("🎬 Reels: Seeding sample data for testing...");
                seedSampleReels();
            } else {
                // Sample reels are disabled - only real uploads will be shown
                System.out.println("🎬 Reels: Only showing real uploads from database (sample data disabled)");
                
                // Remove any existing sample reels (identified by sample student IDs)
                List<String> sampleStudentIds = List.of(
                    "saketh-reddy", "priya-sharma", "arjun-patel", 
                    "neha-gupta", "rohit-kumar", "anjali-desai",
                    "STU001", "STU002", "STU003", "STU004", "STU005", "STU006"
                );
                
                long deletedCount = 0;
                for (String studentId : sampleStudentIds) {
                    List<Reel> sampleReels = reelRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
                    if (!sampleReels.isEmpty()) {
                        reelRepository.deleteAll(sampleReels);
                        deletedCount += sampleReels.size();
                    }
                }
                
                if (deletedCount > 0) {
                    System.out.println("  🗑️ Removed " + deletedCount + " sample reel(s)");
                }
            }
            
            long existingCount = reelRepository.count();
            System.out.println("  ✅ Found " + existingCount + " reel(s) in database");
        } catch (Exception e) {
            System.out.println("  ⚠️ Warning: Cannot connect to MongoDB for reel operations");
            System.out.println("  Error: " + e.getMessage());
        }
    }

    private void seedSampleReels() {
        // Check if sample reels already exist
        long existingCount = reelRepository.count();
        if (existingCount > 0) {
            System.out.println("  📊 Reels already exist in database, skipping seed");
            return;
        }

        List<String> localVideos = loadLocalReelVideos();
        List<String> fallbackVideos = List.of(
            "https://res.cloudinary.com/demo/video/upload/dog.mp4",
            "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
            "https://res.cloudinary.com/demo/video/upload/sea-turtle.mp4"
        );

        List<Reel> sampleReels = List.of(
            createSampleReel("STU001", "Saketh Reddy", "CSE", 
                "DSA Mastery - Binary Trees", 
                "Quick tips on solving binary tree problems for interviews! 🌲 #DSA #Coding",
                resolveVideoUrl(localVideos, fallbackVideos, 0), "Tech Tips", "3rd Year",
                "https://ui-avatars.com/api/?name=Saketh+Reddy&background=random"),
            createSampleReel("STU002", "Priya Sharma", "ECE",
                "IoT Project Demo",
                "Check out my smart home automation project! 🏠 #IoT #Electronics",
                resolveVideoUrl(localVideos, fallbackVideos, 1), "Projects", "4th Year",
                "https://ui-avatars.com/api/?name=Priya+Sharma&background=random"),
            createSampleReel("STU003", "Arjun Patel", "CSE",
                "Placement Success Story",
                "How I cracked Google interviews! Tips inside 💡 #Placements #Google",
                resolveVideoUrl(localVideos, fallbackVideos, 2), "Placements", "4th Year",
                "https://ui-avatars.com/api/?name=Arjun+Patel&background=random"),
            createSampleReel("STU004", "Neha Gupta", "IT",
                "Web Dev Portfolio",
                "My journey from beginner to full-stack developer 🚀 #WebDev #React",
                resolveVideoUrl(localVideos, fallbackVideos, 0), "Projects", "3rd Year",
                "https://ui-avatars.com/api/?name=Neha+Gupta&background=random"),
            createSampleReel("STU005", "Rohit Kumar", "MECH",
                "3D Printing Innovation",
                "Created a prosthetic hand using 3D printing! ✋ #Innovation #Engineering",
                resolveVideoUrl(localVideos, fallbackVideos, 1), "Projects", "4th Year",
                "https://ui-avatars.com/api/?name=Rohit+Kumar&background=random"),
            createSampleReel("STU006", "Anjali Desai", "CSE",
                "Hackathon Winner",
                "Won first place at Smart India Hackathon! 🏆 #Hackathon #Winner",
                resolveVideoUrl(localVideos, fallbackVideos, 2), "Achievements", "3rd Year",
                "https://ui-avatars.com/api/?name=Anjali+Desai&background=random")
        );

        reelRepository.saveAll(sampleReels);
        System.out.println("  ✅ Seeded " + sampleReels.size() + " sample reels");
    }

    private Reel createSampleReel(
            String studentId,
            String studentName,
            String branch,
            String title,
            String description,
            String videoUrl,
            String category,
            String year,
            String avatarUrl) {
        Reel reel = new Reel(
            studentId,
            studentName,
            branch,
            avatarUrl,
            title,
            description,
            category
        );
        reel.setVideoUrl(videoUrl);
        reel.setYear(year);
        reel.setLikes(Math.random() > 0.5 ? (int)(Math.random() * 100) : 0);
        reel.setViews((int)(Math.random() * 500));
        reel.setComments((int)(Math.random() * 20));
        reel.setCreatedAt(Instant.now().minusSeconds((int)(Math.random() * 86400 * 7))); // Last 7 days
        reel.setReelType("STUDENT_CREATED");
        return reel;
    }

    private List<String> loadLocalReelVideos() {
        // All reel videos are stored in Cloudinary — no local files to load
        return List.of();
    }

    private String resolveVideoUrl(List<String> localVideos, List<String> fallbackVideos, int index) {
        if (!fallbackVideos.isEmpty()) {
            return fallbackVideos.get(index % fallbackVideos.size());
        }
        return "https://res.cloudinary.com/demo/video/upload/v1689798029/samples/sea-turtle.mp4";
    }
}
