package com.uniconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Service
public class FileUploadService {
    private static final String UPLOAD_DIR = "uploads/reels";
    private static final long MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    private static final String[] ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"};
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"};

    public FileUploadService() {
        // Create upload directory if it doesn't exist
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    public String uploadVideo(MultipartFile file) throws IOException {
        return uploadFile(file, ALLOWED_VIDEO_TYPES, "video");
    }

    public String uploadThumbnail(MultipartFile file) throws IOException {
        return uploadFile(file, ALLOWED_IMAGE_TYPES, "thumbnail");
    }

    private String uploadFile(MultipartFile file, String[] allowedTypes, String fileType) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 500MB");
        }

        String contentType = file.getContentType();
        boolean isAllowedType = false;
        for (String allowedType : allowedTypes) {
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
        Path uploadPath = Paths.get(UPLOAD_DIR, uniqueFilename);
        Files.write(uploadPath, file.getBytes());

        // Return file URL (relative path that can be served)
        return "/uploads/reels/" + uniqueFilename;
    }

    public String fileToBase64(MultipartFile file) throws IOException {
        return Base64.getEncoder().encodeToString(file.getBytes());
    }
}
