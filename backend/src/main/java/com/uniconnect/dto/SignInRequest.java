package com.uniconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SignInRequest(
        @NotBlank(message = "Email is required")
        @Pattern(regexp = ".+@klh\\.edu\\.in$", message = "Use your @klh.edu.in email")
        String email,
        @NotBlank(message = "Password is required")
        String password
) {
}
