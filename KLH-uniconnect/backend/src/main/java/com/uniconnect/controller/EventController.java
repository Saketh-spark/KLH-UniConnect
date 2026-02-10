package com.uniconnect.controller;

import com.uniconnect.model.Event;
import com.uniconnect.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty/events")
@CrossOrigin(originPatterns = "*")
public class EventController {
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<Event>> getMyEvents(@RequestHeader("Faculty-Id") String facultyId) {
        return ResponseEntity.ok(eventService.getEventsByFaculty(facultyId));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getEvent(@PathVariable String eventId) {
        Event event = eventService.getEventById(eventId);
        if (event != null) {
            return ResponseEntity.ok(event);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(
            @RequestBody Event event,
            @RequestHeader("Faculty-Id") String facultyId) {
        event.setCreatedBy(facultyId);
        event.setStatus("Draft");
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<Event> updateEvent(
            @PathVariable String eventId,
            @RequestBody Event event) {
        Event updated = eventService.updateEvent(eventId, event);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{eventId}/publish")
    public ResponseEntity<Event> publishEvent(@PathVariable String eventId) {
        Event event = eventService.publishEvent(eventId);
        if (event != null) {
            return ResponseEntity.ok(event);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestHeader("Faculty-Id") String facultyId) {
        Map<String, Object> stats = eventService.getDashboardStats(facultyId);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{eventId}/register/{studentId}")
    public ResponseEntity<Event> registerStudent(
            @PathVariable String eventId,
            @PathVariable String studentId) {
        Event event = eventService.registerStudentForEvent(eventId, studentId);
        if (event != null) {
            return ResponseEntity.ok(event);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{eventId}/attendance")
    public ResponseEntity<Event> markAttendance(
            @PathVariable String eventId,
            @RequestBody Map<String, String> attendanceData) {
        Event event = eventService.markAttendance(
                eventId,
                attendanceData.get("studentId"),
                attendanceData.get("studentName"),
                attendanceData.get("studentEmail")
        );
        if (event != null) {
            return ResponseEntity.ok(event);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{eventId}/registrations/export")
    public ResponseEntity<String> exportRegistrations(@PathVariable String eventId) {
        Event event = eventService.getEventById(eventId);
        if (event != null) {
            StringBuilder csv = new StringBuilder();
            csv.append("Student ID,Registration Date\n");
            event.getRegisteredStudents().forEach(studentId ->
                    csv.append(studentId).append(",").append(Instant.now()).append("\n")
            );
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=registrations-" + eventId + ".csv")
                    .body(csv.toString());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<Event>> searchEvents(@RequestParam String query) {
        return ResponseEntity.ok(eventService.searchEvents(query));
    }

    @GetMapping("/type/{eventType}")
    public ResponseEntity<List<Event>> getEventsByType(@PathVariable String eventType) {
        return ResponseEntity.ok(eventService.getEventsByType(eventType));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Event>> getEventsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        Instant start = Instant.parse(startDate);
        Instant end = Instant.parse(endDate);
        return ResponseEntity.ok(eventService.getEventsInDateRange(start, end));
    }
}
