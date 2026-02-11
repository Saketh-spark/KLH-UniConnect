package com.uniconnect.service;

import com.uniconnect.dto.CertificateResponse;
import com.uniconnect.model.Certificate;
import com.uniconnect.repository.CertificateRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private static final String UPLOAD_DIR = new File("uploads/certificates").getAbsolutePath();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy");

    public CertificateService(CertificateRepository certificateRepository) {
        this.certificateRepository = certificateRepository;
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    public CertificateResponse uploadCertificate(String studentId, String title, String issuer,
            String category, String issueDate, String description, String credentialId,
            String credentialUrl, MultipartFile file) throws IOException {

        Certificate certificate = new Certificate();
        certificate.setStudentId(studentId);
        certificate.setTitle(title);
        certificate.setIssuer(issuer);
        certificate.setCategory(category);
        certificate.setDescription(description);
        certificate.setCredentialId(credentialId);
        certificate.setCredentialUrl(credentialUrl);
        certificate.setType("student-uploaded");
        certificate.setUniversityIssued(false);

        if (issueDate != null && !issueDate.isEmpty()) {
            try {
                certificate.setIssueDate(LocalDateTime.parse(issueDate + "T00:00:00"));
            } catch (Exception e) {
                // ignore invalid date
            }
        }

        if (file != null && !file.isEmpty()) {
            String originalFilename = file.getOriginalFilename();
            certificate.setOriginalFileName(originalFilename);
            String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".pdf";
            String filename = UUID.randomUUID().toString() + extension;
            File dest = new File(UPLOAD_DIR + "/" + filename);
            file.transferTo(dest);
            certificate.setFileUrl("/uploads/certificates/" + filename);
        }

        certificate = certificateRepository.save(certificate);
        return convertToResponse(certificate);
    }

    public List<CertificateResponse> getCertificatesByStudentId(String studentId) {
        return certificateRepository.findByStudentIdOrderByUploadDateDesc(studentId)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<CertificateResponse> getCertificatesByStudentIdAndCategory(String studentId, String category) {
        if (category == null || category.equals("All")) {
            return getCertificatesByStudentId(studentId);
        }
        return certificateRepository.findByStudentIdAndCategory(studentId, category)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public CertificateResponse getCertificateById(String id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return convertToResponse(certificate);
    }

    public CertificateResponse startVerification(String id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        certificate.setStatus("verified");
        certificate = certificateRepository.save(certificate);
        return convertToResponse(certificate);
    }

    public CertificateResponse createShareLink(String id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        String shareCode = UUID.randomUUID().toString().substring(0, 8);
        certificate.setShareLink("share-" + shareCode);
        certificate = certificateRepository.save(certificate);
        return convertToResponse(certificate);
    }

    public CertificateResponse getCertificateByShareLink(String shareLink) {
        Certificate certificate = certificateRepository.findByShareLink(shareLink)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return convertToResponse(certificate);
    }

    public CertificateResponse verifyCertificate(String verificationCode) {
        Certificate certificate = certificateRepository.findByVerificationCode(verificationCode)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return convertToResponse(certificate);
    }

    public void deleteCertificate(String id, String studentId) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        if (!certificate.getStudentId().equals(studentId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (certificate.getFileUrl() != null) {
            String filename = certificate.getFileUrl().replace("/uploads/certificates/", "");
            File file = new File(UPLOAD_DIR + "/" + filename);
            if (file.exists()) { file.delete(); }
        }
        certificateRepository.delete(certificate);
    }

    public long getVerifiedCount(String studentId) {
        return certificateRepository.findByStudentIdAndStatus(studentId, "approved").size()
             + certificateRepository.findByStudentIdAndStatus(studentId, "verified").size();
    }

    public long getPendingCount(String studentId) {
        return certificateRepository.findByStudentIdAndStatus(studentId, "pending").size();
    }

    public long getTotalCount(String studentId) {
        return certificateRepository.findByStudentId(studentId).size();
    }

    public long getTotalCertificatesInDatabase() {
        return certificateRepository.count();
    }

    public List<CertificateResponse> getAllCertificates() {
        return certificateRepository.findAllByOrderByUploadDateDesc()
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // --- Faculty endpoints ---

    public List<CertificateResponse> getPendingCertificates() {
        return certificateRepository.findByStatus("pending")
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public CertificateResponse approveCertificate(String id, String facultyEmail, String note) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        certificate.setStatus("approved");
        certificate.setReviewedBy(facultyEmail);
        certificate.setReviewNote(note);
        certificate.setApprovedDate(LocalDateTime.now());
        certificate = certificateRepository.save(certificate);
        return convertToResponse(certificate);
    }

    public CertificateResponse rejectCertificate(String id, String facultyEmail, String reason) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        certificate.setStatus("rejected");
        certificate.setReviewedBy(facultyEmail);
        certificate.setRejectionReason(reason);
        certificate = certificateRepository.save(certificate);
        return convertToResponse(certificate);
    }

    public CertificateResponse generateUniversityCertificate(String studentId, String studentName,
            String title, String eventName, String templateName, String signature,
            String facultyEmail, String department) {
        Certificate certificate = new Certificate();
        certificate.setStudentId(studentId);
        certificate.setStudentName(studentName);
        certificate.setTitle(title);
        certificate.setEventName(eventName);
        certificate.setTemplateName(templateName);
        certificate.setSignature(signature);
        certificate.setGeneratedBy(facultyEmail);
        certificate.setDepartment(department);
        certificate.setIssuer("KL University");
        certificate.setCategory("University");
        certificate.setType("university-issued");
        certificate.setUniversityIssued(true);
        certificate.setStatus("approved");
        certificate.setApprovedDate(LocalDateTime.now());
        certificate.setIssueDate(LocalDateTime.now());
        certificate = certificateRepository.save(certificate);
        return convertToResponse(certificate);
    }

    public List<CertificateResponse> getUniversityCertificates(String studentId) {
        return certificateRepository.findByStudentIdAndUniversityIssued(studentId, true)
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public List<CertificateResponse> getStudentPortfolio(String studentId) {
        return certificateRepository.findByStudentIdAndStatus(studentId, "approved")
                .stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private CertificateResponse convertToResponse(Certificate certificate) {
        CertificateResponse response = new CertificateResponse();
        response.setId(certificate.getId());
        response.setStudentId(certificate.getStudentId());
        response.setStudentName(certificate.getStudentName());
        response.setDepartment(certificate.getDepartment());
        response.setYear(certificate.getYear());
        response.setTitle(certificate.getTitle());
        response.setIssuer(certificate.getIssuer());
        response.setCategory(certificate.getCategory());
        response.setFileUrl(certificate.getFileUrl());
        response.setOriginalFileName(certificate.getOriginalFileName());
        response.setStatus(certificate.getStatus());
        response.setVerificationCode(certificate.getVerificationCode());
        response.setShareLink(certificate.getShareLink());
        response.setDescription(certificate.getDescription());
        response.setCredentialId(certificate.getCredentialId());
        response.setCredentialUrl(certificate.getCredentialUrl());
        response.setReviewedBy(certificate.getReviewedBy());
        response.setReviewNote(certificate.getReviewNote());
        response.setRejectionReason(certificate.getRejectionReason());
        response.setUniversityIssued(certificate.isUniversityIssued());
        response.setType(certificate.getType());
        response.setTemplateName(certificate.getTemplateName());
        response.setEventName(certificate.getEventName());
        response.setSignature(certificate.getSignature());
        response.setGeneratedBy(certificate.getGeneratedBy());
        if (certificate.getIssueDate() != null) {
            response.setIssueDate(certificate.getIssueDate().format(DATE_FORMATTER));
        }
        if (certificate.getUploadDate() != null) {
            response.setUploadDate(certificate.getUploadDate().format(DATE_FORMATTER));
        }
        if (certificate.getApprovedDate() != null) {
            response.setApprovedDate(certificate.getApprovedDate().format(DATE_FORMATTER));
        }
        return response;
    }
}
