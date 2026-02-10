package com.uniconnect.controller;

import com.uniconnect.model.OpportunityApplication;
import com.uniconnect.repository.OpportunityApplicationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/opportunities")
@CrossOrigin(originPatterns = "*")
public class OpportunityController {

    private final OpportunityApplicationRepository appRepo;

    public OpportunityController(OpportunityApplicationRepository appRepo) {
        this.appRepo = appRepo;
    }

    /* ───────── Apply to opportunity ───────── */
    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String oppId = body.get("opportunityId");
        if (email == null || oppId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and opportunityId are required"));
        }

        Optional<OpportunityApplication> existing = appRepo.findByApplicantEmailAndOpportunityId(email, oppId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("status", "ALREADY_APPLIED", "id", existing.get().getId()));
        }

        OpportunityApplication app = new OpportunityApplication();
        app.setApplicantEmail(email);
        app.setApplicantName(body.getOrDefault("name", ""));
        app.setOpportunityId(oppId);
        app.setCoverNote(body.getOrDefault("coverNote", ""));
        app.setResumeUrl(body.getOrDefault("resumeUrl", ""));
        appRepo.save(app);

        return ResponseEntity.ok(Map.of("status", "APPLIED", "id", app.getId()));
    }

    /* ───────── Check application status (bulk) ───────── */
    @PostMapping("/status/bulk")
    public ResponseEntity<?> bulkStatus(@RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        @SuppressWarnings("unchecked")
        List<String> oppIds = (List<String>) body.get("opportunityIds");

        if (email == null || oppIds == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and opportunityIds required"));
        }

        List<OpportunityApplication> myApps = appRepo.findByApplicantEmail(email);
        Map<String, Map<String, String>> result = new LinkedHashMap<>();
        Set<String> appliedIds = new HashSet<>();
        for (OpportunityApplication a : myApps) {
            appliedIds.add(a.getOpportunityId());
            result.put(a.getOpportunityId(), Map.of("status", a.getStatus(), "id", a.getId()));
        }
        for (String id : oppIds) {
            if (!result.containsKey(id)) {
                result.put(id, Map.of("status", "NONE"));
            }
        }
        return ResponseEntity.ok(result);
    }

    /* ───────── Get my applications ───────── */
    @GetMapping("/my-applications")
    public List<OpportunityApplication> myApplications(@RequestParam String email) {
        return appRepo.findByApplicantEmail(email);
    }

    /* ───────── Withdraw application ───────── */
    @DeleteMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String oppId = body.get("opportunityId");
        Optional<OpportunityApplication> opt = appRepo.findByApplicantEmailAndOpportunityId(email, oppId);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        appRepo.delete(opt.get());
        return ResponseEntity.ok(Map.of("status", "WITHDRAWN"));
    }
}
