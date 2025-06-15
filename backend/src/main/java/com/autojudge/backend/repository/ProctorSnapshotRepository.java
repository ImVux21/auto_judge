package com.autojudge.backend.repository;

import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.ProctorSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProctorSnapshotRepository extends JpaRepository<ProctorSnapshot, Long> {
    
    List<ProctorSnapshot> findBySession(InterviewSession session);
    
    List<ProctorSnapshot> findBySessionOrderByTimestampAsc(InterviewSession session);
    
    List<ProctorSnapshot> findBySessionAndFlaggedTrue(InterviewSession session);
    
    List<ProctorSnapshot> findBySessionAndEventType(InterviewSession session, String eventType);
    
    List<ProctorSnapshot> findBySessionAndEventTypeIn(InterviewSession session, List<String> eventTypes);
    
    long countBySession(InterviewSession session);
    
    long countBySessionAndFlaggedTrue(InterviewSession session);
    
    long countBySessionAndEventType(InterviewSession session, String eventType);
} 