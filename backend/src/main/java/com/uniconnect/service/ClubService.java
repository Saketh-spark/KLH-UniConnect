package com.uniconnect.service;

import com.uniconnect.model.Club;
import com.uniconnect.repository.ClubRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClubService {
    private final ClubRepository clubRepository;

    public ClubService(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    // Create Club
    public Club createClub(Club club) {
        if (club.getStatus() == null) {
            club.setStatus("Pending");
        }
        return clubRepository.save(club);
    }

    // Get all clubs
    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    // Get clubs by faculty coordinator
    public List<Club> getClubsByFaculty(String facultyId) {
        return clubRepository.findByFacultyCoordinator(facultyId);
    }

    // Get club by ID
    public Club getClubById(String clubId) {
        return clubRepository.findById(clubId).orElse(null);
    }

    // Update club
    public Club updateClub(String clubId, Club updatedClub) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club != null) {
            club.setName(updatedClub.getName());
            club.setDescription(updatedClub.getDescription());
            club.setCategory(updatedClub.getCategory());
            club.setIconUrl(updatedClub.getIconUrl());
            club.setBannerUrl(updatedClub.getBannerUrl());
            club.setFacultyCoordinator(updatedClub.getFacultyCoordinator());
            club.setUpdatedAt(Instant.now());
            return clubRepository.save(club);
        }
        return null;
    }

    // Approve club
    public Club approveClub(String clubId, String approvedBy) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club != null) {
            club.setStatus("Active");
            club.setApprovedBy(approvedBy);
            club.setApprovedAt(Instant.now());
            club.setUpdatedAt(Instant.now());
            return clubRepository.save(club);
        }
        return null;
    }

    // Reject club
    public void rejectClub(String clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club != null) {
            club.setStatus("Rejected");
            club.setUpdatedAt(Instant.now());
            clubRepository.save(club);
        }
    }

    // Suspend club
    public Club suspendClub(String clubId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club != null) {
            club.setStatus("Suspended");
            club.setUpdatedAt(Instant.now());
            return clubRepository.save(club);
        }
        return null;
    }

    // Delete club
    public void deleteClub(String clubId) {
        clubRepository.deleteById(clubId);
    }

    // Add member to club
    public Club addMemberToClub(String clubId, String studentId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club != null && !club.getMembers().contains(studentId)) {
            club.getMembers().add(studentId);
            club.setMemberCount(club.getMembers().size());
            club.setUpdatedAt(Instant.now());
            return clubRepository.save(club);
        }
        return club;
    }

    // Remove member from club
    public Club removeMemberFromClub(String clubId, String studentId) {
        Club club = clubRepository.findById(clubId).orElse(null);
        if (club != null && club.getMembers().contains(studentId)) {
            club.getMembers().remove(studentId);
            club.setMemberCount(club.getMembers().size());
            club.setUpdatedAt(Instant.now());
            return clubRepository.save(club);
        }
        return club;
    }

    // Get clubs by category
    public List<Club> getClubsByCategory(String category) {
        return clubRepository.findByCategory(category);
    }

    // Search clubs
    public List<Club> searchClubs(String query) {
        return clubRepository.searchByName(query);
    }

    // Get dashboard stats
    public Map<String, Object> getDashboardStats(String facultyId) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Club> allClubs = clubRepository.findAll();
        List<Club> facultyClubs = getClubsByFaculty(facultyId);
        
        long totalClubs = allClubs.size();
        long activeClubs = allClubs.stream()
                .filter(c -> "Active".equals(c.getStatus()))
                .count();
        long pendingClubs = allClubs.stream()
                .filter(c -> "Pending".equals(c.getStatus()))
                .count();
        
        long totalMembers = facultyClubs.stream()
                .mapToLong(c -> c.getMembers() != null ? c.getMembers().size() : 0)
                .sum();
        
        stats.put("totalClubs", totalClubs);
        stats.put("activeClubs", activeClubs);
        stats.put("pendingClubs", pendingClubs);
        stats.put("facultyClubs", facultyClubs.size());
        stats.put("totalMembers", totalMembers);
        
        return stats;
    }
}
