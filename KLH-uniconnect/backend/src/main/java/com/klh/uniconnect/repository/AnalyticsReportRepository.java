package com.klh.uniconnect.repository;

import com.klh.uniconnect.model.AnalyticsReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsReportRepository extends MongoRepository<AnalyticsReport, String> {
    List<AnalyticsReport> findByStudentId(String studentId);
    List<AnalyticsReport> findByStudentIdAndReportType(String studentId, String reportType);
    List<AnalyticsReport> findByStatus(String status);
    List<AnalyticsReport> findByMonthAndYear(String month, String year);
}
