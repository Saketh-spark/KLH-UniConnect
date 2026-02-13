package com.uniconnect.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Legacy file serve controller.
 * All file uploads are now stored in Cloudinary and served directly from Cloudinary URLs.
 * This controller handles any remaining requests to old /uploads/** paths gracefully.
 */
@RestController
@RequestMapping("/uploads")
@CrossOrigin(
    origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000",
               "https://klh-uni-connect.vercel.app", "https://klh-uniconnect.onrender.com"},
    allowedHeaders = "*"
)
public class FileServeController {

    @GetMapping("/{subdir}/{filename:.+}")
    public ResponseEntity<?> serveFile(
            @PathVariable String subdir,
            @PathVariable String filename) {
        // All files are now stored in Cloudinary. Local file serving is deprecated.
        return ResponseEntity.status(HttpStatus.GONE)
                .body(Map.of(
                    "error", "File not available from local storage",
                    "message", "Files are now served from cloud storage (Cloudinary). Please re-upload or use the updated URL."
                ));
    }
}
