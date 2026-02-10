package com.uniconnect.service;

import com.uniconnect.model.EmergencyContact;
import com.uniconnect.repository.EmergencyContactRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EmergencyContactService {
    private final EmergencyContactRepository repository;

    public EmergencyContactService(EmergencyContactRepository repository) {
        this.repository = repository;
    }

    public EmergencyContact createContact(EmergencyContact contact, String userId) {
        contact.setCreatedBy(userId);
        contact.setCreatedAt(LocalDateTime.now());
        contact.setUpdatedAt(LocalDateTime.now());
        contact.setIsActive(true);
        return repository.save(contact);
    }

    public EmergencyContact updateContact(String id, EmergencyContact updates, String userId) {
        Optional<EmergencyContact> existing = repository.findById(id);
        if (existing.isPresent()) {
            EmergencyContact contact = existing.get();
            if (updates.getTitle() != null) contact.setTitle(updates.getTitle());
            if (updates.getPhone() != null) contact.setPhone(updates.getPhone());
            if (updates.getEmail() != null) contact.setEmail(updates.getEmail());
            if (updates.getCategory() != null) contact.setCategory(updates.getCategory());
            if (updates.getIsPrimary() != null) contact.setIsPrimary(updates.getIsPrimary());
            if (updates.getVisibleToStudents() != null) contact.setVisibleToStudents(updates.getVisibleToStudents());
            if (updates.getPriority() != null) contact.setPriority(updates.getPriority());
            contact.setUpdatedAt(LocalDateTime.now());
            return repository.save(contact);
        }
        return null;
    }

    public void deleteContact(String id) {
        repository.deleteById(id);
    }

    public Optional<EmergencyContact> getContactById(String id) {
        return repository.findById(id);
    }

    public List<EmergencyContact> getAllContacts() {
        return repository.findAll();
    }

    public List<EmergencyContact> getVisibleContacts() {
        return repository.findByIsActiveTrueAndVisibleToStudentsTrueOrderByPriority();
    }

    public List<EmergencyContact> getContactsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Optional<EmergencyContact> getPrimaryContact() {
        return repository.findByIsPrimaryTrueAndIsActiveTrue();
    }

    public void setPrimaryContact(String id) {
        repository.findByIsPrimaryTrueAndIsActiveTrue().ifPresent(contact -> {
            contact.setIsPrimary(false);
            repository.save(contact);
        });
        
        Optional<EmergencyContact> newPrimary = repository.findById(id);
        if (newPrimary.isPresent()) {
            newPrimary.get().setIsPrimary(true);
            repository.save(newPrimary.get());
        }
    }

    public void toggleContactVisibility(String id, Boolean visible) {
        Optional<EmergencyContact> contact = repository.findById(id);
        if (contact.isPresent()) {
            contact.get().setVisibleToStudents(visible);
            repository.save(contact.get());
        }
    }

    public long getTotalContacts() {
        return repository.count();
    }

    public long getActiveContactCount() {
        return repository.findByIsActiveTrueAndVisibleToStudentsTrueOrderByPriority().size();
    }
}
