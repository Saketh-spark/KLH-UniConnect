package com.uniconnect.service;

import com.uniconnect.model.CounselingSession;
import com.uniconnect.repository.CounselingSessionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class CounselingSessionService {
    private final CounselingSessionRepository repository;

    public CounselingSessionService(CounselingSessionRepository repository) {
        this.repository = repository;
    }

    public CounselingSession createSession(CounselingSession session) {
        session.setStatus("Requested");
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        return repository.save(session);
    }

    public CounselingSession assignCounselor(String id, String counselorId, String counselorName) {
        Optional<CounselingSession> session = repository.findById(id);
        if (session.isPresent()) {
            session.get().setCounselorId(counselorId);
            session.get().setCounselorName(counselorName);
            session.get().setStatus("Scheduled");
            session.get().setBookingStatus("Confirmed");
            session.get().setUpdatedAt(LocalDateTime.now());
            return repository.save(session.get());
        }
        return null;
    }

    public CounselingSession scheduleSession(String id, String dateTimeString) {
        Optional<CounselingSession> session = repository.findById(id);
        if (session.isPresent()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
                LocalDateTime dateTime = LocalDateTime.parse(dateTimeString, formatter);
                session.get().setSessionDateTime(dateTime);
                session.get().setStatus("Scheduled");
                session.get().setBookingStatus("Confirmed");
                session.get().setUpdatedAt(LocalDateTime.now());
                return repository.save(session.get());
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public void closeSession(String id, String notes) {
        Optional<CounselingSession> session = repository.findById(id);
        if (session.isPresent()) {
            session.get().setStatus("Completed");
            session.get().setBookingStatus("Completed");
            session.get().setCounselorNotes(notes);
            session.get().setUpdatedAt(LocalDateTime.now());
            repository.save(session.get());
        }
    }

    public Optional<CounselingSession> getSessionById(String id) {
        return repository.findById(id);
    }

    public List<CounselingSession> getAllSessions() {
        return repository.findAll();
    }

    public List<CounselingSession> getSessionsByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<CounselingSession> getCounselorSessions(String counselorId) {
        return repository.findByCounselorId(counselorId);
    }

    public List<CounselingSession> getStudentSessions(String studentId) {
        return repository.findByStudentId(studentId);
    }

    public long getTotalSessions() {
        return repository.count();
    }

    public long getPendingSessionCount() {
        return repository.findByStatus("Requested").size();
    }
}
