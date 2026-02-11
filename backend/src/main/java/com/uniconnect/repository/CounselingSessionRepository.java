package com.uniconnect.repository;

import com.uniconnect.model.CounselingSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CounselingSessionRepository extends MongoRepository<CounselingSession, String> {
    List<CounselingSession> findByStudentId(String studentId);
    List<CounselingSession> findByCounselorId(String counselorId);
    List<CounselingSession> findByStatus(String status);
    List<CounselingSession> findByBookingStatus(String bookingStatus);
    List<CounselingSession> findBySessionTypeOrderByCreatedAtDesc(String sessionType);
    List<CounselingSession> findByRequiresFollowUpTrueAndStatusNot(String status);
}
