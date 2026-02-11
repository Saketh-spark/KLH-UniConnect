package com.uniconnect.controller;

import com.uniconnect.model.Club;
import com.uniconnect.service.ClubService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/clubs")
@CrossOrigin(originPatterns = "*")
public class ClubController {
    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/my-clubs")
    public ResponseEntity<List<Club>> getMyClubs(@RequestHeader("Faculty-Id") String facultyId) {
        return ResponseEntity.ok(clubService.getClubsByFaculty(facultyId));
    }

    @GetMapping("/{clubId}")
    public ResponseEntity<Club> getClub(@PathVariable String clubId) {
        Club club = clubService.getClubById(clubId);
        if (club != null) {
            return ResponseEntity.ok(club);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Club> createClub(
            @RequestBody Club club,
            @RequestHeader("Faculty-Id") String facultyId) {
        club.setFacultyCoordinator(facultyId);
        return ResponseEntity.ok(clubService.createClub(club));
    }

    @PutMapping("/{clubId}")
    public ResponseEntity<Club> updateClub(
            @PathVariable String clubId,
            @RequestBody Club club) {
        Club updated = clubService.updateClub(clubId, club);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{clubId}/approve")
    public ResponseEntity<Club> approveClub(
            @PathVariable String clubId,
            @RequestHeader("Faculty-Id") String facultyId) {
        Club club = clubService.approveClub(clubId, facultyId);
        if (club != null) {
            return ResponseEntity.ok(club);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{clubId}/reject")
    public ResponseEntity<Void> rejectClub(@PathVariable String clubId) {
        clubService.rejectClub(clubId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{clubId}/suspend")
    public ResponseEntity<Club> suspendClub(@PathVariable String clubId) {
        Club club = clubService.suspendClub(clubId);
        if (club != null) {
            return ResponseEntity.ok(club);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{clubId}")
    public ResponseEntity<Void> deleteClub(@PathVariable String clubId) {
        clubService.deleteClub(clubId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{clubId}/members/{studentId}")
    public ResponseEntity<Club> addMember(
            @PathVariable String clubId,
            @PathVariable String studentId) {
        Club club = clubService.addMemberToClub(clubId, studentId);
        if (club != null) {
            return ResponseEntity.ok(club);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{clubId}/members/{studentId}")
    public ResponseEntity<Club> removeMember(
            @PathVariable String clubId,
            @PathVariable String studentId) {
        Club club = clubService.removeMemberFromClub(clubId, studentId);
        if (club != null) {
            return ResponseEntity.ok(club);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestHeader("Faculty-Id") String facultyId) {
        Map<String, Object> stats = clubService.getDashboardStats(facultyId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Club>> getClubsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(clubService.getClubsByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Club>> searchClubs(@RequestParam String query) {
        return ResponseEntity.ok(clubService.searchClubs(query));
    }
}
