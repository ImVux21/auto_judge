package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodingSubmissionDto {
    private Long id;
    private String sessionId;
    private Long taskId;
    private String code;
    private String language;
    private LocalDateTime submittedAt;
    private Boolean isComplete;
    private String candidateNotes;
    private List<TestCaseResultDto> executionResults;
} 