package com.uniconnect.repository;

import com.uniconnect.model.AttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends MongoRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByFacultyId(String facultyId);
    List<AttendanceRecord> findBySubject(String subject);
    List<AttendanceRecord> findBySubjectAndSection(String subject, String section);
    List<AttendanceRecord> findByDate(LocalDate date);
    List<AttendanceRecord> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<AttendanceRecord> findByFacultyIdAndSubject(String facultyId, String subject);
    List<AttendanceRecord> findBySubjectOrderByDateDesc(String subject);
    List<AttendanceRecord> findAllByOrderByDateDesc();
}
