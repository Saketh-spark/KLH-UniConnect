package com.uniconnect.service;

import com.uniconnect.model.SafetyResource;
import com.uniconnect.repository.SafetyResourceRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SafetyResourceService {
    private final SafetyResourceRepository repository;

    public SafetyResourceService(SafetyResourceRepository repository) {
        this.repository = repository;
    }

    public SafetyResource createResource(SafetyResource resource, String userId) {
        resource.setCreatedBy(userId);
        resource.setCreatedAt(LocalDateTime.now());
        resource.setUpdatedAt(LocalDateTime.now());
        resource.setIsActive(true);
        return repository.save(resource);
    }

    public SafetyResource updateResource(String id, SafetyResource updates, String userId) {
        Optional<SafetyResource> existing = repository.findById(id);
        if (existing.isPresent()) {
            SafetyResource resource = existing.get();
            if (updates.getTitle() != null) resource.setTitle(updates.getTitle());
            if (updates.getDescription() != null) resource.setDescription(updates.getDescription());
            if (updates.getType() != null) resource.setType(updates.getType());
            if (updates.getPhone() != null) resource.setPhone(updates.getPhone());
            if (updates.getEmail() != null) resource.setEmail(updates.getEmail());
            if (updates.getAvailability() != null) resource.setAvailability(updates.getAvailability());
            if (updates.getPriorityLevel() != null) resource.setPriorityLevel(updates.getPriorityLevel());
            if (updates.getIsActive() != null) resource.setIsActive(updates.getIsActive());
            if (updates.getVisibleToStudents() != null) resource.setVisibleToStudents(updates.getVisibleToStudents());
            resource.setUpdatedAt(LocalDateTime.now());
            resource.setUpdatedBy(LocalDateTime.now());
            return repository.save(resource);
        }
        return null;
    }

    public void deleteResource(String id) {
        repository.deleteById(id);
    }

    public Optional<SafetyResource> getResourceById(String id) {
        return repository.findById(id);
    }

    public List<SafetyResource> getAllResources() {
        return repository.findAll();
    }

    public List<SafetyResource> getVisibleResources() {
        return repository.findByVisibleToStudentsTrue();
    }

    public List<SafetyResource> getResourcesByType(String type) {
        return repository.findByType(type);
    }

    public List<SafetyResource> getActiveResources() {
        return repository.findByIsActiveTrueAndVisibleToStudentsTrue();
    }

    public void toggleResourceVisibility(String id, Boolean visible) {
        Optional<SafetyResource> resource = repository.findById(id);
        if (resource.isPresent()) {
            resource.get().setVisibleToStudents(visible);
            repository.save(resource.get());
        }
    }

    public void disableResource(String id) {
        Optional<SafetyResource> resource = repository.findById(id);
        if (resource.isPresent()) {
            resource.get().setIsActive(false);
            repository.save(resource.get());
        }
    }

    public long getTotalResources() {
        return repository.count();
    }

    public long getActiveResourceCount() {
        return repository.findByIsActiveTrueAndVisibleToStudentsTrue().size();
    }
}
