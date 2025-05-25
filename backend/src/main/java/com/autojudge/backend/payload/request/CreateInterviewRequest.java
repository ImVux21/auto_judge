package com.autojudge.backend.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInterviewRequest {
    @NotBlank
    private String title;
    
    @NotBlank
    private String jobRole;
    
    private String description;
    
    @NotNull
    @Min(1)
    private Integer timeLimit;
    
    @NotNull
    @Min(0)
    private Integer mcqCount;
    
    @NotNull
    @Min(0)
    private Integer openEndedCount;
} 