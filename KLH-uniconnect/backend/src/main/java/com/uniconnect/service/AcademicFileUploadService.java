package com.uniconnect.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class AcademicFileUploadService {
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final String[] ALLOWED_DOC_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain"
    };

    private final Cloudinary cloudinary;

    @Autowired
    public AcademicFileUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary must be configured for file uploads. Please set CLOUDINARY_URL environment variable.");
        }
        System.out.println("☁️ AcademicFileUploadService: Cloudinary configured - documents will be stored in cloud");
    }

    public String uploadMaterial(MultipartFile file) throws IOException {
        return uploadFile(file, "materials");
    }

    public String uploadAssignment(MultipartFile file) throws IOException {
        return uploadFile(file, "assignments");
    }

    private String uploadFile(MultipartFile file, String folderName) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 100MB");
        }

        String contentType = file.getContentType();
        // If content type is null, try to determine from filename extension
        if (contentType == null || contentType.equals("application/octet-stream")) {
            String originalName = file.getOriginalFilename();
            if (originalName != null) {
                String lower = originalName.toLowerCase();
                if (lower.endsWith(".pdf")) contentType = "application/pdf";
                else if (lower.endsWith(".doc")) contentType = "application/msword";
                else if (lower.endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                else if (lower.endsWith(".ppt")) contentType = "application/vnd.ms-powerpoint";
                else if (lower.endsWith(".pptx")) contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                else if (lower.endsWith(".txt")) contentType = "text/plain";
            }
        }
        boolean isAllowedType = false;
        for (String allowedType : ALLOWED_DOC_TYPES) {
            if (allowedType.equals(contentType)) {
                isAllowedType = true;
                break;
            }
        }

        if (!isAllowedType) {
            throw new IllegalArgumentException("File type not allowed: " + contentType + ". Allowed types: PDF, DOC, DOCX, PPT, PPTX, TXT");
        }

        // Upload to Cloudinary
        return uploadToCloudinary(file, folderName);
    }

    private String uploadToCloudinary(MultipartFile file, String folderName) throws IOException {
        try {
            String originalFilename = file.getOriginalFilename();
            String baseName = originalFilename != null && originalFilename.contains(".") ? 
                originalFilename.substring(0, originalFilename.lastIndexOf(".")) : "document";
            String publicId = "uniconnect/" + folderName + "/" + UUID.randomUUID() + "_" + baseName;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", "raw",  // Use "raw" for non-image/video files like PDFs
                "public_id", publicId,
                "folder", "uniconnect"
            ));
            
            String secureUrl = (String) uploadResult.get("secure_url");
            System.out.println("☁️ Document uploaded to Cloudinary: " + secureUrl);
            return secureUrl;
        } catch (Exception e) {
            System.out.println("❌ Cloudinary upload failed: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    public String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return String.format("%.1f KB", bytes / 1024.0);
        } else {
            return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        }
    }
}
