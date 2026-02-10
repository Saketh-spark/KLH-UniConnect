package com.klh.uniconnect.repository;

import com.klh.uniconnect.model.StudentAnalytics;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface StudentAnalyticsRepository extends MongoRepository<StudentAnalytics, String> {
    Optional<StudentAnalytics> findByStudentId(String studentId);
    List<StudentAnalytics> findByDepartment(String department);
    List<StudentAnalytics> findBySemester(String semester);
    List<StudentAnalytics> findByDepartmentAndSemester(String department, String semester);
}
