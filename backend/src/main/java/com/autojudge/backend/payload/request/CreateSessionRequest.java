package com.autojudge.backend.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSessionRequest {
    @NotBlank
    @Email
    private String candidateEmail;
    
    @NotBlank
    private String candidateFirstName;
    
    @NotBlank
    private String candidateLastName;
} 