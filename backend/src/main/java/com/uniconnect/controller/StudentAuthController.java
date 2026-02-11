package com.uniconnect.controller;

import com.uniconnect.dto.AuthResponse;
import com.uniconnect.dto.SignInRequest;
import com.uniconnect.dto.SignUpRequest;
import com.uniconnect.service.StudentAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/student")
@CrossOrigin(origins = {"https://klh-uniconnect.onrender.com", "https://*.vercel.app", "http://localhost:4173", "http://localhost:5173"})
public class StudentAuthController {
    private final StudentAuthService studentAuthService;

    public StudentAuthController(StudentAuthService studentAuthService) {
        this.studentAuthService = studentAuthService;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<AuthResponse> signIn(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(studentAuthService.signIn(request));
    }

    @PostMapping("/sign-up")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.ok(studentAuthService.signUp(request));
    }
}
