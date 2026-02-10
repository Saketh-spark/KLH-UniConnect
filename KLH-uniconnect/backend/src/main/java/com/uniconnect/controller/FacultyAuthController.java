package com.uniconnect.controller;

import com.uniconnect.dto.AuthResponse;
import com.uniconnect.dto.SignInRequest;
import com.uniconnect.dto.SignUpRequest;
import com.uniconnect.service.FacultyAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/faculty")
@CrossOrigin(origins = {"http://localhost:4173", "http://localhost:5173"})
public class FacultyAuthController {
    private final FacultyAuthService facultyAuthService;

    public FacultyAuthController(FacultyAuthService facultyAuthService) {
        this.facultyAuthService = facultyAuthService;
    }

    @PostMapping("/sign-in")
    public ResponseEntity<AuthResponse> signIn(@Valid @RequestBody SignInRequest request) {
        return ResponseEntity.ok(facultyAuthService.signIn(request));
    }

    @PostMapping("/sign-up")
    public ResponseEntity<AuthResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ResponseEntity.ok(facultyAuthService.signUp(request));
    }
}
