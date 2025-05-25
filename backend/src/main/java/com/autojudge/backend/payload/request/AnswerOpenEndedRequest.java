package com.autojudge.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerOpenEndedRequest {
    @NotNull
    private Long questionId;
    
    @NotBlank
    private String textAnswer;
} 