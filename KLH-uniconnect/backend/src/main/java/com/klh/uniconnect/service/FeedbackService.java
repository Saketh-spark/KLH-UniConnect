package com.klh.uniconnect.service;

import com.klh.uniconnect.model.AnalyticsFeedback;
import com.klh.uniconnect.repository.AnalyticsFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {
    @Autowired
    private AnalyticsFeedbackRepository feedbackRepository;

    // Get all feedback for a student
    public List<AnalyticsFeedback> getStudentFeedback(String studentId) {
        return feedbackRepository.findByStudentId(studentId);
    }

    // Get unread feedback
    public List<AnalyticsFeedback> getUnreadFeedback(String studentId) {
        return feedbackRepository.findByStudentIdAndIsReadFalse(studentId);
    }

    // Add feedback from faculty
    public AnalyticsFeedback addFeedback(AnalyticsFeedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());
        feedback.setRead(false);
        return feedbackRepository.save(feedback);
    }

    // Mark feedback as read
    public AnalyticsFeedback markAsRead(String feedbackId) {
        Optional<AnalyticsFeedback> feedback = feedbackRepository.findById(feedbackId);
        if (feedback.isPresent()) {
            AnalyticsFeedback f = feedback.get();
            f.setRead(true);
            f.setUpdatedAt(LocalDateTime.now());
            return feedbackRepository.save(f);
        }
        return null;
    }

    // Get all feedback by faculty
    public List<AnalyticsFeedback> getFacultyFeedback(String facultyId) {
        return feedbackRepository.findByFacultyId(facultyId);
    }

    // Get flagged students (needs attention)
    public List<AnalyticsFeedback> getFlaggedStudents() {
        return feedbackRepository.findByFlaggedAsNeedsAttentionTrue();
    }

    // Flag a student for attention
    public AnalyticsFeedback flagStudentForAttention(String feedbackId, String recommendedAction) {
        Optional<AnalyticsFeedback> feedback = feedbackRepository.findById(feedbackId);
        if (feedback.isPresent()) {
            AnalyticsFeedback f = feedback.get();
            f.setFlaggedAsNeedsAttention(true);
            f.setRecommendedAction(recommendedAction);
            f.setUpdatedAt(LocalDateTime.now());
            return feedbackRepository.save(f);
        }
        return null;
    }
}
