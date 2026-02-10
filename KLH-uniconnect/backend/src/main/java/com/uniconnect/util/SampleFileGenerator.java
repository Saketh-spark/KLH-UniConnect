package com.uniconnect.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class SampleFileGenerator {
    
    public static void generateSampleMaterials() {
        String uploadDir = "uploads/materials";
        new File(uploadDir).mkdirs();

        // DBMS PDF is provided as a real file, skip generating placeholder

        generatePdfFile(uploadDir + "/web-dev-fundamentals.pdf",
            "Web Development Fundamentals\n\n" +
            "Module 1: HTML Basics\n" +
            "- HTML Tags\n" +
            "- Forms\n" +
            "- Semantic HTML\n\n" +
            "Module 2: CSS Styling\n" +
            "- Selectors\n" +
            "- Layouts\n" +
            "- Responsive Design\n");

        generatePdfFile(uploadDir + "/dsa-sorting.pdf",
            "Data Structures & Algorithms - Sorting\n\n" +
            "1. Bubble Sort\n" +
            "   Time Complexity: O(n²)\n\n" +
            "2. Merge Sort\n" +
            "   Time Complexity: O(n log n)\n\n" +
            "3. Quick Sort\n" +
            "   Time Complexity: O(n log n) average\n");

        generatePdfFile(uploadDir + "/os-process-management.pdf",
            "Operating Systems - Process Management\n\n" +
            "Process States:\n" +
            "- New\n" +
            "- Ready\n" +
            "- Running\n" +
            "- Waiting\n" +
            "- Terminated\n\n" +
            "Scheduling Algorithms:\n" +
            "- FCFS\n" +
            "- SJF\n" +
            "- Round Robin\n");

        generatePdfFile(uploadDir + "/microprocessors-interfacing.pdf",
            "Microprocessors & Interfacing\n\n" +
            "8085 Microprocessor Architecture\n" +
            "- ALU\n" +
            "- Registers\n" +
            "- Memory\n" +
            "- I/O Devices\n\n" +
            "Interfacing Concepts\n" +
            "- I/O Ports\n" +
            "- Interrupts\n" +
            "- DMA\n");
    }

    private static void generatePdfFile(String filePath, String content) {
        try {
            // Create a simple text file as a placeholder
            // In production, use a proper PDF library like iText or Apache PDFBox
            File file = new File(filePath);
            try (FileOutputStream fos = new FileOutputStream(file)) {
                String textContent = "%PDF-1.4\n" + content + "\n%%EOF";
                fos.write(textContent.getBytes());
            }
            System.out.println("✓ Generated: " + filePath);
        } catch (IOException e) {
            System.err.println("✗ Failed to generate: " + filePath);
            e.printStackTrace();
        }
    }
}
