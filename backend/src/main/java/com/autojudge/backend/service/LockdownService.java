package com.autojudge.backend.service;

import com.autojudge.backend.model.InterviewSession;
import com.autojudge.backend.model.ProctorEvent;
import com.autojudge.backend.payload.dto.ProctorEventDto;
import com.autojudge.backend.payload.request.ProctorEventRequest;
import com.autojudge.backend.repository.InterviewSessionRepository;
import com.autojudge.backend.repository.ProctorEventRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LockdownService {

    private final ProctorEventRepository eventRepository;
    private final InterviewSessionRepository sessionRepository;

    @Autowired
    public LockdownService(
            ProctorEventRepository eventRepository,
            InterviewSessionRepository sessionRepository) {
        this.eventRepository = eventRepository;
        this.sessionRepository = sessionRepository;
    }
    
    public void recordSecurityEvent(String sessionToken, ProctorEventRequest request) {
        InterviewSession session = findSessionByToken(sessionToken);
        
        ProctorEvent event = new ProctorEvent();
        event.setInterviewSession(session);
        event.setEventType(request.getEventType());
        event.setEventDetails(request.getEventDetails());
        event.setSeverity(request.getSeverity());
        
        eventRepository.save(event);
    }
    
    public List<ProctorEventDto> getSecurityEvents(String sessionToken) {
        InterviewSession session = findSessionByToken(sessionToken);
        List<ProctorEvent> events = eventRepository.findByInterviewSessionOrderByTimestampDesc(session);
        
        return events.stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public int getViolationCount(String sessionToken) {
        InterviewSession session = findSessionByToken(sessionToken);
        
        int tabSwitchViolations = eventRepository.countByInterviewSessionAndEventType(session, "TAB_SWITCH");
        int fullscreenExitViolations = eventRepository.countByInterviewSessionAndEventType(session, "FULLSCREEN_EXIT");
        int copyPasteViolations = eventRepository.countByInterviewSessionAndEventType(session, "COPY_PASTE");
        
        return tabSwitchViolations + fullscreenExitViolations + copyPasteViolations;
    }
    
    public boolean isSessionSecure(String sessionToken) {
        int violationCount = getViolationCount(sessionToken);
        
        // Define a threshold for security violations
        // This is a simplified implementation - in a real application you might use
        // more complex criteria based on violation types, timing, etc.
        return violationCount <= 3; // Allow up to 3 violations before marking as insecure
    }
    
    public String getSecurityStatus(String sessionToken) {
        InterviewSession session = findSessionByToken(sessionToken);
        
        int tabSwitchViolations = eventRepository.countByInterviewSessionAndEventType(session, "TAB_SWITCH");
        int fullscreenExitViolations = eventRepository.countByInterviewSessionAndEventType(session, "FULLSCREEN_EXIT");
        int copyPasteViolations = eventRepository.countByInterviewSessionAndEventType(session, "COPY_PASTE");
        
        StringBuilder status = new StringBuilder();
        status.append("Security Status: ");
        
        if (tabSwitchViolations + fullscreenExitViolations + copyPasteViolations == 0) {
            status.append("Good");
        } else if (tabSwitchViolations + fullscreenExitViolations + copyPasteViolations <= 3) {
            status.append("Warning");
        } else {
            status.append("Violated");
        }
        
        status.append("\nTab Switches: ").append(tabSwitchViolations);
        status.append("\nFullscreen Exits: ").append(fullscreenExitViolations);
        status.append("\nCopy/Paste Attempts: ").append(copyPasteViolations);
        
        return status.toString();
    }
    
    private InterviewSession findSessionByToken(String sessionToken) {
        return sessionRepository.findByAccessToken(sessionToken)
                .orElseThrow(() -> new EntityNotFoundException("Interview session not found"));
    }
    
    private ProctorEventDto mapToDto(ProctorEvent event) {
        ProctorEventDto dto = new ProctorEventDto();
        dto.setId(event.getId());
        dto.setSessionId(event.getInterviewSession().getAccessToken());
        dto.setEventType(event.getEventType());
        dto.setTimestamp(event.getTimestamp());
        dto.setEventDetails(event.getEventDetails());
        dto.setSeverity(event.getSeverity());
        return dto;
    }
} 