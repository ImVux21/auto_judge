package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerDto {
    private Long id;
    private String textAnswer;
    private List<OptionDto> selectedOptions;
    private Double score;
    private String aiEvaluation;
    private LocalDateTime submittedAt;
    private QuestionDto question;
} 