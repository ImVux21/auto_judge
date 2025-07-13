package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewDto {
    private Long id;
    private String title;
    private String jobRole;
    private String description;
    private Integer timeLimit;
    private LocalDateTime createdAt;
    private boolean active;
    private UserDto createdBy;
    private int questionCount;
    private int mcqCount;
    private int openEndedCount;
    private boolean hasCodingChallenge;
} 