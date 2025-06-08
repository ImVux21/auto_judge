package com.autojudge.backend.payload.dto;

import com.autojudge.backend.model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;
    private String text;
    private QuestionType type;
    private Integer difficultyLevel;
    private String category;
    private String modelAnswer;
    private Integer orderIndex;
    private List<OptionDto> options = new ArrayList<>();
} 