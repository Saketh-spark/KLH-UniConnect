package com.uniconnect.controller;

import com.uniconnect.model.FollowRequest;
import com.uniconnect.repository.FollowRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follow")
@CrossOrigin(originPatterns = "*")
public class FollowController {

    private final FollowRequestRepository followRepo;

    public FollowController(FollowRequestRepository followRepo) {
        this.followRepo = followRepo;
    }

    /* ───────── Send follow request ───────── */
    @PostMapping("/request")
    public ResponseEntity<?> sendFollowRequest(@RequestBody Map<String, String> body) {
        String fromEmail = body.get("fromEmail");
        String toEmail   = body.get("toEmail");

        if (fromEmail == null || toEmail == null || fromEmail.equalsIgnoreCase(toEmail)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid request"));
        }

        // Check if already exists
        Optional<FollowRequest> existing = followRepo.findByFromEmailAndToEmail(fromEmail, toEmail);
        if (existing.isPresent()) {
            FollowRequest fr = existing.get();
            if ("ACCEPTED".equals(fr.getStatus())) {
                return ResponseEntity.ok(Map.of("status", "ALREADY_CONNECTED"));
            }
            if ("PENDING".equals(fr.getStatus())) {
                return ResponseEntity.ok(Map.of("status", "ALREADY_PENDING"));
            }
            // If previously rejected, allow re-requesting
            fr.setStatus("PENDING");
            fr.setUpdatedAt(Instant.now());
            followRepo.save(fr);
            return ResponseEntity.ok(Map.of("status", "PENDING", "id", fr.getId()));
        }

        // Check reverse direction — maybe target already sent us a follow
        Optional<FollowRequest> reverse = followRepo.findByFromEmailAndToEmail(toEmail, fromEmail);
        if (reverse.isPresent() && "PENDING".equals(reverse.get().getStatus())) {
            // Auto-accept: both want to connect
            FollowRequest rev = reverse.get();
            rev.setStatus("ACCEPTED");
            followRepo.save(rev);
            return ResponseEntity.ok(Map.of("status", "ACCEPTED", "message", "Auto-accepted — mutual request"));
        }

        FollowRequest fr = new FollowRequest(
            fromEmail,
            body.getOrDefault("fromName", ""),
            body.getOrDefault("fromAvatarUrl", ""),
            body.getOrDefault("fromRole", "student"),
            toEmail,
            body.getOrDefault("toName", ""),
            body.getOrDefault("toAvatarUrl", ""),
            body.getOrDefault("toRole", "student")
        );
        followRepo.save(fr);
        return ResponseEntity.ok(Map.of("status", "PENDING", "id", fr.getId()));
    }

    /* ───────── Accept / Reject a request ───────── */
    @PutMapping("/request/{id}")
    public ResponseEntity<?> respondToRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String action = body.get("action"); // "accept" or "reject"
        Optional<FollowRequest> opt = followRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        FollowRequest fr = opt.get();
        if ("accept".equalsIgnoreCase(action)) {
            fr.setStatus("ACCEPTED");
        } else if ("reject".equalsIgnoreCase(action)) {
            fr.setStatus("REJECTED");
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid action"));
        }
        followRepo.save(fr);
        return ResponseEntity.ok(Map.of("status", fr.getStatus(), "id", fr.getId()));
    }

    /* ───────── Unfollow / Remove connection ───────── */
    @DeleteMapping("/request")
    public ResponseEntity<?> unfollow(@RequestBody Map<String, String> body) {
        String fromEmail = body.get("fromEmail");
        String toEmail   = body.get("toEmail");

        // Check both directions
        Optional<FollowRequest> fr1 = followRepo.findByFromEmailAndToEmail(fromEmail, toEmail);
        Optional<FollowRequest> fr2 = followRepo.findByFromEmailAndToEmail(toEmail, fromEmail);

        fr1.ifPresent(followRepo::delete);
        fr2.ifPresent(followRepo::delete);

        return ResponseEntity.ok(Map.of("status", "UNFOLLOWED"));
    }

    /* ───────── Get pending requests received ───────── */
    @GetMapping("/requests/received")
    public List<Map<String, Object>> getReceivedRequests(@RequestParam String email) {
        return followRepo.findByToEmailAndStatus(email, "PENDING")
                .stream().map(fr -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", fr.getId());
                    m.put("fromEmail", fr.getFromEmail());
                    m.put("fromName", fr.getFromName());
                    m.put("fromAvatarUrl", fr.getFromAvatarUrl());
                    m.put("fromRole", fr.getFromRole());
                    m.put("createdAt", fr.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());
    }

    /* ───────── Get pending requests sent ───────── */
    @GetMapping("/requests/sent")
    public List<Map<String, Object>> getSentRequests(@RequestParam String email) {
        return followRepo.findByFromEmailAndStatus(email, "PENDING")
                .stream().map(fr -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", fr.getId());
                    m.put("toEmail", fr.getToEmail());
                    m.put("toName", fr.getToName());
                    m.put("toAvatarUrl", fr.getToAvatarUrl());
                    m.put("toRole", fr.getToRole());
                    m.put("createdAt", fr.getCreatedAt());
                    return m;
                }).collect(Collectors.toList());
    }

    /* ───────── Count pending received requests ───────── */
    @GetMapping("/requests/count")
    public Map<String, Object> getRequestCount(@RequestParam String email) {
        long count = followRepo.countByToEmailAndStatus(email, "PENDING");
        return Map.of("count", count);
    }

    /* ───────── Get all connections (accepted follows) ───────── */
    @GetMapping("/connections")
    public List<Map<String, Object>> getConnections(@RequestParam String email) {
        List<FollowRequest> all = followRepo.findByFromEmailAndStatusOrToEmailAndStatus(
                email, "ACCEPTED", email, "ACCEPTED");

        return all.stream().map(fr -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", fr.getId());
            // Return the OTHER person's details
            if (email.equalsIgnoreCase(fr.getFromEmail())) {
                m.put("email", fr.getToEmail());
                m.put("name", fr.getToName());
                m.put("avatarUrl", fr.getToAvatarUrl());
                m.put("role", fr.getToRole());
            } else {
                m.put("email", fr.getFromEmail());
                m.put("name", fr.getFromName());
                m.put("avatarUrl", fr.getFromAvatarUrl());
                m.put("role", fr.getFromRole());
            }
            m.put("connectedAt", fr.getUpdatedAt());
            return m;
        }).collect(Collectors.toList());
    }

    /* ───────── Get follow status between two users ───────── */
    @GetMapping("/status")
    public Map<String, Object> getFollowStatus(
            @RequestParam String fromEmail,
            @RequestParam String toEmail) {
        // Check from→to direction
        Optional<FollowRequest> forward = followRepo.findByFromEmailAndToEmail(fromEmail, toEmail);
        if (forward.isPresent()) {
            FollowRequest fr = forward.get();
            return Map.of("status", fr.getStatus(), "direction", "sent", "id", fr.getId());
        }
        // Check to→from direction
        Optional<FollowRequest> reverse = followRepo.findByFromEmailAndToEmail(toEmail, fromEmail);
        if (reverse.isPresent()) {
            FollowRequest fr = reverse.get();
            return Map.of("status", fr.getStatus(), "direction", "received", "id", fr.getId());
        }
        return Map.of("status", "NONE");
    }

    /* ───────── Bulk follow status for discover page (batch) ───────── */
    @PostMapping("/status/bulk")
    public Map<String, Object> bulkFollowStatus(@RequestBody Map<String, Object> body) {
        String myEmail = (String) body.get("email");
        @SuppressWarnings("unchecked")
        List<String> targetEmails = (List<String>) body.get("targets");

        if (myEmail == null || targetEmails == null) {
            return Map.of();
        }

        // Get all follow requests involving this user
        List<FollowRequest> sent = followRepo.findByFromEmail(myEmail);
        List<FollowRequest> received = followRepo.findByToEmail(myEmail);

        Map<String, Object> result = new HashMap<>();
        for (String target : targetEmails) {
            // Check sent
            Optional<FollowRequest> s = sent.stream()
                    .filter(f -> target.equalsIgnoreCase(f.getToEmail()))
                    .findFirst();
            if (s.isPresent()) {
                result.put(target, Map.of("status", s.get().getStatus(), "direction", "sent", "id", s.get().getId()));
                continue;
            }
            // Check received
            Optional<FollowRequest> r = received.stream()
                    .filter(f -> target.equalsIgnoreCase(f.getFromEmail()))
                    .findFirst();
            if (r.isPresent()) {
                result.put(target, Map.of("status", r.get().getStatus(), "direction", "received", "id", r.get().getId()));
                continue;
            }
            result.put(target, Map.of("status", "NONE"));
        }
        return result;
    }
}
