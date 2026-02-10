package com.klh.uniconnect.repository;

import com.klh.uniconnect.model.AnalyticsFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsFeedbackRepository extends MongoRepository<AnalyticsFeedback, String> {
    List<AnalyticsFeedback> findByStudentId(String studentId);
    List<AnalyticsFeedback> findByFacultyId(String facultyId);
    List<AnalyticsFeedback> findByStudentIdAndIsReadFalse(String studentId);
    List<AnalyticsFeedback> findByFlaggedAsNeedsAttentionTrue();
}
