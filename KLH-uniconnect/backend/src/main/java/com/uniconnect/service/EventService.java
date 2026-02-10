package com.uniconnect.service;

import com.uniconnect.model.Event;
import com.uniconnect.repository.EventRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EventService {
    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // Create Event
    public Event createEvent(Event event) {
        if (event.getStatus() == null) {
            event.setStatus("Draft");
        }
        return eventRepository.save(event);
    }

    // Get all events
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    // Get events by faculty
    public List<Event> getEventsByFaculty(String facultyId) {
        return eventRepository.findByCreatedBy(facultyId);
    }

    // Get event by ID
    public Event getEventById(String eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }

    // Update event
    public Event updateEvent(String eventId, Event updatedEvent) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setEventType(updatedEvent.getEventType());
            event.setDateTime(updatedEvent.getDateTime());
            event.setVenue(updatedEvent.getVenue());
            event.setMaxParticipants(updatedEvent.getMaxParticipants());
            event.setRegistrationDeadline(updatedEvent.getRegistrationDeadline());
            event.setBannerUrl(updatedEvent.getBannerUrl());
            event.setUpdatedAt(Instant.now());
            return eventRepository.save(event);
        }
        return null;
    }

    // Delete event
    public void deleteEvent(String eventId) {
        eventRepository.deleteById(eventId);
    }

    // Publish event (make visible to students)
    public Event publishEvent(String eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            event.setStatus("Published");
            event.setUpdatedAt(Instant.now());
            return eventRepository.save(event);
        }
        return null;
    }

    // Register student for event
    public Event registerStudentForEvent(String eventId, String studentId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null && !event.getRegisteredStudents().contains(studentId)) {
            event.getRegisteredStudents().add(studentId);
            event.setRegistrationCount(event.getRegistrationCount() + 1);
            event.setUpdatedAt(Instant.now());
            return eventRepository.save(event);
        }
        return event;
    }

    // Mark attendance
    public Event markAttendance(String eventId, String studentId, String studentName, String studentEmail) {
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event != null) {
            Event.Attendance attendance = new Event.Attendance(studentId, studentName, studentEmail);
            event.getAttendance().add(attendance);
            event.setUpdatedAt(Instant.now());
            return eventRepository.save(event);
        }
        return null;
    }

    // Get dashboard stats
    public Map<String, Object> getDashboardStats(String facultyId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Event> allEvents = getEventsByFaculty(facultyId);
        Instant now = Instant.now();
        
        long totalEvents = allEvents.size();
        long upcomingEvents = allEvents.stream()
                .filter(e -> e.getDateTime().isAfter(now))
                .count();
        long pastEvents = allEvents.stream()
                .filter(e -> e.getDateTime().isBefore(now))
                .count();
        long publishedEvents = allEvents.stream()
                .filter(e -> "Published".equals(e.getStatus()))
                .count();
        
        long totalRegistrations = allEvents.stream()
                .mapToLong(e -> e.getRegistrationCount() != null ? e.getRegistrationCount() : 0)
                .sum();
        
        long totalAttendance = allEvents.stream()
                .mapToLong(e -> e.getAttendance() != null ? e.getAttendance().size() : 0)
                .sum();
        
        double attendancePercentage = totalRegistrations > 0 ? (totalAttendance * 100.0 / totalRegistrations) : 0;
        
        stats.put("totalEvents", totalEvents);
        stats.put("upcomingEvents", upcomingEvents);
        stats.put("pastEvents", pastEvents);
        stats.put("publishedEvents", publishedEvents);
        stats.put("totalRegistrations", totalRegistrations);
        stats.put("attendancePercentage", Math.round(attendancePercentage * 100.0) / 100.0);
        
        return stats;
    }

    // Get events by type
    public List<Event> getEventsByType(String eventType) {
        return eventRepository.findByEventType(eventType);
    }

    // Search events
    public List<Event> searchEvents(String query) {
        return eventRepository.searchByTitle(query);
    }

    // Get events in date range
    public List<Event> getEventsInDateRange(Instant startDate, Instant endDate) {
        return eventRepository.findByDateTimeBetween(startDate, endDate);
    }
}
