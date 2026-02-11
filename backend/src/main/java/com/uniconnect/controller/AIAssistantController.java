package com.uniconnect.controller;

import com.uniconnect.model.*;
import com.uniconnect.service.AIAssistantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/ai-assistant")
@CrossOrigin(origins = "*")
public class AIAssistantController {

    private final AIAssistantService aiService;

    public AIAssistantController(AIAssistantService aiService) {
        this.aiService = aiService;
    }

    // ============ CONVERSATION ENDPOINTS ============

    @PostMapping("/conversations")
    public ResponseEntity<AIConversation> createConversation(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String userRole = body.getOrDefault("userRole", "student");
        String title = body.getOrDefault("title", "New Conversation");
        String category = body.getOrDefault("category", "doubt");
        String subject = body.get("subject");
        String language = body.getOrDefault("language", "en");

        AIConversation conv = aiService.createConversation(userId, userRole, title, category, subject, language);
        return ResponseEntity.status(HttpStatus.CREATED).body(conv);
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<AIConversation> getConversation(@PathVariable String conversationId) {
        AIConversation conv = aiService.getConversation(conversationId);
        return ResponseEntity.ok(conv);
    }

    @GetMapping("/conversations/user/{userId}")
    public ResponseEntity<List<AIConversation>> getUserConversations(@PathVariable String userId) {
        List<AIConversation> convs = aiService.getUserConversations(userId);
        return ResponseEntity.ok(convs);
    }

    @GetMapping("/conversations/user/{userId}/category/{category}")
    public ResponseEntity<List<AIConversation>> getUserConversationsByCategory(
            @PathVariable String userId, @PathVariable String category) {
        List<AIConversation> convs = aiService.getUserConversationsByCategory(userId, category);
        return ResponseEntity.ok(convs);
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<AIConversation> sendMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body) {
        String content = (String) body.get("content");
        String type = (String) body.getOrDefault("type", "text");
        @SuppressWarnings("unchecked")
        List<String> attachments = (List<String>) body.get("attachments");

        AIConversation conv = aiService.sendMessage(conversationId, content, type, attachments);
        return ResponseEntity.ok(conv);
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> deleteConversation(@PathVariable String conversationId) {
        aiService.deleteConversation(conversationId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Conversation deleted");
        return ResponseEntity.ok(resp);
    }

    // ============ QUICK CHAT (NO CONVERSATION CREATED) ============

    @PostMapping("/quick-chat")
    public ResponseEntity<Map<String, Object>> quickChat(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String message = body.get("message");
        String category = body.getOrDefault("category", "doubt");
        String subject = body.get("subject");
        String language = body.getOrDefault("language", "en");

        // Create temp conversation, send message, return response
        AIConversation conv = aiService.createConversation(userId, "student", 
            message.length() > 50 ? message.substring(0, 50) + "..." : message,
            category, subject, language);
        conv = aiService.sendMessage(conv.getId(), message, "text", null);

        Map<String, Object> resp = new HashMap<>();
        resp.put("conversationId", conv.getId());
        resp.put("response", conv.getMessages().get(conv.getMessages().size() - 1).getContent());
        resp.put("messages", conv.getMessages());
        return ResponseEntity.ok(resp);
    }

    // ============ STUDY PLAN ENDPOINTS ============

    @PostMapping("/study-plans")
    public ResponseEntity<AIStudyPlan> generateStudyPlan(@RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        String type = (String) body.getOrDefault("type", "daily");
        @SuppressWarnings("unchecked")
        List<String> subjects = (List<String>) body.get("subjects");

        AIStudyPlan plan = aiService.generateStudyPlan(studentId, type, subjects);
        return ResponseEntity.status(HttpStatus.CREATED).body(plan);
    }

    @GetMapping("/study-plans/student/{studentId}")
    public ResponseEntity<List<AIStudyPlan>> getStudentStudyPlans(@PathVariable String studentId) {
        List<AIStudyPlan> plans = aiService.getStudentStudyPlans(studentId);
        return ResponseEntity.ok(plans);
    }

    @DeleteMapping("/study-plans/{planId}")
    public ResponseEntity<Map<String, Object>> deleteStudyPlan(@PathVariable String planId) {
        aiService.deleteStudyPlan(planId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Study plan deleted");
        return ResponseEntity.ok(resp);
    }

    // ============ QUIZ ENDPOINTS ============

    @PostMapping("/quizzes/generate")
    public ResponseEntity<AIQuizResult> generateQuiz(@RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        String subject = (String) body.getOrDefault("subject", "General");
        String quizType = (String) body.getOrDefault("quizType", "mcq");
        int numQuestions = body.containsKey("numQuestions") ? ((Number) body.get("numQuestions")).intValue() : 10;
        String difficulty = (String) body.getOrDefault("difficulty", "medium");

        AIQuizResult quiz = aiService.generateQuiz(studentId, subject, quizType, numQuestions, difficulty);
        return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public ResponseEntity<AIQuizResult> submitQuiz(
            @PathVariable String quizId,
            @RequestBody Map<String, String> answers) {
        AIQuizResult result = aiService.submitQuiz(quizId, answers);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/quizzes/student/{studentId}")
    public ResponseEntity<List<AIQuizResult>> getStudentQuizResults(@PathVariable String studentId) {
        List<AIQuizResult> results = aiService.getStudentQuizResults(studentId);
        return ResponseEntity.ok(results);
    }

    // ============ SYLLABUS CONFIG (FACULTY) ============

    @PostMapping("/syllabus-config")
    public ResponseEntity<AISyllabusConfig> saveSyllabusConfig(@RequestBody AISyllabusConfig config) {
        AISyllabusConfig saved = aiService.saveSyllabusConfig(config);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/syllabus-config/faculty/{facultyId}")
    public ResponseEntity<List<AISyllabusConfig>> getFacultySyllabusConfigs(@PathVariable String facultyId) {
        List<AISyllabusConfig> configs = aiService.getFacultySyllabusConfigs(facultyId);
        return ResponseEntity.ok(configs);
    }

    @DeleteMapping("/syllabus-config/{configId}")
    public ResponseEntity<Map<String, Object>> deleteSyllabusConfig(@PathVariable String configId) {
        aiService.deleteSyllabusConfig(configId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Syllabus config deleted");
        return ResponseEntity.ok(resp);
    }

    // ============ FILE UPLOAD ENDPOINT ============

    @PostMapping("/conversations/{conversationId}/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @PathVariable String conversationId,
            @RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = aiService.processFileUpload(conversationId, file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    // ============ ANALYTICS ENDPOINTS ============

    @GetMapping("/analytics/faculty/{facultyId}")
    public ResponseEntity<Map<String, Object>> getFacultyAnalytics(@PathVariable String facultyId) {
        Map<String, Object> analytics = aiService.getFacultyAIAnalytics(facultyId);
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentAnalytics(@PathVariable String studentId) {
        Map<String, Object> analytics = aiService.getStudentAIAnalytics(studentId);
        return ResponseEntity.ok(analytics);
    }
}
