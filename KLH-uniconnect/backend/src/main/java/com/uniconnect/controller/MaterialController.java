package com.uniconnect.controller;

import com.uniconnect.dto.MaterialResponse;
import com.uniconnect.dto.UploadMaterialRequest;
import com.uniconnect.service.AcademicFileUploadService;
import com.uniconnect.service.MaterialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:3000"})
public class MaterialController {
    private final MaterialService materialService;
    private final AcademicFileUploadService fileUploadService;

    public MaterialController(MaterialService materialService,
                            AcademicFileUploadService fileUploadService) {
        this.materialService = materialService;
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/upload-file")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-Student-Id") String studentId) {
        try {
            String fileUrl = fileUploadService.uploadMaterial(file);
            String fileSize = fileUploadService.formatFileSize(file.getSize());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileUrl", fileUrl);
            response.put("fileSize", fileSize);
            response.put("fileName", file.getOriginalFilename());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<MaterialResponse> uploadMaterial(
            @RequestHeader("X-Student-Id") String studentId,
            @Valid @RequestBody UploadMaterialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(materialService.uploadMaterial(studentId, request));
    }

    @GetMapping
    public ResponseEntity<List<MaterialResponse>> getAllMaterials(
            @RequestParam(value = "semester", required = false) String semester,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(materialService.getAllMaterials(semester, type, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponse> getMaterial(@PathVariable String id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<MaterialResponse> downloadMaterial(@PathVariable String id) {
        return ResponseEntity.ok(materialService.incrementDownload(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMaterial(
            @PathVariable String id,
            @RequestHeader("X-Student-Id") String studentId) {
        try {
            materialService.deleteMaterial(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Material deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
