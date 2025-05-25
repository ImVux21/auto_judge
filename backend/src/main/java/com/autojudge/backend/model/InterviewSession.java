package com.autojudge.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "interview_sessions")
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id")
    private Interview interview;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id")
    private User candidate;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    @Column(nullable = false)
    private String status; // PENDING, IN_PROGRESS, COMPLETED, EVALUATED
    
    @Column(nullable = false)
    private String accessToken; // Unique token for the candidate to access the interview
    
    @Column(nullable = false)
    private String ipAddress;
    
    private String deviceInfo;
    
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL)
    private List<Answer> answers = new ArrayList<>();
    
    private Double score;
    
    @Column(length = 2000)
    private String evaluationSummary;
    
    @Column(nullable = false)
    private boolean proctored = false;
    
    @Column(length = 1000)
    private String proctorNotes;
} 