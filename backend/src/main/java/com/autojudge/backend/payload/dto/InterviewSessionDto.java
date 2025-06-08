package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionDto {
    private Long id;
    private String accessToken;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private Double score;
    private String evaluationSummary;
    private InterviewDto interview;
    private UserDto candidate;
    private String ipAddress;
    private String deviceInfo;
    private boolean proctored;
    private String proctorNotes;
} 