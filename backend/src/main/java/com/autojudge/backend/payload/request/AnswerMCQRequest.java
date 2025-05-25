package com.autojudge.backend.payload.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AnswerMCQRequest {
    @NotNull
    private Long questionId;
    
    @NotEmpty
    private List<Long> selectedOptionIds;
} 