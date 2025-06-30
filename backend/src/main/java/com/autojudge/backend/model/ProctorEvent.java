package com.autojudge.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "proctor_events")
@NoArgsConstructor
@AllArgsConstructor
public class ProctorEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_session_id", nullable = false)
    private InterviewSession interviewSession;

    @Column(nullable = false)
    private String eventType;  // TAB_SWITCH, FULLSCREEN_EXIT, COPY_PASTE, etc.

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String eventDetails;

    @Column(nullable = false)
    private Integer severity; // 1-5 scale, with 5 being the most severe

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
} 