package com.uniconnect.service;

import com.uniconnect.dto.MaterialResponse;
import com.uniconnect.dto.UploadMaterialRequest;
import com.uniconnect.model.Material;
import com.uniconnect.repository.MaterialRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialService {
    private final MaterialRepository materialRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public MaterialService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    public MaterialResponse uploadMaterial(String studentId, UploadMaterialRequest request) {
        Material material = new Material();
        material.setTitle(request.getTitle());
        material.setSubject(request.getSubject());
        material.setSemester(request.getSemester());
        material.setAuthor(request.getAuthor());
        material.setFileUrl(request.getFileUrl());
        material.setFileSize(request.getFileSize());
        material.setType(request.getType());
        material.setUploadedBy(studentId);

        material = materialRepository.save(material);
        return convertToResponse(material);
    }

    public List<MaterialResponse> getAllMaterials(String semester, String type, String search) {
        List<Material> materials;

        if (search != null && !search.trim().isEmpty()) {
            materials = materialRepository.findByTitleContainingIgnoreCaseOrSubjectContainingIgnoreCase(search, search);
        } else if (semester != null && !semester.equals("All") && type != null && !type.equals("All")) {
            materials = materialRepository.findBySemesterAndType(semester, type);
        } else if (semester != null && !semester.equals("All")) {
            materials = materialRepository.findBySemester(semester);
        } else if (type != null && !type.equals("All")) {
            materials = materialRepository.findByType(type);
        } else {
            materials = materialRepository.findAll();
        }

        return materials.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public MaterialResponse getMaterialById(String id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
        return convertToResponse(material);
    }

    public MaterialResponse incrementDownload(String id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
        
        material.incrementDownloads();
        material = materialRepository.save(material);
        return convertToResponse(material);
    }

    public void deleteMaterial(String id) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
        materialRepository.delete(material);
    }

    private MaterialResponse convertToResponse(Material material) {
        MaterialResponse response = new MaterialResponse();
        response.setId(material.getId());
        response.setTitle(material.getTitle());
        response.setSubject(material.getSubject());
        response.setSemester(material.getSemester());
        response.setAuthor(material.getAuthor());
        response.setDate(material.getUploadDate().format(DATE_FORMATTER));
        response.setFileUrl(material.getFileUrl());
        response.setFileSize(material.getFileSize());
        response.setDownloads(material.getDownloads());
        response.setType(material.getType());
        return response;
    }
}
