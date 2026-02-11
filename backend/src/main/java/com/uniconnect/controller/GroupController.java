package com.uniconnect.controller;

import com.uniconnect.dto.GroupResponse;
import com.uniconnect.dto.MessageResponse;
import com.uniconnect.service.ChatService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173", "http://localhost:4174", "http://localhost:3000", "http://localhost:8085"})
public class GroupController {

    private final ChatService chatService;

    public GroupController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Create group
    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            String createdBy = (String) request.get("createdBy");
            @SuppressWarnings("unchecked")
            List<String> memberIds = (List<String>) request.get("memberIds");
            
            GroupResponse group = chatService.createGroup(name, description, createdBy, memberIds);
            return ResponseEntity.ok(group);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get user groups
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GroupResponse>> getUserGroups(@PathVariable("userId") String userId) {
        try {
            List<GroupResponse> groups = chatService.getUserGroups(userId);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get group messages
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<MessageResponse>> getGroupMessages(@PathVariable("groupId") String groupId) {
        try {
            List<MessageResponse> messages = chatService.getGroupMessages(groupId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Send group message
    @PostMapping("/{groupId}/messages")
    public ResponseEntity<MessageResponse> sendGroupMessage(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, Object> request) {
        try {
            String senderId = (String) request.get("senderId");
            String content = (String) request.get("content");
            String type = (String) request.get("type");
            String fileUrl = (String) request.get("fileUrl");
            String fileName = (String) request.get("fileName");
            Long fileSize = request.get("fileSize") != null ? 
                ((Number) request.get("fileSize")).longValue() : null;
            
            MessageResponse message = chatService.sendGroupMessage(groupId, senderId, content, type,
                                                                  fileUrl, fileName, fileSize);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add member to group
    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String addedBy = request.get("addedBy");
            chatService.addMemberToGroup(groupId, userId, addedBy);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Remove member from group
    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable("groupId") String groupId,
            @PathVariable("userId") String userId) {
        try {
            chatService.removeMemberFromGroup(groupId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Mark group messages as read
    @PostMapping("/{groupId}/read")
    public ResponseEntity<Void> markGroupMessagesAsRead(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            chatService.markGroupMessagesAsRead(groupId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
