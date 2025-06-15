package com.autojudge.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OpenAiAnswerDto {
    private Double score;
    private String evaluation;
} 