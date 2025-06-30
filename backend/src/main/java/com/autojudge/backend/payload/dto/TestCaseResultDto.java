package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResultDto {
    private Long testCaseId;
    private Boolean passed;
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private Long executionTimeMs;
} 