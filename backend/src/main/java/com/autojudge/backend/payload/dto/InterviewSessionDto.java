package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
    private boolean hasCodingChallenge;
    private List<CodingTaskDto> codingTasks;
    
    // Constructor that maintains backward compatibility
    public InterviewSessionDto(Long id, String accessToken, LocalDateTime startTime, LocalDateTime endTime, 
                             String status, Double score, String evaluationSummary, InterviewDto interview, 
                             UserDto candidate, String ipAddress, String deviceInfo, boolean proctored, 
                             String proctorNotes) {
        this.id = id;
        this.accessToken = accessToken;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.score = score;
        this.evaluationSummary = evaluationSummary;
        this.interview = interview;
        this.candidate = candidate;
        this.ipAddress = ipAddress;
        this.deviceInfo = deviceInfo;
        this.proctored = proctored;
        this.proctorNotes = proctorNotes;
        this.hasCodingChallenge = false;
        this.codingTasks = null;
    }
} 