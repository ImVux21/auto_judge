package com.autojudge.backend.repository;

import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.ProctorEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProctorEventRepository extends JpaRepository<ProctorEvent, Long> {
    List<ProctorEvent> findByInterviewSessionOrderByTimestampDesc(InterviewSession session);
    
    List<ProctorEvent> findByInterviewSessionAndEventTypeOrderByTimestampDesc(
            InterviewSession session, String eventType);
    
    int countByInterviewSessionAndEventType(InterviewSession session, String eventType);
} 