package com.uniconnect.service;

import com.uniconnect.dto.AuthResponse;
import com.uniconnect.dto.SignInRequest;
import com.uniconnect.dto.SignUpRequest;
import com.uniconnect.model.Student;
import com.uniconnect.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class StudentAuthService {
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentAuthService(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse signUp(SignUpRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords must match");
        }

        if (studentRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Student student = new Student(request.email(), passwordEncoder.encode(request.password()), Instant.now());

        studentRepository.save(student);
        String emailPrefix = student.getEmail() != null && student.getEmail().contains("@")
                ? student.getEmail().split("@")[0] : student.getId();
        return new AuthResponse("Account ready to be created", emailPrefix, null);
    }

    public AuthResponse signIn(SignInRequest request) {
        Student student = studentRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), student.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String emailPrefix = student.getEmail() != null && student.getEmail().contains("@")
                ? student.getEmail().split("@")[0] : student.getId();
        return new AuthResponse("Proceeding to Student Portal", emailPrefix, null);
    }
}
