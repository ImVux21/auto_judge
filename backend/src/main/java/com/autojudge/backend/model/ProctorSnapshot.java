package com.autojudge.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "proctor_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProctorSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "timestamp")
    private Long timestamp;
    
    @Column(name = "created_at")
    private Instant createdAt;
    
    @Lob
    @Column(name = "image_data", columnDefinition = "LONGTEXT")
    private String imageData;
    
    @Column(name = "flagged", nullable = false)
    private Boolean flagged;
    
    @Column(name = "flag_reason")
    private String flagReason;
    
    @Column(name = "event_type")
    private String eventType;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        if (flagged == null) {
            flagged = false;
        }
        if (eventType == null) {
            eventType = "NORMAL";
        }
    }
} 