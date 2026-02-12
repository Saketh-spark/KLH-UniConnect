package com.uniconnect.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class FileUploadService {
    private static final long MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
    private static final String[] ALLOWED_VIDEO_TYPES = {"video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"};
    private static final String[] ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"};

    private final Cloudinary cloudinary;

    @Autowired
    public FileUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
        
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary must be configured for file uploads. Please set CLOUDINARY_URL environment variable.");
        }
        System.out.println("☁️ FileUploadService: Cloudinary configured - uploads will be stored in cloud");
    }

    public String uploadVideo(MultipartFile file) throws IOException {
        return uploadFile(file, ALLOWED_VIDEO_TYPES, "video");
    }

    public String uploadThumbnail(MultipartFile file) throws IOException {
        return uploadFile(file, ALLOWED_IMAGE_TYPES, "image");
    }

    private String uploadFile(MultipartFile file, String[] allowedTypes, String resourceType) throws IOException {
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

        // Upload to Cloudinary
        return uploadToCloudinary(file, resourceType);
    }

    private String uploadToCloudinary(MultipartFile file, String resourceType) throws IOException {
        try {
            String originalFilename = file.getOriginalFilename();
            String baseName = originalFilename != null && originalFilename.contains(".") ? 
                originalFilename.substring(0, originalFilename.lastIndexOf(".")) : "upload";
            String publicId = "uniconnect/" + resourceType + "s/" + UUID.randomUUID() + "_" + baseName;
            
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "resource_type", resourceType,
                "public_id", publicId,
                "folder", "uniconnect"
            ));
            
            String secureUrl = (String) uploadResult.get("secure_url");
            System.out.println("☁️ Uploaded to Cloudinary: " + secureUrl);
            return secureUrl;
        } catch (Exception e) {
            System.out.println("❌ Cloudinary upload failed: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage(), e);
        }
    }

    public String fileToBase64(MultipartFile file) throws IOException {
        return Base64.getEncoder().encodeToString(file.getBytes());
    }
}
