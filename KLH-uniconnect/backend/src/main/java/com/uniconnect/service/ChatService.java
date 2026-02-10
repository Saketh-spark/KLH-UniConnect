package com.uniconnect.service;

import com.uniconnect.dto.ConversationResponse;
import com.uniconnect.dto.GroupResponse;
import com.uniconnect.dto.MessageResponse;
import com.uniconnect.model.ChatGroup;
import com.uniconnect.model.Conversation;
import com.uniconnect.model.Message;
import com.uniconnect.model.Faculty;
import com.uniconnect.model.Student;
import com.uniconnect.repository.ChatGroupRepository;
import com.uniconnect.repository.ConversationRepository;
import com.uniconnect.repository.FacultyRepository;
import com.uniconnect.repository.MessageRepository;
import com.uniconnect.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private static final String CHAT_UPLOAD_DIR = new File("uploads/chat").getAbsolutePath();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy h:mm a");

    public ChatService(MessageRepository messageRepository, 
                      ConversationRepository conversationRepository,
                      ChatGroupRepository chatGroupRepository,
                      StudentRepository studentRepository,
                      FacultyRepository facultyRepository) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.chatGroupRepository = chatGroupRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        
        // Create chat upload directory
        File uploadDir = new File(CHAT_UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
            System.out.println("Created chat upload directory: " + CHAT_UPLOAD_DIR);
        }
    }

    // User Search - searches both students and faculty
    public List<Map<String, String>> searchUsers(String email) {
        List<Map<String, String>> results = new ArrayList<>();
        
        // Search students
        List<Student> students = studentRepository.findByEmailContainingIgnoreCase(email);
        for (Student student : students) {
            Map<String, String> userInfo = new HashMap<>();
            userInfo.put("id", student.getEmail()); // Use email as ID for consistency
            userInfo.put("email", student.getEmail());
            userInfo.put("name", student.getName() != null ? student.getName() : student.getEmail().split("@")[0]);
            userInfo.put("role", "Student");
            userInfo.put("department", student.getBranch() != null ? student.getBranch() : "");
            results.add(userInfo);
        }
        
        // Search faculty
        List<Faculty> allFaculty = facultyRepository.findAll();
        for (Faculty faculty : allFaculty) {
            if (faculty.getEmail() != null && faculty.getEmail().toLowerCase().contains(email.toLowerCase())) {
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("id", faculty.getEmail()); // Use email as ID for consistency
                userInfo.put("email", faculty.getEmail());
                userInfo.put("name", faculty.getEmail().split("@")[0]);
                userInfo.put("role", "Faculty");
                userInfo.put("department", "");
                results.add(userInfo);
            }
        }
        
        return results;
    }

    // Helper to resolve user name from email
    private String resolveUserName(String userId) {
        // Try finding by email first (most reliable)
        Optional<Student> studentByEmail = studentRepository.findByEmail(userId);
        if (studentByEmail.isPresent()) {
            return studentByEmail.get().getName() != null ? studentByEmail.get().getName() : userId.split("@")[0];
        }
        // Try faculty
        Optional<Faculty> faculty = facultyRepository.findByEmail(userId);
        if (faculty.isPresent()) {
            return userId.split("@")[0];
        }
        // Try by MongoDB ObjectId
        Optional<Student> studentById = studentRepository.findById(userId);
        if (studentById.isPresent()) {
            return studentById.get().getName() != null ? studentById.get().getName() : studentById.get().getEmail().split("@")[0];
        }
        return userId.split("@")[0];
    }

    private String resolveUserEmail(String userId) {
        if (userId.contains("@")) return userId;
        Optional<Student> student = studentRepository.findById(userId);
        return student.map(Student::getEmail).orElse(userId);
    }

    // Get or Create Conversation
    public ConversationResponse getOrCreateConversation(String userId1, String userId2) {
        List<String> participantIds = Arrays.asList(userId1, userId2);
        Collections.sort(participantIds);

        // Check if conversation exists
        List<Conversation> conversations = conversationRepository.findByParticipantIdsContainingOrderByLastMessageTimeDesc(userId1);
        Optional<Conversation> existingConv = conversations.stream()
                .filter(conv -> conv.getParticipantIds().containsAll(participantIds) && conv.getParticipantIds().size() == 2)
                .findFirst();

        Conversation conversation;
        if (existingConv.isPresent()) {
            conversation = existingConv.get();
        } else {
            // Create new conversation
            conversation = new Conversation();
            conversation.setParticipantIds(participantIds);
            
            // Resolve participant info from both student and faculty tables
            String name1 = resolveUserName(userId1);
            String email1 = resolveUserEmail(userId1);
            String name2 = resolveUserName(userId2);
            String email2 = resolveUserEmail(userId2);
            
            Conversation.ParticipantInfo p1 = new Conversation.ParticipantInfo(userId1, name1, email1);
            Conversation.ParticipantInfo p2 = new Conversation.ParticipantInfo(userId2, name2, email2);
            conversation.getParticipants().add(p1);
            conversation.getParticipants().add(p2);
            
            conversation = conversationRepository.save(conversation);
        }

        return convertToConversationResponse(conversation, userId1);
    }

    // Get User Conversations
    public List<ConversationResponse> getUserConversations(String userId) {
        List<Conversation> conversations = conversationRepository.findByParticipantIdsContainingOrderByLastMessageTimeDesc(userId);
        return conversations.stream()
                .map(conv -> convertToConversationResponse(conv, userId))
                .collect(Collectors.toList());
    }

    // Send Message
    public MessageResponse sendMessage(String conversationId, String senderId, String content, String type, 
                                      String fileUrl, String fileName, Long fileSize) {
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setType(type != null ? type : "text");
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setFileSize(fileSize);

        // Resolve sender info from student or faculty
        message.setSenderName(resolveUserName(senderId));
        message.setSenderEmail(resolveUserEmail(senderId));

        message = messageRepository.save(message);

        // Update conversation
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        if (convOpt.isPresent()) {
            Conversation conv = convOpt.get();
            conv.setLastMessage(content);
            conv.setLastMessageId(message.getId());
            conv.setLastMessageTime(message.getTimestamp());
            conv.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conv);
        }

        return convertToMessageResponse(message);
    }

    // Send Group Message
    public MessageResponse sendGroupMessage(String groupId, String senderId, String content, String type,
                                           String fileUrl, String fileName, Long fileSize) {
        Message message = new Message();
        message.setGroupId(groupId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setType(type != null ? type : "text");
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setFileSize(fileSize);

        // Resolve sender info from student or faculty
        message.setSenderName(resolveUserName(senderId));
        message.setSenderEmail(resolveUserEmail(senderId));

        message = messageRepository.save(message);

        // Update group
        Optional<ChatGroup> groupOpt = chatGroupRepository.findById(groupId);
        if (groupOpt.isPresent()) {
            ChatGroup group = groupOpt.get();
            group.setLastMessage(content);
            group.setLastMessageId(message.getId());
            group.setLastMessageTime(message.getTimestamp());
            group.setUpdatedAt(LocalDateTime.now());
            chatGroupRepository.save(group);
        }

        return convertToMessageResponse(message);
    }

    // Upload File
    public String uploadFile(MultipartFile file) throws IOException {
        String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        File dest = new File(CHAT_UPLOAD_DIR, filename);
        file.transferTo(dest);
        return "/uploads/chat/" + filename;
    }

    // Get Messages
    public List<MessageResponse> getConversationMessages(String conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        return messages.stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    // Get Group Messages
    public List<MessageResponse> getGroupMessages(String groupId) {
        List<Message> messages = messageRepository.findByGroupIdOrderByTimestampAsc(groupId);
        return messages.stream()
                .map(this::convertToMessageResponse)
                .collect(Collectors.toList());
    }

    // Create Group
    public GroupResponse createGroup(String name, String description, String createdBy, List<String> memberIds) {
        ChatGroup group = new ChatGroup();
        group.setName(name);
        group.setDescription(description);
        group.setCreatedBy(createdBy);
        group.getAdminIds().add(createdBy);

        // Add creator as admin (use email-based lookup)
        String creatorEmail = resolveUserEmail(createdBy);
        String creatorName = resolveUserName(createdBy);
        ChatGroup.GroupMember adminMember = new ChatGroup.GroupMember(
            creatorEmail,
            creatorName,
            creatorEmail,
            "admin"
        );
        group.getMembers().add(adminMember);

        // Add other members (use email-based lookup)
        for (String memberId : memberIds) {
            String memberEmail = resolveUserEmail(memberId);
            if (!memberEmail.equals(creatorEmail)) {
                String memberName = resolveUserName(memberId);
                ChatGroup.GroupMember groupMember = new ChatGroup.GroupMember(
                    memberEmail,
                    memberName,
                    memberEmail,
                    "member"
                );
                group.getMembers().add(groupMember);
            }
        }

        group = chatGroupRepository.save(group);
        return convertToGroupResponse(group, createdBy);
    }

    // Get User Groups
    public List<GroupResponse> getUserGroups(String userId) {
        try {
            System.out.println("=== GET USER GROUPS ===");
            System.out.println("UserId: " + userId);
            
            List<ChatGroup> groups = chatGroupRepository.findByMembersUserId(userId);
            System.out.println("Found " + groups.size() + " groups");
            
            List<GroupResponse> responses = new ArrayList<>();
            for (ChatGroup group : groups) {
                try {
                    System.out.println("Converting group: " + group.getId() + " - " + group.getName());
                    GroupResponse response = convertToGroupResponse(group, userId);
                    responses.add(response);
                } catch (Exception e) {
                    System.err.println("Error converting group " + group.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("Returning " + responses.size() + " group responses");
            return responses;
        } catch (Exception e) {
            System.err.println("Error in getUserGroups: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Add Member to Group
    public void addMemberToGroup(String groupId, String userId, String addedBy) {
        Optional<ChatGroup> groupOpt = chatGroupRepository.findById(groupId);
        
        if (groupOpt.isPresent()) {
            ChatGroup group = groupOpt.get();
            String memberEmail = resolveUserEmail(userId);
            
            // Check if user is already a member
            boolean isMember = group.getMembers().stream()
                    .anyMatch(m -> m.getUserId().equals(memberEmail) || m.getEmail().equals(memberEmail));
            
            if (!isMember) {
                String memberName = resolveUserName(userId);
                ChatGroup.GroupMember newMember = new ChatGroup.GroupMember(
                    memberEmail,
                    memberName,
                    memberEmail,
                    "member"
                );
                group.getMembers().add(newMember);
                chatGroupRepository.save(group);
            }
        }
    }

    // Remove Member from Group
    public void removeMemberFromGroup(String groupId, String userId) {
        Optional<ChatGroup> groupOpt = chatGroupRepository.findById(groupId);
        if (groupOpt.isPresent()) {
            ChatGroup group = groupOpt.get();
            group.getMembers().removeIf(m -> m.getUserId().equals(userId));
            chatGroupRepository.save(group);
        }
    }

    // Add Reaction
    public void addReaction(String messageId, String userId, String emoji) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            
            // Remove existing reaction from this user for this emoji
            message.getReactions().removeIf(r -> r.getUserId().equals(userId) && r.getEmoji().equals(emoji));
            
            // Add new reaction
            Message.Reaction reaction = new Message.Reaction(userId, emoji);
            message.getReactions().add(reaction);
            
            messageRepository.save(message);
        }
    }

    // Mark Messages as Read
    public void markMessagesAsRead(String conversationId, String userId) {
        List<Message> unreadMessages = messageRepository.findByConversationIdAndReadFalseAndSenderIdNot(conversationId, userId);
        unreadMessages.forEach(msg -> msg.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    // Mark Group Messages as Read
    public void markGroupMessagesAsRead(String groupId, String userId) {
        List<Message> unreadMessages = messageRepository.findByGroupIdAndReadFalseAndSenderIdNot(groupId, userId);
        unreadMessages.forEach(msg -> msg.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    // Edit Message
    public MessageResponse editMessage(String messageId, String userId, String newContent) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            if (message.getSenderId().equals(userId)) {
                message.setContent(newContent);
                message.setEdited(true);
                message.setEditedAt(LocalDateTime.now());
                message = messageRepository.save(message);
                return convertToMessageResponse(message);
            }
        }
        return null;
    }

    // Delete Message
    public boolean deleteMessage(String messageId, String userId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            if (message.getSenderId().equals(userId)) {
                messageRepository.delete(message);
                return true;
            }
        }
        return false;
    }

    // Get online users
    public List<String> getOnlineUsers() {
        return com.uniconnect.websocket.ChatWebSocketHandler.getOnlineUsers();
    }

    // Converters
    private MessageResponse convertToMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setConversationId(message.getConversationId());
        response.setGroupId(message.getGroupId());
        response.setSenderId(message.getSenderId());
        response.setSenderName(message.getSenderName());
        response.setSenderEmail(message.getSenderEmail());
        response.setContent(message.getContent());
        response.setType(message.getType());
        response.setFileUrl(message.getFileUrl());
        response.setFileName(message.getFileName());
        response.setFileSize(message.getFileSize());
        response.setRead(message.isRead());
        response.setEdited(message.isEdited());
        response.setReplyToMessageId(message.getReplyToMessageId());

        if (message.getTimestamp() != null) {
            response.setTimestamp(message.getTimestamp().format(DATE_FORMATTER));
        }
        if (message.getEditedAt() != null) {
            response.setEditedAt(message.getEditedAt().format(DATE_FORMATTER));
        }

        List<MessageResponse.ReactionResponse> reactionResponses = message.getReactions().stream()
                .map(r -> {
                    MessageResponse.ReactionResponse rr = new MessageResponse.ReactionResponse();
                    rr.setUserId(r.getUserId());
                    rr.setEmoji(r.getEmoji());
                    if (r.getTimestamp() != null) {
                        rr.setTimestamp(r.getTimestamp().format(DATE_FORMATTER));
                    }
                    return rr;
                })
                .collect(Collectors.toList());
        response.setReactions(reactionResponses);

        return response;
    }

    private ConversationResponse convertToConversationResponse(Conversation conversation, String currentUserId) {
        ConversationResponse response = new ConversationResponse();
        response.setId(conversation.getId());
        response.setLastMessage(conversation.getLastMessage());

        if (conversation.getLastMessageTime() != null) {
            response.setLastMessageTime(conversation.getLastMessageTime().format(DATE_FORMATTER));
        }

        // Get unread count
        long unreadCount = messageRepository.countByConversationIdAndReadFalseAndSenderIdNot(conversation.getId(), currentUserId);
        response.setUnreadCount((int) unreadCount);

        // Convert participants
        List<ConversationResponse.ParticipantInfo> participantInfos = conversation.getParticipants().stream()
                .map(p -> {
                    ConversationResponse.ParticipantInfo pi = new ConversationResponse.ParticipantInfo();
                    pi.setUserId(p.getUserId());
                    pi.setName(p.getName());
                    pi.setEmail(p.getEmail());
                    pi.setUnreadCount(p.getUnreadCount());
                    return pi;
                })
                .collect(Collectors.toList());
        response.setParticipants(participantInfos);

        // Set other user info
        Optional<Conversation.ParticipantInfo> otherUser = conversation.getParticipants().stream()
                .filter(p -> !p.getUserId().equals(currentUserId))
                .findFirst();
        if (otherUser.isPresent()) {
            response.setOtherUserName(otherUser.get().getName());
            response.setOtherUserEmail(otherUser.get().getEmail());
            response.setOtherUserId(otherUser.get().getUserId());
        }

        return response;
    }

    private GroupResponse convertToGroupResponse(ChatGroup group, String currentUserId) {
        GroupResponse response = new GroupResponse();
        response.setId(group.getId());
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        response.setAvatarUrl(group.getAvatarUrl());
        response.setCreatedBy(group.getCreatedBy());
        response.setAdminIds(group.getAdminIds());
        response.setLastMessage(group.getLastMessage());
        response.setMemberCount(group.getMembers().size());

        if (group.getLastMessageTime() != null) {
            response.setLastMessageTime(group.getLastMessageTime().format(DATE_FORMATTER));
        }

        // Get unread count
        long unreadCount = messageRepository.countByGroupIdAndReadFalseAndSenderIdNot(group.getId(), currentUserId);
        response.setUnreadCount((int) unreadCount);

        // Convert members
        List<GroupResponse.GroupMemberInfo> memberInfos = group.getMembers().stream()
                .map(m -> {
                    GroupResponse.GroupMemberInfo mi = new GroupResponse.GroupMemberInfo();
                    mi.setUserId(m.getUserId());
                    mi.setName(m.getName());
                    mi.setEmail(m.getEmail());
                    mi.setRole(m.getRole());
                    if (m.getJoinedAt() != null) {
                        mi.setJoinedAt(m.getJoinedAt().format(DATE_FORMATTER));
                    }
                    mi.setUnreadCount(m.getUnreadCount());
                    return mi;
                })
                .collect(Collectors.toList());
        response.setMembers(memberInfos);

        return response;
    }
}
