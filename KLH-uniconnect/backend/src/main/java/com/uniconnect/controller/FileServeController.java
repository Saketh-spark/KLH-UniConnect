package com.uniconnect.controller;

import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(
    origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000"},
    allowedHeaders = "*",
    exposedHeaders = {"Content-Range", "Accept-Ranges", "Content-Length", "Content-Type"},
    methods = {RequestMethod.GET, RequestMethod.OPTIONS}
)
public class FileServeController {
    
    private static final String UPLOAD_DIR = "uploads";
    private static final long CHUNK_SIZE = 1024 * 1024; // 1MB chunks for video streaming
    
    @GetMapping("/materials/{filename:.+}")
    public ResponseEntity<Resource> serveMaterialFile(
            @PathVariable String filename) {
        return serveDocumentFile(filename, "materials");
    }

    @GetMapping("/assignments/{filename:.+}")
    public ResponseEntity<Resource> serveAssignmentFile(
            @PathVariable String filename) {
        return serveDocumentFile(filename, "assignments");
    }

    @GetMapping("/certificates/{filename:.+}")
    public ResponseEntity<Resource> serveCertificateFile(
            @PathVariable String filename) {
        return serveDocumentFile(filename, "certificates");
    }

    @GetMapping("/chat/{filename:.+}")
    public ResponseEntity<Resource> serveChatFile(
            @PathVariable String filename) {
        return serveDocumentFile(filename, "chat");
    }

    @GetMapping("/reels/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String filename,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        try {
            // Prevent directory traversal attacks
            if (filename.contains("..")) {
                return ResponseEntity.badRequest().build();
            }
            
            // Try to find the file in the uploads directory
            Path filePath = Paths.get(UPLOAD_DIR, "reels", filename).toAbsolutePath();
            
            // Log the file path for debugging
            System.out.println("Attempting to serve file: " + filePath);
            System.out.println("File exists: " + Files.exists(filePath));
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                System.err.println("File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }
            
            // Determine content type
            String contentType;
            if (filename.endsWith(".mp4")) {
                contentType = "video/mp4";
            } else if (filename.endsWith(".webm")) {
                contentType = "video/webm";
            } else if (filename.endsWith(".png")) {
                contentType = "image/png";
            } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (filename.endsWith(".webp")) {
                contentType = "image/webp";
            } else {
                contentType = "application/octet-stream";
            }
            
            long fileSize = resource.contentLength();
            File file = resource.getFile();
            
            // Handle range requests for video streaming
            if (rangeHeader != null && contentType.startsWith("video/")) {
                try {
                    List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
                    if (!ranges.isEmpty()) {
                        HttpRange range = ranges.get(0);
                        long start = range.getRangeStart(fileSize);
                        long end = range.getRangeEnd(fileSize);
                        long contentLength = end - start + 1;
                        
                        // Create input stream for the requested byte range
                        InputStream inputStream = new FileInputStream(file);
                        inputStream.skip(start);
                        
                        InputStreamResource rangeResource = new InputStreamResource(inputStream) {
                            @Override
                            public long contentLength() {
                                return contentLength;
                            }
                        };
                        
                        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                                .contentType(MediaType.parseMediaType(contentType))
                                .header(HttpHeaders.CONTENT_RANGE, String.format("bytes %d-%d/%d", start, end, fileSize))
                                .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                                .body(rangeResource);
                    }
                } catch (Exception e) {
                    System.err.println("Error processing range request: " + e.getMessage());
                    // If range parsing fails, fall through to regular response
                }
            }
            
            // Regular response (for images or if no range requested)
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileSize))
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private ResponseEntity<Resource> serveDocumentFile(String filename, String subdirectory) {
        try {
            // Prevent directory traversal attacks
            if (filename.contains("..")) {
                return ResponseEntity.badRequest().build();
            }

            // Build file path - try multiple possible locations
            Path filePath = Paths.get(UPLOAD_DIR, subdirectory, filename).toAbsolutePath();
            
            System.out.println("=== Serving Document File ===");
            System.out.println("Subdirectory: " + subdirectory);
            System.out.println("Filename: " + filename);
            System.out.println("Absolute path: " + filePath);
            System.out.println("File exists: " + Files.exists(filePath));
            
            // If file doesn't exist at that path, try without subdirectory
            if (!Files.exists(filePath)) {
                System.out.println("File not found at primary path, trying alternative...");
                filePath = Paths.get(UPLOAD_DIR, filename).toAbsolutePath();
                System.out.println("Alternative path: " + filePath);
                System.out.println("File exists at alternative: " + Files.exists(filePath));
            }

            if (!Files.exists(filePath)) {
                System.err.println("File not found at any location: " + filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(null);
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.isReadable()) {
                System.err.println("File is not readable: " + filePath);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Determine content type
            String contentType = determineContentType(filename);
            long fileSize = Files.size(filePath);

            System.out.println("Serving file: " + filename + " (" + contentType + ", " + fileSize + " bytes)");

            // Return file with appropriate headers for download
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileSize))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000")
                    .body(resource);
        } catch (IOException e) {
            System.err.println("Error serving document file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.endsWith(".pdf")) {
            return "application/pdf";
        } else if (filename.endsWith(".doc")) {
            return "application/msword";
        } else if (filename.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (filename.endsWith(".ppt")) {
            return "application/vnd.ms-powerpoint";
        } else if (filename.endsWith(".pptx")) {
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        } else if (filename.endsWith(".txt")) {
            return "text/plain";
        } else if (filename.endsWith(".mp4")) {
            return "video/mp4";
        } else if (filename.endsWith(".webm")) {
            return "video/webm";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "application/octet-stream";
        }
    }
}
