package com.autojudge.backend.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProctorEventDto {
    private Long id;
    private String sessionId;
    private String eventType;
    private LocalDateTime timestamp;
    private String eventDetails;
    private Integer severity;
} 