package com.klh.uniconnect.service;

import com.klh.uniconnect.model.Goal;
import com.klh.uniconnect.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {
    @Autowired
    private GoalRepository goalRepository;

    // Get active goals for student
    public List<Goal> getActiveGoals(String studentId) {
        return goalRepository.findByStudentIdAndStatus(studentId, "Active");
    }

    // Get all goals for student
    public List<Goal> getStudentGoals(String studentId) {
        return goalRepository.findByStudentId(studentId);
    }

    // Create a goal (can be faculty-assigned or student-created)
    public Goal createGoal(Goal goal) {
        goal.setCreatedAt(LocalDateTime.now());
        goal.setLastUpdated(LocalDateTime.now());
        return goalRepository.save(goal);
    }

    // Update goal progress
    public Goal updateGoalProgress(String goalId, double progress) {
        Optional<Goal> goal = goalRepository.findById(goalId);
        if (goal.isPresent()) {
            Goal g = goal.get();
            g.setProgressPercentage(progress);
            if (progress >= 100) {
                g.setStatus("Completed");
                g.setCompletedDate(LocalDateTime.now());
            }
            g.setLastUpdated(LocalDateTime.now());
            return goalRepository.save(g);
        }
        return null;
    }

    // Mark goal as completed
    public Goal completeGoal(String goalId) {
        Optional<Goal> goal = goalRepository.findById(goalId);
        if (goal.isPresent()) {
            Goal g = goal.get();
            g.setStatus("Completed");
            g.setProgressPercentage(100);
            g.setCompletedDate(LocalDateTime.now());
            g.setLastUpdated(LocalDateTime.now());
            return goalRepository.save(g);
        }
        return null;
    }

    // Add feedback to a goal
    public Goal addFeedback(String goalId, String feedback) {
        Optional<Goal> goal = goalRepository.findById(goalId);
        if (goal.isPresent()) {
            Goal g = goal.get();
            g.setFeedback(feedback);
            g.setLastUpdated(LocalDateTime.now());
            return goalRepository.save(g);
        }
        return null;
    }

    // Get goals assigned by faculty
    public List<Goal> getFacultyAssignedGoals(String facultyId) {
        return goalRepository.findByAssignedBy(facultyId);
    }

    // Get count of active goals
    public long getActiveGoalsCount(String studentId) {
        return getActiveGoals(studentId).size();
    }
}
