package com.uniconnect.controller;

import com.uniconnect.model.Event;
import com.uniconnect.model.Club;
import com.uniconnect.repository.EventRepository;
import com.uniconnect.repository.ClubRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events/student")
@CrossOrigin(originPatterns = "*")
public class StudentEventsController {

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;

    public StudentEventsController(EventRepository eventRepository, ClubRepository clubRepository) {
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
    }

    // Get events where the student is registered
    @GetMapping("/registered")
    public ResponseEntity<List<Event>> getRegisteredEvents(@RequestParam String email) {
        List<Event> all = eventRepository.findAll();
        List<Event> registered = all.stream()
                .filter(e -> e.getRegisteredStudents() != null && e.getRegisteredStudents().contains(email))
                .collect(Collectors.toList());
        return ResponseEntity.ok(registered);
    }

    // Get clubs where the student is a member
    @GetMapping("/joined-clubs")
    public ResponseEntity<List<Club>> getJoinedClubs(@RequestParam String email) {
        List<Club> clubs = clubRepository.findClubsByMember(email);
        return ResponseEntity.ok(clubs);
    }

    // Get student achievement stats
    @GetMapping("/achievements")
    public ResponseEntity<Map<String, Object>> getAchievements(@RequestParam String email) {
        List<Event> all = eventRepository.findAll();

        long registered = all.stream()
                .filter(e -> e.getRegisteredStudents() != null && e.getRegisteredStudents().contains(email))
                .count();

        long attended = all.stream()
                .filter(e -> e.getAttendance() != null &&
                        e.getAttendance().stream().anyMatch(a ->
                                email.equals(a.studentEmail) || email.equals(a.studentId)))
                .count();

        List<Club> joinedClubs = clubRepository.findClubsByMember(email);

        long leadershipRoles = joinedClubs.stream()
                .filter(c -> email.equals(c.getClubPresident()))
                .count();

        int participationScore = (int) (attended * 10 + registered * 5 + joinedClubs.size() * 8 + leadershipRoles * 20);

        Map<String, Object> stats = new HashMap<>();
        stats.put("eventsRegistered", registered);
        stats.put("eventsAttended", attended);
        stats.put("certificates", attended); // 1 cert per attended event
        stats.put("clubsJoined", joinedClubs.size());
        stats.put("leadershipRoles", leadershipRoles);
        stats.put("participationScore", participationScore);

        // Build participation history
        List<Map<String, Object>> history = all.stream()
                .filter(e -> e.getRegisteredStudents() != null && e.getRegisteredStudents().contains(email))
                .sorted(Comparator.comparing(Event::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(20)
                .map(e -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("eventId", e.getId());
                    entry.put("title", e.getTitle());
                    entry.put("eventType", e.getEventType());
                    entry.put("dateTime", e.getDateTime());
                    boolean att = e.getAttendance() != null &&
                            e.getAttendance().stream().anyMatch(a ->
                                    email.equals(a.studentEmail) || email.equals(a.studentId));
                    entry.put("attended", att);
                    entry.put("status", e.getStatus());
                    return entry;
                })
                .collect(Collectors.toList());

        stats.put("history", history);
        return ResponseEntity.ok(stats);
    }

    // Cancel registration
    @DeleteMapping("/{eventId}/cancel")
    public ResponseEntity<Map<String, String>> cancelRegistration(
            @PathVariable String eventId, @RequestParam String email) {
        Optional<Event> opt = eventRepository.findById(eventId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Event event = opt.get();
        List<String> reg = event.getRegisteredStudents();
        if (reg != null && reg.contains(email)) {
            reg.remove(email);
            event.setRegisteredStudents(reg);
            event.setRegistrationCount(reg.size());
            eventRepository.save(event);
            return ResponseEntity.ok(Map.of("message", "Registration cancelled"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Not registered"));
    }

    // Submit feedback
    @PostMapping("/{eventId}/feedback")
    public ResponseEntity<Map<String, String>> submitFeedback(
            @PathVariable String eventId, @RequestBody Map<String, Object> body) {
        // For now, just acknowledge — can be extended with a Feedback model later
        Optional<Event> opt = eventRepository.findById(eventId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully"));
    }
}
