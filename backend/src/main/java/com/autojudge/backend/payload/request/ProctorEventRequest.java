package com.autojudge.backend.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProctorEventRequest {
    private String eventType;
    private String eventDetails;
    private Integer severity;
} 