package com.autojudge.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "interviews")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String jobRole;
    
    private String description;
    
    @Column(nullable = false)
    private Integer timeLimit; // in minutes
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();
    
    @Column(nullable = false)
    private boolean active = true;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "interview_coding_tasks",
        joinColumns = @JoinColumn(name = "interview_id"),
        inverseJoinColumns = @JoinColumn(name = "coding_task_id")
    )
    private Set<CodingTask> codingTasks = new HashSet<>();
    
    @Column(name = "has_coding_challenge")
    private boolean hasCodingChallenge = false;
    
    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL)
    private List<InterviewSession> sessions = new ArrayList<>();
} 