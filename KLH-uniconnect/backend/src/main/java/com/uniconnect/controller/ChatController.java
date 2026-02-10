package com.uniconnect.controller;

import com.uniconnect.dto.ConversationResponse;
import com.uniconnect.dto.MessageResponse;
import com.uniconnect.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000", "http://localhost:8085"})
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Search users by email
    @GetMapping("/users/search")
    public ResponseEntity<List<Map<String, String>>> searchUsers(@RequestParam String email) {
        try {
            List<Map<String, String>> users = chatService.searchUsers(email);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get or create conversation
    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> getOrCreateConversation(@RequestBody Map<String, String> request) {
        try {
            String userId1 = request.get("userId1");
            String userId2 = request.get("userId2");
            ConversationResponse conversation = chatService.getOrCreateConversation(userId1, userId2);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get user conversations
    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<ConversationResponse>> getUserConversations(@PathVariable("userId") String userId) {
        try {
            List<ConversationResponse> conversations = chatService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get conversation messages
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<MessageResponse>> getConversationMessages(@PathVariable("conversationId") String conversationId) {
        try {
            List<MessageResponse> messages = chatService.getConversationMessages(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Send message
    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody Map<String, Object> request) {
        try {
            String conversationId = (String) request.get("conversationId");
            String senderId = (String) request.get("senderId");
            String content = (String) request.get("content");
            String type = (String) request.get("type");
            String fileUrl = (String) request.get("fileUrl");
            String fileName = (String) request.get("fileName");
            Long fileSize = request.get("fileSize") != null ? 
                ((Number) request.get("fileSize")).longValue() : null;
            
            MessageResponse message = chatService.sendMessage(conversationId, senderId, content, type, 
                                                             fileUrl, fileName, fileSize);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Upload file
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = chatService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                "url", fileUrl,
                "filename", file.getOriginalFilename(),
                "size", String.valueOf(file.getSize())
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add reaction
    @PostMapping("/messages/{messageId}/reactions")
    public ResponseEntity<Void> addReaction(
            @PathVariable("messageId") String messageId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String emoji = request.get("emoji");
            chatService.addReaction(messageId, userId, emoji);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Mark messages as read
    @PostMapping("/conversations/{conversationId}/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            chatService.markMessagesAsRead(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Edit message
    @PutMapping("/messages/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable("messageId") String messageId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String content = request.get("content");
            MessageResponse updated = chatService.editMessage(messageId, userId, content);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete message
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, Object>> deleteMessage(
            @PathVariable("messageId") String messageId,
            @RequestParam String userId) {
        try {
            boolean deleted = chatService.deleteMessage(messageId, userId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("success", true));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "Not authorized"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get online users
    @GetMapping("/online-users")
    public ResponseEntity<List<String>> getOnlineUsers() {
        return ResponseEntity.ok(chatService.getOnlineUsers());
    }
}
