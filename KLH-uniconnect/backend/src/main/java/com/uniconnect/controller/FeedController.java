package com.uniconnect.controller;

import com.uniconnect.model.FeedPost;
import com.uniconnect.model.FeedComment;
import com.uniconnect.repository.FeedPostRepository;
import com.uniconnect.repository.FeedCommentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(originPatterns = "*")
public class FeedController {

    private final FeedPostRepository postRepo;
    private final FeedCommentRepository commentRepo;

    public FeedController(FeedPostRepository postRepo, FeedCommentRepository commentRepo) {
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
    }

    /* ───────── Get all posts ───────── */
    @GetMapping("/posts")
    public List<Map<String, Object>> listPosts(@RequestParam(required = false) String topic,
                                                @RequestParam(required = false) String type,
                                                @RequestParam(required = false) String email) {
        List<FeedPost> posts;
        if (type != null && !type.isEmpty() && !"All".equals(type)) {
            posts = postRepo.findByTypeOrderByCreatedAtDesc(type);
        } else if (topic != null && !topic.isEmpty() && !"All".equals(topic)) {
            posts = postRepo.findByTopicOrderByCreatedAtDesc(topic);
        } else {
            posts = postRepo.findAllByOrderByIsPinnedDescCreatedAtDesc();
        }

        return posts.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("authorEmail", p.getAuthorEmail());
            m.put("authorName", p.getAuthorName());
            m.put("authorAvatar", p.getAuthorAvatar());
            m.put("authorRole", p.getAuthorRole());
            m.put("topic", p.getTopic());
            m.put("type", p.getType());
            m.put("title", p.getTitle());
            m.put("content", p.getContent());
            m.put("isPinned", p.getIsPinned());
            m.put("likes", p.getLikes().size());
            m.put("isLiked", email != null && p.getLikes().contains(email));
            m.put("isSaved", email != null && p.getSaves().contains(email));
            m.put("comments", commentRepo.countByPostId(p.getId()));
            m.put("shareCount", p.getShareCount());
            m.put("createdAt", p.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
    }

    /* ───────── Create post ───────── */
    @PostMapping("/posts")
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> body) {
        FeedPost post = new FeedPost();
        post.setAuthorEmail((String) body.get("authorEmail"));
        post.setAuthorName((String) body.get("authorName"));
        post.setAuthorAvatar((String) body.getOrDefault("authorAvatar", ""));
        post.setAuthorRole((String) body.getOrDefault("authorRole", "STUDENT"));
        post.setTopic((String) body.getOrDefault("topic", "General"));
        post.setType((String) body.getOrDefault("type", "General"));
        post.setTitle((String) body.get("title"));
        post.setContent((String) body.get("content"));
        post.setIsPinned(Boolean.TRUE.equals(body.get("isPinned")));
        postRepo.save(post);
        return ResponseEntity.ok(Map.of("id", post.getId(), "status", "CREATED"));
    }

    /* ───────── Toggle like ───────── */
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String id, @RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<FeedPost> opt = postRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        FeedPost post = opt.get();
        boolean isLiked;
        if (post.getLikes().contains(email)) {
            post.getLikes().remove(email);
            isLiked = false;
        } else {
            post.getLikes().add(email);
            isLiked = true;
        }
        post.setUpdatedAt(Instant.now());
        postRepo.save(post);
        return ResponseEntity.ok(Map.of("isLiked", isLiked, "likes", post.getLikes().size()));
    }

    /* ───────── Toggle save ───────── */
    @PostMapping("/posts/{id}/save")
    public ResponseEntity<?> toggleSave(@PathVariable String id, @RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<FeedPost> opt = postRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        FeedPost post = opt.get();
        boolean isSaved;
        if (post.getSaves().contains(email)) {
            post.getSaves().remove(email);
            isSaved = false;
        } else {
            post.getSaves().add(email);
            isSaved = true;
        }
        post.setUpdatedAt(Instant.now());
        postRepo.save(post);
        return ResponseEntity.ok(Map.of("isSaved", isSaved));
    }

    /* ───────── Share (increment) ───────── */
    @PostMapping("/posts/{id}/share")
    public ResponseEntity<?> share(@PathVariable String id) {
        Optional<FeedPost> opt = postRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        FeedPost post = opt.get();
        post.setShareCount(post.getShareCount() + 1);
        postRepo.save(post);
        return ResponseEntity.ok(Map.of("shareCount", post.getShareCount()));
    }

    /* ───────── Get comments for post ───────── */
    @GetMapping("/posts/{id}/comments")
    public List<FeedComment> getComments(@PathVariable String id) {
        return commentRepo.findByPostIdOrderByCreatedAtAsc(id);
    }

    /* ───────── Add comment ───────── */
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<FeedPost> opt = postRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        FeedComment c = new FeedComment();
        c.setPostId(id);
        c.setAuthorEmail(body.get("email"));
        c.setAuthorName(body.getOrDefault("name", ""));
        c.setAuthorAvatar(body.getOrDefault("avatar", ""));
        c.setText(body.get("text"));
        commentRepo.save(c);

        long count = commentRepo.countByPostId(id);
        return ResponseEntity.ok(Map.of("id", c.getId(), "commentCount", count));
    }

    /* ───────── Seed mock data (call once) ───────── */
    @PostMapping("/seed")
    public ResponseEntity<?> seedData() {
        if (postRepo.count() > 0) return ResponseEntity.ok(Map.of("status", "ALREADY_SEEDED"));

        List<FeedPost> posts = List.of(
            mkPost("placement.cell@klh.edu.in", "Placement Cell", "🎯", "ADMIN", "Placements", "Placements",
                "Record Breaking: 95%+ Placements This Semester!",
                "Excited to share that 200+ students got placed with companies like Google, Microsoft, Amazon. Average package: 12.5 LPA. Top skills in demand: ML, Cloud, Full-Stack.", true),
            mkPost("ramesh.kumar@klh.edu.in", "Dr. Ramesh Kumar", "👨‍🏫", "FACULTY", "Research", "Research",
                "New AI Research Lab Opening - Join Us!",
                "Excited to announce a new AI research lab with focus on Federated Learning & Edge AI. Students interested in research can apply. Stipend available.", false),
            mkPost("techclub@klh.edu.in", "Tech Club KLH", "💻", "ADMIN", "Hackathons", "Project Showcases",
                "HackKLH 2026 - 48-hour Hackathon",
                "National-level hackathon happening next month. Build innovative solutions, win prizes worth ₹5 Lakhs. Open for all branches and year levels. Register now!", false),
            mkPost("ananya.reddy@klh.edu.in", "Ananya Reddy", "👩‍💻", "STUDENT", "Web Dev", "Project Showcases",
                "How I Built a Production Full-Stack App in 2 Weeks",
                "Sharing my journey building a full-stack app using React, Spring Boot, MongoDB during semester break. Key learnings, resources, and mistakes to avoid.", false),
            mkPost("srinivas.prof@klh.edu.in", "Prof. Srinivas", "🔬", "FACULTY", "Research", "Research",
                "IEEE Publication Achieved - Research Tips",
                "Our team published a paper on IoT edge optimization. Tips for students interested in research: start early, collaborate, and write consistently.", false),
            mkPost("career.center@klh.edu.in", "Career Center", "🚀", "ADMIN", "Placements", "Career Tips",
                "Ace Your Next Interview: DSA + System Design Guide",
                "Complete preparation guide for tech interviews covering Data Structures, Algorithms, System Design, and behavioral questions. Amazon visiting campus next week!", false)
        );
        postRepo.saveAll(posts);
        return ResponseEntity.ok(Map.of("status", "SEEDED", "count", posts.size()));
    }

    private FeedPost mkPost(String email, String name, String avatar, String role, String topic, String type, String title, String content, boolean pinned) {
        FeedPost p = new FeedPost();
        p.setAuthorEmail(email); p.setAuthorName(name); p.setAuthorAvatar(avatar);
        p.setAuthorRole(role); p.setTopic(topic); p.setType(type);
        p.setTitle(title); p.setContent(content); p.setIsPinned(pinned);
        // Add some initial likes for realism
        if (pinned) { p.getLikes().addAll(Set.of("user1@klh.edu.in", "user2@klh.edu.in", "user3@klh.edu.in")); }
        return p;
    }
}
