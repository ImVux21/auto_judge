package com.autojudge.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StartSessionRequest {
    @NotBlank
    private String deviceInfo;
} 