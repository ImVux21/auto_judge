package com.autojudge.backend.payload.dto;

import com.autojudge.backend.model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerPerformanceDto {
    private Long answerId;
    private String answer;
    private Long questionId;
    private String questionText;
    private QuestionType questionType;
    private Double score;
    private String evaluation;
    private List<OptionDto> selectedOptions;
    private String correctAnswer;
} 