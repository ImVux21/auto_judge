package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodingTaskDto {
    private Long id;
    private String title;
    private String description;
    private String instructions;
    private String difficulty;
    private Integer timeLimit;
    private String language;
    private String taskType;
    private String initialCode;
    private String solutionCode;
    private List<TestCaseDto> testCases;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 