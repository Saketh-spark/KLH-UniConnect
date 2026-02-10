package com.uniconnect.service;

import com.uniconnect.model.SafetyGuide;
import com.uniconnect.repository.SafetyGuideRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SafetyGuideService {
    private final SafetyGuideRepository repository;

    public SafetyGuideService(SafetyGuideRepository repository) {
        this.repository = repository;
    }

    public SafetyGuide createGuide(SafetyGuide guide, String userId) {
        guide.setCreatedBy(userId);
        guide.setAuthor(userId);
        guide.setCreatedAt(LocalDateTime.now());
        guide.setUpdatedAt(LocalDateTime.now());
        guide.setIsApproved(false);
        guide.setIsPublished(false);
        return repository.save(guide);
    }

    public SafetyGuide updateGuide(String id, SafetyGuide updates) {
        Optional<SafetyGuide> existing = repository.findById(id);
        if (existing.isPresent()) {
            SafetyGuide guide = existing.get();
            if (updates.getTitle() != null) guide.setTitle(updates.getTitle());
            if (updates.getContent() != null) guide.setContent(updates.getContent());
            if (updates.getDescription() != null) guide.setDescription(updates.getDescription());
            if (updates.getCategory() != null) guide.setCategory(updates.getCategory());
            if (updates.getImportanceLevel() != null) guide.setImportanceLevel(updates.getImportanceLevel());
            if (updates.getTags() != null) guide.setTags(updates.getTags());
            guide.setUpdatedAt(LocalDateTime.now());
            return repository.save(guide);
        }
        return null;
    }

    public SafetyGuide approveGuide(String id, String facultyId) {
        Optional<SafetyGuide> guide = repository.findById(id);
        if (guide.isPresent()) {
            guide.get().setIsApproved(true);
            guide.get().setReviewedBy(facultyId);
            guide.get().setReviewedAt(LocalDateTime.now());
            guide.get().setUpdatedAt(LocalDateTime.now());
            return repository.save(guide.get());
        }
        return null;
    }

    public SafetyGuide publishGuide(String id) {
        Optional<SafetyGuide> guide = repository.findById(id);
        if (guide.isPresent() && guide.get().getIsApproved()) {
            guide.get().setIsPublished(true);
            guide.get().setPublishedAt(LocalDateTime.now());
            guide.get().setUpdatedAt(LocalDateTime.now());
            return repository.save(guide.get());
        }
        return null;
    }

    public void deleteGuide(String id) {
        repository.deleteById(id);
    }

    public Optional<SafetyGuide> getGuideById(String id) {
        return repository.findById(id);
    }

    public List<SafetyGuide> getAllGuides() {
        return repository.findAll();
    }

    public List<SafetyGuide> getApprovedGuides() {
        return repository.findByIsApprovedTrueAndIsPublishedTrueOrderByPublishedAtDesc();
    }

    public List<SafetyGuide> getGuidesByCategory(String category) {
        return repository.findByCategory(category);
    }

    public List<SafetyGuide> getPendingApproval() {
        return repository.findByIsApprovedFalse();
    }

    public long getTotalGuides() {
        return repository.count();
    }
}
