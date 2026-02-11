package com.uniconnect.service;

import com.uniconnect.dto.AuthResponse;
import com.uniconnect.dto.SignInRequest;
import com.uniconnect.dto.SignUpRequest;
import com.uniconnect.model.Faculty;
import com.uniconnect.repository.FacultyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class FacultyAuthService {
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyAuthService(FacultyRepository facultyRepository, PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse signUp(SignUpRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords must match");
        }

        if (facultyRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Faculty faculty = new Faculty(request.email(), passwordEncoder.encode(request.password()), Instant.now());
        facultyRepository.save(faculty);
        return new AuthResponse("Account ready to be created", null, faculty.getId());
    }

    public AuthResponse signIn(SignInRequest request) {
        Faculty faculty = facultyRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), faculty.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new AuthResponse("Proceeding to Faculty Portal", null, faculty.getId());
    }
}
