package com.uniconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AcademicFileUploadService {
    private static final String MATERIALS_DIR = "uploads/materials";
    private static final String ASSIGNMENTS_DIR = "uploads/assignments";
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final String[] ALLOWED_DOC_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain"
    };

    public AcademicFileUploadService() {
        // Create upload directories if they don't exist
        new File(MATERIALS_DIR).mkdirs();
        new File(ASSIGNMENTS_DIR).mkdirs();
    }

    public String uploadMaterial(MultipartFile file) throws IOException {
        return uploadFile(file, MATERIALS_DIR, "material");
    }

    public String uploadAssignment(MultipartFile file) throws IOException {
        return uploadFile(file, ASSIGNMENTS_DIR, "assignment");
    }

    private String uploadFile(MultipartFile file, String directory, String fileType) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 100MB");
        }

        String contentType = file.getContentType();
        boolean isAllowedType = false;
        for (String allowedType : ALLOWED_DOC_TYPES) {
            if (allowedType.equals(contentType)) {
                isAllowedType = true;
                break;
            }
        }

        if (!isAllowedType) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path uploadPath = Paths.get(directory, uniqueFilename);
        Files.write(uploadPath, file.getBytes());

        // Return file URL (relative path that can be served)
        return "/" + directory + "/" + uniqueFilename;
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
